# 06 — Competitor research & site gap analysis

**Status: RESEARCH (2026-09-11).** Input for the next round of homepage work.
Companion to `05-icp-positioning.md` (ICP is locked; this is about *presentation*).

## The brand-model decision (settled 2026-09-11)

**Model chosen: solo specialist.** You, by name and face — not an agency ("we/our
team"), not a generic "service provider."

Why, in one line each:

- **Agency** wins on capacity and de-risking ("if one person leaves, the team
  covers"). You can't credibly claim that yet, and the social proof an agency
  facade needs (a team page, "our clients") would be invented — which
  `CLAUDE.md` bans outright.
- **Generic service provider** ("I help businesses with automation") is the
  ₹25k–60k global race-to-the-bottom that `05-icp-positioning.md` already
  rejects. That exact phrasing is banned from the copy.
- **Solo specialist** is what commands the 2–3× pricing the positioning doc
  documents, *and* it doubles as a job-landing profile ("both, client-leaning").
  Your buyer — a busy, non-technical clinic/studio owner — is buying trust and
  low coordination cost. "You talk to the person who builds it, and you own it
  afterward" is a genuine edge over an agency, not a limitation. The FAQ and the
  first-person "I build" voice already lean this way.

**The tension to resolve:** the voice is split. Copy says **"I build"** (solo,
right) but `site.name` is **"Digital Systems Builder"** (impersonal placeholder),
and there is **no human anywhere** — no name, no face, no `/about`. For a solo
specialist *you are the product*, and that's the single biggest gap below.

---

## What the market does — patterns worth stealing

Drawn from a scan of solo automation/AI builders, small studios, and the
freelance-market playbooks (n8n/Upwork/Contra pricing threads, Framer/Webflow
"AI automation" template genre — the same genre as our design reference).

Observed pricing anchors (for sanity-checking our bands, not to copy):

| Tier | Typical quote (global) | Our equivalent |
|---|---|---|
| Single workflow / simple automation | $250–500 | inside the Sprint |
| Medium multi-step automation | $600–800 | Sprint (₹40k–80k) |
| Complex / AI agent build | $1.5k–5k+ | AI Assistant (₹80k–1.5L) |
| Ongoing retainer | $2k/mo dev, or care plans | Care Plan (₹15k–30k/mo) |

Our bands are sensibly placed. The gap is **presentation**, not price.

The recurring conversion patterns, ranked by how much the market leans on them:

1. **The person is the product.** Best solo sites open with name + face +
   one-line identity ("Hi, I'm ___. I build ___ for ___."), founder story, a
   real LinkedIn. This is the #1 differentiator between a solo site that reads
   as *premium specialist* vs *anonymous vendor*.
2. **Social proof, densely.** Testimonials, named clients or "worked with"
   logos, star ratings, result quotes. In every freelance playbook this is
   ranked the top trust lever — above copy, above design.
3. **Outcome-led hero, quantified.** A number or a sharp before→after *in the
   hero*, not lower down.
4. **Case studies as problem → approach → result.** The universal template.
5. **Productized offers with "from" pricing** to filter buyers and anchor value.
6. **One dominant, low-friction CTA** repeated down the page (book a call /
   WhatsApp), never five competing ones.
7. **A free top-of-funnel offer** — "free automation audit / teardown" — that
   captures leads who aren't ready to buy.
8. **Risk reversal** — fixed scope, fixed timeline, "you own it, no lock-in."
9. **An authority layer** — LinkedIn cadence, teardowns, a short blog — driving
   inbound.
10. **Availability / scarcity** — "taking N builds a month."

## Where we already match the best (keep, don't touch)

- **Case studies (5, 8):** the four projects are genuinely strong —
  problem → system → outcome, with honest directional caveats. This is
  best-in-class for the genre. Better than most agency sites.
- **Productized pricing (5):** three named offers + Care Plan, with "from"
  anchoring and a featured Sprint as the front door. Textbook.
- **Risk reversal (8):** "you own it," self-hosted, "I build on your stack,"
  fixed-scope Sprint. Already sold in the FAQ.
- **Availability (10):** `site.availability` — "two new builds a month."
- **Process transparency:** the four-step Map/Build/Automate/Improve band and
  `proofTools` do the "how I work" job well.

## Gap analysis — ranked, mapped to files

### CRITICAL — costing conversions right now

**G1. Every CTA is dead.** `site.whatsapp` is empty, `site.email` is a
placeholder, and `VITE_LEAD_WEBHOOK_URL` is unset — so **no lead is captured by
any path.** A visitor convinced by the page has no working way to act. This is
the highest-leverage fix on the entire site and it's a content/config task, not
a code one. *Files: `src/data.js` (`site.whatsapp`, `site.email`), Vercel env +
redeploy. Already flagged in `CLAUDE.md` "Blocked on Aniket."*

**G2. No human — the solo model has no person.** `site.name` is "Digital Systems
Builder"; there is no name, no photo, no `/about`. The one thing the chosen
model depends on is absent. *Files: `src/data.js` (add identity fields), new
`/about` route + page, a signed founder line in Hero/CTA, a real headshot in
`public/`.*

### HIGH — biggest trust levers still missing

**G3. Zero social proof.** No testimonial, no client name, no "worked with,"
no LinkedIn. The market's #1 lever is entirely absent. Real quotes are blocked
on Aniket, but the *slot* should exist, and non-fabricated proof can ship now: a
LinkedIn link, a real GitHub link (already have one), an honest "early client
work — references on request" line. *Files: new `testimonials`/`clients` export
in `data.js` (empty slot, honestly labelled), a proof band on the home page,
`social` hrefs filled.*

**G4. Hero buries the outcome.** `heroProof` ("2 hrs → under 30 min") is the
sharpest thing on the site but sits as secondary proof. Consider leading the
hero with the before→after. *Files: `src/pages/home/Hero.jsx`, `HomePage.css`.*

**G5. No free top-of-funnel offer.** Nothing captures the not-ready-to-buy
visitor. A "free 20-min automation audit" or "free process teardown" is the
standard entry point and works *before* the webhook is live (it's just a
booking/WhatsApp link). *Files: a lead-magnet band + `whatsappPrefill` entry.*

### MEDIUM — polish and compounding growth

**G6. All 16 images are Unsplash placeholders.** Real screenshots of the
booking flow, consent PDF, ops board and intake assistant are, per our own
notes, "the single most replaceable thing on a portfolio." *Files: `public/`,
`images` in `src/data.js`.*

**G7. No authority layer + empty social links.** No blog/teardowns; `social`
LinkedIn/X/Email hrefs are empty. Inbound has no engine. *Files: `social` in
`data.js`; optionally a lightweight `/writing` later.*

**G8. Risk reversal is implicit, not shown.** "Live in 2 weeks," fixed scope,
"you own it" live in the FAQ but aren't a visible guarantee near the pricing.
*Files: `src/pages/home/Pricing.jsx`.*

## Recommended sequence

1. **G1** (unblock CTAs) — content/config, not code. Nothing else converts until
   this is done.
2. **G2 + G3** — the identity layer (`/about`, name, face, LinkedIn) and the
   proof slot. This is the solo model, made real. *Code can build the slots now;
   the photo/quotes are Aniket's to supply.*
3. **G4, G5, G8** — hero outcome, free-audit entry, visible guarantee.
4. **G6, G7** — real screenshots and the authority layer, over time.

The through-line: we are **already strong on substance** (case studies, pricing,
process) and **weak on the human and the proof** — which is exactly the profile
of a builder's portfolio written by the builder. The next round of work is
identity and trust, not more capability copy.
