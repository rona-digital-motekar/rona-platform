import { NextRequest, NextResponse } from "next/server";
import {
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
} from "@/lib/server/auth";
import { mutateStore } from "@/lib/server/store";
import { normalizeTemplateItem, type TemplateItem } from "@/lib/templates";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  const { id } = await context.params;
  let updates: Partial<TemplateItem>;
  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Format JSON tidak valid." }, { status: 400 });
  }

  try {
    const updated = await mutateStore((current) => {
      const existing = current.templates.find((t) => t.id === id);
      if (!existing) throw new Error("NOT_FOUND");

      if (updates.slug) {
        const cleanSlug = updates.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        if (
          current.templates.some(
            (t) => t.id !== id && t.slug.toLowerCase() === cleanSlug
          )
        ) {
          throw new Error("DUPLICATE_SLUG");
        }
        updates.slug = cleanSlug;
      }

      const now = new Date().toISOString().split("T")[0];
      const merged = normalizeTemplateItem({
        ...existing,
        ...updates,
        id: existing.id,
        theme: updates.theme
          ? { ...existing.theme, ...updates.theme }
          : existing.theme,
        designConfig: updates.designConfig
          ? { ...existing.designConfig, ...updates.designConfig }
          : existing.designConfig,
        demoUrl: updates.demoSlug
          ? `/i/${updates.demoSlug}`
          : updates.demoUrl || existing.demoUrl,
        updatedAt: now,
      });

      const nextTemplates = current.templates.map((t) =>
        t.id === id ? merged : t
      );

      // Sinkronkan templateSlug pada undangan yang mengarah ke template ini
      const nextInvitations = { ...current.invitations };
      for (const [invSlug, inv] of Object.entries(nextInvitations)) {
        if (inv.templateId === id || inv.templateSlug === existing.slug) {
          nextInvitations[invSlug] = {
            ...inv,
            templateId: merged.id,
            templateSlug: merged.slug,
          };
        }
      }

      return {
        next: {
          ...current,
          templates: nextTemplates,
          invitations: nextInvitations,
        },
        result: merged,
      };
    });

    return NextResponse.json({ template: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 });
    }
    if (err instanceof Error && err.message === "DUPLICATE_SLUG") {
      return NextResponse.json({ error: "Slug sudah dipakai template lain." }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal memperbarui template." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  const { id } = await context.params;
  try {
    await mutateStore((current) => {
      if (current.templates.length <= 1) {
        throw new Error("MIN_ONE");
      }
      const exists = current.templates.some((t) => t.id === id);
      if (!exists) throw new Error("NOT_FOUND");
      return {
        next: {
          ...current,
          templates: current.templates.filter((t) => t.id !== id),
        },
        result: true,
      };
    });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    if (err instanceof Error && err.message === "MIN_ONE") {
      return NextResponse.json(
        { error: "Minimal harus tersisa satu template di sistem." },
        { status: 400 }
      );
    }
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ error: "Gagal menghapus template." }, { status: 500 });
  }
}
