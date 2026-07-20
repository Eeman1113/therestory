# what_HAVE_I_DONE.md

A running log of every task completed in this project. Newest entries at the bottom.

Format:
```
## YYYY-MM-DD — Short title
- What was done
```

---

## 2026-07-20 — Project meta setup
- Wrote `CLAUDE.md` with git identity (Eeman1113), no-AI-coauthor rule, GitHub Pages hosting constraints, and the `what_HAVE_I_DONE.md` log convention.
- Created this log file.

## 2026-07-20 — Phase 1: scaffold, tokens, base layout
- Created `Eeman1113/therestory` public repo on GitHub; initialised local git with Eeman1113 identity.
- Scaffolded Next.js 16 App Router + Tailwind v4 + TypeScript at repo root.
- Installed `geist`, `lucide-react`, `next-themes`, `zod`, `motion`, `clsx`, `tailwind-merge`.
- Configured `next.config.ts` for static export with `basePath: /therestory` in production, plus `.nojekyll` in `public/`.
- Set Paper/Ink design tokens in `globals.css` — OKLCH warm-bone light + deep-ink dark, oxidized-iron-blue accent (`#2E4057` / `#7E9FBD`), hairline rule token, focus ring, reduced-motion respect.
- Wired Geist Sans (body) and Geist Mono (dates) via the `geist` package.
- Built primitives: `MonoDate` (middle-dot separators, e.g. `1453·05·29`), `MicroCaps`, `HairlineRule`.
- Built `ThemeProvider` + `ThemeToggle` (Sun/Moon), `SiteHeader`, `SiteFooter`.
- Built empty `TimelineStrip` shell — persistent 60px chrome with era bands and mono year ticks, using a piecewise scale that compresses ancient millennia.
- Rewrote homepage: editorial hero, sidebar of editorial notes, "Fifteen moments to start from" grid of pivotal years, teaser for interactive timeline.
- Added GitHub Actions workflow `.github/workflows/deploy.yml` (build + deploy static export to GitHub Pages on push to main).
- Removed scaffold's default SVGs and cruft. Verified `npm run build` + `npm run lint` clean. Verified light + dark in browser.
- Wrote `README.md`.

## 2026-07-20 — Phase 2: data layer + 5 seed events
- Authored Zod schemas (`lib/content/schema.ts`) for events, years, and IA metadata; enums for regions/eras/categories; signed BCE year regex; year snapshots must cover all seven regions.
- Built content loader (`lib/content/loader.ts`) that reads and validates every JSON in `/content` at build time and caches results.
- Authored static IA JSONs: `content/eras.json` (8 eras with year spans + descriptions), `content/regions.json` (7 regions), `content/categories.json` (8 categories).
- Spawned research subagent to author 5 Wave A anchor events: Unification of Upper & Lower Egypt (c. 3100 BCE), Qin unification of China (221 BCE), Genghis Khan proclaimed (1206), Fall of Constantinople (1453·05·29), Apollo 11 lunar landing (1969·07·20).
- Each event: full schema, ≥3 sources, hero image from Wikimedia Commons with confirmed license + credit + Commons file-page URL, world-context snapshots for other regions, key figures. `disputed: true` on Egypt unification per Menes/Narmer/Hor-Aha debate.
- Spawned source-strengthening subagent to append at least one non-Wikipedia source per event (World History Encyclopedia — peer-reviewed) alongside existing Wikipedia sources. Wikipedia kept; augmented, not replaced.
- Wired homepage to load events from the content loader (proves the pipeline end-to-end at build time). Replaced hardcoded pivotal-years list with a live "Anchor events" grid.
- Trimmed `display` overrides on CE day-precision events so the mono middle-dot signature (`1453·05·29`, `1969·07·20`) renders consistently; kept `display` on BCE dates ("221 BCE", "c. 3100 BCE") where it reads more naturally.

## 2026-07-20 — Phase 3: the interactive timeline
- Built `lib/timeline/scale.ts`: piecewise `yearToPosition` / `positionToYear` mapping (ancient millennia compressed, recent centuries expanded), `parseStartYear` that handles BCE + month/day fractions, and a `generateTicks` tick generator that adapts density and always keeps era boundaries.
- Built `lib/timeline/density.ts`: `minSignificanceFor(windowSize)` — controls which markers show at each zoom level so the timeline stays readable at every scale.
- Built `lib/timeline/categories.ts`: muted historic palette (one color per category, light + dark variants) used to color the marker dots.
- Built `components/timeline/timeline-view.tsx`: React context that carries `viewStart`, `viewEnd`, `focusedEventId` plus `pan`, `zoomAt`, `resetView`, `setView`. Consumed by both the strip and the canvas.
- Built `components/timeline/timeline-canvas.tsx`: the full-page interactive surface. Era band strip, mono ruler with adaptive ticks, greedy multi-track marker layout so dots never overlap, hover cards with mono date + category chip + summary + link, keyboard nav (←/→/Home/End/Enter/+/−), pointer-drag pan, wheel/pinch zoom anchored at the cursor, focus ring, `prefers-reduced-motion` respected via CSS.
- Rewired `components/timeline/timeline-strip.tsx` to consume the shared view state — now doubles as a minimap that highlights the currently visible window from the canvas.
- Wrapped `<TimelineViewProvider>` in the root layout so the strip and canvas share state across the whole app.
- Promoted the interactive timeline into the homepage hero position (per SPEC §Information architecture). The intro text tightened, canvas below, then the anchor-events jump list.
- Verified in browser: hover shows the Constantinople preview card, zoom + / − updates the visible-marker count, drag pan re-centers the "you are here" readout, minimap highlight follows the view window.

## 2026-07-20 — Phase 4: detail pages + eras + about + ⌘K
- Installed `react-markdown` + `remark-gfm` for section bodies and `cmdk` for the command palette.
- Built `/event/[slug]` with `generateStaticParams` over all seed events. Layout: `EventHero` (mono XL date, era + category chips in category color, title, summary, hero image with caption/credit/licence/source), `EventBody` (§01/§02/§03 numbered sections with sidebar heading), `MeanwhileSection` (the signature — region plaques with focus regions ordered first), `FiguresGrid` (grayscale portraits), `ImageGallery`, `SourcesList` (numbered, external-link icon, accessed date), `PrevNextNav` (previous/later in time).
- Built `Markdown` renderer with editorial component overrides.
- Built `/eras` index and `/eras/[era]` detail pages listing anchor events in each era.
- Built `/about` page — mission, sourcing standard, imagery & credits, colophon.
- Built ⌘K command palette using `cmdk`: searches events, eras, regions, keyboard-navigable, editorial styled (mono middle-dot dates, micro-caps group headers, hairline dividers, Esc/↵/↑↓ hints). Global keyboard shortcut + clickable header trigger via custom event.
- Verified end-to-end: search "cons" → Fall of Constantinople bubbled to top → Enter → event page loads with hero image (Fausto Zonaro painting), full sections, "meanwhile" plaques for East Asia / South & Central Asia / Africa / Europe / Americas, complete sources list.

