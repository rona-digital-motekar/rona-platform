"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Layers, Move3d, Hand } from "lucide-react";

type DepthLayer = {
  index: string;
  id: "back" | "mid" | "front";
  title: string;
  summary: string;
  detail: string;
  zOffset: number;
};

const DEPTH_LAYERS: DepthLayer[] = [
  {
    index: "01",
    id: "back",
    title: "Latar Diorama & Pencahayaan Hangat",
    summary: "Bidang lengkung lembut dengan tekstur kertas katun dan bayangan ambien.",
    detail: "Memberi ruang bernapas pada mata tamu sebelum membaca detail acara.",
    zOffset: 0,
  },
  {
    index: "02",
    id: "mid",
    title: "Lembaran Cerita & Tipografi Lentur",
    summary: "Komposisi undangan melayang di atas alas kertas dengan gerak pegas organik.",
    detail: "Setiap pergantian babak terasa seperti membuka halaman buku kenangan.",
    zOffset: 44,
  },
  {
    index: "03",
    id: "front",
    title: "Detail Taktil & Respons Sentuh",
    summary: "Segel lilin timbul, pita washi, dan kartu acara yang bereaksi halus saat disentuh.",
    detail: "Dirancang nyaman digeser dengan satu ibu jari di ponsel maupun kursor desktop.",
    zOffset: 88,
  },
];

export default function DepthAnatomySection() {
  const [exploded, setExploded] = useState(true);
  const [activeLayer, setActiveLayer] = useState<"back" | "mid" | "front">("mid");

  return (
    <section className="depth-section" id="dimensi">
      <div className="depth-header">
        <div>
          <p className="eyebrow">Arsitektur Visual · 2.5D Tanpa Kaku</p>
          <h2 className="depth-title">
            Tiga lapisan ruang yang bergerak selaras.
          </h2>
        </div>

        <div className="depth-controls" role="group" aria-label="Mode tampilan lapisan 2.5D">
          <button
            type="button"
            onClick={() => setExploded(true)}
            className={`depth-mode-btn ${exploded ? "active" : ""}`}
          >
            <Layers size={14} aria-hidden="true" />
            Urai Lapisan
          </button>
          <button
            type="button"
            onClick={() => setExploded(false)}
            className={`depth-mode-btn ${!exploded ? "active" : ""}`}
          >
            <Move3d size={14} aria-hidden="true" />
            Tampilan Menyatu
          </button>
        </div>
      </div>

      <div className="depth-grid">
        {/* Interactive Isometric 2.5D Stack */}
        <div className="depth-canvas">
          <div className="depth-perspective-box">
            {/* Layer 1: Back Plane */}
            <motion.button
              type="button"
              onClick={() => setActiveLayer("back")}
              className={`depth-plane plane-back ${activeLayer === "back" ? "is-focused" : ""}`}
              animate={{
                rotateX: exploded ? 46 : 12,
                rotateZ: exploded ? -24 : -2,
                translateZ: exploded ? -10 : 0,
                y: exploded ? 46 : 0,
                scale: activeLayer === "back" ? 1.03 : 1,
              }}
              transition={{ type: "spring", stiffness: 130, damping: 19 }}
              aria-label="Inspeksi Lapisan 01: Latar Diorama"
            >
              <span className="plane-tag">01 · Latar Diorama</span>
              <div className="plane-arch-motif" aria-hidden="true" />
            </motion.button>

            {/* Layer 2: Mid Plane */}
            <motion.button
              type="button"
              onClick={() => setActiveLayer("mid")}
              className={`depth-plane plane-mid ${activeLayer === "mid" ? "is-focused" : ""}`}
              animate={{
                rotateX: exploded ? 46 : 6,
                rotateZ: exploded ? -24 : 0,
                translateZ: exploded ? 38 : 12,
                y: exploded ? -4 : -2,
                scale: activeLayer === "mid" ? 1.04 : 1,
              }}
              transition={{ type: "spring", stiffness: 135, damping: 18 }}
              aria-label="Inspeksi Lapisan 02: Lembaran Cerita"
            >
              <span className="plane-tag">02 · Lembaran Cerita</span>
              <div className="plane-editorial-sample" aria-hidden="true">
                <strong>D &amp; S</strong>
                <span>Sabtu, 19 Desember 2026</span>
              </div>
            </motion.button>

            {/* Layer 3: Front Plane */}
            <motion.button
              type="button"
              onClick={() => setActiveLayer("front")}
              className={`depth-plane plane-front ${activeLayer === "front" ? "is-focused" : ""}`}
              animate={{
                rotateX: exploded ? 46 : 0,
                rotateZ: exploded ? -24 : 2,
                translateZ: exploded ? 88 : 26,
                y: exploded ? -54 : -6,
                scale: activeLayer === "front" ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 145, damping: 17 }}
              aria-label="Inspeksi Lapisan 03: Detail Taktil"
            >
              <span className="plane-tag">03 · Detail Taktil</span>
              <div className="plane-tactile-row" aria-hidden="true">
                <span className="plane-seal-dot">❧</span>
                <span className="plane-gesture-hint">
                  <Hand size={12} /> Usap &amp; Buka
                </span>
              </div>
            </motion.button>
          </div>
          <p className="depth-canvas-caption">
            Klik salah satu lapisan atau ganti mode untuk melihat susunan kedalaman 2.5D.
          </p>
        </div>

        {/* Layer Specifications */}
        <div className="depth-list">
          {DEPTH_LAYERS.map((layer) => {
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`depth-list-item ${isSelected ? "selected" : ""}`}
              >
                <div className="depth-item-num">{layer.index}</div>
                <div className="depth-item-copy">
                  <h3>{layer.title}</h3>
                  <p>{layer.summary}</p>
                  {isSelected && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="depth-item-detail"
                    >
                      {layer.detail}
                    </motion.span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
