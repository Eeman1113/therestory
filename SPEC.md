# Therestory — Build Spec for Claude Code

## Mission

Build **Therestory**: a clean, minimal, editorial website that aims to become the single most complete and up-to-date home for world history — "Wikipedia, but organized by time instead of topic."

The centerpiece is a horizontal timeline across the top of the site with markers at every major historical event. Clicking any point in time opens an extremely detailed view of what was happening **everywhere in the world** at that moment — not just one region — with imagery, key figures, context, and cited sources.

## Non-negotiables

1. **Accuracy.** Every fact, date, and name must be grounded in real, verifiable sources. Nothing invented, ever.
2. **Global coverage.** Every time period must cover all world regions — Africa, the Americas, East Asia, South & Central Asia, the Middle East & North Africa, Europe, and Oceania. No Eurocentric bias.
3. **Minimal aesthetic.** Quiet, typographic, editorial. The content is the hero.
4. **Built to grow.** The data model must scale to "all of history" — v1 seeds it, the architecture supports adding events forever.

## Before writing any code

1. **Load and follow the `frontend-design` skill** before building any UI. Use it to drive the design plan (palette tokens, type scale, layout concept, signature element) so the site feels intentional and designed — not like a default shadcn template. Where this spec pins down a choice (fonts, icons, minimalism), follow the spec; where it's open, the skill decides.
2. **Plan first.** Show me the proposed routes, component tree, data schema, and research plan before scaffolding. Wait for my approval on the plan, then work autonomously through the build phases.

## Tech stack

- **Next.js** (latest, App Router, TypeScript, React Server Components, static generation wherever possible)
- **Tailwind CSS + shadcn/ui** for components (Command, Dialog, Tooltip, Sheet, Tabs, etc.)
- **Geist Sans** for UI and body text, **Geist Mono** for dates, years, and metadata (make the mono dates a signature detail)
- **lucide-react** for all icons — no other icon sets
- **Content as structured JSON in the repo**, validated with Zod. No database for v1.
- Framer Motion only for subtle, purposeful transitions. Respect `prefers-reduced-motion`.

## Design direction

