# 01 — Website Map

**Code state verified: 2026-08-27.** Every claim below was re-checked against the
working tree on that date; the *In flight* items from the 2026-08-25 pass have been
resolved to Done or restated with what is actually in the code.

**The site is live.** It deploys to Vercel from `main` on every push — see
*Deploy* below. What remains is content and a domain, not engineering.

Status vocabulary used below:
- **Done** — verified present in the code.
- **In flight** — decided this session, data layer landed, page render not yet confirmed.
- **Blocked on Aniket** — cannot be finished by any agent; needs a real-world input.

## Stack

- React 18 + Vite 5, React Router 6
- Fonts: Inter + Archivo (fontsource)
- No backend yet
- Deploy: **Vercel**, live, GitHub integration connected. Custom domain still pending.

**The hero shader is raw WebGL 1 — there is no three.js and no 3D library.**
`src/components/HeroCanvas.jsx` is one fullscreen fragment shader (~300 lines,
zero new dependencies). Do not add a library to change it; edit the GLSL. Two
things in there are load-bearing and look like mistakes if you do not know why:

- Cleanup deliberately does **not** call `WEBGL_lose_context.loseContext()`.
  Losing the context is permanent for that canvas, and a later `getContext()`
  hands back the same dead one — which silently kills the shader under
  StrictMode's double-mount in dev, and on any real remount (navigate off home
  and back).
- `resize()` re-sends the viewport and `u_res` **unconditionally**. A remount
  links a new program whose uniforms all start at zero, so skipping the update
  when the size happens to be unchanged leaves `u_res` at `(0,0)`, divides
  `gl_FragCoord` by zero, and flattens the whole field to the darkest stop of
  the ramp. It still renders — just wrong — so it does not read as an error.

## Repo layout

Four directories, and nothing else at the root but config:

| Path | Holds |
|---|---|
| `src/` | Code — pages, components, `data.js`, the two stylesheets |
| `public/` | Static assets, copied verbatim into `dist/` |
| `docs/` | Everything written. This file is `docs/system/01-website-map.md`. |
| `n8n/` | The importable lead-intake workflow |

`docs/` absorbed the old top-level `system/` and `specs/` folders and the
misspelled `Refrence files/` (now `docs/reference/folioblox.html`).
`docs/README.md` indexes it.

## Routes

| Path | File | Status | Notes |
|------|------|--------|-------|
| `/` | `src/pages/HomePage.jsx` + `src/pages/home/` | Done | `HomePage.jsx` is composition only; one file per band — see *Home page composition* below |
| `/projects` | `src/pages/ProjectsPage.jsx` | Done | Reads `src/data.js` |
| `/projects/:slug` | `src/pages/ProjectDetailPage.jsx` | Done | Renders `problem`, `system`, `outcome` and `outcomeNote` |
| `/about` | `src/pages/AboutPage.jsx` | Done | The solo-specialist identity layer (see `docs/research/06`). Renders from `founder`; photo and story are honest empty slots until Aniket supplies them |
| `/contact` | `src/pages/ContactPage.jsx` | Done | Renders `ContactForm.jsx` |
| `*` | `src/pages/NotFoundPage.jsx` | Done | Real 404 with a CTA, wired to `path="*"` in `App.jsx` |

**Every route resets the scroll offset — `src/components/ScrollToTop.jsx`.**
`BrowserRouter` does not do this on its own; only the data routers get
`<ScrollRestoration>`. Without it React swapped the markup and left
`window.scrollY` untouched, so "View system" from a work card 1867px down the
home page landed 1867px down the case study, and every "Get in touch" landed on
the *footer* of `/contact` because that page is shorter and the offset clamped
to the bottom. Forward navigation goes to the top; back and forward restore the
offset from an in-memory map keyed on `location.key`. It must stay in memory —
persisting it would restore a stale offset onto an unrelated page after a
reload, since every freshly loaded document keys its first entry `default`.

