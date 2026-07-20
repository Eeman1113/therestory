import { allEras, allEvents, allRegions } from "@/lib/content/loader";
import { CommandPalette } from "./command-palette";

/**
 * Server wrapper that reads content at build time and hands it to the
 * client-side ⌘K palette. Mounted once at the root layout.
 */
export function CommandPaletteMount() {
  const events = allEvents().map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.title,
    date: e.date,
    era: e.era,
    categories: e.categories,
    summary: e.summary,
  }));
  return (
    <CommandPalette
      events={events}
      eras={allEras()}
      regions={allRegions()}
    />
  );
}
