# 02 — Service Catalog

What you sell. Concrete, priceable, deliverable.

## Three service areas (2026-09-30)

The offers are grouped into three areas, each with its own page on the site
(`/websites`, `/software`, `/ai`) and its own `lane` in `packages` in
`src/data.js`, which is where the prices on the site come from. Positioning:
`05-icp-positioning.md`.

**Placeholder prices.** The website, website + AI and roadmap prices below were
set on 2026-09-30 as starting points Aniket agreed to go with, and the Quick-Win
INR price was already a placeholder. Each is marked `TODO` in `data.js` until he
confirms it. The USD figures are set per market, not converted.

### Websites

| Offer | INR | USD | Live in | What it is |
|---|---|---|---|---|
| Business Website | from ₹25,000 (placeholder) | from $690 (placeholder) | 2 weeks | Up to 5 pages on the client's own domain, phone-first, set up for search, with the enquiry form and WhatsApp wired to the team |
| Website + AI Assistant | from ₹60,000 (placeholder) | from $1,500 (placeholder) | 3 weeks | The above plus an assistant that answers from the client's own information and hands ready buyers over on WhatsApp or email, with every conversation saved |

### Software

| Offer | INR | USD | Live in | What it is |
|---|---|---|---|---|
| Internal Tool / Dashboard | ₹1.5L – ₹3L | $4,000 – $8,000 | 3–4 weeks | A lightweight web app that replaces the spreadsheet (was Offer C) |
| Custom Platform | quoted after a call | quoted after a call | 3–5 weeks | Client and staff apps, bookings, payments, signed forms and role-based access in one system, the scale of the clinic platform |

### AI and automation

| Offer | INR | USD | Live in | What it is |
|---|---|---|---|---|
| AI Roadmap Session | ₹15,000 (placeholder) | $290 (placeholder) | ready in 1 week | The consultancy entry: a 60-minute working session, then a written plan ranking where AI and automation pay off, and a fixed quote for the first build if wanted |
| Automation Quick-Win | ₹25,000 (placeholder) | $490 | 5 days | One task fully automated |
| Ops Automation Sprint | ₹40k – ₹80k | $1,500 – $2,500 | 2 weeks | 3-5 n8n workflows connecting existing tools (was Offer A) |
| AI Assistant Build | ₹80k – ₹1.5L | $2,500 – $4,500 | 3 weeks | A Claude-powered assistant on the client's own documents (was Offer B) |

The paid AI Roadmap Session is not the free 15-minute call every page offers.
The free call is for deciding whether and where to start; the session is the
paid piece of work that produces the written plan.

## Pricing framing (for the site + calls)

The site's closing band states one starting price per area, built from
`services[].from` in `src/data.js` into `site.pricingAnchor`:

> Websites from ₹25,000. AI and automation from ₹15,000. Custom software from ₹1.5L.

If an entry price moves, change it in `packages` and in that area's `from`
together, or the card and the anchor will disagree.

- Never quote hourly — always fixed-scope
- Always name a **timeline** (buyers buy speed as much as output)
- **Discovery call → written 1-page proposal** (never verbal quote)
- 50% up front, 50% on delivery

## Retainers (recurring revenue layer)

Once a client has 1-2 systems live, offer a **Care Plan** at ₹15k-₹30k/month:
- Monitoring + fix broken automations within 24h
- 4-8 hours of small improvements per month
- Priority for new builds

Retainers are where the business becomes real. Every project should end with a retainer offer.

## What you DON'T sell (write this down so you don't drift)

- Hourly consulting (the AI Roadmap Session is fixed-price and fixed-scope)
- Long-form copy / brand strategy — refer out
- App-store mobile apps (installable web apps are in scope)
- Anything requiring a dedicated ops person to run

Websites came off this list on 2026-09-30: Aniket builds them, and a website
wired into the systems behind it is now one of the three areas.
