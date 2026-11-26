"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import {
  ArrowUpRight,
  Copy,
  Palette,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useOperator } from "@/lib/operator-context";
import { TEMPLATE_CATEGORIES, type TemplateItem } from "@/lib/templates";
import { resolveArtworkSource } from "@/lib/template-artworks";

export default function OperatorTemplatesPage() {
  const {
    templates,
    addTemplate,
    toggleStatus,
    deleteTemplate,
    isLoading,
  } = useOperator();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        tpl.name.toLowerCase().includes(q) ||
        tpl.slug.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q);
      const matchCategory =
        selectedCategory === "ALL" || tpl.category === selectedCategory;
      const matchStatus =
        selectedStatus === "ALL" || tpl.status === selectedStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [templates, searchQuery, selectedCategory, selectedStatus]);

  async function handleDuplicate(tpl: TemplateItem) {
    setActionMessage(null);
    let idx = templates.length + 1;
    let newSlug = `${tpl.slug}-salinan-${idx}`;
    while (templates.some((t) => t.slug === newSlug)) {
      idx += 1;
      newSlug = `${tpl.slug}-salinan-${idx}`;
    }
    const res = await addTemplate({
      ...tpl,
      name: `${tpl.name} (Salinan)`,
      slug: newSlug,
      status: "draft",
      demoSlug: `demo-${newSlug}`,
      demoUrl: `/i/demo-${newSlug}`,
    });
    if (res.success) {
      setActionMessage(`Template "${tpl.name}" berhasil diduplikasi sebagai draft.`);
    } else {
      setActionMessage(res.error || "Gagal menduplikasi template.");
    }
  }

  async function handleDelete(tpl: TemplateItem) {
    const res = await deleteTemplate(tpl.id);
    setConfirmDeleteId(null);
    if (res.success) {
      setActionMessage(`Template "${tpl.name}" telah dihapus.`);
    } else {
      setActionMessage(res.error || "Gagal menghapus template.");
    }
  }

  return (
    <div className="operator-content">
      <div className="operator-page-header">
        <div>
          <p className="eyebrow" style={{ marginBottom: "6px" }}>
            Registri Desain Studio
          </p>
          <h1 className="operator-page-title">Katalog Template Undangan</h1>
          <p className="operator-page-subtitle">
            Semua desain yang diterbitkan (Published) di sini langsung tampil di Landing Page
            publik untuk seluruh pengunjung.
          </p>
        </div>
        <Link href="/operator/studio" className="operator-btn operator-btn-primary">
          <Plus size={15} aria-hidden="true" />
          <span>Buat Template di Studio</span>
        </Link>
      </div>

      {actionMessage && (
        <div className="op-notice-bar" role="status">
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="op-notice-close"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="operator-filter-bar">
        <div className="operator-search-box">
          <Search size={15} className="operator-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="operator-search-input"
            placeholder="Cari nama template, slug, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="op-filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="operator-form-select"
            aria-label="Filter kategori"
          >
            <option value="ALL">Semua Kategori</option>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="operator-form-select"
            aria-label="Filter status"
          >
            <option value="ALL">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="operator-card op-empty-state">Memuat katalog template...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="operator-card op-empty-state">
          <p>Tidak ada template yang cocok dengan filter saat ini.</p>
          <button
            type="button"
            className="operator-btn operator-btn-secondary operator-btn-sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedStatus("ALL");
            }}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="operator-templates-grid">
          {filteredTemplates.map((tpl) => {
            const artwork = resolveArtworkSource(
              tpl.designConfig?.artworkKey,
              tpl.slug,
              tpl.thumbnailClass
            );
            return (
              <article key={tpl.id} className="operator-template-card">
                <div
                  className="op-tpl-cover"
                  style={{ background: tpl.theme.soft }}
                >
                  <Image
                    src={artwork}
                    alt={tpl.name}
                    fill
                    sizes="(max-width: 768px) 90vw, 380px"
                    referrerPolicy="no-referrer"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="op-tpl-scrim" />
                  <div className="op-tpl-cover-meta">
                    <span>{tpl.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {tpl.status === "published" ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="operator-template-body">
                  <div className="operator-template-header">
                    <div>
                      <h3 className="operator-template-name">{tpl.name}</h3>
                      <code className="operator-template-slug">{tpl.slug}</code>
                    </div>
                  </div>

                  <p className="operator-template-desc">{tpl.description}</p>

                  <div className="operator-template-palette">
                    <span className="op-palette-label">Palet:</span>
                    {[
                      tpl.theme.background,
                      tpl.theme.deep,
                      tpl.theme.accent,
                      tpl.theme.highlight,
                    ].map((hex, i) => (
                      <span
                        key={`${tpl.id}-c-${i}`}
                        className="operator-palette-circle"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>

                  <div className="operator-template-actions">
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <Link
                        href={`/operator/studio?id=${encodeURIComponent(tpl.id)}`}
                        className="operator-btn operator-btn-primary operator-btn-sm"
                      >
                        <Palette size={13} aria-hidden="true" />
                        <span>Studio</span>
                      </Link>
                      <Link
                        href={tpl.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="operator-btn operator-btn-secondary operator-btn-sm"
                      >
                        <span>Demo</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(tpl)}
                        className="operator-btn operator-btn-secondary operator-btn-sm"
                        title="Duplikat template"
                      >
                        <Copy size={13} aria-hidden="true" />
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggleStatus(tpl.id)}
                        className="operator-btn operator-btn-secondary operator-btn-sm"
                      >
                        {tpl.status === "published" ? "Tarik Draft" : "Terbitkan"}
                      </button>

                      {templates.length > 1 &&
                        (confirmDeleteId === tpl.id ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(tpl)}
                            className="operator-btn operator-btn-danger operator-btn-sm"
                          >
                            Hapus Ya
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(tpl.id)}
                            className="operator-btn operator-btn-danger operator-btn-sm"
                            aria-label={`Hapus ${tpl.name}`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
