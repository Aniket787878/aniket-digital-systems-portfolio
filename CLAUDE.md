# CLAUDE.md

Portfolio site for Aniket — sells AI and operations automation to service
businesses (clinics, studios, agencies, consultancies).

**Goal: win client work *and* land jobs.** Audience is "both, client-leaning" —
when a change serves only one, serve the buyer.

## Commands

```bash
npm run dev      # vite, port 5173
npm run build    # must pass before any commit
npm run lint     # eslint, currently clean
```

## Stack

React 18 · Vite 5 · React Router 6 · Inter + Archivo (fontsource) · no backend ·
deploys to **Vercel** (`vercel.json` holds the SPA rewrite — delete it and every
deep link 404s on refresh). **Five runtime dependencies. Adding one needs a
reason** — the hero shader is hand-written WebGL precisely to avoid a 3D library.

## Rules that fail silently

Break any of these and nothing errors — it just renders wrong.

1. **`--container-max` is the CONTENT width, not the border box.** `.container`
   and `.nav-inner` use `max-width: calc(var(--container-max) + var(--container-pad) * 2)`.
   The other reading leaves 1272px of content on a 1920px screen. Values are
   1600 / 40, measured off the design reference.
2. **`index.css` imports before `App.jsx` in `main.jsx`.** Reverse it and every
   page stylesheet loads ahead of the base sheet, so `index.css` wins every
   specificity *tie* — a page override that ties simply does nothing.
3. **`HeroCanvas.jsx` must not call `loseContext()` on cleanup**, and `resize()`
   must send `u_res` *unconditionally*. Both look like sloppiness; both are load-
   bearing. Reasons are in the file's comments and `system/01-website-map.md`.
4. **Never hardcode an email** — import `site.email` from `src/data.js`.
5. **Every `outcome` number renders with its `outcomeNote`.** They are all
   directional, not audited.

## Never invent content

Real project numbers, testimonials, a CV and real screenshots exist or are
obtainable, but Aniket has not supplied them. Build the slot, leave it empty, say
what is missing. No placeholder testimonials, no made-up metrics, no stock photo
presented as a product screenshot. All 16 images in `data.js` are Unsplash
placeholders and are marked as such.

## Design reference

The Framer template at https://extended-experiences-754918.framer.app/ —
specifically its **header and footer**. `threeui.com` is *not* this site; it was
only cited as a source of 3D ideas.

When a visual difference is reported in loose terms ("compressed", "structure is
different"), **open the reference and measure both at matching viewports before
changing anything.** Guessing has cost a full cycle of work.

## Conventions

- Files are mixed CRLF/LF. Match the file you are editing; don't reflow it.
- Comments explain *why*, especially where the code looks wrong but isn't.
- Verify before claiming. Screenshots may be unavailable — use geometry probes
  (`getBoundingClientRect`), `gl.readPixels`, computed-style diffs.

## Deeper docs

| File | Holds |
|---|---|
| `system/01-website-map.md` | Routes, `data.js` schema, page composition, gap list. **Keep in sync.** |
| `system/02-service-catalog.md` | The three offers and their price bands — source of truth for `packages` |
| `system/05-icp-positioning.md` | Locked positioning line, ICP language |
| `specs/` | Contact form, n8n webhook |
| `docs/deploy.md` | Vercel runbook — setup, env vars, domain, rollback, health check |

## Blocked on Aniket

Domain · real email (`hello@aniketbuilds.com` is a placeholder) ·
`VITE_LEAD_WEBHOOK_URL` · WhatsApp number · case-study numbers · testimonial ·
CV PDF (blocks `/about`, which does not exist yet) · real screenshots.
