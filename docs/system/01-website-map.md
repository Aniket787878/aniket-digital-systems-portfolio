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
| `/ai-check` | `src/pages/AiCheckPage.jsx` + `src/pages/aicheck/rules.js` | Done (2026-10-09) | The free AI check, step 1 of the path (`funnelPath` in `data.js`): six questions (`aiCheck` in `data.js`) and a contact step, then an instant result worked out in the browser (top three jobs, rough hours labelled an estimate) and the AI Roadmap as step 2. Answers go to `/api/lead` with the contact form's fields (`service: 'ai'`, answers in `workflow_broken`, `source: 'ai-check · <referrer>'`), so the n8n intake needs no change. Since 2026-10-09 (start flows) the AI step 1: `/ai`'s primary buttons and the AI choice on `/start` point here; `/start/ai` redirects here. Shares its question engine with the plans (`src/pages/flow/Steps.jsx`) |
| `/start` | `src/pages/start/StartPage.jsx` | Done (2026-10-09) | "What do you want to build?" Three equal choices (Websites, Software, AI; line and price are each area's `promise` and `from`), to `/start/website`, `/start/software` or `/ai-check` (`startChoices` in `data.js`). Quiet links: "Not sure which? Start with the free AI check" and "Prefer to just talk?" (booking, else WhatsApp, else /contact). The nav's and home hero's "Get started" land here. Event `start_choose { choice }` |
| `/start/website`, `/start/software` | `src/pages/start/FlowPage.jsx` + `src/pages/start/rules.js` | Done (2026-10-09) | The free website plan and free software plan: the AI check's engine and look, questions in `startFlows` in `data.js` (budget step uses `budgetBands` in the visitor's currency), then a contact step and an instant result: the suggested package from `packages` with its real price and timeline (website: Business Website, or Website + AI Assistant when the AI assistant is ticked; software: Internal Tool / Dashboard, or Custom Platform when clients log in and 3+ must-haves, or 4+ must-haves), what it covers for their answers (website) or the first three screens (software), honest notes (more than 5 pages, budget under the starting price) and "a starting point, not a quote". Then the area's `PathStrip` and book a call / WhatsApp. Lead: `/api/lead`, same fields as the contact form, `service: 'websites' | 'software'`, `budget_band` as picked, answers in `workflow_broken`, `source: 'start-website · <referrer>'` / `'start-software · …'`. Events `flow_start`, `flow_submit { service }` |
| `/websites`, `/software`, `/ai` | `src/pages/ServicePage.jsx` + `src/pages/service/` | Done (2026-09-30) | One page per service area (`services` in `data.js`), the pages outreach links point at. Bands: dusk hero with three "what you get" cards, proof (night, project cards plus this site's own screens), the area's prices band (paper; since 2026-10-09 one "from" price, what is always included and the area's plan button, no package cards), the area's FAQ (the home `Faq` band with `items`), the other two areas as doors (night), the home closing `Cta` with `service` so its links preselect the area in the contact form |
| `/projects` | `src/pages/ProjectsPage.jsx` | Done | Reads `src/data.js`. Eight projects since 2026-09-30: the three n8n assistants (06 to 08) show a cropped still until they have films |
| `/projects/:slug` | `src/pages/ProjectDetailPage.jsx` | Done | Renders `problem`, `system`, `outcome` and `outcomeNote`. A project with a `stills` entry and no film gets the step-through gallery (`components/Walkthrough.jsx`) in the film's place, and its `credit` as a "Built on" row |
| `/about` | `src/pages/AboutPage.jsx` | Done | The identity layer that puts a real person behind the work (see `docs/research/06`; the solo framing there was superseded 2026-09-27). Composition only, bands in `src/pages/about/`: portrait hero (dusk monogram card until `founder.photo` is set), a five-step stepper (`founder.steps`; pinned and scroll-driven from 768px, a stacked list on phones and under reduced motion), the toolbox grouped by outcome (`toolbox`), the five project films in the site's dialog player, then the home closing CTA. Story renders only once `founder.story` is written |
| `/contact` | `src/pages/ContactPage.jsx` | Done | Three bands (`src/pages/contact/`): dusk header with the ways to reach me, the `ContactForm.jsx` card on paper, a "what happens next" stepper on night. `?service=websites|software|ai` preselects the form's "What do you need?" option; `#write` lands on the form (`ScrollToTop` honours the hash on forward navigation) |
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

The `/about` route now **exists** (added 2026-09-11) as the identity layer that
puts a real person behind the work. It is content-complete from what the site already
backs; a CV PDF and a real headshot remain blocked on Aniket, but neither blocks
the page — it renders labelled slots in their place.

**Correction:** this table previously said `/contact` was *"Skeleton — mailto only —
no form, no capture, no notify."* That is **false and has been removed.**
`src/components/ContactForm.jsx` is fully built: controlled fields, `POST` to
`VITE_LEAD_WEBHOOK_URL`, budget bands, and `sending` / `success` / `error` /
`fallback` states. Mailto is now only the fallback path when no webhook is
configured, not the mechanism.

## Data source

`src/data.js` — 8 projects. Email is a **placeholder** (`hello@aniketbuilds.com`,
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
| `diagram` | string | Optional. Key into `components/SystemDiagram.jsx`. Unset (the three n8n demos): no drawing and no drawing caption |
| `credit` | `{ label, href?, to?, licence? }[]` | Optional. What the project is built on, with its licence; renders as the "Built on" row. Required wherever the work starts from someone else's template or package |
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
| `services` | `{ slug, path, name, formLabel, example, icon, docTitle, title[2], sub, promise, points[3], from, media, proofHead[2], proof[], faq[] }[]` | The three service areas (2026-09-30). Drives the three service pages, the home Services band's doors, the closing band's price anchor and the contact form's "What do you need?" options. `proof` entries are project slugs or `{ key, title, subtitle, note, image, badge, to, cta }` for proof that is not a project (this site, its form) |
| `packages` | `{ lane, name, price, timeline, timelineChart, featured, explainer, forWho, deliverable, includes[] }[]` | The offers from `02-service-catalog.md`, grouped by `lane` (a `services` slug), in selling order within each. `featured` marks each area's "Start here". `timelineChart` picks the bars on the About page's timeline |
| `carePlan` | `{ name, price, blurb }` | Retainer. Its price shows only on the plans' result screens (2026-10-09); pages say "optional" |
| `founder` | `{ name, role, intro, story, photo, basedIn, steps[], principles[], quickFacts[] }` | The `/about` identity layer. `photo` is empty until a real file lands in `public/` (set `photo: '/aniket.jpg'`; the page shows a drawn dusk monogram card meanwhile). `story` renders only when written. `steps` restate promises made elsewhere on the site. `principles` is currently unused by the page. Nothing invented |
| `toolbox` | `[{ key, outcome, tools[{ name, note }] }]` | The `/about` toolbox, sorted by what each tool does for the client. Notes reuse `proofTools` where one exists |
| `testimonials` | `{ quote, name, role, business }[]` | **Empty on purpose** — the Testimonials band (3b) renders an honest "references on request" state until a real, attributed quote lands. No placeholder quotes (CLAUDE.md) |
| `images` | `{ process{}, projects{}, gallery[] }` | **All placeholders.** See *Images* below |

**Price duplication:** `packages[0].price` and each area's `services[].from` state
the same floor twice (`site.pricingAnchor` and the FAQ's cost answer are filled
with / restate the `from` values). Move them together or the site disagrees with
itself.

**Where prices show (Aniket, 2026-10-09).** Pages show one "from" price per area
(`services[].from`): service page prices band, hero foot, `/start` cards, home
doors, closing `Cta` anchor, the FAQ cost answer, JSON-LD (`minPrice` per area).
A package's own price (and the Care Plan's) appears only on the result screens
of `/start/website`, `/start/software` (`FlowPage.jsx`) and `/ai-check` (the AI
Roadmap price, step 2), after the visitor has answered and left their details.
`funnelPath` / `servicePaths` notes are price-free ("Fixed fee", "Optional").
`PriceCard` / `CarePlanCard` in `components/Pricing.jsx` are no longer rendered.

**Lead fields and result URLs (2026-10-09, `docs/outreach/2026-10-09-funnel-strategy.md`).**
All three flows and the contact form keep the original payload and add
`phone`, `timing`, `package`, `lead_temp`, `utm_source`, `utm_medium`,
`utm_campaign`, `landing_page` (`src/leadExtras.js`; landing captured in
`main.jsx` into sessionStorage). Temperature: plans are cold when the budget is
below the package's start (Custom Platform uses the Internal Tool's floor) or
"no fixed date yet", hot when the budget fits, it is wanted within a month and
a WhatsApp number was given, else warm; the AI check (no budget or date asked)
is cold for 1 to 2 people with under 10 enquiries a week, hot with a number and
30+ enquiries or 3+ people, else warm; the contact form sends warm. Routes are
`/start/website/:view?`, `/start/software/:view?`, `/ai-check/:view?`: `result`
is the result screen, a refresh there (nothing in memory) returns to the start,
the back button returns to the contact step, anything else redirects. Result
buttons (`pages/flow/NextStep.jsx`): hot "WhatsApp me now" (Aniket's number,
answers prefilled) + call or message; warm the call buttons as before; cold
"Here's what to read next" (website-answer-widget / therapist-pwa /
appointment-desk) + the call as a light button.

### `films`, `heroReel`, `stackMarquee` (2026-09-27)

- `films[slug]` — `{ kind, src, poster, clip?, clipPoster? }`. `kind` is
  `'real'` (the consent signer, shared inbox and lead research tool: captures of the running app) or
  `'schematic'` (the two client platforms). Read by the home work cards,
  `/projects` (now a film-led showcase, not a thumbnail list) and the case
  page. Every surface labels the kind.
- `heroReel` — the silent loop of the real apps, shown in the Statement band
  under the problem text (real captures only; phones get the poster). Moved
  there 2026-09-27 when the brand explainer took the hero card.
- `stackMarquee` — the moving "Built with" strip under the hero.
- Source for all of it: `remotion/` + `public/walkthroughs/`, rendered by
  `scripts/render-videos.sh`.

### Project covers, `projects[].cover`, `COVER_V` (2026-10-09)

- Every project card (the `/projects` grid and the service-page proof cards)
  shows a designed cover, `projects[].cover = { src, alt }`, instead of a
  shrunk screen or a hover film: one moment that explains the job, in words
  that read at card size, plus a three-step strip. Built as HTML in
  `scripts/covers/<slug>.html` (one `covers.css`), rendered by
  `PLAYWRIGHT=... node scripts/render-covers.mjs [slug]` to
  `public/covers/<slug>.png` (1600x900, compressed). Bump `COVER_V` after a
  re-render. The /websites "This website" proof entry has its own `cover`.
- Each cover carries a small corner tag that matches its card label:
  "Words from a real test run" / "Drawn from the working demo" (quotes the
  recorded run or the captured screens), "Illustration · no client data"
  (client platforms), "Demo · made-up business" (demo screens). Never put
  invented numbers or client records on a cover. The case pages keep the
  films and real screens; without a `cover` a card falls back to them.

### `stills`, `stillLabel`, `mediaKind` (2026-09-30)

- `stills[slug]`: `{ kind, cover: { file, focus }, card? }` for a demo with real
  screens but no film yet: Appointment Desk, Practice Knowledge Assistant,
  Website Answer Widget (captured by `scripts/capture-demos.mjs`: n8n's real
  chat UI, replies recorded from real test executions and replayed). The
  `/projects` grid and the service-page proof cards (both
  `components/ProjectCard.jsx`, data from `components/projectCard.js`,
  since 2026-10-09) show `cover`, cropped to `card` (else `focus`) by
  `components/ScreenStill.jsx`; the light captures sit in a window frame on
  the dark well, and the truth label is in the card's meta row, never on
  the picture; the case page steps
  through every shot in `public/walkthroughs/<slug>/steps.json` (read by
  `src/walkthroughs.js`). A film in `films` always wins.
- `stillLabel`: the one badge and caption every still surface uses.
- `mediaKind(slug)`: `'real'` or `'schematic'`, from the film or the still.
- Placement: all three on `/ai`, the widget also on `/websites`, all on
  `/projects`. Not on home: the Work band is "three working tools" with
  films, and a still-only row there would be a second idea in the band.

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

The hero no longer quotes this project (`site.heroProof` was removed
2026-09-27); the brand explainer film carries the proof instead.

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
| 1 | Hero (dusk scene with the brand explainer; poster on phones) | `Hero.jsx` | `site.headline`, `site.subtitle`, `explainers.brand`, `whatsappPrefill.audit` |
| 1b | Statement + showreel | `Statement.jsx` | `heroReel` |
| 2 | Work | `Work.jsx` | `projects`, `films` |
| 4 | Services: three doors, one per area, each opening its service page | `Services.jsx` | `services`, `site.guarantee`, `carePlan` (via `components/Pricing.jsx`, `components/ServiceDoor.jsx`) |
| 2b | Product tour | `Tour.jsx` | `screenTour` |
| 2c | Connect | `Connect.jsx` | nothing (its copy lives in the file) |
| 3b | Testimonials | `Testimonials.jsx` | `testimonials` (empty → honest slot) |
| 3 | Process | `Process.jsx` | `process` |
| 5 | FAQ | `Faq.jsx` | `faq` (the service pages pass their own `items`) |
| 6 | Closing CTA | `Cta.jsx` | `site.pricingAnchor` filled from each area's `services[].from` |

The full price cards moved to the service pages on 2026-09-30, and off the
site on 2026-10-09 (package prices only on the plans' result screens); the home
page only says what the three areas are and where each starts.

### Funnel: every page ends on a free first step (2026-10-09)

Rewired the same day ("for website why AI check button?"): the primary is
`StartCta` in `components/FunnelCta.jsx`, destinations in `src/flows.js`.
"Get started" goes to `/start`; with `service` it goes to that area's own
plan: websites "Plan your website" (`/start/website`), software "Plan your
software" (`/start/software`), ai "Get your free AI check" (`/ai-check`,
`CheckCta`). `TalkCta` is the call, second; `Rehook` defaults to `/start`.
Every saffron `StartCta` carries `data-primary`; the nav's "Get started"
turns to an outline while one is on screen, and is always quiet on
`/start*` and `/ai-check`. The footer drops its button on `/start*`.
`PathStrip` takes `service` (`servicePaths` in `data.js`): AI keeps check,
Roadmap, build, Care Plan; websites and software are their own free plan,
a free call and written fixed-price proposal, build by a fixed date, Care
Plan.

| Route | Funnel beats |
|---|---|
| `/` | Hero "Get started" + Book a free call, trust line kept; close band "Get started". The ∞ loop (`funnelPath`) still tells the AI path |
| `/websites`, `/software`, `/ai` | Hero, close band and the prices band's button use the area's own step 1 ("Plan your website" / "Plan your software" / "Get your free AI check"); hero foot "Free website plan first, no obligation" etc. Prices band: the area's "from" price, "Always included", the plan button, then `PATH_INTRO` and the area's `PathStrip`. Websites showcase ends "Plan your website". OtherAreas ends "Not sure which of the three comes first?" to `/start` |
| `/projects` | Rehook under the lede and the closing box: "Get started" (`/start`) + call |
| `/projects/:slug` | Closing box names the project; its button is the plan of the one area whose `proof` lists the project (e.g. care-journey to the software plan, appointment-desk to the AI check), else "Get started" (projects in two areas' proof) |
| `/about` | Hero "Get started"; Steps band rehook to `/start` |
| `/contact` | Hero and NextSteps rehooks to `/start`. Form and email unchanged |
| `/privacy` | Mentions the website and software plans beside the AI check; ends on a rehook to `/start` |

No sticky mobile bar: the nav is fixed on phones and already carries the
"Get started" button at every scroll position, so a bottom bar would duplicate it.

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
| 9 | `/about` page + CV download | **Page done (2026-09-11)** — `/about` renders the identity layer from `founder`. CV PDF and a real headshot still blocked on Aniket, but the page renders labelled slots for both rather than waiting on them |

### Demo projects (2026-09-30)

| # | Item | Status |
|---|---|---|
| D1 | Appointment Desk, Practice Knowledge Assistant, Website Answer Widget as projects | **Done**: real stills, step-through on the case page, credits with licences |
| D2 | Films for the three | **Open**: render into `films`; the stills then retire on their own |
| D3 | Appointment Desk booking write | **Done 2026-09-30**: one real booking (execution 23954) wrote the calendar event and the log row, captured as screen 04. It ran on a stand-in calendar with only free/busy visible to the AI; the n8n calendar credential still cannot see the demo calendar. Reschedule, cancel and confirm remain tested with simulated responses |

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
