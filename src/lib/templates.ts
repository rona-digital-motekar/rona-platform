export type TemplateCategory =
  | "Editorial Modern"
  | "Romance Storybook"
  | "Floral Botanical"
  | "Minimalist Classic"
  | "Heritage Traditional";

export type TemplateStatus = "published" | "draft";

export type TemplateEngine = "editorial-25d" | "storybook-cinematic" | "atelier-3d";

export type FontPairingId =
  | "playfair-dm"
  | "cormorant-jakarta"
  | "fraunces-manrope"
  | "bodoni-public";

export type Ornament3DType =
  | "wax-seal"
  | "floral-arch"
  | "origami-crest"
  | "ribbon-halo";

export type ParticleType = "none" | "gold-dust" | "botanical-petals" | "paper-ribbons";

export type PaperTextureType =
  | "cotton-warm"
  | "linen-sage"
  | "vellum-sheer"
  | "velvet-noir";

export type CoverStyleType = "envelope-seal" | "arch-framed" | "editorial-monogram";

export type SectionBlockType =
  | "cover"
  | "couple"
  | "quote"
  | "timeline"
  | "events"
  | "gallery"
  | "gift"
  | "rsvp";

export type TemplateSectionBlock = {
  id: string;
  type: SectionBlockType;
  label: string;
  visible: boolean;
  accentNote?: string;
};

export type TemplateDesignConfig = {
  engine: TemplateEngine;
  fontPairing: FontPairingId;
  ornament3D: Ornament3DType;
  particles: ParticleType;
  paperTexture: PaperTextureType;
  coverStyle: CoverStyleType;
  depthIntensity: number; // 0.4 - 1.4
  artworkKey: string; // preset key ("ivory", "terracotta", "storybook", "sage-botanical-25d", "atelier-royal-3d", "hero-diorama") or "/uploads/..."
  monogramSealText?: string;
  sections: TemplateSectionBlock[];
};

export type TemplateTheme = {
  background: string;
  deep: string;
  accent: string;
  highlight: string;
  soft: string;
  paletteClass: string;
};

export type TemplateItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: TemplateCategory;
  status: TemplateStatus;
  featured?: boolean;
  demoSlug: string;
  demoUrl: string;
  thumbnailClass: string;
  theme: TemplateTheme;
  features: string[];
  designConfig: TemplateDesignConfig;
  createdAt: string;
  updatedAt: string;
};

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Editorial Modern",
  "Romance Storybook",
  "Floral Botanical",
  "Minimalist Classic",
  "Heritage Traditional",
];

export const DEFAULT_SECTION_BLOCKS: TemplateSectionBlock[] = [
  { id: "sec_cover", type: "cover", label: "Sampul Undangan 2.5D/3D", visible: true, accentNote: "Pembuka amplop & segel" },
  { id: "sec_couple", type: "couple", label: "Profil Mempelai", visible: true, accentNote: "Nama & restu keluarga" },
  { id: "sec_quote", type: "quote", label: "Kutipan & Prosa Pembuka", visible: true, accentNote: "Puisi perjalanan cinta" },
  { id: "sec_timeline", type: "timeline", label: "Linimasa Kisah Cinta", visible: true, accentNote: "Babak pertemuan" },
  { id: "sec_events", type: "events", label: "Agenda Akad & Resepsi", visible: true, accentNote: "Waktu, lokasi & peta" },
  { id: "sec_gallery", type: "gallery", label: "Galeri Momen Scrapbook", visible: true, accentNote: "Bingkai kenangan" },
  { id: "sec_gift", type: "gift", label: "Tanda Kasih Digital", visible: true, accentNote: "Amplop & kirim kado" },
  { id: "sec_rsvp", type: "rsvp", label: "Konfirmasi RSVP & Doa", visible: true, accentNote: "Tersimpan ke server" },
];

export const FONT_PAIRING_MAP: Record<
  FontPairingId,
  { label: string; displayCss: string; bodyCss: string; vibe: string }
> = {
  "playfair-dm": {
    label: "Playfair Display + DM Sans",
    displayCss: "'Playfair Display', Georgia, serif",
    bodyCss: "'DM Sans', system-ui, sans-serif",
    vibe: "Editorial klasik & hangat",
  },
  "cormorant-jakarta": {
    label: "Cormorant Garamond + Plus Jakarta Sans",
    displayCss: "'Cormorant Garamond', Georgia, serif",
    bodyCss: "'Plus Jakarta Sans', system-ui, sans-serif",
    vibe: "Puitis tinggi & kontemporer",
  },
  "fraunces-manrope": {
    label: "Fraunces + Manrope",
    displayCss: "'Fraunces', Georgia, serif",
    bodyCss: "'Manrope', system-ui, sans-serif",
    vibe: "Artisanal organik & lembut",
  },
  "bodoni-public": {
    label: "Bodoni Moda + Public Sans",
    displayCss: "'Bodoni Moda', Georgia, serif",
    bodyCss: "'Public Sans', system-ui, sans-serif",
    vibe: "Kontras tinggi & formal",
  },
};

