# CLAUDE.md

Portfolio site for Aniket — sells websites, custom software and AI/automation
to service businesses (clinics, studios, agencies, consultancies). One site,
three service areas, each with its own page (`/websites`, `/software`, `/ai`,
driven by `services` in `src/data.js`); see `docs/system/05-icp-positioning.md`
(2026-09-30) for why it is not three sites.

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

**Interaction layer.** `@fiddle-digital/string-tune` (a runtime dependency
because it is the one library that gives cursor portals, magnetic pull and
word splitting from plain attributes) drives the custom cursor, magnetic
primary buttons, word-by-word headings and scroll-linked depth. It lives in
`src/interactions/` and follows these rules:

- **Lazy.** `controller.js` (main bundle, tiny) imports `stringtune.js` (the
  ~62KB gzip chunk) after `load` plus an idle slot. Never import the library
  statically. It never starts under `prefers-reduced-motion` (and stops if
  that flips); cursor and magnetic only for `(hover: hover) and (pointer: fine)`
  at 1024px+.
- **Scroll stays native.** StringTune's desktop default mode is `smooth`, which
  `preventDefault()`s wheel and arrow/space/page/home/end keys. `stringtune.js`
  switches both modes to `default` synchronously after `getInstance()`. Never
  enable smooth, never `preventDefault` a scroll input.
- **Nothing hidden until it runs.** Effects are `data-string*` attributes from
  `fx()` (`attrs.js`), styled by `interactions.css` only under `html.st-on`;
  var() fallbacks are the resting pose.
- **No fight with Motion.** This layer never writes `transform` or `opacity` on
  an element Motion animates: it uses the individual `translate`/`scale`
  properties on inner elements, or elements Motion never touches. Progress goes
  to `--st-progress` because the page has its own `--progress`.
- **SPA-safe.** One instance, idempotent start/stop (StrictMode, reduced-motion
  toggle). The library watches the DOM itself for route changes; the controller
  only re-measures. `StringSplit` rewrites a heading's innerHTML and drops
  `<br>`: split only static headings, break lines with a block span
  (`.h2 .soft`), and `key` any route that reuses one component for different
  text (the three service routes). The ring `<div>` stays mounted, since the
  library keeps a reference to that exact node.
- **Library gaps** (stuck hover after scrolling away, magnet never returning) are
  fixed by the two subclasses in `stringtune.js`; re-check them on upgrade.

**Product films.** Every video on the site is rendered from `remotion/` by
`bash scripts/render-videos.sh [slug|hero]` into `public/videos/` (films,
`clips/` loops, `posters/`). The three working demos are **real captures**:
PNGs of the running apps plus a `steps.json` (caption, clicked element,
zoom region) in `public/walkthroughs/<slug>/`; the film only adds camera,
pointer and captions. The two client platforms are **schematics** —
wireframes of the real flow in `remotion/stage/schematics.jsx`, labelled as
such on every frame, on the card and in the caption, because their real
screens hold client records. Never swap one kind for the other without
changing the label (`films[slug].kind` in `data.js`). The explainer films
(`remotion/explainers/`, target `explainers`) are illustrative motion design
that quotes the real captures; the site shows them only while
`explainersReady` in `data.js` is true, so an unrendered film never ships as
an empty player. Remotion is a dev
dependency only; nothing from it ships in the site bundle. Renders need a
scale giving even pixel sizes (H.264), hence 0.8 for the card loops.

**Film sound.** The films and the explainers carry sound effects
(96 kb/s AAC); the card loops (`Clip-*`, `Framed-*`) and the hero reel
(only ever a silent home loop) render `--muted`, with no audio track. The effects are synthesised in code by
`python3 scripts/make-sfx.py` into `remotion/sfx/*.wav`, so there is no
licence to track; never swap in downloaded audio. Cues are placed by
`remotion/sound.jsx` (`cue()` and `<Soundtrack>`), driven by the same
timing constants as the visuals, so a retimed beat moves its sound with it.
**Music slot:** put a track at `remotion/audio/music.mp3` (or `.m4a`/`.wav`)
and re-run the render script. It is normalised to -20 LUFS into the
gitignored `remotion/audio/music-bed.wav` and mixed in from frame 0 with fades
and a duck under the end tone. With no track, the films are effects only.
On the site the lightbox films start with sound on, the case-page film
autoplays muted with a "Sound on" toggle, and every other player stays muted.
After any re-render, bump `FILM_V` in `data.js` so browsers fetch the new files.

**Live on Vercel**, deploying from `main` on every push (team `aniket-s1`,
project `aniket-portfolio`). `vercel.json` holds the SPA rewrite — delete it and
every deep link 404s on refresh. Runbook: `docs/deploy.md`.

## Layout

    src/      code        public/   static assets
    docs/     all prose   n8n/      importable workflow

`src/pages/HomePage.jsx` is composition only — ten bands, one file each in
`src/pages/home/`, named to match the bands in `HomePage.css`. The three service
pages are one component, `src/pages/ServicePage.jsx`, composed from
`src/pages/service/` plus the home `Faq` and `Cta` bands; its styles are
`ServicePage.css` (prefix `svc-`) on top of HomePage.css, which App loads on
every route.

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
- **Web scraping: Crawl4AI is the default** (Aniket's choice, 2026-09-30). Run
  `bash scripts/setup-crawl4ai.sh` once per container, then `crawl <url>`
  (clean markdown; `--out FILE`, `--raw`, and `--undetected` for sites that
  block a normal headless browser). It runs inside the sandbox, so it only
  reaches hosts the environment's network policy allows; for a host that
  policy blocks, fall back to the Firecrawl connector and say so.
- **Subagents: pick the cheapest model that can do the job** (Aniket's
  choice, 2026-09-30). Pass `model` on every launch: `haiku` for read-only
  reviews of prepared material, `sonnet` for code, audits and research,
  `opus` (Opus 5.5) only for one-off hard review or design questions. The
  Remotion films (`remotion/`) follow the model rules in `remotion/CLAUDE.md`
  (Sonnet builds; Opus only for shot list, complex timing and final review). Capture shared inputs (the
  site, docs) once with a script and hand agents the path, so no two agents
  crawl the same thing; code-writing agents work in a worktree and never
  push.
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
15-min call" the primary button everywhere) ·
a `Service` column in the "Portfolio leads" sheet (the form now sends `service`;
the live n8n workflow needs the column before it can file it) · case-study numbers · testimonial · CV PDF
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
