# 01 — Website Map

## Stack

- React 18 + Vite 5, React Router 6
- Fonts: Inter + Archivo (fontsource)
- No backend yet
- Deploy target: **Cloudflare Pages** + custom domain

## Routes

| Path | File | Status | Notes |
|------|------|--------|-------|
| `/` | `src/pages/HomePage.jsx` | Built, needs offer sharpening | Hero, featured, process, CTA |
| `/projects` | `src/pages/ProjectsPage.jsx` | Built | Reads `src/data.js` |
| `/projects/:slug` | `src/pages/ProjectDetailPage.jsx` | Built, thin content | Needs real case study format |
| `/contact` | `src/pages/ContactPage.jsx` | **Skeleton — mailto only** | No form, no capture, no notify |

## Data source

`src/data.js` — currently 4 projects, `hello@example.com` placeholder email.

## Gap list (do these in order)

### P0 — blocks launch
1. **Fix `site.email` in `data.js`** → real address (`aniket@mindsetwellness.in` or a dedicated `hello@`)
2. **Contact page → real form** with n8n webhook capture
3. **Meta tags** (title, description, OG image) in `index.html`
4. **Favicon** — currently generic svg

### P1 — conversion critical
5. **Hero offer clarity** — "I turn complicated workflows into better digital systems" is beautiful but vague. Add a subhead naming *who* + *what outcome*. (See `05-icp-positioning.md`.)
6. **Rewrite each project as a case study**: Problem → System built → Outcome (hours saved / errors avoided / revenue unlocked). Even directional numbers.
7. **Proof strip on home** — tools badges (n8n, Make, Claude, Airtable, Supabase), or a testimonial from Mindset Wellness.
8. **Pricing anchor** — even one sentence: "Systems typically ship in 2-4 weeks, from ₹X."

### P2 — polish
9. **404 page** (currently redirects to `/`; a proper 404 with CTA is better)
10. **Analytics** — Plausible or Cloudflare Web Analytics (free, cookieless)
11. **Sitemap.xml + robots.txt**

## Deploy plan (Cloudflare Pages)

1. Push repo to GitHub (already done)
2. Cloudflare dashboard → Workers & Pages → Create → connect repo
3. Build command: `npm run build` · Output dir: `dist`
4. Add custom domain (buy on Cloudflare Registrar or point existing DNS)
5. Add env var placeholder for future webhook URL: `VITE_LEAD_WEBHOOK_URL`

**SPA redirect fix** — add `public/_redirects`:
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

Fields to capture: name, email, company (optional), what workflow is broken (textarea), budget band (radio: <50k / 50k-2L / 2L+ / not sure).
