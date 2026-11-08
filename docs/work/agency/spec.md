# Agency phase 1: foundation (spec for approval)

Date: 2026-11-08. Status: **awaiting Aniket's approval**, no code yet.
Decisions so far: two people (Aniket sells and builds, Mukul builds); clinics first;
cities Mumbai and Pune; USP = DPDP-protected, secure database, no AI training;
AI drafts, a human sends (never silent AI pretending to be a person).

## Goal

Turn the portfolio's `/ai` brand into the agency's clinic-facing front door, with the
data promises stated plainly and every path ending in a booked 15-minute call.
Phases 2 to 4 (sales system, growth engine, client ops) live on the server and are
specced separately after this ships.

## Name (Aniket to pick)

Working name stays `brand.name` = Befikr until he picks. Shortlist, checked 2026-11-08
on Vercel's registry lookup (`.co` / `.com` only; `.in` must be checked at a registrar):

| Name | Meaning in the pitch | Available |
|---|---|---|
| Haazir | "Present." Someone is always there for the patient | haazir.co, gethaazir.com |
| Tatpar | "Ready, prompt." Replies before the patient moves on | tatpar.co |
| Har Jawaab | "Every answer." Every enquiry answered | harjawaab.com |
| Khayaal | "Care, attention." Looks after enquiries and data | khayaal.co |
| Sambhal | "We handle it." Ops and follow-up handled | sambhalai.com |
| Pehla Reply | "First reply." Fast first response | pehlareply.com |

Taken: jawaabai.com, dhyaan.co, sahaj.co, everyenquiry.com.
Recommendation: **Haazir** (one word, clinic owners get it instantly, works in English).

## Slices

Each slice is one builder (Sonnet) in its own worktree, gated by build + lint + Playwright
screenshots, one review, merge only on "merge".

### Slice 1: two-person brand
- `data.js`: `brand.team[2]` { name, role, line, photo } with Mukul as a **labelled
  placeholder** (no invented bio; one line "Builder. Automation and systems." plus empty
  photo slot). `brand.name` rename is still one line once chosen.
- `/ai` hero and `/ai/every-enquiry` "The person who checks" read `brand.team`.
- `/about` shows both people, Aniket first.
- Copy: "we" not "I" across `brand.*` strings only (home and other services untouched).

### Slice 2: clinics as the front door
- `/ai/for/clinics` becomes the destination of every ads and outreach link and the
  first chip in the `/ai` link strip; studios, coaching, agencies stay but move after it.
- Clinic page gains "Mumbai and Pune first" line and a cities field
  (`brand.cities = ['Mumbai', 'Pune']`) used in copy and JSON-LD `areaServed`.
- Free leak check copy on `/ai-check` mentions clinics in the intro line only.

### Slice 3: "Your data" page, `/ai/your-data`
- Four promises in plain words, one band each: stays in India, consent recorded,
  deleted on request, never used to train any AI. Each with "what this means for you"
  and "how we do it" (one line, no jargon).
- A downloadable one-page data processing agreement (markdown rendered to PDF at build,
  or a static PDF in `public/`). **Draft only, marked "sample, review with your lawyer"**;
  nothing on the page says "DPDP compliant", it says "built for the DPDP Act".
- Linked from `/ai` OwnIt band, the pricing page terms, the footer and the landing privacy line.
- Security lead reviews the wording before merge (claims must match the real server setup).

### Slice 4: every path books a call
- Set `site.bookingUrl` to Aniket's Cal.com link (blocker: he supplies it). The existing
  `FunnelCta` then shows "Book a 15-min call" everywhere; no new component.
- `/ai-check` result and the clinics page close on the booking button first, WhatsApp second.
- Lead webhook unchanged; `source` values documented in `01-website-map.md`.

### Slice 5: docs and audit
- `01-website-map.md` routes and `brand` schema updated; `02-service-catalog.md` gains a
  "Clinics first" note; `MAP.md` status board row; `docs/work/agency/audit.md` from the
  existing `scripts/audit` (contrast, links, meta) on every changed page.

## Not in phase 1
Postgres on the server, n8n sales flows, scraping, WhatsApp API, dashboard. Those are
phases 2 to 4 and need the server preflight first.

## Needed from Aniket
1. Name (or "keep Befikr").
2. Cal.com link (or we ship with the WhatsApp button as primary, as now).
3. Approval of the five slices, or changes.