The `/about` route now **exists** (added 2026-09-11) as the identity layer the
solo-specialist model needs. It is content-complete from what the site already
backs; a CV PDF and a real headshot remain blocked on Aniket, but neither blocks
the page — it renders labelled slots in their place.

**Correction:** this table previously said `/contact` was *"Skeleton — mailto only —
no form, no capture, no notify."* That is **false and has been removed.**
`src/components/ContactForm.jsx` is fully built: controlled fields, `POST` to
`VITE_LEAD_WEBHOOK_URL`, budget bands, and `sending` / `success` / `error` /
`fallback` states. Mailto is now only the fallback path when no webhook is
configured, not the mechanism.

## Data source

`src/data.js` — 4 projects. Email is a **placeholder** (`hello@aniketbuilds.com`,
carries a TODO to confirm the domain). Never hardcode an email in a component —
always import `site.email`.

### `site`

| Field | Notes |
|---|---|
| `name` | Site/brand name |
| `tagline` | The locked positioning line (see `05-icp-positioning.md`) |
| `email` | Placeholder until the domain is bought — **blocked on Aniket** |
| `whatsapp` | Currently `''` — **blocked on Aniket**. Consumers must handle empty |
| `location` | e.g. India · working with clients worldwide |
| `availability` | Slot scarcity line |
| `pricingAnchor` | One-sentence price + timeline anchor (see `02-service-catalog.md`) |

### `projects[]` — case-study schema

| Field | Type | Notes |
|---|---|---|
| `index` | string | `'01'`–`'04'`, display order |
| `slug` | string | Route param for `/projects/:slug` |
| `title` | string | |
| `summary` | string | One-line outcome, ICP language |
| `description` | string | Optional. Narrative paragraph, used only as the fallback when `problem` is unset. Project 01 no longer carries one |
| `flow` | string[] | Step labels. Renders as the one-line `Flow` row in the case-study spec block |
| `diagram` | string | Key into `components/SystemDiagram.jsx` — `booking`, `approval`, `operations`, `assistant` |
| `private` | boolean | Optional. Renders "Private Client System", suppresses client identity |
| `role` | string | What Aniket personally did |
| `timeline` | string | Optional. e.g. `'4 weeks'`. Project 01 has none — both consumers guard it |
| `stack` | string[] | Tools used |
| `problem` | string | Before state |
| `system` | string[] | What was built, one bullet per component |
| `outcome` | string[] | Results. Either verifiable (row counts, arithmetic from a stated rule) or **directional** — never an unaudited business claim |
| `outcomeNote` | string | Directional-metrics disclaimer. Render it wherever `outcome` renders |

### Other exports

| Export | Shape | Purpose |
|---|---|---|
| `proofTools` | `{ name, note }[]` | Home proof strip — 6 tools + why each is used |
| `capabilities` | `{ index, title, blurb, items[] }[]` | One consumer now: the Capabilities band (2b), which renders all four fields. The hero used to repeat `index` + `title` as a numbered range; that duplicated 2b word for word and cost the hero 179px it did not have, so it is gone |
| `packages` | `{ name, price, timeline, featured, forWho, deliverable, includes[] }[]` | The three offers from `02-service-catalog.md`, in selling order. Sprint is `featured` |
| `carePlan` | `{ name, price, blurb }` | Retainer line under the pricing grid |
| `founder` | `{ name, role, intro, story, photo, basedIn, principles[], quickFacts[] }` | The `/about` identity layer. `story` and `photo` are **empty slots** — the page renders labelled placeholders until Aniket fills them. Nothing invented |
| `testimonials` | `{ quote, name, role, business }[]` | **Empty on purpose** — the Testimonials band (3b) renders an honest "references on request" state until a real, attributed quote lands. No placeholder quotes (CLAUDE.md) |
| `images` | `{ process{}, projects{}, gallery[] }` | **All placeholders.** See *Images* below |