export function normalizeTemplateItem(raw: Partial<TemplateItem> & { id: string; slug: string; name: string }): TemplateItem {
  const slug = raw.slug;
  const demoSlug = raw.demoSlug || `demo-${slug}`;
  const defaultSections = DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s }));

  return {
    id: raw.id,
    slug,
    name: raw.name,
    description: raw.description || "",
    category: raw.category || "Editorial Modern",
    status: raw.status || "draft",
    featured: Boolean(raw.featured),
    demoSlug,
    demoUrl: raw.demoUrl || `/i/${demoSlug}`,
    thumbnailClass: raw.thumbnailClass || "theme-ivory",
    theme: {
      background: raw.theme?.background || "#f6f0e6",
      deep: raw.theme?.deep || "#24332a",
      accent: raw.theme?.accent || "#6c846f",
      highlight: raw.theme?.highlight || "#b49257",
      soft: raw.theme?.soft || "#e6ddcc",
      paletteClass: raw.theme?.paletteClass || `palette-${demoSlug}`,
    },
    features: Array.isArray(raw.features) ? raw.features : [],
    designConfig: {
      engine: raw.designConfig?.engine || "editorial-25d",
      fontPairing: raw.designConfig?.fontPairing || "playfair-dm",
      ornament3D: raw.designConfig?.ornament3D || "wax-seal",
      particles: raw.designConfig?.particles || "gold-dust",
      paperTexture: raw.designConfig?.paperTexture || "cotton-warm",
      coverStyle: raw.designConfig?.coverStyle || "envelope-seal",
      depthIntensity:
        typeof raw.designConfig?.depthIntensity === "number"
          ? Math.max(0.4, Math.min(1.4, raw.designConfig.depthIntensity))
          : 1,
      artworkKey: raw.designConfig?.artworkKey || "ivory",
      monogramSealText: raw.designConfig?.monogramSealText || "R · M",
      sections:
        Array.isArray(raw.designConfig?.sections) && raw.designConfig.sections.length > 0
          ? raw.designConfig.sections
          : defaultSections,
    },
    createdAt: raw.createdAt || new Date().toISOString().split("T")[0],
    updatedAt: raw.updatedAt || new Date().toISOString().split("T")[0],
  };
}

