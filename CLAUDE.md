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

React 18 · Vite 5 · React Router 6 · Inter + Archivo (fontsource) · no backend.
**Adding a runtime dependency needs a reason.**

**Motion layer.** `motion` (Framer Motion, imported as `m` via
`LazyMotion`/`domAnimation` in `App.jsx`) drives the scroll-reveals and the
hero entrance — shared variants live in `src/motion/variants.js`. Every
animation respects `prefers-reduced-motion` through the one
`<MotionConfig reducedMotion="user">` wrapper, so components need no
per-element guard.

**3D hero accent.** `three` + `@react-three/fiber` + `@react-three/drei`
render the pointer-reactive node network in `components/Hero3D.jsx`. It is
**code-split** (a `lazy()` import in `Hero.jsx`) and only mounts on a wide
viewport with motion allowed — never on mobile, never under reduced motion,
never in the first-load bundle. A `SafeMount` boundary drops it silently if
WebGL is unavailable, leaving the photograph. Keep it lazy: the three.js
chunk is ~220KB gzip and must never re-enter the main bundle.

**Product films.** Every video on the site is rendered from `remotion/` by
`bash scripts/render-videos.sh [slug|hero]` into `public/videos/` (films,
`clips/` loops, `posters/`). The three working demos are **real captures**:
PNGs of the running apps plus a `steps.json` (caption, clicked element,
zoom region) in `public/walkthroughs/<slug>/`; the film only adds camera,
pointer and captions. The two client platforms are **schematics** —
wireframes of the real flow in `remotion/platformScenes.jsx`, labelled as
such on every frame, on the card and in the caption, because their real
screens hold client records. Never swap one kind for the other without
changing the label (`films[slug].kind` in `data.js`). The explainer films
(`remotion/explainers/`, target `explainers`) are illustrative motion design
that quotes the real captures; the site shows them only while
`explainersReady` in `data.js` is true, so an unrendered film never ships as
an empty player. Remotion is a dev
dependency only; nothing from it ships in the site bundle. Renders need a
scale giving even pixel sizes (H.264), hence 0.8 for the card loops.

**Live on Vercel**, deploying from `main` on every push (team `aniket-s1`,
project `aniket-portfolio`). `vercel.json` holds the SPA rewrite — delete it and
every deep link 404s on refresh. Runbook: `docs/deploy.md`.

## Layout

    src/      code        public/   static assets
    docs/     all prose   n8n/      importable workflow

`src/pages/HomePage.jsx` is composition only — nine bands, one file each in
`src/pages/home/`, named to match the bands in `HomePage.css`.

## Rules that fail silently

Break any of these and nothing errors — it just renders wrong.

1. **`--container-max` is the CONTENT width, not the border box.** `.container`
   uses `max-width: calc(var(--container-max) + var(--container-pad) * 2)`.
   Values are 1200 / clamp(1.5rem .. 2.5rem) since the Dusk pass (was 1600,
   which spread every band into islands of text). The nav is a floating pill
   sized to its content, not the container.
2. **`index.css` imports before `App.jsx` in `main.jsx`.** Reverse it and every
   page stylesheet loads ahead of the base sheet, so `index.css` wins every
   specificity *tie* — a page override that ties simply does nothing.
3. **The hero ground is the dusk scene (Dusk pass, 2026-09-27).** `Hero.jsx`
   draws the sky (CSS gradient + seeded stars) and three SVG ridges from
   `components/dusk/terrain.js`; the far and mid ridges parallax with scroll,
   the one-minute brand explainer sits between the mid and near ridges
   (phones get its poster; the app showreel lives in the Statement band), and the near
   ridge is filled with `--night` so it melts into the next band. Motion is
   Framer Motion only; do not add a CSS entrance animation beside it (the two
   fight over opacity). The `hero-*.jpg` files and `Hero3D` are unused.
4. **`HomePage.css` stays one file.** Do not split it per section. Its rules beat
   `index.css` on source order alone (see 2), and a single import from a single
   place is what pins that order regardless of component evaluation order.
