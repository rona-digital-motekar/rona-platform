import crypto from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export const OPERATOR_COOKIE_NAME = "rona_op_session";

const globalForAuth = globalThis as typeof globalThis & {
  __ronaSessionSecret?: string;
};

function getSessionSecret(): string {
  const envSecret = process.env.OPERATOR_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return envSecret;
  }
  if (!globalForAuth.__ronaSessionSecret) {
    globalForAuth.__ronaSessionSecret = crypto.randomBytes(32).toString("hex");
  }
  return globalForAuth.__ronaSessionSecret;
}

export function hashPasscode(passcode: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(passcode, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPasscodeHash(passcode: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;

  const actualBuf = crypto.scryptSync(passcode, salt, 64);
  const expectedBuf = Buffer.from(expectedHex, "hex");
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

export function verifyConstantString(a: string, b: string): boolean {
  const bufA = crypto.createHash("sha256").update(a).digest();
  const bufB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

type SessionPayload = {
  role: "operator";
  iat: number;
  exp: number;
  nonce: string;
};

export function createSessionToken(ttlSeconds = 60 * 60 * 24): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: "operator",
    iat: now,
    exp: now + ttlSeconds,
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encodedPayload, sig] = parts;
  if (!encodedPayload || !sig) return false;

  const expectedSig = crypto
    .createHmac("sha256", getSessionSecret())
    .update(encodedPayload)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    return payload.role === "operator" && payload.exp > now;
  } catch {
    return false;
  }
}

export function attachSessionCookie(res: NextResponse, token: string): void {
  const cookieHeader = `${OPERATOR_COOKIE_NAME}=${encodeURIComponent(
    token
  )}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=None; Partitioned`;
  res.headers.append("Set-Cookie", cookieHeader);
}

export function clearSessionCookie(res: NextResponse): void {
  const cookieHeader = `${OPERATOR_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None; Partitioned`;
  res.headers.append("Set-Cookie", cookieHeader);
}

export function extractBearerOrCookieToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookieVal = req.cookies.get(OPERATOR_COOKIE_NAME)?.value;
  return cookieVal ? decodeURIComponent(cookieVal) : null;
}

export function isTrustedMutationOrigin(req: NextRequest): boolean {
  // Non-cookie Bearer auth is not vulnerable to CSRF
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return true;
  }

  // Custom header check
  if (req.headers.get("x-requested-with") === "RonaOperatorStudio") {
    return true;
  }

  // Origin / Host verification
  const origin = req.headers.get("origin");
  const expectedHost =
    req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !expectedHost) return false;

  try {
    const parsedOrigin = new URL(origin);
    return parsedOrigin.host === expectedHost;
  } catch {
    return false;
  }
}

export function isOperatorAuthenticated(req: NextRequest): boolean {
  const token = extractBearerOrCookieToken(req);
  return verifySessionToken(token);
}
