"use client";

import { Suspense, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  FilePlus2,
  ImagePlus,
  Layers,
  Monitor,
  Palette,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useOperator } from "@/lib/operator-context";
import {
  DEFAULT_SECTION_BLOCKS,
  FONT_PAIRING_MAP,
  normalizeTemplateItem,
  TEMPLATE_CATEGORIES,
  type CoverStyleType,
  type FontPairingId,
  type Ornament3DType,
  type PaperTextureType,
  type ParticleType,
  type TemplateCategory,
  type TemplateEngine,
  type TemplateItem,
} from "@/lib/templates";
import { ARTWORK_PRESETS, resolveArtworkSource } from "@/lib/template-artworks";
import type { InvitationData } from "@/lib/invitations";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";

const PALETTE_SWATCHES = [
  {
    label: "Atelier Emas Hangat",
    background: "#f5efe6",
    deep: "#2a231d",
    accent: "#7b6344",
    highlight: "#c69c53",
    soft: "#e7dac7",
  },
  {
    label: "Taman Sage Botani",
    background: "#edf2eb",
    deep: "#2e3f31",
    accent: "#6c886e",
    highlight: "#a5977a",
    soft: "#d7e2d5",
  },
  {
    label: "Kraton Senja Terracotta",
    background: "#f7eee4",
    deep: "#4c362c",
    accent: "#995d43",
    highlight: "#c49756",
    soft: "#ead5c4",
  },
  {
    label: "Malam Beludru Noir",
    background: "#1c211e",
    deep: "#f4ede2",
    accent: "#9a7e4f",
    highlight: "#d3ae6e",
    soft: "#2a322d",
  },
];

const AI_QUICK_CONCEPTS = [
  {
    label: "Kraton Emas Jawa 3D",
    prompt:
      "Undangan pernikahan royal keraton Jawa modern berwarna krem gading hangat dan emas tempa dengan segel lilin 3D dan partikel emas.",
  },
  {
    label: "Taman Eucalyptus Senja",
    prompt:
      "Tema taman botani sage green lembut bertekstur linen dengan lengkung bunga 3D, kelopak dedaunan halus, dan tipografi puitis.",
  },
  {
    label: "Buku Cerita Kyoto Vintage",
    prompt:
      "Gaya storybook romantis bernuansa kertas katun hangat terracotta dengan pita washi, scrapbook, dan tipografi editorial klasik.",
  },
];

function createEmptyDraft(): TemplateItem {
  const stamp = Date.now().toString().slice(-4);
  const slug = `rona-karya-${stamp}`;
  return normalizeTemplateItem({
    id: `draft_${stamp}`,
    slug,
    name: "Rona Karya Baru 3D",
    description:
      "Komposisi undangan digital 3D interaktif yang dirancang khusus dari Studio Rona.",
    category: "Editorial Modern",
    status: "draft",
    demoSlug: `demo-${slug}`,
    demoUrl: `/i/demo-${slug}`,
    thumbnailClass: "theme-atelier-3d",
    theme: {
      background: "#f5efe6",
      deep: "#2a231d",
      accent: "#7b6344",
      highlight: "#c69c53",
      soft: "#e7dac7",
      paletteClass: `palette-demo-${slug}`,
    },
    features: [
      "Panggung 3D Segel Lilin Interaktif",
      "Lapisan Kertas 2.5D & Partikel",
      "Amplop Digital & Peta Lokasi",
      "RSVP & Buku Tamu Tersimpan",
    ],
    designConfig: {
      engine: "atelier-3d",
      fontPairing: "cormorant-jakarta",
      ornament3D: "wax-seal",
      particles: "gold-dust",
      paperTexture: "cotton-warm",
      coverStyle: "envelope-seal",
      depthIntensity: 1.1,
      artworkKey: "atelier-royal-3d",
      monogramSealText: "A · M",
      sections: DEFAULT_SECTION_BLOCKS.map((s) => ({ ...s })),
    },
  });
}

function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type StudioCanvasEditorProps = {
  existingTemplate: TemplateItem | null;
  allTemplates: TemplateItem[];
  invitations: InvitationData[];
  isCreatingNew: boolean;
  onSelectTemplateId: (id: string | null) => void;
};