**Price duplication:** `packages[0].price` and `site.pricingAnchor` state the same
number twice — the anchor names Offer A's floor. Move both or the site disagrees
with itself.

### Images — all empty, and that is deliberate

`images` used to hold 16 hotlinked Unsplash URLs across three keys. All 16 are
gone. A stock photo of an office said nothing a visitor could not have assumed,
and sixteen of them made the site read as a template.

There is no `images.hero`: the hero ground is a `<picture>` in `Hero.jsx` over a
CSS gradient fallback. `public/hero.jpg` (with `hero-960.jpg`) is the landscape
frame; `public/hero-portrait.jpg` is the same photograph cropped to 4:5 and is
served at `max-width: 600px`, because the landscape frame is 2.33:1 and a phone
asks for something near 0.45:1 — `cover` threw away four fifths of the width and
left an unreadable slice of one lens. Below 810px the picture also stops being a
full-bleed ground and becomes a band across the top of the hero, so the copy sits
on solid ground instead of on his face.

What replaced them:

| Was | Now |
|---|---|
| `projects` (4) — work cards, projects list, case banner | `components/SystemDiagram.jsx`, one drawn schematic per case study, selected by the project's `diagram` key |
| `gallery` (8) — the closing arc | The four case studies themselves, as text cards built from `projects` |
| `process` (4) — hover decoration | Nothing. The slot survives but stays empty |

Two slots remain, and both render **only when set** — an empty string renders no
element at all, because a dashed placeholder well on a live page reads as a
broken build rather than as an honest gap:

| Key | Count | Wants to be |
|---|---|---|
| `projects` | 4 | Real screenshots of the booking flow, consent PDF, ops board and intake assistant. Renders under the diagram on the case-study page |
| `process` | 4 | Hover decoration on the process rows. Must be a **photograph**: the slot is about 4.7:1, and a diagram scaled into it renders its labels at five pixels. Lowest priority |

Real screenshots are still the single strongest thing this site could gain. The
diagrams are honest about being diagrams, and they are captioned as such — they
are not a substitute for showing the software running.

### Project 01 is drawn from the real system

The booking case study and its `booking` schematic were rewritten from the
production system ("The Slot Engine", Mindset Wellness) rather than from an
approximation. Three things had been wrong and are worth not reintroducing:

- **There is no room.** The old copy and the old drawing both showed a
  second-room constraint gating availability. The system has no concept of a
  room. What actually gates a slot is the therapist's gap, their Google
  Calendar, their blocked dates and their mode (weekly grid *or* listed dates,
  never both).
- **The database is PostgreSQL, not Supabase.** `proofTools` still lists
  Supabase, correctly — it is a tool Aniket uses. It is not this project's.
- **The scale is fourteen therapists**, 1,226 client records and 1,325
  bookings, not three practitioners.

The diagram now draws the turnaround rule, which is the part a reader cannot
infer from the words "booking system": a calendar booking is padded by the gap
on both sides before the overlap test, and a blocked candidate resumes one gap
after the blocking event ends rather than a whole session later. Every block in
it is placed by clock arithmetic from constants at the top of the drawing, so
the picture cannot drift out of agreement with the prose beside it.

`site.heroProof` quotes this project and was restated with it. Its previous
claim — two hours of booking admin down to thirty minutes — was an unaudited
business number and is gone.

## Home page composition

Ten bands, in the order a stranger reads them. Each band is **one file in
`src/pages/home/`**; `HomePage.jsx` is composition only. Section CSS stays in
the single `src/pages/HomePage.css`, ordered to match, and the `b` suffixes are
the bands added in the second pass — they keep the original numbering so the
stylesheet still reads top-to-bottom in page order.

The stylesheet is deliberately **not** split per band: several of its rules beat
`index.css` on source order alone, so one import from one place is what keeps
that order fixed. The reasoning is repeated in a comment in `HomePage.jsx`.

