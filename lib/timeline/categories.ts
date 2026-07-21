/**
 * Japanese Zen category palette. Each entry is drawn from traditional
 * pigment names — the kind you'd find on a shoji-lit museum plaque —
 * refined for Apple-clean legibility on the warm paper background.
 *
 *   politics-empires    → enji-iro    (臙脂色)  imperial crimson
 *   war-conflict        → sumi-iro    (墨色)   warm charcoal ink
 *   science-technology  → hanada-iro  (縹色)   traditional deep blue
 *   religion-ideas      → shion-iro   (紫苑色)  aster purple
 *   art-culture         → yamabuki-iro(山吹色) kerria gold
 *   economy-trade       → matcha-iro  (抹茶色)  powdered green tea
 *   exploration         → asagi-iro   (浅葱色)  pale-scallion teal
 *   disaster-disease    → shu-iro     (朱色)   vermillion
 *
 * Each entry carries `light` and `dark` (main colour per theme), plus
 * `tint` (very pale fill for card strips + pills) and `deep` (darker
 * variant for pill text on the tint background).
 */

import type { Category } from "@/lib/content/schema";

export interface CategoryColor {
  light: string; // main colour on Paper (light) theme
  dark: string;  // main colour on Ink (dark) theme
  tint: string;  // very pale fill for card strips / pills
  deep: string;  // darker version for text on tint bg
}

export const CATEGORY_COLORS: Record<Category, CategoryColor> = {
  "politics-empires":   { light: "#B0343B", dark: "#E58085", tint: "#F8E5E6", deep: "#7A1F25" },
  "war-conflict":       { light: "#2B2724", dark: "#8A8074", tint: "#E5E1D8", deep: "#161412" },
  "science-technology": { light: "#245F87", dark: "#8ABFDC", tint: "#E1ECF4", deep: "#123F5B" },
  "religion-ideas":     { light: "#7C4FA4", dark: "#C4A5D8", tint: "#EEE5F3", deep: "#4A2A66" },
  "art-culture":        { light: "#C58721", dark: "#F0C378", tint: "#F8ECD3", deep: "#7A5210" },
  "economy-trade":      { light: "#5F8A55", dark: "#A9CFA0", tint: "#E6F0E1", deep: "#385430" },
  "exploration":        { light: "#2E8A96", dark: "#8CC7CF", tint: "#DEEEF0", deep: "#1B5A63" },
  "disaster-disease":   { light: "#CE5A2E", dark: "#F49269", tint: "#F7E2D4", deep: "#7A2F13" },
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
