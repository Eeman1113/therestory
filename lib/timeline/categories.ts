/**
 * Muted, historic palette for event categories. Colors are chosen to sit
 * quietly against the Paper / Ink themes; markers are small (4–6 px) so the
 * saturation stays low enough to feel editorial rather than infographic.
 */

import type { Category } from "@/lib/content/schema";

export interface CategoryColor {
  light: string; // hex or OKLCH — used on the Paper (light) theme
  dark: string; // hex or OKLCH — used on the Ink (dark) theme
}

export const CATEGORY_COLORS: Record<Category, CategoryColor> = {
  "war-conflict": { light: "#8A2A1E", dark: "#C4614F" },
  "politics-empires": { light: "#2E4057", dark: "#7E9FBD" },
  "science-technology": { light: "#3A5A48", dark: "#7DA48D" },
  "art-culture": { light: "#8A6A2A", dark: "#C4A374" },
  exploration: { light: "#2A5A6A", dark: "#6A9AAD" },
  "religion-ideas": { light: "#5A3A5A", dark: "#9A7A9A" },
  "disaster-disease": { light: "#8A4A2A", dark: "#C4855F" },
  "economy-trade": { light: "#4A4A3A", dark: "#8A8A7A" },
};

/**
 * A single category is chosen to color a marker even if the event has several.
 * The rule: the first category listed wins. Content authors put the most
 * defining category first.
 */
export function markerColor(categories: Category[]): CategoryColor {
  const c = categories[0] ?? "politics-empires";
  return CATEGORY_COLORS[c];
}
