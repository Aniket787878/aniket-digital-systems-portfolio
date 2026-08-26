# 06 — 4-Week Roadmap

Ship the whole loop in 4 weeks. Then iterate.

## Blocked on Aniket — nothing else can close these

Every item below is a real-world input no agent can supply. The site cannot go live
until the first three are done.

| # | Blocker | Blocks |
|---|---|---|
| 1 | **Domain** — buy it | Deploy, real email, OG tags |
| 2 | **Email address** — replaces the `hello@aniketbuilds.com` placeholder | Contact fallback, footer, outreach |
| 3 | **n8n webhook URL** — set as `VITE_LEAD_WEBHOOK_URL` in Cloudflare Pages | Lead capture. Until set, no lead is stored |
| 4 | **Real case study numbers** | Every `outcome` figure is directional until then |
| 5 | **WhatsApp number** — `site.whatsapp` is `''` | Contact success panel, footer |

## Week 1 — Website ships + ICP locked

**Website (P0 gaps from `01-website-map.md`)**
- [x] Fix `site.email` in `data.js` — placeholder set with TODO; real address blocked on Aniket
- [ ] Add real meta tags + OG image in `index.html` — in flight; PNG OG image still needed
- [x] Add `public/_redirects` for SPA routing
- [x] Build contact form component with fields from `01-website-map.md` — webhook POST, budget bands, success/error/fallback states
- [ ] Set up n8n workflow: webhook → Airtable → email notify → auto-reply — build against the exact payload keys in `01-website-map.md`
- [ ] Deploy to Cloudflare Pages, connect custom domain — blocked on domain
- [ ] Verify: submit test form, confirm end-to-end — blocked on webhook URL

**Positioning**
- [x] Read `05-icp-positioning.md`, pick ICP — **LOCKED**: sell narrow, deliver broad. Service businesses running on bookings, intake, follow-ups, team coordination. Not wellness-only
- [x] Rewrite project summaries in ICP language
- [ ] Rewrite hero subhead + one CTA line — locked line is in `site.tagline`; `HomePage.jsx` wiring in flight

**Definition of done for Week 1:** site is live at custom domain, contact form works, hero names your ICP.

## Week 2 — Case studies + outbound infra

**Case studies (P1)** — pulled forward into Week 1; data layer landed early
- [x] Convert each `data.js` project into full case study: Problem / System / Outcome (with directional numbers) — all four scaffolded; `ProjectDetailPage.jsx` render still in flight
- [x] Add proof strip on home — `proofTools` export ready; page render in flight. No testimonial: none exists and none may be invented
- [x] Add pricing anchor sentence — `site.pricingAnchor`, points at Offer A
- [ ] Replace directional numbers with real ones — blocked on Aniket (blocker 4)

**Outbound infra**
- [ ] Set up Airtable "Prospects" base with pipeline stages from `03-client-landing-engine.md`
- [ ] Build 200-prospect target list
- [ ] Warm up sending Gmail (10-15 emails/day for 5 days, ramp)
- [ ] Draft opener template (see `03-client-landing-engine.md`)
- [ ] Set up LinkedIn profile: banner, tagline, featured section pointing to site

## Week 3 — Outbound live + content starts

- [ ] Send 25 personalized outbound touches (day 1-3)
- [ ] Send 25 more (day 4-5)
- [ ] Publish 2 LinkedIn posts (teardown + result story)
- [ ] Publish 1 X thread
- [ ] Track: reply rate, calls booked, post views
- [ ] Do 1-3 discovery calls if any book

## Week 4 — Iterate + first close

- [ ] Review Week 3 metrics — what worked, what didn't
- [ ] Revise opener + posts based on data
- [ ] Send 50 more touches
- [ ] Publish 3 more posts
- [ ] Send at least 1 written proposal
- [ ] Close first paid engagement (target)

## Success signals at end of Week 4

- Site live, converts (>2% form submit rate on cold LinkedIn traffic)
- ≥5% cold email reply rate
- ≥3 discovery calls done
- ≥1 proposal out
- ≥1 close, or clear path to close next week

## If Week 4 misses

Don't add more channels. Fix conversion at the weakest step:
- Low replies → opener is generic
- Replies but no calls → offer isn't clear
- Calls but no proposals → not qualifying hard enough
- Proposals but no close → price / risk framing off
