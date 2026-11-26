import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import {
  isOperatorAuthenticated,
  isTrustedMutationOrigin,
} from "@/lib/server/auth";
import {
  TEMPLATE_CATEGORIES,
  type CoverStyleType,
  type FontPairingId,
  type Ornament3DType,
  type PaperTextureType,
  type ParticleType,
  type TemplateCategory,
  type TemplateEngine,
} from "@/lib/templates";

export const dynamic = "force-dynamic";

type AiGeneratedBlueprint = {
  name: string;
  slug: string;
  category: TemplateCategory;
  description: string;
  features: string[];
  theme: {
    background: string;
    deep: string;
    accent: string;
    highlight: string;
    soft: string;
  };
  designConfig: {
    engine: TemplateEngine;
    fontPairing: FontPairingId;
    ornament3D: Ornament3DType;
    particles: ParticleType;
    paperTexture: PaperTextureType;
    coverStyle: CoverStyleType;
    depthIntensity: number;
    artworkKey: string;
    monogramSealText: string;
  };
};

export async function POST(req: NextRequest) {
  if (!isOperatorAuthenticated(req)) {
    return NextResponse.json({ error: "Autentikasi Operator diperlukan." }, { status: 401 });
  }
  if (!isTrustedMutationOrigin(req)) {
    return NextResponse.json({ error: "Origin permintaan tidak valid." }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY belum terpasang di server. Tambahkan kunci API pada panel Settings -> Secrets untuk mengaktifkan Asisten AI Desain.",
      },
      { status: 503 }
    );
  }

  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  const promptText = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (promptText.length < 4 || promptText.length > 600) {
    return NextResponse.json(
      { error: "Tuliskan deskripsi konsep desain (4–600 karakter)." },
      { status: 400 }
    );
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: `Rancang satu konsep template undangan pernikahan digital premium untuk Rona Digital Motekar berdasarkan permintaan desainer berikut: "${promptText}".
Pastikan palet warna hex memiliki kontras sangat baik (warna teks 'deep' harus kontras tinggi terhadap 'background' agar nyaman dibaca). Pilih kombinasi engine visual, tipografi, ornamen 3D, partikel, dan tekstur kertas paling serasi. Gunakan bahasa Indonesia editorial yang hangat dan elegan.`,
      config: {
        systemInstruction:
          "Anda adalah Art Director & Creative Technologist untuk studio undangan digital luxury Rona Digital Motekar. Hasilkan blueprint JSON yang selaras, kontras tinggi, dan siap pakai untuk mesin 3D/2.5D.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nama template singkat elegan, misal Rona Nilam Kraton 3D" },
            slug: { type: Type.STRING, description: "Slug huruf kecil dengan tanda hubung, misal rona-nilam-kraton-3d" },
            category: {
              type: Type.STRING,
              enum: TEMPLATE_CATEGORIES,
            },
            description: { type: Type.STRING, description: "Deskripsi editorial 1-2 kalimat dalam bahasa Indonesia" },
            features: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 poin keunggulan fitur template",
            },
            background: { type: Type.STRING, description: "Hex warna latar utama, misal #f6f2ea" },
            deep: { type: Type.STRING, description: "Hex warna teks utama kontras tinggi, misal #24332a" },
            accent: { type: Type.STRING, description: "Hex warna aksen sekunder" },
            highlight: { type: Type.STRING, description: "Hex warna sorotan emas/logam" },
            soft: { type: Type.STRING, description: "Hex warna permukaan kartu lembut" },
            engine: {
              type: Type.STRING,
              enum: ["atelier-3d", "storybook-cinematic", "editorial-25d"],
            },
            fontPairing: {
              type: Type.STRING,
              enum: ["playfair-dm", "cormorant-jakarta", "fraunces-manrope", "bodoni-public"],
            },
            ornament3D: {
              type: Type.STRING,
              enum: ["wax-seal", "floral-arch", "origami-crest", "ribbon-halo"],
            },
            particles: {
              type: Type.STRING,
              enum: ["none", "gold-dust", "botanical-petals", "paper-ribbons"],
            },
            paperTexture: {
              type: Type.STRING,
              enum: ["cotton-warm", "linen-sage", "vellum-sheer", "velvet-noir"],
            },
            coverStyle: {
              type: Type.STRING,
              enum: ["envelope-seal", "arch-framed", "editorial-monogram"],
            },
            depthIntensity: { type: Type.NUMBER, description: "Antara 0.6 sampai 1.3" },
            artworkKey: {
              type: Type.STRING,
              enum: [
                "atelier-royal-3d",
                "storybook",
                "ivory",
                "terracotta",
                "sage-botanical-25d",
                "hero-diorama",
              ],
            },
            monogramSealText: { type: Type.STRING, description: "Inisial segel 5 karakter misal R · M" },
          },
          required: [
            "name",
            "slug",
            "category",
            "description",
            "features",
            "background",
            "deep",
            "accent",
            "highlight",
            "soft",
            "engine",
            "fontPairing",
            "ornament3D",
            "particles",
            "paperTexture",
            "coverStyle",
            "depthIntensity",
            "artworkKey",
            "monogramSealText",
          ],
        },
      },
    });

    const rawText = (response.text ?? "").trim();
    if (!rawText) {
      return NextResponse.json(
        { error: "AI tidak mengembalikan rancangan. Coba ulangi deskripsi Anda." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawText) as {
      name: string;
      slug: string;
      category: TemplateCategory;
      description: string;
      features: string[];
      background: string;
      deep: string;
      accent: string;
      highlight: string;
      soft: string;
      engine: TemplateEngine;
      fontPairing: FontPairingId;
      ornament3D: Ornament3DType;
      particles: ParticleType;
      paperTexture: PaperTextureType;
      coverStyle: CoverStyleType;
      depthIntensity: number;
      artworkKey: string;
      monogramSealText: string;
    };

    const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);

    const blueprint: AiGeneratedBlueprint = {
      name: parsed.name.trim(),
      slug: parsed.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/(^-|-$)+/g, ""),
      category: TEMPLATE_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : "Editorial Modern",
      description: parsed.description.trim(),
      features: Array.isArray(parsed.features) ? parsed.features.slice(0, 4) : [],
      theme: {
        background: isHex(parsed.background) ? parsed.background : "#f6f2ea",
        deep: isHex(parsed.deep) ? parsed.deep : "#24332a",
        accent: isHex(parsed.accent) ? parsed.accent : "#6c846f",
        highlight: isHex(parsed.highlight) ? parsed.highlight : "#b49257",
        soft: isHex(parsed.soft) ? parsed.soft : "#e8e0d0",
      },
      designConfig: {
        engine: parsed.engine,
        fontPairing: parsed.fontPairing,
        ornament3D: parsed.ornament3D,
        particles: parsed.particles,
        paperTexture: parsed.paperTexture,
        coverStyle: parsed.coverStyle,
        depthIntensity: Math.max(0.6, Math.min(1.3, Number(parsed.depthIntensity) || 1)),
        artworkKey: parsed.artworkKey || "atelier-royal-3d",
        monogramSealText: (parsed.monogramSealText || "R · M").slice(0, 7),
      },
    };

    return NextResponse.json({ blueprint });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Gagal menghubungi Gemini API.";
    return NextResponse.json(
      { error: `Gagal menghasilkan rancangan AI: ${message}` },
      { status: 500 }
    );
  }
}