5. **Never hardcode an email** — import `site.email` from `src/data.js`.
6. **Every `outcome` number renders with its `outcomeNote`.** They are all
   directional, not audited.

## Never invent content

Real project numbers, testimonials, a CV and real screenshots exist or are
obtainable, but Aniket has not supplied them. Build the slot, leave it empty, say
what is missing. No placeholder testimonials, no made-up metrics, no stock photo
presented as a product screenshot. All 16 images in `data.js` are Unsplash
placeholders and are marked as such.

## Design system: "Dusk" (read before any visual change)

`docs/design-system.md` is the source of truth. It is derived from
**getstage.co**, the reference Aniket approved twice (PRs #14, #15), rebuilt in
his saffron: a dusk hero with parallax ridges, a warm light "paper" ground for
the explaining bands, a dark "night" ground for the cinematic ones, Inter only
at weight 500, saffron as punctuation, motion that explains a mechanism.

What he has rejected, in his words: "too simple", then "looks like a kids
website, jumbled". Heavy display type, stacked effects (glows, chips, grids and
marquees at once) and walls of tags read as jumbled; bare text-only bands read
as too simple. One idea per band, with the real product films carrying the
visuals. **No em dashes in visible copy.**

The older Framer references (`docs/reference/folioblox.html`) are superseded.
When a visual difference is reported in loose terms, open getstage.co and
measure both at matching viewports before changing anything.

## Conventions

- Files are mixed CRLF/LF. Match the file you are editing; don't reflow it.
- Comments explain *why*, especially where the code looks wrong but isn't.
- Verify before claiming. Screenshots may be unavailable — use geometry probes
  (`getBoundingClientRect`), `gl.readPixels`, computed-style diffs.
- **Two traps in that probe environment.** Both have produced false bug reports:
  the browser pane runs with `document.hidden === true` even when fronted, so
  **`requestAnimationFrame` never fires** and anything scroll-driven through it
  (the gallery arc's `--open`) looks frozen; and a computed-style baseline taken
  on the *first* load measures fallback font metrics, inventing hundreds of
  phantom diffs. Check `document.fonts.status === 'loaded'` on both sides, and
  test rAF-driven code by setting the custom property directly.

## Deeper docs

| File | Holds |
|---|---|
| `docs/system/01-website-map.md` | Routes, `data.js` schema, page composition, gap list. **Keep in sync.** |
| `docs/system/02-service-catalog.md` | The three offers and their price bands — source of truth for `packages` |
| `docs/system/05-icp-positioning.md` | Locked positioning line, ICP language |
| `docs/specs/` | Contact form, n8n webhook |
| `docs/deploy.md` | Vercel runbook — setup, env vars, domain, rollback, health check |
| `docs/reference/folioblox.html` | Saved copy of the design reference, for offline measuring |
| `docs/README.md` | Index of the above, plus where each kind of code lives |

## Blocked on Aniket

Branded domain (set `site.origin` in `data.js`; canonical, OG, JSON-LD,
robots.txt and sitemap.xml are generated from it by the `siteMeta` plugin in
`vite.config.js`) · `site.bookingUrl` (Cal.com; setting it makes "Book a
15-min call" the primary button everywhere) · Quick-Win INR price (placeholder
₹25,000) · case-study numbers · testimonial · CV PDF
and a real headshot (the `/about` page now exists and renders labelled slots for
both) · real screenshots.

Resolved 2026-09-11: real email (`aniket.html@gmail.com`) and WhatsApp number
(`+91 9136582842`) are set, so every WhatsApp CTA is live.

Resolved 2026-09-27: the contact form is live. It posts to `/api/lead`, which
`vercel.json` rewrites (server-side, so the n8n host never reaches the
browser) to the "Portfolio — Lead intake" n8n workflow: Google Sheet "Portfolio
leads", Gmail alert and auto-reply, an error-alert workflow, and a 09:30 IST
reminder for leads unanswered after 24h (see `n8n/README.md`).
`VITE_LEAD_WEBHOOK_URL`, if set, overrides the rewrite; set it for local dev,
where the rewrite does not exist.