| # | Band | File in `src/pages/home/` | Reads from |
|---|---|---|---|
| 1 | Hero (photographic ground; a top band below 810px) | `Hero.jsx` | `site.heroProof`, `whatsappPrefill.hero` |
| 1b | Proof strip — who it is for, then the stack | `ProofStrip.jsx` | `proofTools`. The `.proof-lede` ICP line is hardcoded here; it was the hero lede until the hero was cut to four elements |
| 2 | Selected work | `Work.jsx` | `projects` (incl. `diagram`) |
| 3b | Testimonials | `Testimonials.jsx` | `testimonials` (empty → honest slot), `social` (GitHub) |
| 2b | Capabilities | `Capabilities.jsx` | `capabilities[].blurb/items` |
| 3 | Process | `Process.jsx` | `process`, `images.process` (usually empty) |
| 4b | Pricing | `Pricing.jsx` | `packages`, `carePlan` |
| 5b | CTA band | `CtaBand.jsx` | `site.pricingAnchor`, `site.availability` |
| 4 | FAQ | `Faq.jsx` | `faq` |
| 5 | Closing gallery | `Gallery.jsx` | `projects` — the arc fans the four case studies |

`site.availability` renders **once**, in the CTA band. It used to also close the
gallery; two copies on one page reads as a templating mistake.

## Layout contract

Two rules in `src/index.css` and `src/main.jsx` that are easy to break by accident.

**`--container-max` is the CONTENT width, not the border box.** `.container` and
`.nav-inner` both use `max-width: calc(var(--container-max) + var(--container-pad) * 2)`.
Written the other way round the two tokens fight: a 1400px box with 64px of padding
leaves 1272px of content on a 1920px screen, and the page reads as a narrow column
squeezed in from both sides. Current values are 1600 / 40, measured off the Folioblox
reference at 1920, 1440, 1280, 810 and 375.

`.page` carries a 62rem reading cap for the prose pages. `/projects` opts out with
`.page-wide` because it is a row list, not prose.

**`index.css` must be imported before `App.jsx` in `main.jsx`.** The other order
pulls every page stylesheet in ahead of the base sheet, so `index.css` wins every
specificity *tie* against page CSS — the inverse of what a page override is written
to do. It fails silently: a page rule that ties simply does nothing.

**Rule:** every number in `outcome` is directional and must render with
`outcomeNote` attached. Nothing is stated as a verified fact until Aniket supplies
real figures.

## Gap list

### P0 — blocks launch

| # | Item | Status |
|---|---|---|
| 1 | Fix `site.email` in `data.js` | **Done** — real address `aniket.html@gmail.com` set (2026-09-11) |
| 2 | Contact page → real form with n8n webhook capture | **Done** — form built. Live webhook URL blocked on Aniket |
| 3 | Meta tags (title, description, OG image) in `index.html` | **Done** — title, description, robots, full `og:*` and `twitter:*` set. `og:image` points at `og.svg`; see the PNG item below |
| 4 | Favicon | **Done** — `public/favicon.svg` recolored to match the site: near-black ground (`#101010`) with a saffron node (`#f5871e`) and a white node (`#ededed`). The site accent is now **bhagwa / saffron** (`--accent: #f5871e`), replacing the old orange (`#ff5c00`); the browser `theme-color` in `index.html` is the near-black ground `#101010`, not the old sage `#dbe3d2` |

### P1 — conversion critical

| # | Item | Status |
|---|---|---|
| 5 | Hero offer clarity — name *who* + *what outcome* | **Done** — rendered from `site.tagline` |
| 6 | Rewrite each project as a case study (Problem → System → Outcome) | **Done** — all four scaffolded in data and rendered by `ProjectDetailPage.jsx`. Numbers are still directional |
| 7 | Proof strip on home | **Done** — `proofTools` renders as band 1b. Testimonial band (3b) now exists too, as an **empty slot**: it renders an honest "references on request" state until Aniket supplies a real attributed quote. None invented |
| 8 | Pricing anchor | **Done** — `site.pricingAnchor` in the CTA band, and `packages` renders the full grid |
| 9 | `/about` page + CV download | **Page done (2026-09-11)** — `/about` renders the solo-specialist identity layer from `founder`. CV PDF and a real headshot still blocked on Aniket, but the page renders labelled slots for both rather than waiting on them |

