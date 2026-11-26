import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
} from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");

function detectImageExtension(buf: Buffer): "png" | "jpg" | "webp" | null {
  if (buf.length < 12) return null;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  // WEBP: RIFF....WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Format unggahan tidak valid." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Berkas gambar tidak ditemukan." }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran gambar maksimal 4 MB." },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = detectImageExtension(buffer);

  if (!ext) {
    return NextResponse.json(
      { error: "Format gambar harus PNG, JPG, atau WEBP yang valid." },
      { status: 400 }
    );
  }

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `rona-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const targetPath = path.resolve(UPLOADS_DIR, filename);

  if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
    return NextResponse.json({ error: "Path unggahan tidak valid." }, { status: 400 });
  }

  await fs.writeFile(targetPath, buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
