# 05 — ICP & Positioning

**Status: DECIDED (locked 2026-08-25).** Review on **2026-10-24** (60 days).
Previous status was "OPEN QUESTION" — the decision below replaces it.

## Decision (locked)

**Sell narrow, deliver broad.**

**Headline promise**
> AI + operations automation for service businesses that run on bookings, client
> intake, follow-ups and team coordination.

**Buyer:** owner/operator of a service business — clinics, studios, agencies,
consultancies — in India. Busy, non-technical, drowning in WhatsApp + Google Sheets
+ manual copy-paste.

**Breadth** (websites, CRM, dashboards, PWA, GMB, data) is shown as **capability
range lower on the page** — never as the headline promise.

Banned from all copy: "I help businesses with automation" and any variant that
names neither who nor what outcome.

### Why narrow

Generalist automation positioning competes on price against a global pool, and
loses. Niched positioning commands 2-3x pricing. Observed in the Indian n8n market:

| Positioning | Typical quote |
|---|---|
| Niched (names an industry + workflow) | ₹80k – ₹2.5L |
| Generic "automation setup" | ₹25k – ₹60k |

Same delivery work. The difference is whether the buyer reads the offer as *their
problem* or as *a service category*.

### Why NOT wellness-only

Wellness clinics were this doc's old default (candidate A, and still the warmest
segment). Rejected as the *headline* for two reasons:

1. Aniket wants a wider net than one vertical supports.
2. The four existing case studies generalise. Booking, consent/intake, team ops and
   AI intake are workflow shapes, not wellness features — they map to any service
   business that runs on bookings, intake, follow-ups and coordination.

Wellness stays the warmest **entry point** for outreach (best intros, best domain
fluency). It is a targeting decision, not the positioning.

### What breadth is still sold, and where

| Sold | Where it appears | Never |
|---|---|---|
| Bookings, intake, follow-ups, team coordination | Hero, headline promise, opener | — |
| Digital systems (internal tools, dashboards, portals, CRM) | Capability range, lower on home | Hero |
| Web & apps (sites, landing pages, PWA) | Capability range, lower on home | Hero |
| AI & automation (n8n + Claude) | Capability range + case studies | — |
| Growth systems (lead capture, follow-up, GMB, reporting) | Capability range, lower on home | Hero |

Source of truth for that list is the `capabilities` export in `src/data.js`.
The rule: a visitor should read the automation promise first and discover the range
second. Never reorder that.

### Review trigger

- **Review date: 2026-10-24** (60 days from lock).
- **Revisit early if cold reply rate is <5%** — that means the opener or the ICP is
  off. Diagnose in that order: opener first (cheaper to change), ICP second.
- Reply rate >10% → double down, narrow further within the winning segment.

## Decision framework — kept

Score each candidate 1-5 on:

1. **Domain fluency** — how well do you understand their workflows?
2. **Warm intro path** — can you reach them via someone you know?
3. **Willingness to pay** — do they buy this kind of thing already?
4. **Case study fit** — do your existing projects (booking, consent, team ops) map?
5. **Reachability** — can you find 200 of them on LinkedIn / directories?

## Scores

| # | Candidate | Domain fluency | Warm intro | Willingness to pay | Case study fit | Reachability | Total |
|---|---|---|---|---|---|---|---|
| **E** | **Service businesses on bookings / intake / follow-ups / team coordination (clinics, studios, agencies, consultancies — India)** | **4** | **4** | **4** | **5** | **5** | **22** ✅ **CHOSEN** |
| A | Wellness clinics / therapists / studios (India-first) | 5 | 5 | 3 | 5 | 4 | 22 |
| D | Solo consultants / coaches | 4 | 4 | 2 | 4 | 5 | 19 |
| B | Small marketing / creative agencies | 3 | 3 | 4 | 2 | 5 | 17 |
| C | D2C e-commerce brands | 2 | 2 | 5 | 2 | 4 | 15 |

**How E is scored** (it is a union of A, B and D, so scores are derived, not new
evidence): fluency 4 — the workflow layer is identical across these businesses even
where the industry is less familiar than wellness. Warm intro 4 — wellness intros
still warmest, wider net includes colder segments. Willingness to pay 4 — agencies
and consultancies lift the price-sensitive clinic average. Case study fit 5 — the
criterion *is* booking/intake/follow-up/team-ops. Reachability 5 — union of all
channels.

E ties A on score against a much larger pool, and carries the pricing advantage of a
named workflow. That is the case for E over A.

### Original candidate notes (kept for the 60-day review)

- **A — Wellness clinics/therapists/studios:** Mindset Wellness is exactly this;
  existing network; price-sensitive but real; projects came from this world;
  reachable via JustDial, Practo, Instagram, local groups.
- **B — Small marketing/creative agencies:** resell your work at markup; existing
  projects don't map; LinkedIn goldmine.
- **C — D2C e-commerce brands:** ROI easy to prove, but weakest fluency and fit.
- **D — Solo consultants/coaches:** natural expansion, small budgets.

## Positioning statement (live)

> I build AI and operations automation for service businesses — clinics, studios,
> agencies and consultancies — so bookings, client intake, follow-ups and team
> coordination stop running on WhatsApp threads and manual copy-paste.

This is live as `site.tagline` in `src/data.js`. Change it there, not in a component.

## Next steps now the ICP is locked

- [x] Rewrite `site.tagline` in `data.js` to name the ICP + outcome
- [x] Rewrite `data.js` project summaries in ICP language
- [x] Add `capabilities` export so breadth has a home below the hero
- [ ] Wire hero subhead + CTA line on `HomePage.jsx` to the locked promise
- [ ] Draft ICP-specific opener template (see `03-client-landing-engine.md`)
- [ ] Build the 200-prospect target list — start with wellness (warmest), then
      studios, then agencies/consultancies
- [ ] Log reply rate against the <5% / >10% triggers above
