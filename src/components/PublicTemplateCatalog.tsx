"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Smartphone, X } from "lucide-react";
import type { TemplateCategory, TemplateItem } from "@/lib/templates";
import type { InvitationData } from "@/lib/invitations";
import { resolveArtworkSource } from "@/lib/template-artworks";
import TemplateDispatcher from "@/components/templates/TemplateDispatcher";

type PublicTemplateCatalogProps = {
  initialTemplates: TemplateItem[];
  invitationsMap: Record<string, InvitationData>;
};

export default function PublicTemplateCatalog({
  initialTemplates,
  invitationsMap,
}: PublicTemplateCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [simulatorTemplate, setSimulatorTemplate] = useState<TemplateItem | null>(null);

  const publishedTemplates = useMemo(
    () => initialTemplates.filter((t) => t.status === "published"),
    [initialTemplates]
  );

  const availableCategories = useMemo(() => {
    const cats = new Set<TemplateCategory>();
    publishedTemplates.forEach((t) => cats.add(t.category));
    return Array.from(cats);
  }, [publishedTemplates]);

  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "ALL") return publishedTemplates;
    return publishedTemplates.filter((t) => t.category === selectedCategory);
  }, [publishedTemplates, selectedCategory]);

  const simulatorInvitation = useMemo<InvitationData | null>(() => {
    if (!simulatorTemplate) return null;
    const found = invitationsMap[simulatorTemplate.demoSlug];
    if (found) return found;
    return {
      slug: simulatorTemplate.demoSlug,
      templateId: simulatorTemplate.id,
      templateSlug: simulatorTemplate.slug,
      coupleNames: "Ardian & Medina",
      firstNameA: "Ardian",
      firstNameB: "Medina",
      greeting: "Dengan penuh sukacita, kami mengundang kehadiran Anda",
      eventDate: "Sabtu, 16 Januari 2027",
      quote: "Setiap lembaran cerita yang ditulis tulus akan menemukan kebahagiaan.",
      akad: {
        title: "Akad Nikah",
        dateLabel: "Sabtu, 16 Januari 2027",
        timeLabel: "08.30 – 10.30 WIB",
        venue: "Paviliun Taman Motekar",
        address: "Jl. Siliwangi No. 28, Bandung",
      },
      reception: {
        title: "Resepsi",
        dateLabel: "Sabtu, 16 Januari 2027",
        timeLabel: "11.30 – 15.00 WIB",
        venue: "Pendopo Agung Rona",
        address: "Jl. Siliwangi No. 28, Bandung",
      },
    };
  }, [simulatorTemplate, invitationsMap]);

  return (
    <section className="catalog-section" id="katalog">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">Katalog Resmi · Koleksi Terbit</p>
          <h2>Pilihan Desain &amp; Tema.</h2>
          <p className="catalog-subtitle">
            Setiap tema dirancang dan diterbitkan langsung dari studio Rona dalam komposisi
            2.5D dan 3D yang luwes, ringan dibuka di ponsel tamu, dan siap dipakai siapa saja.
          </p>
        </div>

        {/* Interactive Category Segmented Filter */}
        <div className="catalog-filter-bar" role="tablist" aria-label="Filter kategori template">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === "ALL"}
            className={`catalog-tab-btn ${selectedCategory === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            Semua ({publishedTemplates.length})
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              className={`catalog-tab-btn ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2.5D Showcase Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="catalog-empty">
          Belum ada template yang terbit pada kategori ini.
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredTemplates.map((tpl, index) => {
            const artwork = resolveArtworkSource(
              tpl.designConfig?.artworkKey,
              tpl.slug,
              tpl.thumbnailClass
            );
            const demoInvite = invitationsMap[tpl.demoSlug];
            const demoLabel = demoInvite
              ? demoInvite.coupleNames
              : tpl.demoSlug.replace(/-/g, " ");
            const engineLabel =
              tpl.designConfig?.engine === "atelier-3d"
                ? "Atelier 3D"
                : tpl.designConfig?.engine === "storybook-cinematic"
                ? "Storybook"
                : "Editorial 2.5D";

            return (
              <motion.article
                key={tpl.id}
                className="catalog-card-25d"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -6 }}
              >
                {/* Elevated 2.5D Artwork Frame */}
                <div
                  className="catalog-art-stage"
                  style={{
                    background: `linear-gradient(145deg, ${tpl.theme.background} 0%, ${tpl.theme.soft} 100%)`,
                  }}
                >
                  <div className="catalog-art-depth-frame">
                    <Image
                      src={artwork}
                      alt={`Pratinjau 2.5D template ${tpl.name}`}
                      fill
                      sizes="(max-width: 768px) 92vw, 380px"
                      referrerPolicy="no-referrer"
                      className="catalog-art-img"
                    />
                  </div>
                </div>

                {/* Clean Typography & Unboxed Metadata */}
                <div className="catalog-card-body">
                  <div className="catalog-meta-line">
                    <span>{tpl.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{engineLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{demoLabel}</span>
                  </div>

                  <h3>{tpl.name}</h3>
                  <p className="catalog-desc">{tpl.description}</p>

                  <ul className="catalog-feature-list">
                    {tpl.features.slice(0, 3).map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>

                  <div className="catalog-card-footer">
                    <div className="catalog-swatches" aria-label="Palet warna template">
                      <span style={{ backgroundColor: tpl.theme.background }} />
                      <span style={{ backgroundColor: tpl.theme.accent }} />
                      <span style={{ backgroundColor: tpl.theme.deep }} />
                    </div>

                    <div className="catalog-footer-actions">
                      <button
                        type="button"
                        onClick={() => setSimulatorTemplate(tpl)}
                        className="catalog-preview-btn"
                      >
                        <Smartphone size={14} aria-hidden="true" />
                        <span>Simulasi</span>
                      </button>
                      <Link href={tpl.demoUrl} className="catalog-demo-link">
                        <span>Lihat Demo</span>
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Interactive In-Page Phone Simulator Modal */}
      <AnimatePresence>
        {simulatorTemplate && simulatorInvitation && (
          <motion.div
            className="simulator-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSimulatorTemplate(null)}
          >
            <motion.div
              className="simulator-dialog"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`Simulasi Interaktif ${simulatorTemplate.name}`}
            >
              <div className="simulator-topbar">
                <div>
                  <strong>{simulatorTemplate.name}</strong>
                  <span>
                    {simulatorTemplate.category} · Demo {simulatorInvitation.coupleNames}
                  </span>
                </div>
                <div className="simulator-top-actions">
                  <Link href={simulatorTemplate.demoUrl} className="catalog-demo-link">
                    <span>Buka Layar Penuh</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    className="simulator-close-btn"
                    onClick={() => setSimulatorTemplate(null)}
                    aria-label="Tutup simulasi"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="simulator-device-stage">
                <div className="simulator-phone-bezel">
                  <div className="simulator-phone-screen">
                    <TemplateDispatcher
                      invitation={simulatorInvitation}
                      template={simulatorTemplate}
                      previewMode
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