export const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: "tpl_atelier_01",
    slug: "rona-atelier-royal-3d",
    name: "Rona Atelier Royal 3D",
    description:
      "Komposisi ruang 3D WebGL dengan segel lilin logam tempa, kertas vellum berlapis cahaya, partikel emas melayang, serta tata letak undangan interaktif paling imersif.",
    category: "Heritage Traditional",
    status: "published",
    featured: true,
    demoSlug: "bagas-clarissa",
    demoUrl: "/i/bagas-clarissa",
    thumbnailClass: "theme-atelier-3d",
    theme: {
      background: "#f5efe6",
      deep: "#2a231d",
      accent: "#7b6344",
      highlight: "#c69c53",
      soft: "#e7dac7",
      paletteClass: "palette-bagas-clarissa",
    },
    features: [
      "Panggung 3D Segel Lilin Interaktif",
      "Kertas Vellum & Partikel Emas",
      "Amplop Digital & Peta Acara",
      "RSVP & Buku Tamu Real-time",
    ],
    designConfig: {
      engine: "atelier-3d",
      fontPairing: "cormorant-jakarta",
      ornament3D: "wax-seal",
      particles: "gold-dust",
      paperTexture: "vellum-sheer",
      coverStyle: "envelope-seal",
      depthIntensity: 1.2,
      artworkKey: "atelier-royal-3d",
      monogramSealText: "B · C",
      sections: DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s })),
    },
    createdAt: "2026-11-18",
    updatedAt: "2026-11-24",
  },
  {
    id: "tpl_storybook_01",
    slug: "rona-storybook-cinematic",
    name: "Rona Storybook Cinematic",
    description:
      "Undangan bergaya buku cerita romantis & scrapbook berlapis. Dilengkapi tekstur kertas, polaroid kenangan, pita washi tape, timeline babak cinta, dan transisi sinematik halus.",
    category: "Romance Storybook",
    status: "published",
    featured: true,
    demoSlug: "dimas-sarah",
    demoUrl: "/i/dimas-sarah",
    thumbnailClass: "theme-storybook",
    theme: {
      background: "#fbf6ee",
      deep: "#3c2a1e",
      accent: "#995d43",
      highlight: "#c49756",
      soft: "#eee0cf",
      paletteClass: "palette-dimas-sarah",
    },
    features: [
      "6 Babak Cerita Sinematik",
      "Scrapbook & Polaroid Vintage",
      "Timeline Perjalanan Cinta",
      "Galeri Momen & Konfirmasi Interaktif",
    ],
    designConfig: {
      engine: "storybook-cinematic",
      fontPairing: "fraunces-manrope",
      ornament3D: "ribbon-halo",
      particles: "paper-ribbons",
      paperTexture: "cotton-warm",
      coverStyle: "arch-framed",
      depthIntensity: 1.05,
      artworkKey: "storybook",
      monogramSealText: "D · S",
      sections: DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s })),
    },
    createdAt: "2026-10-17",
    updatedAt: "2026-11-24",
  },
  {
    id: "tpl_ivory_01",
    slug: "rona-ivory-editorial",
    name: "Rona Ivory Editorial",
    description:
      "Desain editorial berkelas dengan nuansa warm ivory, sage green, dan tipografi serif klasik yang puitis. Mengedepankan transisi berlapis 2.5D yang bersih dan elegan.",
    category: "Editorial Modern",
    status: "published",
    featured: true,
    demoSlug: "raka-alya",
    demoUrl: "/i/raka-alya",
    thumbnailClass: "theme-ivory",
    theme: {
      background: "#f6f0e6",
      deep: "#344535",
      accent: "#8b9a7a",
      highlight: "#bd9d65",
      soft: "#e6ddcc",
      paletteClass: "palette-raka-alya",
    },
    features: [
      "5 Adegan Cerita Bergerak",
      "Cover Monogram Tipografi",
      "Portret Dua Perjalanan",
      "Konfirmasi Kehadiran Langsung",
    ],
    designConfig: {
      engine: "editorial-25d",
      fontPairing: "playfair-dm",
      ornament3D: "origami-crest",
      particles: "botanical-petals",
      paperTexture: "cotton-warm",
      coverStyle: "editorial-monogram",
      depthIntensity: 0.95,
      artworkKey: "ivory",
      monogramSealText: "R · A",
      sections: DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s })),
    },
    createdAt: "2026-10-10",
    updatedAt: "2026-11-24",
  },
  {
    id: "tpl_terracotta_02",
    slug: "rona-earth-terracotta",
    name: "Rona Earth Terracotta",
    description:
      "Sentuhan palet warna bumi terracotta & warm cream dengan suasana hangat, intim, dan bersahaja untuk pernikahan bertema alam keluarga.",
    category: "Minimalist Classic",
    status: "published",
    featured: false,
    demoSlug: "andika-nadira",
    demoUrl: "/i/andika-nadira",
    thumbnailClass: "theme-terracotta",
    theme: {
      background: "#f7eee4",
      deep: "#634c3f",
      accent: "#b57e60",
      highlight: "#c29a74",
      soft: "#ead5c4",
      paletteClass: "palette-andika-nadira",
    },
    features: [
      "Palet Hangat Bumi",
      "Kutipan Pembuka Puitis",
      "Detail Dua Agenda Acara",
      "Swipe Mobile Responsive",
    ],
    designConfig: {
      engine: "editorial-25d",
      fontPairing: "bodoni-public",
      ornament3D: "floral-arch",
      particles: "none",
      paperTexture: "cotton-warm",
      coverStyle: "editorial-monogram",
      depthIntensity: 0.9,
      artworkKey: "terracotta",
      monogramSealText: "A · N",
      sections: DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s })),
    },
    createdAt: "2026-10-12",
    updatedAt: "2026-11-24",
  },
  {
    id: "tpl_sage_03",
    slug: "rona-sage-botanical",
    name: "Rona Sage Botanical",
    description:
      "Nuansa sage green dedaunan eucalyptus alami dipadu lengkung kertas potong 2.5D dan stempel kuningan, dirancang untuk pernikahan taman atau intimate outdoor.",
    category: "Floral Botanical",
    status: "draft",
    featured: false,
    demoSlug: "demo-rona-sage-botanical",
    demoUrl: "/i/demo-rona-sage-botanical",
    thumbnailClass: "theme-sage",
    theme: {
      background: "#edf2eb",
      deep: "#2e3f31",
      accent: "#6c886e",
      highlight: "#a5977a",
      soft: "#d7e2d5",
      paletteClass: "palette-sage-botanical",
    },
    features: [
      "Lapisan Botani Paper-Cut 2.5D",
      "Monogram Dedaunan",
      "Stempel Kuningan Klasik",
      "Format Mobile First",
    ],
    designConfig: {
      engine: "atelier-3d",
      fontPairing: "cormorant-jakarta",
      ornament3D: "floral-arch",
      particles: "botanical-petals",
      paperTexture: "linen-sage",
      coverStyle: "arch-framed",
      depthIntensity: 1.1,
      artworkKey: "sage-botanical-25d",
      monogramSealText: "S · B",
      sections: DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s })),
    },
    createdAt: "2026-10-15",
    updatedAt: "2026-11-24",
  },
];
