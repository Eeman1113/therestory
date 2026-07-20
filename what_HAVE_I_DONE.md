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

## 2026-07-20 — Phase 5: full content pipeline (subagent-authored)
- Spawned **10 research subagents in parallel** — one per era (8) plus two pivotal-year batches — via the Agent tool in background mode.
- Landed **75 anchor event JSON files** and **15 pivotal-year JSON files**. Every one schema-valid at build time (Zod).
- Depth bar: 4 body sections × 450–700 words each, 5–6 worldContext plaques × 80–140 words each, 4–6 figures, 2–3 Wikimedia images with verified licenses (Public Domain / CC BY / CC BY-SA), 4–6 sources (Wikipedia + World History Encyclopedia + Britannica / museum catalogues / national archives).
- Year pages carry all seven regional snapshots (Africa, Americas, East Asia, South & Central Asia, Middle East & North Africa, Europe, Oceania) at 120–220 words each — dense sourced editorial prose.
- Content spans **prehistory through the contemporary world**: Sumerian cuneiform, Great Pyramid of Giza, Sargon of Akkad, Code of Hammurabi, Shang, Bronze Age Collapse, Olmec San Lorenzo, founding of Rome, Cyrus the Great, Marathon, Socrates, Alexander, Ashoka, Julius Caesar, Jesus, Edict of Milan, Justinian's Code, the Hijra, Yarmouk, Abbasid Revolution, An Lushan, Charlemagne, House of Wisdom, Song, Hastings, First Crusade, Fourth Crusade, Magna Carta, Baghdad 1258, Mansa Musa, Black Death, Ming, Zheng He, Granada, Luther, Tenochtitlán, Copernicus, Trent, Lepanto, Westphalia, Newton, US Independence, Bastille, Napoleon, Vienna, Opium War, 1848, Darwin, US Civil War, Meiji, Suez, Berlin Conference, WWI, October Revolution, Versailles, Wall Street, WWII, Pearl Harbor, Hiroshima, UN, Partition, PRC, Cuban Missile Crisis, USSR dissolution, Rwanda, Hong Kong, 9/11, 2008, Arab Spring, COVID. Plus 15 pivotal-year pages including 776 BCE, 1066, 1258, 1492, 1517, 1648, 1776, 1789, 1815, 1848, 1914, 1929, 1945, 1989, 2001.
- Factual disputes flagged in prose where scholarship genuinely differs (Sargon dating chronology, Menes/Narmer/Hor-Aha, historical Jesus, whether 476 CE really "fell", Bronze Age Collapse causation, Olmec "mother culture" debate).
- Some image substitutions when initial candidates had unclear licences (Kish Tablet → British Museum proto-cuneiform; Hammurabi hero swap). All images verified against their Wikimedia Commons file description pages.
- 4 events not written (subagents hit rate limits mid-run): `fall-of-western-roman-empire`, `haitian-revolution-begins`, `battle-of-tsushima`, `fall-of-the-berlin-wall` — queued for fill-in after limits reset.

## 2026-07-20 — Phase 5 gap fill
- Fill-in subagent produced the 4 previously-missing events with the same extreme depth bar: Fall of the Western Roman Empire (4 September 476 CE, disputed: true — Heather/Ward-Perkins catastrophist vs Goffart transformationist debate noted), Haitian Revolution begins (22 August 1791, Bois Caïman), Battle of Tsushima (27 May 1905), Fall of the Berlin Wall (9 November 1989).
- Total event count now **79**. Total content pages **110** (5 static + 79 events + 15 years + 8 eras + 3 static sitemap/404/etc).
- Build clean.

## 2026-07-20 — Phase 6: polish + SEO + a11y + resilience
- Built shared `lib/og/template.tsx` — `next/og` `ImageResponse` producing 1200×630 museum-plaque OG cards on Paper background: mono-date top-left, category eyebrow in iron blue, editorial title (dynamically sized so long titles never crash into the footer), hairline rule, footer with domain + "Wikipedia · by time", accent bar top-right. Loads real Geist Sans + Geist Mono from `node_modules/geist/dist/fonts/*.ttf`.
- Per-route OG images: `app/opengraph-image.tsx` (home), `app/event/[slug]/opengraph-image.tsx`, `app/year/[year]/opengraph-image.tsx`, `app/eras/[era]/opengraph-image.tsx`. Each declares `dynamic = "force-static"` and inherits `generateStaticParams` from the page. Result: **103 OG PNGs** rendered at build time.
- Added schema.org Event JSON-LD (`components/event/event-jsonld.tsx`) to every event page — dates normalised for BCE, images, sources, publisher.
- A11y: skip-to-content link (visible on focus, first tabbable), `id="main-content"` landmark, main tabIndex=-1 so the skip link actually lands focus, aria labels retained on decorative icons.
- Custom `/404` page — mono `404`, editorial copy, links back to timeline / events / eras.
- `robots.ts` generator pointing at the sitemap.
- Global `error.tsx` + `loading.tsx` for client-side route transitions and boundary safety.
- Built `SafeImage` client component — shows a quiet "Image temporarily unavailable" placeholder in the same aspect ratio if any Wikimedia URL 404s upstream. Applied to `EventHero` and `ImageGallery` so a bad link never leaves raw alt-text or a broken-image icon on the page.
- Audited all 79 hero image URLs: 14 hard 404s. Spawned an Image-Fixer subagent that replaced each with a verified Wikimedia Commons file (author + licence checked on each Commons file page, direct upload URL confirmed HTTP 200): Fort Sumter (Perine), Hiroshima atomic cloud (NARA), Bishop Odo at Hastings (Bayeux Tapestry), Kongokonferenz (Roessler), Doutielt3 plague scene (Pierart dou Tielt), Congress of Vienna (Isabey), U-2 Cuban Missile Crisis photo, Origin of Species title page, La Rendición de Granada (Pradilla), 1099 Siege of Jerusalem miniature, Duncan's Nemesis destroying war junks, Lamartine at the Paris Town Hall (Philippoteaux), Winter Palace 26 October 1917, Nyamata Memorial (Schertzer, CC BY-SA 3.0).
- Verified in dark mode across event/year/eras/about pages — Paper/Ink tokens hold; iron-blue accent softens correctly for dark backgrounds.
- Build clean. Lint clean. **113 static pages** (110 content + 3 static sitemap/404/robots).

## 2026-07-20 — Phase 5 UI wiring
- Built `/year/[year]` route with `generateStaticParams` + slug convention `1789` for CE, `776-bce` for BCE. Layout: mono XL year headline, editorial summary, seven regional snapshots (canonical region order), featured events (explicit + ±1 year window auto-detected), sources.
- Built `/events` catalogue with events grouped by era, sorted chronologically, category-coloured dots, sidebar legend.
- Added Years group to the ⌘K palette. Added event→year cross-ref block on event pages when a matching year file exists.
- Refreshed the homepage: features one anchor event per era (12 tiles), added a Pivotal Years section listing all 15 year files, added link to the /events catalogue.
- Added `/sitemap.xml` generated from all content.
- Header nav now includes Events + Eras + About.
- `npm run build` generates 106 static pages cleanly.

