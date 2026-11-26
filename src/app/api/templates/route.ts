import { NextRequest, NextResponse } from "next/server";
import {
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
} from "@/lib/server/auth";
import { mutateStore, readStore } from "@/lib/server/store";
import {
  normalizeTemplateItem,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateItem,
} from "@/lib/templates";
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
  const scope = req.nextUrl.searchParams.get("scope");
  const store = await readStore();

  if (scope === "all") {
    if (!isOperatorAuthenticated(req)) {
      return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
    }
    return NextResponse.json({
      templates: store.templates,
      invitations: store.invitations,
      rsvps: store.rsvps,
    });
  }

  return NextResponse.json({
    templates: store.templates.filter((t) => t.status === "published"),
  });
}

export async function POST(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  let body: Partial<TemplateItem> & { autoCreateDemo?: boolean; demoCoupleNames?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = sanitizeSlug(typeof body.slug === "string" ? body.slug : name);

  if (!name || !slug) {
    return NextResponse.json(
      { error: "Nama template dan slug unik wajib diisi." },
      { status: 400 }
    );
  }

  const category: TemplateCategory = TEMPLATE_CATEGORIES.includes(
    body.category as TemplateCategory
  )
    ? (body.category as TemplateCategory)
    : "Editorial Modern";

  const now = new Date().toISOString().split("T")[0];
  const requestedDemoSlug = body.demoSlug ? sanitizeSlug(body.demoSlug) : "";
  const demoSlug = requestedDemoSlug || `demo-${slug}`;

  try {
    const created = await mutateStore((current) => {
      if (current.templates.some((t) => t.slug.toLowerCase() === slug.toLowerCase())) {
        throw new Error("DUPLICATE_SLUG");
      }

      const newTemplate = normalizeTemplateItem({
        ...body,
        id: `tpl_${Date.now()}`,
        slug,
        name,
        category,
        status: body.status === "published" ? "published" : "draft",
        demoSlug,
        demoUrl: `/i/${demoSlug}`,
        createdAt: now,
        updatedAt: now,
      });

      const nextInvitations = { ...current.invitations };
      // Otomatis buatkan rute demo live jika demoSlug belum ada di invitations
      if (!nextInvitations[demoSlug]) {
        const coupleRaw =
          typeof body.demoCoupleNames === "string" && body.demoCoupleNames.trim()
            ? body.demoCoupleNames.trim()
            : "Ardian & Medina";
        const parts = coupleRaw.split("&").map((p) => p.trim());
        const firstNameA = parts[0] || "Ardian";
        const firstNameB = parts[1] || "Medina";

        const autoDemo: InvitationData = {
          slug: demoSlug,
          templateId: newTemplate.id,
          templateSlug: newTemplate.slug,
          coupleNames: `${firstNameA} & ${firstNameB}`,
          firstNameA,
          firstNameB,
          parentNamesA: "Putra pertama dari keluarga mempelai pria",
          parentNamesB: "Putri pertama dari keluarga mempelai wanita",
          greeting: "Dengan penuh sukacita, kami mengundang Anda merayakan hari istimewa kami",
          eventDate: "Sabtu, 16 Januari 2027",
          quote:
            "Setiap lembaran cerita yang ditulis dengan ketulusan akan selalu menemukan jalannya menuju kebahagiaan.",
          akad: {
            title: "Akad Nikah",
            dateLabel: "Sabtu, 16 Januari 2027",
            timeLabel: "08.30 – 10.30 WIB",
            venue: "Paviliun Taman Motekar",
            address: "Jl. Siliwangi No. 28, Bandung, Jawa Barat",
          },
          reception: {
            title: "Resepsi",
            dateLabel: "Sabtu, 16 Januari 2027",
            timeLabel: "11.30 – 15.00 WIB",
            venue: "Pendopo Agung Rona",
            address: "Jl. Siliwangi No. 28, Bandung, Jawa Barat",
          },
          storyTimeline: [
            {
              year: "2023",
              title: "Awal Cerita",
              story: "Pertemuan sederhana yang menumbuhkan percakapan hangat tentang masa depan.",
            },
            {
              year: "2027",
              title: "Hari Bahagia",
              story: "Melangkah bersama dalam ikatan suci dengan doa restu keluarga dan sahabat.",
            },
          ],
          gallery: [
            { id: "g-auto-1", title: "Potret Awal", note: `Edisi ${newTemplate.name}` },
            { id: "g-auto-2", title: "Langkah Bersama", note: "Kenangan manis menanti hari H" },
          ],
          giftAccounts: [
            { bankName: "Bank BCA", accountNumber: "8120495811", accountHolder: firstNameA },
          ],
          isTemplateDemo: true,
          updatedAt: now,
        };
        nextInvitations[demoSlug] = autoDemo;
      }

      return {
        next: {
          ...current,
          templates: [newTemplate, ...current.templates],
          invitations: nextInvitations,
        },
        result: newTemplate,
      };
    });

    return NextResponse.json({ template: created }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "DUPLICATE_SLUG") {
      return NextResponse.json(
        { error: "Slug template sudah digunakan. Gunakan slug lain." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Gagal menyimpan template." }, { status: 500 });
  }
}