function StudioCanvasEditor({
  existingTemplate,
  allTemplates,
  invitations,
  isCreatingNew,
  onSelectTemplateId,
}: StudioCanvasEditorProps) {
  const {
    addTemplate,
    updateTemplate,
    uploadArtwork,
    generateAiDesign,
  } = useOperator();

  const [draft, setDraft] = useState<TemplateItem>(() =>
    existingTemplate
      ? normalizeTemplateItem(structuredClone(existingTemplate))
      : createEmptyDraft()
  );
  const [slugLockedManual, setSlugLockedManual] = useState<boolean>(
    Boolean(existingTemplate)
  );
  const [demoCoupleNames, setDemoCoupleNames] = useState<string>(() => {
    if (existingTemplate) {
      const linked = invitations.find(
        (inv) =>
          inv.slug === existingTemplate.demoSlug ||
          inv.templateId === existingTemplate.id
      );
      if (linked) return linked.coupleNames;
    }
    return "Ardian & Medina";
  });

  const [leftTab, setLeftTab] = useState<"layers" | "ai">("layers");
  const [rightTab, setRightTab] = useState<"identity" | "style" | "stage" | "media">(
    "style"
  );
  const [viewportMode, setViewportMode] = useState<"mobile" | "desktop">("mobile");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingAction, setSavingAction] = useState<"draft" | "published" | null>(
    null
  );
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isExistingOnServer = useMemo(
    () =>
      !isCreatingNew &&
      Boolean(existingTemplate && allTemplates.some((t) => t.id === existingTemplate.id)),
    [allTemplates, existingTemplate, isCreatingNew]
  );

  const previewInvitation = useMemo<InvitationData>(() => {
    const existingInvite = invitations.find(
      (inv) => inv.slug === draft.demoSlug || inv.templateId === draft.id
    );
    const parts = demoCoupleNames.split("&").map((p) => p.trim());
    const nameA = parts[0] || existingInvite?.firstNameA || "Ardian";
    const nameB = parts[1] || existingInvite?.firstNameB || "Medina";

    if (existingInvite) {
      return {
        ...existingInvite,
        coupleNames: `${nameA} & ${nameB}`,
        firstNameA: nameA,
        firstNameB: nameB,
        templateId: draft.id,
        templateSlug: draft.slug,
      };
    }

    return {
      slug: draft.demoSlug || `demo-${draft.slug}`,
      templateId: draft.id,
      templateSlug: draft.slug,
      coupleNames: `${nameA} & ${nameB}`,
      firstNameA: nameA,
      firstNameB: nameB,
      parentNamesA: "Putra pertama Bpk. Hendra & Ibu Sari",
      parentNamesB: "Putri pertama Bpk. Wijaya & Ibu Ratna",
      greeting:
        "Dengan penuh sukacita, kami mengundang Anda merayakan hari istimewa kami",
      eventDate: "Sabtu, 16 Januari 2027",
      quote:
        "Setiap lembaran cerita yang ditulis tulus akan menemukan kebahagiaan.",
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
          story: "Pertemuan hangat yang menumbuhkan percakapan tentang masa depan.",
        },
        {
          year: "2027",
          title: "Hari Bahagia",
          story: "Melangkah bersama dalam ikatan suci dengan doa restu keluarga.",
        },
      ],
      gallery: [
        { id: "prev-1", title: "Potret Awal", note: `Edisi ${draft.name}` },
        { id: "prev-2", title: "Langkah Bersama", note: "Kenangan menanti hari H" },
      ],
      giftAccounts: [
        { bankName: "Bank BCA", accountNumber: "8120495811", accountHolder: nameA },
      ],
      isTemplateDemo: true,
    };
  }, [demoCoupleNames, draft.demoSlug, draft.id, draft.name, draft.slug, invitations]);

  function updateName(nextName: string) {
    setDraft((prev) => {
      if (isExistingOnServer || slugLockedManual) {
        return { ...prev, name: nextName };
      }
      const nextSlug = sanitizeSlugInput(nextName) || prev.slug;
      const nextDemoSlug = `demo-${nextSlug}`;
      return {
        ...prev,
        name: nextName,
        slug: nextSlug,
        demoSlug: nextDemoSlug,
        demoUrl: `/i/${nextDemoSlug}`,
      };
    });
  }

  function updateSlug(rawSlug: string) {
    setSlugLockedManual(true);
    const cleaned = sanitizeSlugInput(rawSlug);
    setDraft((prev) => {
      const nextDemoSlug = isExistingOnServer ? prev.demoSlug : `demo-${cleaned}`;
      return {
        ...prev,
        slug: cleaned,
        demoSlug: nextDemoSlug,
        demoUrl: `/i/${nextDemoSlug}`,
      };
    });
  }

  function updateThemeColor(
    key: "background" | "deep" | "accent" | "highlight" | "soft",
    hex: string
  ) {
    setDraft((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: hex,
      },
    }));
  }

  function applyPaletteSwatch(swatch: (typeof PALETTE_SWATCHES)[number]) {
    setDraft((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        background: swatch.background,
        deep: swatch.deep,
        accent: swatch.accent,
        highlight: swatch.highlight,
        soft: swatch.soft,
      },
    }));
  }

  function moveSection(index: number, direction: -1 | 1) {
    setDraft((prev) => {
      const list = [...prev.designConfig.sections];
      const target = index + direction;
      if (target < 0 || target >= list.length) return prev;
      const temp = list[index];
      list[index] = list[target];
      list[target] = temp;
      return {
        ...prev,
        designConfig: {
          ...prev.designConfig,
          sections: list,
        },
      };
    });
  }

  function toggleSectionVisibility(index: number) {
    setDraft((prev) => {
      const list = prev.designConfig.sections.map((sec, idx) =>
        idx === index ? { ...sec, visible: !sec.visible } : sec
      );
      return {
        ...prev,
        designConfig: {
          ...prev.designConfig,
          sections: list,
        },
      };
    });
  }

  function renameSection(index: number, label: string) {
    setDraft((prev) => {
      const list = prev.designConfig.sections.map((sec, idx) =>
        idx === index ? { ...sec, label } : sec
      );
      return {
        ...prev,
        designConfig: {
          ...prev.designConfig,
          sections: list,
        },
      };
    });
  }

  async function handleArtworkUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNotice(null);
    setUploadingImage(true);
    const res = await uploadArtwork(file);
    setUploadingImage(false);
    e.target.value = "";

    if (!res.success || !res.data) {
      setNotice({
        type: "error",
        text: res.error || "Gagal mengunggah gambar sampul.",
      });
      return;
    }

    setDraft((prev) => ({
      ...prev,
      designConfig: {
        ...prev.designConfig,
        artworkKey: res.data || prev.designConfig.artworkKey,
      },
    }));
    setNotice({
      type: "success",
      text: "Gambar kustom berhasil diunggah dan dipasang ke template.",
    });
  }

  async function handleGenerateAi() {
    if (aiPrompt.trim().length < 4) {
      setNotice({
        type: "error",
        text: "Tuliskan konsep desain minimal 4 karakter untuk Asisten AI.",
      });
      return;
    }
    setNotice(null);
    setAiLoading(true);
    const res = await generateAiDesign(aiPrompt.trim());
    setAiLoading(false);

    if (!res.success || !res.data) {
      setNotice({
        type: "error",
        text: res.error || "Asisten AI tidak dapat merancang desain saat ini.",
      });
      return;
    }

    const bp = res.data as {
      name?: string;
      slug?: string;
      category?: TemplateCategory;
      description?: string;
      features?: string[];
      theme?: {
        background?: string;
        deep?: string;
        accent?: string;
        highlight?: string;
        soft?: string;
      };
      designConfig?: {
        engine?: TemplateEngine;
        fontPairing?: FontPairingId;
        ornament3D?: Ornament3DType;
        particles?: ParticleType;
        paperTexture?: PaperTextureType;
        coverStyle?: CoverStyleType;
        depthIntensity?: number;
        artworkKey?: string;
        monogramSealText?: string;
      };
    };

    setDraft((prev) => {
      const nextSlug = !isExistingOnServer && bp.slug ? sanitizeSlugInput(bp.slug) : prev.slug;
      const nextDemoSlug = !isExistingOnServer ? `demo-${nextSlug}` : prev.demoSlug;
      return normalizeTemplateItem({
        ...prev,
        name: !isExistingOnServer && bp.name ? bp.name : prev.name,
        slug: nextSlug,
        demoSlug: nextDemoSlug,
        demoUrl: `/i/${nextDemoSlug}`,
        category: bp.category || prev.category,
        description: bp.description || prev.description,
        features: Array.isArray(bp.features) && bp.features.length > 0 ? bp.features : prev.features,
        theme: {
          ...prev.theme,
          background: bp.theme?.background || prev.theme.background,
          deep: bp.theme?.deep || prev.theme.deep,
          accent: bp.theme?.accent || prev.theme.accent,
          highlight: bp.theme?.highlight || prev.theme.highlight,
          soft: bp.theme?.soft || prev.theme.soft,
        },
        designConfig: {
          ...prev.designConfig,
          engine: bp.designConfig?.engine || prev.designConfig.engine,
          fontPairing: bp.designConfig?.fontPairing || prev.designConfig.fontPairing,
          ornament3D: bp.designConfig?.ornament3D || prev.designConfig.ornament3D,
          particles: bp.designConfig?.particles || prev.designConfig.particles,
          paperTexture: bp.designConfig?.paperTexture || prev.designConfig.paperTexture,
          coverStyle: bp.designConfig?.coverStyle || prev.designConfig.coverStyle,
          depthIntensity: bp.designConfig?.depthIntensity ?? prev.designConfig.depthIntensity,
          artworkKey: bp.designConfig?.artworkKey || prev.designConfig.artworkKey,
          monogramSealText:
            bp.designConfig?.monogramSealText || prev.designConfig.monogramSealText,
          sections: prev.designConfig.sections,
        },
      });
    });

    setNotice({
      type: "success",
      text: "Konsep AI berhasil diterapkan langsung ke panggung 3D & tema kanvas.",
    });
  }

  async function handleSaveTemplate(targetStatus: "draft" | "published") {
    setNotice(null);
    if (!draft.name.trim() || !draft.slug.trim()) {
      setNotice({
        type: "error",
        text: "Nama template dan slug URL wajib diisi sebelum menyimpan.",
      });
      return;
    }

    setSavingAction(targetStatus);
    if (isExistingOnServer && existingTemplate) {
      const res = await updateTemplate(existingTemplate.id, {
        ...draft,
        status: targetStatus,
      });
      setSavingAction(null);
      if (!res.success || !res.data) {
        setNotice({
          type: "error",
          text: res.error || "Gagal memperbarui template di server.",
        });
        return;
      }
      setDraft(normalizeTemplateItem(res.data));
      setNotice({
        type: "success",
        text:
          targetStatus === "published"
            ? `Template "${res.data.name}" diterbitkan dan langsung tampil di Landing Page publik.`
            : `Perubahan draft "${res.data.name}" berhasil disimpan.`,
      });
      return;
    }

    const res = await addTemplate({
      ...draft,
      status: targetStatus,
      demoCoupleNames,
    });
    setSavingAction(null);
    if (!res.success || !res.data) {
      setNotice({
        type: "error",
        text: res.error || "Gagal menyimpan template baru ke server.",
      });
      return;
    }

    setNotice({
      type: "success",
      text:
        targetStatus === "published"
          ? `Template baru "${res.data.name}" diterbitkan ke Katalog Publik beserta demo ${res.data.demoUrl}.`
          : `Template baru "${res.data.name}" tersimpan sebagai draft dengan demo ${res.data.demoUrl}.`,
    });
    onSelectTemplateId(res.data.id);
  }

  const currentArtworkPreview = resolveArtworkSource(
    draft.designConfig.artworkKey,
    draft.slug,
    draft.thumbnailClass
  );

  return (
    <div className="studio-shell">
      {/* Top Studio Bar */}
      <header className="studio-topbar">
        <div className="studio-topbar-left">
          <div className="studio-select-wrap">
            <label htmlFor="studio-template-picker" className="studio-sr-only">
              Pilih template untuk disunting
            </label>
            <select
              id="studio-template-picker"
              className="operator-form-select"
              value={isExistingOnServer && existingTemplate ? existingTemplate.id : "__new__"}
              onChange={(e) => {
                const val = e.target.value;
                onSelectTemplateId(val === "__new__" ? null : val);
              }}
            >
              <option value="__new__">+ Desain Template Baru</option>
              {allTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name} ({tpl.status === "published" ? "Live" : "Draft"})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectTemplateId(null);
              setDraft(createEmptyDraft());
              setSlugLockedManual(false);
              setNotice(null);
            }}
            className="operator-btn operator-btn-secondary operator-btn-sm"
          >
            <FilePlus2 size={14} aria-hidden="true" />
            <span>Desain Baru</span>
          </button>

          <div className="studio-viewport-toggle" role="group" aria-label="Ukuran layar pratinjau">
            <button
              type="button"
              className={viewportMode === "mobile" ? "active" : ""}
              onClick={() => setViewportMode("mobile")}
              title="Tampilan Ponsel 390px"
            >
              <Smartphone size={14} aria-hidden="true" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              className={viewportMode === "desktop" ? "active" : ""}
              onClick={() => setViewportMode("desktop")}
              title="Tampilan Desktop Lebar"
            >
              <Monitor size={14} aria-hidden="true" />
              <span>Desktop</span>
            </button>
          </div>
        </div>

        <div className="studio-topbar-right">
          {isExistingOnServer && (
            <Link
              href={draft.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="operator-btn operator-btn-secondary operator-btn-sm"
            >
              <span>Lihat Demo Live</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSaveTemplate("draft")}
            disabled={savingAction !== null}
            className="operator-btn operator-btn-secondary operator-btn-sm"
          >
            <Save size={14} aria-hidden="true" />
            <span>{savingAction === "draft" ? "Menyimpan..." : "Simpan Draft"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveTemplate("published")}
            disabled={savingAction !== null}
            className="operator-btn operator-btn-primary operator-btn-sm"
          >
            <Send size={14} aria-hidden="true" />
            <span>
              {savingAction === "published"
                ? "Menerbitkan..."
                : "Terbitkan ke Katalog"}
            </span>
          </button>
        </div>
      </header>

      {notice && (
        <div
          className={`studio-notice ${notice.type === "error" ? "is-error" : "is-success"}`}
          role="status"
        >
          <span>{notice.text}</span>
          {notice.type === "success" && isExistingOnServer && (
            <Link
              href={draft.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="op-inline-link"
            >
              <span>Buka {draft.demoUrl}</span>
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      {/* 3-Pane Canva Studio Workspace */}
      <div className="studio-grid">
        {/* LEFT PANE: Layers & AI 3D Assistant */}
        <aside className="studio-rail studio-rail-left">
          <div className="studio-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={leftTab === "layers"}
              className={leftTab === "layers" ? "active" : ""}
              onClick={() => setLeftTab("layers")}
            >
              <Layers size={14} aria-hidden="true" />
              <span>Lapisan ({draft.designConfig.sections.filter((s) => s.visible).length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={leftTab === "ai"}
              className={leftTab === "ai" ? "active" : ""}
              onClick={() => setLeftTab("ai")}
            >
              <Sparkles size={14} aria-hidden="true" />
              <span>Asisten AI 3D</span>
            </button>
          </div>

          <div className="studio-rail-body">
            {leftTab === "layers" ? (
              <div className="studio-layer-panel">
                <p className="studio-helper-copy">
                  Atur urutan adegan undangan, sembunyikan seksi yang tidak diperlukan, atau
                  ubah judul bab secara langsung.
                </p>

                <div className="studio-layer-list">
                  {draft.designConfig.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className={`studio-layer-row ${!sec.visible ? "is-hidden" : ""}`}
                    >
                      <div className="studio-layer-controls">
                        <button
                          type="button"
                          onClick={() => moveSection(idx, -1)}
                          disabled={idx === 0}
                          className="studio-icon-btn"
                          aria-label={`Naikkan ${sec.label}`}
                        >
                          <ArrowUp size={13} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, 1)}
                          disabled={idx === draft.designConfig.sections.length - 1}
                          className="studio-icon-btn"
                          aria-label={`Turunkan ${sec.label}`}
                        >
                          <ArrowDown size={13} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="studio-layer-info">
                        <input
                          type="text"
                          value={sec.label}
                          onChange={(e) => renameSection(idx, e.target.value)}
                          className="studio-layer-input"
                          aria-label={`Nama seksi ${sec.type}`}
                        />
                        <span className="studio-layer-type">{sec.type}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSectionVisibility(idx)}
                        className="studio-icon-btn"
                        aria-label={sec.visible ? `Sembunyikan ${sec.label}` : `Tampilkan ${sec.label}`}
                        title={sec.visible ? "Tampil" : "Tersembunyi"}
                      >
                        {sec.visible ? (
                          <Eye size={14} aria-hidden="true" />
                        ) : (
                          <EyeOff size={14} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="studio-ai-panel">
                <p className="studio-helper-copy">
                  Jelaskan suasana, palet warna, ornamen 3D, dan gaya tipografi yang Anda
                  inginkan. AI akan menyusun blueprint tema lengkap langsung ke kanvas.
                </p>

                <div className="operator-form-group">
                  <label htmlFor="ai-concept-prompt" className="operator-form-label">
                    Konsep Desain Undangan
                  </label>
                  <textarea
                    id="ai-concept-prompt"
                    className="operator-form-textarea"
                    rows={4}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Contoh: Nuansa malam beludru zamrud dengan aksen emas tempa 3D dan tipografi klasik puitis..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={aiLoading}
                  className="operator-btn operator-btn-primary"
                  style={{ width: "100%" }}
                >
                  <Wand2 size={15} aria-hidden="true" />
                  <span>{aiLoading ? "AI Sedang Meracik..." : "Rancang Tema dengan AI"}</span>
                </button>

                <div className="studio-ai-presets">
                  <span className="operator-form-label">Contoh Konsep Cepat</span>
                  {AI_QUICK_CONCEPTS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="studio-preset-btn"
                      onClick={() => setAiPrompt(preset.prompt)}
                    >
                      <strong>{preset.label}</strong>
                      <span>{preset.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER PANE: Interactive Live Preview Stage */}
        <section className="studio-canvas-stage" aria-label="Kanvas pratinjau langsung">
          <div className="studio-canvas-meta-bar">
            <span>
              <strong>{draft.name || "Tanpa Judul"}</strong> · {draft.designConfig.engine}
            </span>
            <span>
              {FONT_PAIRING_MAP[draft.designConfig.fontPairing]?.label} · Tekstur{" "}
              {draft.designConfig.paperTexture}
            </span>
          </div>

          <div
            className={`studio-canvas-viewport ${
              viewportMode === "mobile" ? "is-mobile" : "is-desktop"
            }`}
          >
            <div className="studio-canvas-frame">
              <TemplateDispatcher
                key={`${draft.designConfig.engine}-${draft.id}`}
                invitation={previewInvitation}
                template={draft}
                previewMode
              />
            </div>
          </div>
        </section>

        {/* RIGHT PANE: Full Theme, 3D & Media Inspector */}
        <aside className="studio-rail studio-rail-right">
          <div className="studio-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={rightTab === "style"}
              className={rightTab === "style" ? "active" : ""}
              onClick={() => setRightTab("style")}
            >
              <Palette size={13} aria-hidden="true" />
              <span>Warna</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rightTab === "stage"}
              className={rightTab === "stage" ? "active" : ""}
              onClick={() => setRightTab("stage")}
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>Ruang 3D</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rightTab === "identity"}
              className={rightTab === "identity" ? "active" : ""}
              onClick={() => setRightTab("identity")}
            >
              <span>Identitas</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={rightTab === "media"}
              className={rightTab === "media" ? "active" : ""}
              onClick={() => setRightTab("media")}
            >
              <span>Sampul</span>
            </button>
          </div>

          <div className="studio-rail-body">
            {/* TAB: WARNA & TIPOGRAFI */}
            {rightTab === "style" && (
              <div className="studio-inspector-stack">
                <div className="operator-form-group">
                  <label className="operator-form-label">Mesin Tampilan Template</label>
                  <select
                    className="operator-form-select"
                    value={draft.designConfig.engine}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          engine: e.target.value as TemplateEngine,
                        },
                      }))
                    }
                  >
                    <option value="atelier-3d">Atelier 3D WebGL (8 Babak + Segel 3D)</option>
                    <option value="storybook-cinematic">Storybook Cinematic (6 Babak Scrapbook)</option>
                    <option value="editorial-25d">Editorial 2.5D (5 Adegan Ringkas)</option>
                  </select>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Pasangan Tipografi</label>
                  <select
                    className="operator-form-select"
                    value={draft.designConfig.fontPairing}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          fontPairing: e.target.value as FontPairingId,
                        },
                      }))
                    }
                  >
                    {Object.entries(FONT_PAIRING_MAP).map(([id, item]) => (
                      <option key={id} value={id}>
                        {item.label} ({item.vibe})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="operator-form-group">
                  <span className="operator-form-label">Harmoni Palet Cepat</span>
                  <div className="studio-swatch-presets">
                    {PALETTE_SWATCHES.map((sw) => (
                      <button
                        key={sw.label}
                        type="button"
                        onClick={() => applyPaletteSwatch(sw)}
                        className="studio-swatch-chip"
                      >
                        <span className="studio-swatch-dots">
                          <i style={{ background: sw.background }} />
                          <i style={{ background: sw.deep }} />
                          <i style={{ background: sw.highlight }} />
                        </span>
                        <span>{sw.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="studio-color-grid">
                  {(
                    [
                      { key: "background", label: "Latar Kertas" },
                      { key: "deep", label: "Teks Utama" },
                      { key: "accent", label: "Aksen Segel" },
                      { key: "highlight", label: "Kilau Emas" },
                      { key: "soft", label: "Kartu Lembut" },
                    ] as const
                  ).map((item) => (
                    <label key={item.key} className="studio-color-picker">
                      <span>{item.label}</span>
                      <div className="studio-color-control">
                        <input
                          type="color"
                          value={draft.theme[item.key]}
                          onChange={(e) => updateThemeColor(item.key, e.target.value)}
                        />
                        <code>{draft.theme[item.key]}</code>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: RUANG 3D & TEKSTUR */}
            {rightTab === "stage" && (
              <div className="studio-inspector-stack">
                <div className="operator-form-group">
                  <label className="operator-form-label">Ornamen Utama 3D</label>
                  <select
                    className="operator-form-select"
                    value={draft.designConfig.ornament3D}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          ornament3D: e.target.value as Ornament3DType,
                        },
                      }))
                    }
                  >
                    <option value="wax-seal">Segel Lilin Logam (Wax Seal)</option>
                    <option value="floral-arch">Lengkung Botani 3D (Floral Arch)</option>
                    <option value="origami-crest">Monogram Origami Crest</option>
                    <option value="ribbon-halo">Halo Pita Emas (Ribbon Halo)</option>
                  </select>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Partikel Atmosfer 3D</label>
                  <select
                    className="operator-form-select"
                    value={draft.designConfig.particles}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          particles: e.target.value as ParticleType,
                        },
                      }))
                    }
                  >
                    <option value="gold-dust">Serbuk Emas Mengapung</option>
                    <option value="botanical-petals">Kelopak Dedaunan Botani</option>
                    <option value="paper-ribbons">Pita Kertas Halus</option>
                    <option value="none">Tanpa Partikel (Minimalis)</option>
                  </select>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Tekstur Permukaan Kertas</label>
                  <select
                    className="operator-form-select"
                    value={draft.designConfig.paperTexture}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          paperTexture: e.target.value as PaperTextureType,
                        },
                      }))
                    }
                  >
                    <option value="cotton-warm">Cotton Warm Hangat</option>
                    <option value="linen-sage">Linen Sage Bertekstur</option>
                    <option value="vellum-sheer">Vellum Sheer Berlapis Cahaya</option>
                    <option value="velvet-noir">Velvet Noir Dramatis</option>
                  </select>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Gaya Bingkai Sampul</label>
                  <select
                    className="operator-form-select"
                    value={draft.designConfig.coverStyle}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          coverStyle: e.target.value as CoverStyleType,
                        },
                      }))
                    }
                  >
                    <option value="envelope-seal">Amplop &amp; Segel Lilin</option>
                    <option value="arch-framed">Bingkai Lengkung Arch</option>
                    <option value="editorial-monogram">Monogram Tipografi Editorial</option>
                  </select>
                </div>

                <div className="operator-form-group">
                  <label htmlFor="monogram-input" className="operator-form-label">
                    Inisial Segel 3D (Maks 7 Karakter)
                  </label>
                  <input
                    id="monogram-input"
                    type="text"
                    maxLength={7}
                    className="operator-form-input"
                    value={draft.designConfig.monogramSealText || ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          monogramSealText: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="operator-form-group">
                  <label htmlFor="depth-range" className="operator-form-label">
                    Kedalaman Paralaks ({draft.designConfig.depthIntensity.toFixed(2)}x)
                  </label>
                  <input
                    id="depth-range"
                    type="range"
                    min={0.4}
                    max={1.4}
                    step={0.05}
                    value={draft.designConfig.depthIntensity}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        designConfig: {
                          ...prev.designConfig,
                          depthIntensity: Number(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* TAB: IDENTITAS & DEMO */}
            {rightTab === "identity" && (
              <div className="studio-inspector-stack">
                <div className="operator-form-group">
                  <label className="operator-form-label">Nama Template</label>
                  <input
                    type="text"
                    className="operator-form-input"
                    value={draft.name}
                    onChange={(e) => updateName(e.target.value)}
                    placeholder="Contoh: Rona Nilam Kraton 3D"
                  />
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Slug Unik Template</label>
                  <input
                    type="text"
                    className="operator-form-input"
                    value={draft.slug}
                    onChange={(e) => updateSlug(e.target.value)}
                    placeholder="rona-nilam-kraton-3d"
                  />
                  <span className="operator-form-hint">
                    Rute demo otomatis: <code>{draft.demoUrl}</code>
                  </span>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Kategori Katalog</label>
                  <select
                    className="operator-form-select"
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        category: e.target.value as TemplateCategory,
                      }))
                    }
                  >
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Nama Pasangan di Pratinjau Demo</label>
                  <input
                    type="text"
                    className="operator-form-input"
                    value={demoCoupleNames}
                    onChange={(e) => setDemoCoupleNames(e.target.value)}
                    placeholder="Ardian & Medina"
                  />
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">Deskripsi Katalog</label>
                  <textarea
                    className="operator-form-textarea"
                    rows={3}
                    value={draft.description}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="operator-form-group">
                  <label className="operator-form-label">
                    Daftar Fitur Unggulan (pisahkan dengan koma)
                  </label>
                  <textarea
                    className="operator-form-textarea"
                    rows={2}
                    value={draft.features.join(", ")}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        features: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* TAB: SAMPUL & UNGGAHAN */}
            {rightTab === "media" && (
              <div className="studio-inspector-stack">
                <div className="studio-artwork-current">
                  <div className="studio-artwork-preview-box">
                    <Image
                      src={currentArtworkPreview}
                      alt="Ilustrasi sampul template"
                      fill
                      sizes="260px"
                      referrerPolicy="no-referrer"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="studio-upload-bar">
                    <label className="operator-btn operator-btn-secondary operator-btn-sm studio-upload-label">
                      <ImagePlus size={14} aria-hidden="true" />
                      <span>
                        {uploadingImage ? "Mengunggah..." : "Unggah Gambar Sendiri"}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleArtworkUpload}
                        disabled={uploadingImage}
                        hidden
                      />
                    </label>
                    <span className="operator-form-hint">
                      PNG, JPG, atau WEBP (maks. 4MB) untuk katalog &amp; galeri.
                    </span>
                  </div>
                </div>

                <div className="operator-form-group">
                  <span className="operator-form-label">Atau Pilih Koleksi Artwork Studio</span>
                  <div className="studio-preset-thumbs">
                    {ARTWORK_PRESETS.map((preset) => {
                      const active = draft.designConfig.artworkKey === preset.key;
                      return (
                        <button
                          key={preset.key}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              designConfig: {
                                ...prev.designConfig,
                                artworkKey: preset.key,
                              },
                            }))
                          }
                          className={`studio-thumb-card ${active ? "active" : ""}`}
                        >
                          <div className="studio-thumb-img">
                            <Image
                              src={preset.image}
                              alt={preset.label}
                              fill
                              sizes="120px"
                              referrerPolicy="no-referrer"
                              style={{ objectFit: "cover" }}
                            />
                            {active && (
                              <span className="studio-thumb-check">
                                <Check size={12} aria-hidden="true" />
                              </span>
                            )}
                          </div>
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StudioRouteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { templates, invitations, isLoading } = useOperator();

  const requestedId = searchParams.get("id");
  const existingTemplate = useMemo(() => {
    if (!requestedId) return null;
    return templates.find((t) => t.id === requestedId) || null;
  }, [requestedId, templates]);

  function handleSelectTemplateId(id: string | null) {
    if (!id) {
      router.push("/operator/studio");
    } else {
      router.push(`/operator/studio?id=${encodeURIComponent(id)}`);
    }
  }

  if (isLoading && templates.length === 0) {
    return (
      <div className="operator-content">
        <div className="operator-card op-empty-state">
          Memuat ruang kerja Studio Desain...
        </div>
      </div>
    );
  }

  return (
    <StudioCanvasEditor
      key={existingTemplate ? existingTemplate.id : "new-template"}
      existingTemplate={existingTemplate}
      allTemplates={templates}
      invitations={invitations}
      isCreatingNew={!requestedId}
      onSelectTemplateId={handleSelectTemplateId}
    />
  );
}

export default function OperatorStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="operator-content">
          <div className="operator-card op-empty-state">
            Menyiapkan Studio Desain Rona...
          </div>
        </div>
      }
    >
      <StudioRouteContent />
    </Suspense>
  );
}
