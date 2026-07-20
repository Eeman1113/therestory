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

