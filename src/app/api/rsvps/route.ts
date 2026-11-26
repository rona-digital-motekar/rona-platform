import { NextRequest, NextResponse } from "next/server";
import {
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
} from "@/lib/server/auth";
import { mutateStore, readStore } from "@/lib/server/store";
import type { RsvpEntry } from "@/lib/invitations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const scope = req.nextUrl.searchParams.get("scope");
  const store = await readStore();

  if (scope === "all") {
    if (!isOperatorAuthenticated(req)) {
      return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
    }
    return NextResponse.json({ rsvps: store.rsvps });
  }

  const filtered = store.rsvps.filter(
    (r) => r.approved && (!slug || r.invitationSlug === slug)
  );
  return NextResponse.json({ rsvps: filtered });
}

export async function POST(req: NextRequest) {
  let body: {
    invitationSlug?: string;
    guestName?: string;
    status?: string;
    guestCount?: number | string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 });
  }

  const invitationSlug =
    typeof body.invitationSlug === "string" ? body.invitationSlug.trim() : "";
  const guestName =
    typeof body.guestName === "string" ? body.guestName.trim().slice(0, 80) : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  const status = body.status === "berhalangan" ? "berhalangan" : "hadir";
  const parsedCount = Number(body.guestCount ?? 1);
  const guestCount =
    status === "berhalangan"
      ? 0
      : Number.isFinite(parsedCount)
      ? Math.max(1, Math.min(10, Math.round(parsedCount)))
      : 1;

  if (!invitationSlug) {
    return NextResponse.json({ error: "Slug undangan tidak valid." }, { status: 400 });
  }
  if (guestName.length < 2) {
    return NextResponse.json(
      { error: "Mohon tulis nama lengkap Anda (minimal 2 karakter)." },
      { status: 400 }
    );
  }

  try {
    const created = await mutateStore((current) => {
      if (!current.invitations[invitationSlug]) {
        throw new Error("INVITATION_NOT_FOUND");
      }

      const entry: RsvpEntry = {
        id: `rsvp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        invitationSlug,
        guestName,
        status,
        guestCount,
        message,
        approved: true,
        createdAt: new Date().toISOString(),
      };

      return {
        next: {
          ...current,
          rsvps: [entry, ...current.rsvps],
        },
        result: entry,
      };
    });

    return NextResponse.json({ rsvp: created }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "INVITATION_NOT_FOUND") {
      return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: "Gagal menyimpan konfirmasi." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  let body: { id?: string; approved?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "ID RSVP wajib diisi." }, { status: 400 });
  }

  const updated = await mutateStore((current) => {
    const nextRsvps = current.rsvps.map((r) =>
      r.id === body.id
        ? { ...r, approved: typeof body.approved === "boolean" ? body.approved : !r.approved }
        : r
    );
    return {
      next: { ...current, rsvps: nextRsvps },
      result: nextRsvps.find((r) => r.id === body.id) || null,
    };
  });

  if (!updated) {
    return NextResponse.json({ error: "RSVP tidak ditemukan." }, { status: 404 });
  }
  return NextResponse.json({ rsvp: updated });
}

export async function DELETE(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Parameter ID diperlukan." }, { status: 400 });
  }

  await mutateStore((current) => ({
    next: {
      ...current,
      rsvps: current.rsvps.filter((r) => r.id !== id),
    },
    result: true,
  }));

  return NextResponse.json({ deleted: true });
}