### P2 — polish

- [x] **404 page** — `NotFoundPage.jsx` wired to `path="*"`
- [x] **Sitemap.xml + robots.txt** — both in `public/`
- [ ] **Analytics** — Plausible or Vercel Web Analytics (cookieless)

## What genuinely REMAINS

**Blocked on Aniket** — no agent can close these:

- [ ] **Buy the real domain** — the gmail address works now, but a branded domain is still the launch goal
- [x] **Real email address** — `aniket.html@gmail.com` set 2026-09-11
- [ ] **Live n8n webhook URL** → set `VITE_LEAD_WEBHOOK_URL` in the Vercel project env.
      Until it is set the form logs the payload and shows the fallback panel; no
      lead is captured. **This is now the only dead lead path** — WhatsApp is live
- [ ] **Real case study numbers** — every `outcome` figure is directional
- [x] **WhatsApp number** — `+91 9136582842` set 2026-09-11; every WhatsApp CTA is now live

**Buildable, still open:**

- [ ] **PNG OG image** — social scrapers do not reliably render SVG; a real PNG is
      required, plus the `og:image` / `twitter:card` tags that point at it
- [ ] **Analytics** — pick one, add the snippet
- [ ] **Favicon** — redraw in the orange accent, not the sage green currently in
      `public/favicon.svg`

**Fixed since the last pass** — the `ContactForm.jsx` success panel no longer prints
a literal `{whatsapp}`. It reads `site.whatsapp`, accepts either a number or a full
URL, and hides the line entirely below 8 digits.

## Deploy — live on Vercel

Full runbook: `docs/deploy.md`.

**Live at** <https://aniket-portfolio-six-bice.vercel.app> · team `aniket-s1` ·
project `aniket-portfolio`. The bare `aniket-portfolio.vercel.app` was already
taken by an unrelated site, which is why the alias carries a suffix.

**GitHub integration is connected**, so the deploy model is just git:

- push to `main` → production build
- push any other branch, or open a PR → preview URL only
- `vercel --prod` still works, but it uploads your *working directory*, not
  `origin/main`, which creates deployments outside the Git record. Prefer pushing.

Two things that have already cost time:

- **The project name must be lowercase.** `Aniket-Portfolio` is rejected with a 400.
- **A stale `.vercel/project.json` silently pins the folder** to whatever project
  it was last linked to, regardless of who is logged in. Delete the folder to reset.

Still to do here: add the custom domain under Project → Settings → Domains, and
set `VITE_LEAD_WEBHOOK_URL`, **then redeploy** — `VITE_*` values are baked into
the bundle at build time, not read at runtime, so saving the variable alone does
nothing.

**SPA rewrite** — `vercel.json` — **done**, present in repo:
```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```
Without this, deep links (`/projects/xyz`) 404 on refresh. Cloudflare's
`public/_redirects` has been deleted — Vercel ignores that file.

## Contact form → n8n wiring (shape)

```
[Contact form] ─POST──▶ [n8n webhook]
                            │
                            ├──▶ Airtable/Notion (lead row)
                            ├──▶ Gmail (notify you)
                            ├──▶ WhatsApp (notify you)
                            └──▶ Auto-reply email (24h SLA promise)
```

Payload the form actually sends (build the n8n side against these exact keys):

| Key | Source |
|---|---|
| `name` | required |
| `email` | required |
| `company` | optional |
| `workflow_broken` | required textarea, 20–1000 chars |
| `budget_band` | required radio: `<50k` / `50k-2L` / `2L+` / `not_sure` |
| `source` | `document.referrer` or `'direct'` |
| `submitted_at` | ISO timestamp |