- Minimal and editorial — museum-plaque energy. Generous whitespace, comfortable reading measure (~65–75ch), strong typographic hierarchy.
- Neutral palette with a single restrained accent; include a proper dark mode. Derive exact tokens through the frontend-design skill's planning pass.
- **Two image layers, kept distinct:**
  - **Decorative/UI illustration:** assets in the style of the Thiings collection (https://www.thiings.co/things) for category icons, era markers, empty states, and playful accents. Verify and respect the collection's license before use.
  - **Historical imagery:** real photographs, paintings, maps, and artifacts sourced from Wikimedia Commons (public domain / CC only). Every image stores caption, credit, license, and source URL in the data — and displays the credit.
- No clutter: no cards-everywhere, no gradients-as-decoration, no stock-photo feel.

## Information architecture

### 1. The Timeline (homepage hero — the core of the product)

- Horizontal, scrollable and zoomable timeline spanning ~3500 BCE (earliest writing/civilizations) to today.
- Era bands: Prehistory → Ancient → Classical → Post-classical/Medieval → Early Modern → Long 19th Century → 20th Century → Contemporary.
- **Zoom-based density:** zoomed out shows eras and only the highest-significance anchor events; zooming in resolves centuries → decades → years → individual events. Recent centuries get proportionally more space than ancient millennia.
- Event markers carry a category color/icon. Hover shows a preview card (title, date, one-line summary, thumbnail). Click navigates to the detail page.
- A slim "you are here" readout showing the current year/era as the user pans.
- Fully keyboard accessible (arrow keys move between events, Enter opens) and smooth on touch/mobile. Target 60fps — virtualize markers if needed.

### 2. Time detail pages — `/event/[slug]` and `/year/[year]`

When a point in time is opened:

- Hero: date (Geist Mono), era, event title, hero image with credit.
- **"Meanwhile, around the world"** — the signature section: a region-by-region snapshot of what was happening everywhere at that moment. This is what makes Therestory different; it must never be empty or Europe-only.
- The main event in depth: Background → What happened → Aftermath & consequences.
- Key figures with portraits and one-line roles.
- Image gallery with captions and credits.
- **Sources list on every page.**
- Previous/next-in-time navigation and related events.

### 3. Supporting surfaces

- `/eras/[era]` — era overviews with their key events.
- **⌘K command palette search** (shadcn Command): search any event, person, year, or era.
- Category filters: War & Conflict, Politics & Empires, Science & Technology, Art & Culture, Exploration, Religion & Ideas, Disaster & Disease, Economy & Trade.
- About page explaining the mission and sourcing standards.
- Per-page SEO/OpenGraph metadata and a sitemap.

## Data model

All content lives in `/content` as JSON validated by Zod. Core event schema (adapt as needed, but keep sources and image credits mandatory):

```ts
{
  id: "fall-of-constantinople",
  title: "Fall of Constantinople",
  date: { start: "1453-05-29", end?: string, precision: "day" | "month" | "year" | "decade" | "century" },
  era: "early-modern",
  regions: ["middle-east-north-africa", "europe"],
  categories: ["war-conflict", "politics-empires"],
  significance: 5, // 1–5; drives which zoom level reveals the marker
  summary: "One tight paragraph.",
  sections: [{ heading: string, body: string }],
  worldContext: [{ region: string, text: string }], // "meanwhile, around the world"
  figures: [{ name, role, imageUrl?, credit? }],
  images: [{ url, caption, credit, license, sourceUrl }],
  sources: [{ title, publisher, url, accessed }],
  disputed?: boolean // set when reputable sources meaningfully conflict
}
```

Plus per-year index files aggregating events and regional snapshots for the `/year/[year]` pages.

## Research workflow — use subagents (required)

Do **not** write historical content from memory in the main session. All content must come from a subagent research pipeline, run in parallel where possible:

1. **Era researcher subagents** — one per era (split dense eras like the 20th century by decade). Each subagent web-searches, compiles that era's major events worldwide, verifies **every date and fact against at least two independent reputable sources** (e.g., Wikipedia cross-checked with Britannica, academic, or museum sources), and outputs schema-valid JSON with sources attached.
2. **Regional balance subagent** — audits the dataset per era and fills gaps. If a century has twelve European events and zero African ones, that is a bug to fix, not an acceptable output.
3. **Fact-check subagent** — reviews everything: schema-valid, dates sane and internally consistent, no duplicates, no anachronisms, every event has ≥2 sources, every image has a credit and license.
4. **Image researcher subagent** — finds public-domain/CC imagery on Wikimedia Commons per event and records URL, caption, credit, license, and source page.

Accuracy rules binding on every subagent:

- Never invent facts, dates, quotes, or statistics. If it can't be verified in two sources, drop it or mark it `disputed` — do not guess.
- Where scholarship genuinely conflicts, present the mainstream view and briefly note the dispute.
- Prefer authoritative sources over content-farm pages.

## Scope for v1 (so this actually ships)

The architecture supports infinite history; the v1 dataset should be deep, not exhaustive:

- **100–150 fully detailed anchor events** (significance 4–5) spread across all eras and all regions.
- **Full "meanwhile, around the world" context for ~25 pivotal years** — e.g., 3100 BCE, 776 BCE, 221 BCE, 476, 622, 1066, 1206, 1347, 1453, 1492, 1519, 1600, 1648, 1776, 1789, 1815, 1848, 1871, 1914, 1929, 1945, 1969, 1989, 2001, 2020.
- Every published page is complete: no lorem ipsum, no placeholder images, no empty regions.

## Build order

1. **Scaffold** — Next.js + Tailwind + shadcn + Geist + lucide; run the frontend-design skill's planning pass; set design tokens and base layout.
2. **Data layer** — Zod schemas, content loaders, and 5 hand-verified seed events to build against.
3. **The timeline** — this is the hard part; build it properly (zoom, density, hover previews, keyboard, touch, virtualization).
4. **Detail pages** — event pages, year pages, era pages, command-palette search, filters.
5. **Content pipeline** — run the subagent research workflow to produce the full v1 dataset; validate it all through the fact-check subagent before it ships.
6. **Polish** — dark mode, SEO/OG images, sitemap, loading and empty states, accessibility pass, Lighthouse ≥ 90 across the board.

Commit at the end of each phase. Show me the working timeline in the browser before kicking off the full content pipeline.

## Quality bar

- `next build` passes with zero type errors and zero lint errors.
- Timeline is smooth at 60fps and genuinely usable on a phone.
- Spot-check any page: every fact traces to its listed sources, every image shows its credit.
- The site reads as a designed publication with a point of view — not a template.
