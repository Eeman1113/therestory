/**
 * Softer, museum-plaque category palette. Warm terracottas, sage blues,
 * olive greens, muted purples, gold ochres. Each hue carries a semantic
 * association intended to be readable at a glance:
 *
 *   politics  → warm terracotta
 *   war       → deep near-black
 *   science   → sage blue
 *   religion  → muted purple
 *   culture   → gold ochre
 *   economy   → olive green
 *   exploration → prussian teal
 *   disaster  → burnt sienna
 *
 * Each entry now also carries a `tint` (very pale fill for hover-card strips
 * and category pills) and a `deep` (darker version for pill text on tint bg).
 */

import type { Category } from "@/lib/content/schema";

export interface CategoryColor {
  light: string; // main colour on Paper (light) theme
  dark: string;  // main colour on Ink (dark) theme
  tint: string;  // very pale fill for card strips / pills
  deep: string;  // darker version for text on tint bg
}

export const CATEGORY_COLORS: Record<Category, CategoryColor> = {
  "politics-empires":   { light: "#A9634D", dark: "#D08D75", tint: "#F4E7E1", deep: "#7A4232" },
  "war-conflict":       { light: "#2A2622", dark: "#7A7268", tint: "#E4E1DA", deep: "#1A1815" },
  "science-technology": { light: "#5D7F9E", dark: "#8FAAC2", tint: "#E5EDF3", deep: "#3D5B75" },
  "religion-ideas":     { light: "#97739F", dark: "#B99DC0", tint: "#F0E8F1", deep: "#644A6B" },
  "art-culture":        { light: "#B98F4A", dark: "#D6B27B", tint: "#F5ECDA", deep: "#7C5D22" },
  "economy-trade":      { light: "#6E8F74", dark: "#9BB9A0", tint: "#E7EFE8", deep: "#455F4B" },
  "exploration":        { light: "#5D8A8A", dark: "#8FB1B1", tint: "#E4EEEE", deep: "#3B6363" },
  "disaster-disease":   { light: "#A87050", dark: "#CC957A", tint: "#F1E4DA", deep: "#764A2E" },
};

/**
 * The first category listed on an event wins. Content authors put the most
 * defining category first.
 */
export function markerColor(categories: Category[]): CategoryColor {
  const c = categories[0] ?? "politics-empires";
  return CATEGORY_COLORS[c];
}

/**
 * Marker radius by significance. History isn't flat — the biggest moments
 * get the biggest dots. Kept fairly small (paper-map style) so they read as
 * pin-heads rather than infographic bubbles.
 */
export function markerRadius(significance: number, hoverBoost = false): number {
  const base =
    significance >= 5 ? 5 :
    significance === 4 ? 4.5 :
    significance === 3 ? 4 :
    significance === 2 ? 3.5 :
                         3;
  return hoverBoost ? base + 2 : base;
}
