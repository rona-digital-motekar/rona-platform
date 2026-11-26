import { NextRequest, NextResponse } from "next/server";
import {
  attachSessionCookie,
  clearSessionCookie,
  createSessionToken,
  hashPasscode,
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
  verifyConstantString,
  verifyPasscodeHash,
} from "@/lib/server/auth";
import { mutateStore, readStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const envPasscode = process.env.OPERATOR_PASSCODE?.trim() || "";
  const store = await readStore();
  const hasClaimedHash = Boolean(store.auth?.passcodeHash);
  const setupRequired = !envPasscode && !hasClaimedHash;
  const authenticated = isOperatorAuthenticated(req);

  return NextResponse.json({
    authenticated,
    setupRequired,
    envConfigured: Boolean(envPasscode),
  });
}

export async function POST(req: NextRequest) {
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json(
      { error: "Origin permintaan tidak diizinkan." },
      { status: 403 }
    );
  }

  let body: { action?: string; passcode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const action = body.action || "login";

  if (action === "logout") {
    const res = NextResponse.json({ authenticated: false });
    clearSessionCookie(res);
    return res;
  }

  const passcode = typeof body.passcode === "string" ? body.passcode.trim() : "";
  const envPasscode = process.env.OPERATOR_PASSCODE?.trim() || "";

  if (action === "setup") {
    if (envPasscode) {
      return NextResponse.json(
        { error: "PIN Operator sudah dikonfigurasi melalui environment server." },
        { status: 400 }
      );
    }
    if (passcode.length < 4 || passcode.length > 64) {
      return NextResponse.json(
        { error: "PIN atau kata sandi minimal 4 karakter dan maksimal 64 karakter." },
        { status: 400 }
      );
    }

    const claimed = await mutateStore((current) => {
      if (current.auth?.passcodeHash) {
        return { next: current, result: false };
      }
      const next = {
        ...current,
        auth: {
          passcodeHash: hashPasscode(passcode),
          claimedAt: new Date().toISOString(),
        },
      };
      return { next, result: true };
    });

    if (!claimed) {
      return NextResponse.json(
        { error: "PIN Operator sudah pernah diaktifkan. Silakan login." },
        { status: 409 }
      );
    }

    const token = createSessionToken();
    const res = NextResponse.json({ authenticated: true, token });
    attachSessionCookie(res, token);
    return res;
  }

  // Standard login
  if (!passcode) {
    return NextResponse.json({ error: "Masukkan PIN atau kata sandi Operator." }, { status: 400 });
  }

  const store = await readStore();

  let valid = false;
  if (envPasscode) {
    valid = verifyConstantString(passcode, envPasscode);
  } else if (store.auth?.passcodeHash) {
    valid = verifyPasscodeHash(passcode, store.auth.passcodeHash);
  } else {
    return NextResponse.json(
      { error: "PIN Operator belum diaktifkan. Silakan buat PIN awal terlebih dahulu.", setupRequired: true },
      { status: 400 }
    );
  }

  if (!valid) {
    return NextResponse.json(
      { error: "PIN atau kata sandi Operator tidak sesuai." },
      { status: 401 }
    );
  }

  const token = createSessionToken();
  const res = NextResponse.json({ authenticated: true, token });
  attachSessionCookie(res, token);
  return res;
}
