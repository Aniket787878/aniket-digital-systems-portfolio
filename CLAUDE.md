# CLAUDE.md

Portfolio site for Aniket: sells websites, custom software and AI/automation to
service businesses. One site, three service areas, each with its own page
(`/websites`, `/software`, `/ai`, driven by `services` in `src/data.js`); see
[docs/system/05-icp-positioning.md](docs/system/05-icp-positioning.md) for why
it is not three sites.

**Goal: win client work *and* land jobs.** Audience is "both, client-leaning";
when a change serves only one, serve the buyer.

**Read first: [docs/MAP.md](docs/MAP.md)** (system diagram, status board, open to-dos, blockers).

## Commands

```bash
npm run dev      # vite, port 5173
npm run build    # must pass before any commit
npm run lint     # eslint, must stay clean
```

## Stack

React 18 · Vite 5 · React Router 6 · Inter + Archivo (fontsource) · no backend.
**Adding a runtime dependency needs a reason.**

Motion (Framer Motion), the lazy 3D hero, StringTune interactions and Lenis
smooth scroll each have strict rules (lazy loading, reduced-motion, no fights
over `transform`). Read [docs/stack-layers.md](docs/stack-layers.md) before
touching `src/motion/`, `src/interactions/`, `src/scroll/` or the hero. Keep
three.js and the interaction/scroll chunks out of the main bundle.

Films are rendered from `remotion/` by `bash scripts/render-videos.sh [slug|hero]`.
Rules (real captures vs labelled schematics, sound, `FILM_V` bump): 
[docs/films.md](docs/films.md) and `remotion/CLAUDE.md`.

**Live on Vercel**, deploying from `main` on every push. `vercel.json` holds
the SPA rewrite and the `/api/lead` rewrite: delete it and every deep link 404s
on refresh. Runbook: [docs/deploy.md](docs/deploy.md). **The GitHub repo must
stay public** (the Vercel free plan blocks deploys from a private repo).

## How to work here (global Main + Subagent pattern)

Follows `~/.claude/CLAUDE.md`: Sonnet 5.5 Medium main session; Haiku subagents
for search, logs, renders and anything reading more than ~5 files (return paths
and a summary, not contents); Sonnet for scoped edits and tests; Opus only when
asked. Films follow `remotion/CLAUDE.md` (shot list approved before any code,
preview before full render). High effort for architecture, multi-file
migrations and deploys. Escalate one tier only after a failed attempt. One task
per session. Pass `model` on every subagent launch.

## Layout

    src/      code        public/   static assets
    docs/     all prose   n8n/      importable workflow

`src/pages/HomePage.jsx` is composition only: ten bands, one file each in
`src/pages/home/`, named to match the bands in `HomePage.css`. The three service
pages are one component, `src/pages/ServicePage.jsx`, composed from
`src/pages/service/` plus the home `Faq` and `Cta` bands; its styles are
`ServicePage.css` (prefix `svc-`) on top of HomePage.css, which App loads on
every route.

## Rules that fail silently

Break any of these and nothing errors; it just renders wrong.

1. **`--container-max` is the CONTENT width, not the border box.** `.container`
   uses `max-width: calc(var(--container-max) + var(--container-pad) * 2)`.
   Values are 1200 / clamp(1.5rem .. 2.5rem). The nav is a floating pill sized
   to its content, not the container.
2. **`index.css` imports before `App.jsx` in `main.jsx`.** Reverse it and every
   page stylesheet loads ahead of the base sheet, so `index.css` wins every
   specificity *tie*; a page override that ties simply does nothing.
3. **The hero ground is the dusk scene.** `Hero.jsx` draws the sky and three SVG
   ridges from `components/dusk/terrain.js`. Motion is Framer Motion only; do
   not add a CSS entrance animation beside it (the two fight over opacity).
   The `hero-*.jpg` files and `Hero3D` are unused.
4. **`HomePage.css` stays one file.** Do not split it per section. Its rules beat
   `index.css` on source order alone (see 2).
5. **Never hardcode an email**: import `site.email` from `src/data.js`.
6. **Every `outcome` number renders with its `outcomeNote`.** They are all
   directional, not audited.
7. **After any film re-render, bump `FILM_V` in `data.js`** so browsers fetch the new files.
8. **Never import StringTune statically and never enable its smooth mode**
   (see [docs/stack-layers.md](docs/stack-layers.md)).

## House rules

- **Never invent content.** Real project numbers, testimonials, a CV and real
  screenshots are not yet supplied. Build the slot, leave it empty, say what is
  missing. No placeholder testimonials, no made-up metrics, no stock photo
  presented as a product screenshot. Placeholder images in `data.js` are marked.
- **Plain-language copy.** No dev jargon in visible site text; tool names only
  in the closed developers panel. **No em dashes in visible copy.**
- **Design:** "Dusk" system, [docs/design-system.md](docs/design-system.md) is
  the source of truth. One idea per band; not "too simple", not "jumbled".
  Rejection history: [docs/conventions.md](docs/conventions.md).
- **Verify before claiming.** Test like a user with Playwright and screenshot
  proof; he cannot open Vercel previews, so send screenshots.
- Files are mixed CRLF/LF: match the file you edit.

## Deeper docs

| File | Holds |
|---|---|
| [docs/MAP.md](docs/MAP.md) | System diagram, status, to-dos, blockers, dated history |
| [docs/system/01-website-map.md](docs/system/01-website-map.md) | Routes, `data.js` schema, page composition, gap list. **Keep in sync.** |
| [docs/system/02-service-catalog.md](docs/system/02-service-catalog.md) | Three offers and price bands; source of truth for `packages` |
| [docs/system/05-icp-positioning.md](docs/system/05-icp-positioning.md) | Locked positioning line, ICP language |
| [docs/stack-layers.md](docs/stack-layers.md) | Motion, 3D, StringTune, Lenis rules |
| [docs/films.md](docs/films.md) | Film rendering and sound rules |
| [docs/conventions.md](docs/conventions.md) | Scraping, subagent choice, probe traps, design feedback |
| [docs/deploy.md](docs/deploy.md) | Vercel runbook |
| [docs/design-system.md](docs/design-system.md) | Dusk design system |
| [docs/specs/contact-form.md](docs/specs/contact-form.md), [docs/specs/n8n-lead-webhook.md](docs/specs/n8n-lead-webhook.md) | Lead form and webhook |
| [docs/README.md](docs/README.md) | Index of docs and where code lives |
