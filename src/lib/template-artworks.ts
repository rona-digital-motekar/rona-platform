"use client";

import type { StaticImageData } from "next/image";
import heroDioramaImg from "@/assets/images/hero_diorama_stage_1795266620562.jpg";
import ivory25dImg from "@/assets/images/tpl_ivory_editorial_25d_1795266621943.jpg";
import terracotta25dImg from "@/assets/images/tpl_terracotta_25d_1795266621779.jpg";
import storybook25dImg from "@/assets/images/tpl_storybook_25d_1795266622270.jpg";
import atelierRoyal3dImg from "@/assets/images/tpl_atelier_royal_3d_1795579176018.jpg";
import sageBotanical25dImg from "@/assets/images/tpl_sage_botanical_25d_1795579175858.jpg";

export type ArtworkPresetOption = {
  key: string;
  label: string;
  image: StaticImageData;
};

export const ARTWORK_PRESETS: ArtworkPresetOption[] = [
  { key: "atelier-royal-3d", label: "Atelier Royal Gold 3D", image: atelierRoyal3dImg },
  { key: "storybook", label: "Storybook Scrapbook 2.5D", image: storybook25dImg },
  { key: "ivory", label: "Ivory Editorial 2.5D", image: ivory25dImg },
  { key: "terracotta", label: "Earth Terracotta 2.5D", image: terracotta25dImg },
  { key: "sage-botanical-25d", label: "Sage Botanical Paper-Cut", image: sageBotanical25dImg },
  { key: "hero-diorama", label: "Rona Arch Diorama", image: heroDioramaImg },
];

export function resolveArtworkSource(
  artworkKey?: string,
  slug?: string,
  thumbnailClass?: string
): StaticImageData | string {
  if (artworkKey && (artworkKey.startsWith("/uploads/") || artworkKey.startsWith("https://"))) {
    return artworkKey;
  }

  const matched = ARTWORK_PRESETS.find((item) => item.key === artworkKey);
  if (matched) return matched.image;

  if (slug === "rona-atelier-royal-3d" || thumbnailClass === "theme-atelier-3d") {
    return atelierRoyal3dImg;
  }
  if (slug === "rona-storybook-cinematic" || thumbnailClass === "theme-storybook") {
    return storybook25dImg;
  }
  if (slug === "rona-earth-terracotta" || thumbnailClass === "theme-terracotta") {
    return terracotta25dImg;
  }
  if (slug === "rona-sage-botanical" || thumbnailClass === "theme-sage") {
    return sageBotanical25dImg;
  }
  if (slug === "rona-ivory-editorial" || thumbnailClass === "theme-ivory") {
    return ivory25dImg;
  }
  return heroDioramaImg;
}
