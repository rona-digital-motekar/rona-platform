"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "motion/react";
import { ArrowUpRight, Layers, Sparkles } from "lucide-react";
import heroDioramaImg from "@/assets/images/hero_diorama_stage_1795266620562.jpg";
import ivory25dImg from "@/assets/images/tpl_ivory_editorial_25d_1795266621943.jpg";
import terracotta25dImg from "@/assets/images/tpl_terracotta_25d_1795266621779.jpg";
import storybook25dImg from "@/assets/images/tpl_storybook_25d_1795266622270.jpg";

type FeaturedStory = {
  id: string;
  couple: string;
  themeName: string;
  date: string;
  href: string;
  accent: string;
  image: typeof heroDioramaImg;
  sealLabel: string;
};

const FEATURED_STORIES: FeaturedStory[] = [
  {
    id: "storybook",
    couple: "Dimas & Sarah",
    themeName: "Storybook Cinematic",
    date: "19 Des 2026",
    href: "/i/dimas-sarah",
    accent: "#995d43",
    image: storybook25dImg,
    sealLabel: "D · S",
  },
  {
    id: "ivory",
    couple: "Raka & Alya",
    themeName: "Ivory Editorial",
    date: "22 Nov 2026",
    href: "/i/raka-alya",
    accent: "#64765e",
    image: ivory25dImg,
    sealLabel: "R · A",
  },
  {
    id: "terracotta",
    couple: "Andika & Nadira",
    themeName: "Earth Terracotta",
    date: "12 Des 2026",
    href: "/i/andika-nadira",
    accent: "#b57e60",
    image: terracotta25dImg,
    sealLabel: "A · N",
  },
];

export default function HeroDioramaStage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = FEATURED_STORIES[activeIndex];

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const smoothX = useSpring(pointerX, { stiffness: 110, damping: 20, mass: 0.9 });
  const smoothY = useSpring(pointerY, { stiffness: 110, damping: 20, mass: 0.9 });

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [9, -9]);
  const floatShiftX = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const floatShiftY = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);
  const backShiftX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
  const backShiftY = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    pointerX.set(nx);
    pointerY.set(ny);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function cycleStory() {
    setActiveIndex((prev) => (prev + 1) % FEATURED_STORIES.length);
  }

  return (
    <div
      className="diorama-viewport"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="diorama-stage"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Back Layer: Soft Organic Paper Aura */}
        <motion.div
          className="diorama-back-aura"
          style={{ x: backShiftX, y: backShiftY }}
          aria-hidden="true"
        />

        {/* Mid Layer: Sculpted Arch Frame with 2.5D Artwork */}
        <motion.div
          className="diorama-arch-frame"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="diorama-image-fallback">
            <Image
              src={heroDioramaImg}
              alt="Diorama kertas berlapis Rona Studio dengan lengkung botani 2.5D"
              fill
              priority
              sizes="(max-width: 768px) 92vw, 520px"
              referrerPolicy="no-referrer"
              style={{ objectFit: "cover" }}
            />
            <div className="diorama-scrim" aria-hidden="true" />
          </div>
        </motion.div>

        {/* Front Layer 1: Floating Tactile Invitation Suite Card */}
        <motion.div
          className="diorama-floating-card"
          style={{ x: floatShiftX, y: floatShiftY }}
          animate={{ rotate: [-1.5, 1, -1.5] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.03 }}
        >
          <div className="diorama-card-thumb">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="diorama-card-thumb-inner"
              >
                <Image
                  src={current.image}
                  alt={`Pratinjau 2.5D tema ${current.themeName}`}
                  fill
                  sizes="240px"
                  referrerPolicy="no-referrer"
                  style={{ objectFit: "cover" }}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="diorama-card-meta">
            <span className="diorama-card-kicker">{current.themeName}</span>
            <strong className="diorama-card-couple">{current.couple}</strong>
            <span className="diorama-card-date">{current.date}</span>
            <div className="diorama-card-actions">
              <Link href={current.href} className="diorama-card-link">
                Buka Demo <ArrowUpRight size={13} aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={cycleStory}
                className="diorama-cycle-btn"
                aria-label="Ganti pratinjau tema undangan"
                title="Lihat tema lain"
              >
                <Layers size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Front Layer 2: Embossed Floating Wax Seal */}
        <motion.button
          type="button"
          onClick={cycleStory}
          className="diorama-wax-seal"
          style={{ backgroundColor: current.accent }}
          animate={{ y: [0, 8, 0], rotate: [-6, 4, -6] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          whileTap={{ scale: 0.92 }}
          aria-label={`Segel cerita ${current.couple}, ketuk untuk ganti tema`}
        >
          <Sparkles size={12} className="diorama-seal-icon" aria-hidden="true" />
          <span>{current.sealLabel}</span>
        </motion.button>
      </motion.div>

      {/* Interactive Story Selector Strip */}
      <div className="diorama-selector" role="tablist" aria-label="Pilih tema pratinjau hero">
        {FEATURED_STORIES.map((story, idx) => (
          <button
            key={story.id}
            type="button"
            role="tab"
            aria-selected={idx === activeIndex}
            onClick={() => setActiveIndex(idx)}
            className={`diorama-selector-btn ${idx === activeIndex ? "active" : ""}`}
          >
            {story.themeName}
          </button>
        ))}
      </div>
    </div>
  );
}
