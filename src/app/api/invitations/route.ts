import { NextRequest, NextResponse } from "next/server";
import {
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
} from "@/lib/server/auth";
import { mutateStore, readStore } from "@/lib/server/store";
import type { InvitationData } from "@/lib/invitations";

export const dynamic = "force-dynamic";

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const store = await readStore();

  if (slug) {
    const item = store.invitations[slug];
    if (!item) {
      return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ invitation: item });
  }

  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }

  return NextResponse.json({
    invitations: Object.values(store.invitations),
  });
}

export async function POST(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  let body: Partial<InvitationData>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 });
  }

  const firstNameA = typeof body.firstNameA === "string" ? body.firstNameA.trim() : "";
  const firstNameB = typeof body.firstNameB === "string" ? body.firstNameB.trim() : "";
  const slug = sanitizeSlug(
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug
      : `${firstNameA}-${firstNameB}`
  );

  if (!slug || !firstNameA || !firstNameB) {
    return NextResponse.json(
      { error: "Nama mempelai pria, mempelai wanita, dan slug URL wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const saved = await mutateStore((current) => {
      const targetTemplate =
        current.templates.find(
          (t) => t.id === body.templateId || t.slug === body.templateSlug
        ) || current.templates[0];

      const now = new Date().toISOString().split("T")[0];
      const nextItem: InvitationData = {
        slug,
        coupleNames: body.coupleNames?.trim() || `${firstNameA} & ${firstNameB}`,
        firstNameA,
        firstNameB,
        parentNamesA: body.parentNamesA?.trim() || "",
        parentNamesB: body.parentNamesB?.trim() || "",
        greeting:
          body.greeting?.trim() ||
          "Dengan memohon rahmat dan ridho Tuhan, kami mengundang Anda",
        eventDate: body.eventDate?.trim() || "Sabtu, 20 Februari 2027",
        quote:
          body.quote?.trim() ||
          "Dua cerita yang berpadu menjadi satu langkah perjalanan selamanya.",
        akad: {
          title: body.akad?.title?.trim() || "Akad Nikah",
          dateLabel: body.akad?.dateLabel?.trim() || body.eventDate?.trim() || "Sabtu, 20 Februari 2027",
          timeLabel: body.akad?.timeLabel?.trim() || "08.00 – 10.00 WIB",
          venue: body.akad?.venue?.trim() || "Pendopo Utama",
          address: body.akad?.address?.trim() || "Bandung, Jawa Barat",
          mapsUrl: body.akad?.mapsUrl?.trim() || "",
        },
        reception: {
          title: body.reception?.title?.trim() || "Resepsi",
          dateLabel:
            body.reception?.dateLabel?.trim() ||
            body.eventDate?.trim() ||
            "Sabtu, 20 Februari 2027",
          timeLabel: body.reception?.timeLabel?.trim() || "11.00 – 14.30 WIB",
          venue: body.reception?.venue?.trim() || "Taman Resepsi",
          address: body.reception?.address?.trim() || "Bandung, Jawa Barat",
          mapsUrl: body.reception?.mapsUrl?.trim() || "",
        },
        templateId: targetTemplate?.id,
        templateSlug: targetTemplate?.slug || "rona-ivory-editorial",
        storyTimeline: Array.isArray(body.storyTimeline)
          ? body.storyTimeline
          : current.invitations[slug]?.storyTimeline || [],
        gallery: Array.isArray(body.gallery)
          ? body.gallery
          : current.invitations[slug]?.gallery || [],
        giftAccounts: Array.isArray(body.giftAccounts)
          ? body.giftAccounts
          : current.invitations[slug]?.giftAccounts || [],
        isTemplateDemo: Boolean(body.isTemplateDemo),
        updatedAt: now,
      };

      return {
        next: {
          ...current,
          invitations: {
            ...current.invitations,
            [slug]: nextItem,
          },
        },
        result: nextItem,
      };
    });

    return NextResponse.json({ invitation: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan data undangan." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Parameter slug diperlukan." }, { status: 400 });
  }

  try {
    await mutateStore((current) => {
      if (!current.invitations[slug]) {
        throw new Error("NOT_FOUND");
      }
      const nextInvitations = { ...current.invitations };
      delete nextInvitations[slug];
      return {
        next: {
          ...current,
          invitations: nextInvitations,
        },
        result: true,
      };
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Undangan tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: "Gagal menghapus undangan." }, { status: 500 });
  }
}
