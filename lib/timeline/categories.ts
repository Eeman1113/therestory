/**
 * Semantic category palette. Each hue carries an intuitive association so
 * the timeline can be read at a glance:
 *   politics → red        war      → near-black
 *   science  → blue       religion → aubergine
 *   culture  → ochre      economy  → green
 *   exploration → prussian teal    disaster → burnt sienna
 *
 * Dark-mode variants are lightened toward warm bone so the palette breathes
 * on Ink backgrounds without losing hue identity.
 */

import type { Category } from "@/lib/content/schema";

export interface CategoryColor {
  light: string;
  dark: string;
}

export const CATEGORY_COLORS: Record<Category, CategoryColor> = {
  "politics-empires":    { light: "#8A2A1E", dark: "#C4614F" }, // red
  "war-conflict":        { light: "#1A1815", dark: "#4A4238" }, // near-black / dark warm
  "science-technology":  { light: "#2E4057", dark: "#7E9FBD" }, // iron blue
  "religion-ideas":      { light: "#5A3A5A", dark: "#9A7A9A" }, // aubergine
  "art-culture":         { light: "#8A6A2A", dark: "#C4A374" }, // ochre / yellow
  "economy-trade":       { light: "#3A5A48", dark: "#7DA48D" }, // green
  "exploration":         { light: "#2A5A6A", dark: "#6A9AAD" }, // prussian teal
  "disaster-disease":    { light: "#8A4A2A", dark: "#C4855F" }, // burnt sienna
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
 * get the biggest dots.
 */
export function markerRadius(significance: number, hoverBoost = false): number {
  const base =
    significance >= 5 ? 7 :
    significance === 4 ? 5.5 :
    significance === 3 ? 4.5 :
    significance === 2 ? 3.5 :
                         3;
  return hoverBoost ? base + 3 : base;
}
