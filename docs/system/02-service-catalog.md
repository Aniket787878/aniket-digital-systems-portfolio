# 02 — Service Catalog

What you sell. Concrete, priceable, deliverable.

## Productized offers (start with 3, not 10)

### Offer A — "Ops Automation Sprint"
**For:** businesses drowning in manual data entry, form handling, follow-ups.
**Deliverable:** 3-5 n8n/Make workflows connecting their existing tools, live in 2 weeks.
**Price anchor:** ₹40k-₹80k fixed
**Examples:** Lead capture → CRM → auto-reply → team notify. Consent form → PDF → drive → whatsapp. Booking → calendar → reminder → follow-up.

### Offer B — "AI Assistant Build"
**For:** teams repeating the same knowledge lookups / responses.
**Deliverable:** Claude-powered assistant on their data (internal wiki, FAQ, product docs) with a simple UI or Slack/WhatsApp interface, in 3 weeks.
**Price anchor:** ₹80k-₹1.5L
**Examples:** Client-intake assistant, internal SOP bot, sales-quote assistant.

### Offer C — "Internal Tool / Dashboard"
**For:** teams working out of messy spreadsheets with no source of truth.
**Deliverable:** A lightweight web app (React + Supabase/Airtable) replacing the spreadsheet, in 3-4 weeks.
**Price anchor:** ₹1.5L-₹3L
**Examples:** Team ops dashboard, task/permission portal, resource booking system.

## Pricing framing (for the site + calls)

**The site now carries a pricing anchor, and it points at Offer A.** It lives in
`site.pricingAnchor` in `src/data.js`:

> Most engagements start with an Ops Automation Sprint: fixed scope, from ₹40,000,
> live in two weeks.

`from ₹40,000` is the floor of Offer A's ₹40k-₹80k band, and `two weeks` matches its
timeline — the anchor opens the range, it does not cap it. Offers B and C are quoted
on calls, not on the site. If Offer A's band moves, change `site.pricingAnchor` and
this line together, or the site and the call will disagree.

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

- Hourly consulting
- Website design (pure marketing sites) — refer out
- Long-form copy / brand strategy — refer out
- Custom mobile apps
- Anything requiring a dedicated ops person to run
