# CLAUDE.md — therestory

Project-specific rules for Claude Code. **Read this first.**

## Git identity

- All commits authored as `Eeman1113 <eeman.majumder@gmail.com>`.
- All pushes go to `Eeman1113`'s GitHub account.
- Set locally in this repo (never rely on global git config):
  ```
  git config user.name  "Eeman1113"
  git config user.email "eeman.majumder@gmail.com"
  ```

## Never add AI as co-author

- **Do not** append `Co-Authored-By: Claude ...` (or any AI attribution) to commit messages.
- **Do not** add "🤖 Generated with Claude Code" or similar trailers to commit messages or PR bodies.
- Git history reflects Eeman1113's authorship alone.

## Log everything to `what_HAVE_I_DONE.md`

After **every** task — small or large — append an entry to `what_HAVE_I_DONE.md` at the repo root.

Format:
```
## YYYY-MM-DD — Short title
- What was done (1–3 bullets)
```

Append only (newest at the bottom). Commit the log update with the work when possible.

"Task" means any meaningful change: scaffolding, config, component, content, bug fix, deploy tweak — all of it.

## Hosting: GitHub Pages

The site deploys to **GitHub Pages** at `https://eeman1113.github.io/therestory/`.

Constraints this imposes:
- `next.config.*` must set `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`.
- `basePath` and `assetPrefix` must be `'/therestory'` in production builds.
- Ship a `.nojekyll` file in `out/` so GitHub Pages doesn't strip `_next/`.
- No API routes, no server actions, no dynamic server rendering. Every page must be prerenderable.
- Deploy runs via `.github/workflows/deploy.yml` on push to `main`.

## Working style (from SPEC.md)

- Follow SPEC.md for product/design decisions. This file only covers meta-rules.
- Use the `frontend-design` skill for any UI planning pass.
- Never invent historical facts. Every fact needs ≥2 reputable sources. Content comes from research subagents, not the main session.
