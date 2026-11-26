"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff, Layers } from "lucide-react";
import Invitation3DStage from "@/components/three/Invitation3DStage";
import type { TemplateItem } from "@/lib/templates";
import type { InvitationData } from "@/lib/invitations";

type HeroWebGLStageProps = {
  templates: TemplateItem[];
  invitations: Record<string, InvitationData>;
};

export default function HeroWebGLStage({
  templates,
  invitations,
}: HeroWebGLStageProps) {
  const featuredList = templates.length > 0 ? templates : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [explode, setExplode] = useState(0);
  const [zenMode, setZenMode] = useState(false);

  const safeIdx = featuredList.length > 0 ? activeIndex % featuredList.length : 0;
  const current = featuredList[safeIdx];

  if (!current) return null;

  const linkedInvite = invitations[current.demoSlug];
  const coupleNames = linkedInvite?.coupleNames || "Ardian & Medina";
  const eventDate = linkedInvite?.eventDate || "Sabtu, 19 Desember 2026";
  const monogram =
    current.designConfig?.monogramSealText ||
    (linkedInvite
      ? `${linkedInvite.firstNameA.slice(0, 1)} · ${linkedInvite.firstNameB.slice(0, 1)}`
      : "R · M");

  return (
    <div className="hero-webgl-wrap">
      <div className="hero-webgl-stage-box">
        {/* Top-left subtle info label (uncluttered, zero pills) */}
        <div className="hero-webgl-caption">
          <span className="hero-webgl-title">{current.name}</span>
          <span className="hero-webgl-sep" aria-hidden="true">
            ·
          </span>
          <span className="hero-webgl-couple">{coupleNames}</span>
        </div>

        {/* Interactive Three.js 3D Scene */}
        <Invitation3DStage
          backgroundHex={current.theme.background}
          deepHex={current.theme.deep}
          accentHex={current.theme.accent}
          highlightHex={current.theme.highlight}
          softHex={current.theme.soft}
          ornament3D={current.designConfig.ornament3D}
          particles={current.designConfig.particles}
          monogramText={monogram}
          coupleNames={coupleNames}
          eventDate={eventDate}
          explode={explode}
          height={470}
          onCardClick={() =>
            setActiveIndex((prev) => (prev + 1) % Math.max(1, featuredList.length))
          }
        />

        {/* Zen / Dock Collapse Toggle + Compact Bottom Control Dock */}
        <div className="hero-dock-anchor">
          <button
            type="button"
            className="hero-dock-collapse"
            onClick={() => setZenMode((prev) => !prev)}
          >
            {zenMode ? (
              <>
                <Eye size={13} aria-hidden="true" />
                <span>Tampilkan Kontrol 3D</span>
              </>
            ) : (
              <>
                <EyeOff size={13} aria-hidden="true" />
                <span>Mode Fokus</span>
              </>
            )}
          </button>

          {!zenMode && (
            <div className="hero-bottom-dock" role="region" aria-label="Kontrol panggung 3D">
              <div className="hero-dock-tabs" role="tablist" aria-label="Pilih tema 3D">
                {featuredList.slice(0, 4).map((tpl, idx) => (
                  <button
                    key={tpl.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === safeIdx}
                    onClick={() => setActiveIndex(idx)}
                    className={`hero-dock-tab ${idx === safeIdx ? "active" : ""}`}
                  >
                    {tpl.name.replace(/^Rona\s+/i, "")}
                  </button>
                ))}
              </div>

              <div className="hero-dock-actions">
                <button
                  type="button"
                  className={`hero-dock-btn ${explode > 0 ? "active" : ""}`}
                  onClick={() => setExplode((prev) => (prev > 0 ? 0 : 1))}
                  title="Pisahkan lapisan kertas 2.5D dan ornamen 3D"
                >
                  <Layers size={14} aria-hidden="true" />
                  <span>{explode > 0 ? "Satukan" : "Urai 3D"}</span>
                </button>

                <Link href={current.demoUrl} className="hero-dock-cta">
                  <span>Buka Demo</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
