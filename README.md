# Therestory

**Wikipedia, but organized by time instead of topic.**

A clean, minimal, editorial home for world history. The centerpiece is a horizontal timeline across the top of the site with markers at every major historical event. Clicking any point in time opens a detailed view of what was happening **everywhere in the world** at that moment.

Live: https://eeman1113.github.io/therestory/

## Non-negotiables

1. **Accuracy.** Every fact, date, and name grounded in ≥2 reputable sources. Nothing invented.
2. **Global coverage.** Every era covers every world region. No Eurocentric default.
3. **Minimal aesthetic.** Quiet, typographic, editorial. Content is the hero.
4. **Built to grow.** Architecture scales to all of history.

## Tech stack

- Next.js 16 (App Router, static export)
- Tailwind CSS v4
- Geist Sans (UI) + Geist Mono (dates & metadata — signature detail)
- lucide-react (icons)
- Content as structured JSON, validated with Zod
- Hosted on GitHub Pages

## Development

```
npm install
npm run dev       # http://localhost:3000
npm run build     # static export to ./out
```

## Project docs

- [SPEC.md](./SPEC.md) — product spec
- [CLAUDE.md](./CLAUDE.md) — meta-rules for Claude Code (git identity, hosting, log convention)
- [what_HAVE_I_DONE.md](./what_HAVE_I_DONE.md) — running log of every task completed

## Design tokens

- **Paper** (light): warm bone `#F6F3EC`, near-black warm ink, hairline rules
- **Ink** (dark): deep `#12110F`, warm bone ink
- **Accent**: oxidized iron blue — `#2E4057` light / `#7E9FBD` dark. Used sparingly.

## License

Code: MIT. Content: each entry cites its own sources; historical imagery from Wikimedia Commons is public domain or CC with credit preserved.
