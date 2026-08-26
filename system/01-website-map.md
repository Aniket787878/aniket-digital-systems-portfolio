# 01 — Website Map

**Code state verified: 2026-08-25, late session.** Other agents were still landing
page changes at the time of writing, so items marked *In flight* are decided and
data-backed but not yet confirmed rendered. Re-verify before deploy.

Status vocabulary used below:
- **Done** — verified present in the code.
- **In flight** — decided this session, data layer landed, page render not yet confirmed.
- **Blocked on Aniket** — cannot be finished by any agent; needs a real-world input.

## Stack

- React 18 + Vite 5, React Router 6
- Fonts: Inter + Archivo (fontsource)
- No backend yet
- Deploy target: **Cloudflare Pages** + custom domain

## Routes

| Path | File | Status | Notes |
|------|------|--------|-------|
| `/` | `src/pages/HomePage.jsx` | In flight | Hero, featured, process, CTA. Proof strip + capability range + pricing anchor being wired to new `data.js` exports |
| `/projects` | `src/pages/ProjectsPage.jsx` | Done | Reads `src/data.js` |
| `/projects/:slug` | `src/pages/ProjectDetailPage.jsx` | In flight | Case-study fields exist in `data.js`; page still renders summary + description only |
| `/contact` | `src/pages/ContactPage.jsx` | Done | Renders `ContactForm.jsx` |

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
| `description` | string | Narrative paragraph |
| `flow` | string[] | Step labels for `SystemVisual` |
| `private` | boolean | Optional. Renders "Private Client System", suppresses client identity |
| `role` | string | What Aniket personally did |
| `timeline` | string | e.g. `'4 weeks'` |
| `stack` | string[] | Tools used |
| `problem` | string | Before state |
| `system` | string[] | What was built, one bullet per component |
| `outcome` | string[] | Results — **directional only** |
| `outcomeNote` | string | Directional-metrics disclaimer. Render it wherever `outcome` renders |

### Other exports

| Export | Shape | Purpose |
|---|---|---|
| `proofTools` | `{ name, note }[]` | Home proof strip — tools + why each is used |
| `capabilities` | `{ index, title, blurb }[]` | Capability range lower on home. **Never the hero** — see `05-icp-positioning.md` |

**Rule:** every number in `outcome` is directional and must render with
`outcomeNote` attached. Nothing is stated as a verified fact until Aniket supplies
real figures.

## Gap list

### P0 — blocks launch

| # | Item | Status |
|---|---|---|
| 1 | Fix `site.email` in `data.js` | **Done (placeholder)** — `hello@aniketbuilds.com` set with a TODO. Real address blocked on Aniket |
| 2 | Contact page → real form with n8n webhook capture | **Done** — form built. Live webhook URL blocked on Aniket |
| 3 | Meta tags (title, description, OG image) in `index.html` | **In flight** — `index.html` still carried the old vague description and no OG tags at time of writing. Verify before deploy |
| 4 | Favicon | **In flight** — `public/favicon.svg` was still the generic dark mark (`#0f1115`) at time of writing. Replacement must use the sage palette. Verify before deploy |

### P1 — conversion critical

| # | Item | Status |
|---|---|---|
| 5 | Hero offer clarity — name *who* + *what outcome* | **In flight** — locked line lives in `site.tagline`; `HomePage.jsx` wiring not yet confirmed |
| 6 | Rewrite each project as a case study (Problem → System → Outcome) | **Done in data / In flight on page** — all four scaffolded with `problem`, `system`, `outcome`, `outcomeNote`; `ProjectDetailPage.jsx` does not render them yet |
| 7 | Proof strip on home | **Done in data / In flight on page** — `proofTools` export ready. No testimonial: none exists and none may be invented |
| 8 | Pricing anchor | **Done in data / In flight on page** — `site.pricingAnchor` set, points at Offer A |

### P2 — polish

- [ ] **404 page** (currently redirects to `/`; a proper 404 with CTA is better)
- [ ] **Analytics** — Plausible or Cloudflare Web Analytics (free, cookieless)
- [ ] **Sitemap.xml + robots.txt**

## What genuinely REMAINS

**Blocked on Aniket** — no agent can close these:

- [ ] **Buy the real domain** — everything below waits on it
- [ ] **Real email address** — replace the `hello@aniketbuilds.com` placeholder
- [ ] **Live n8n webhook URL** → set `VITE_LEAD_WEBHOOK_URL` in Cloudflare Pages env.
      Until it is set the form logs the payload and shows the fallback panel; no
      lead is captured
- [ ] **Real case study numbers** — every `outcome` figure is directional
- [ ] **WhatsApp number** — `site.whatsapp` is `''`

**Buildable, still open:**

- [ ] **PNG OG image** — social scrapers do not reliably render SVG; a real PNG is
      required, plus the `og:image` / `twitter:card` tags that point at it
- [ ] **Analytics** — pick one, add the snippet
- [ ] **Known defect:** `ContactForm.jsx` success panel prints the literal text
      `{whatsapp}` instead of reading `site.whatsapp`, and `site.whatsapp` is empty.
      Fix the reference and hide the line entirely when the value is empty

## Deploy plan (Cloudflare Pages)

1. Push repo to GitHub (already done)
2. Cloudflare dashboard → Workers & Pages → Create → connect repo
3. Build command: `npm run build` · Output dir: `dist`
4. Add custom domain (buy on Cloudflare Registrar or point existing DNS)
5. Set env var `VITE_LEAD_WEBHOOK_URL` to the live n8n webhook

**SPA redirect fix** — `public/_redirects` — **done**, present in repo:
```
/*  /index.html  200
```
Without this, deep links (`/projects/xyz`) 404 on refresh.

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
