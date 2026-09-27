# Action Plan — System → Portfolio → Social proof → Outreach

Written 2026-09-25. Supersedes the ordering in the other files in this folder;
they stay as reference (`client-acquisition-plan.md` = offers & scripts,
`client-acquisition-system.md` = the pipeline design, `cowork-kit/` = Cowork
prompts & templates).

## Ground rules (agreed)

1. **Company n8n is OK to use for now; company credentials are not.** Every
   credential in the pipeline is personal: `aniket.html@gmail.com` (Gmail,
   Sheets, Drive), a personal Anthropic API key, a personal Cal.com. No
   company Gemini key, no company Gmail, no company WhatsApp number, no clinic
   data. After funding, export the workflows and move to a personal instance.
2. **Keep it separable.** All pipeline workflows are named `Pipeline ·` and
   tagged `aniket-pipeline`; all credentials are named `Aniket – …`. Moving
   out later is an export + import, nothing to untangle.
3. **Nothing sends by itself on cold channels.** Cold WhatsApp, Reddit and
   LinkedIn are always sent by you. Automated email only to people who have
   already replied or opted in, plus a capped follow-up sequence with an
   opt-out line.
4. **Real accounts, real proof.** One genuine LinkedIn and one genuine Reddit
   account, under your own name. No fake reviews, bought karma or second
   accounts — they get banned and they destroy exactly the trust we're
   building.
5. **Accountability is built in** (see the end of this file): every phase has a
   done-when, every week has a scoreboard, every change is a commit.

---

## Phase 0 — Access & accounts (Day 1–2) · owner: Aniket

What I need before building. Tick each off.

| # | Item | Why | Notes |
|---|---|---|---|
| 0.1 | **n8n access** to `n8n.mindsetwellness.in` (or confirm which instance) | Where the pipeline runs | The copy on this server has been down since July; the public one is the live one. |
| 0.2 | **Google OAuth for `aniket.html@gmail.com`** added to n8n as `Aniket – Google` (Gmail + Sheets + Drive) | Mail, tracker, docs | Create the OAuth client in a *personal* Google Cloud project, not the company's. |
| 0.3 | **Personal Anthropic API key** added to n8n as `Aniket – Anthropic` (Header Auth, name `x-api-key`) | Lead scoring & drafting | Set a monthly spend limit (~$20) in the Anthropic console. |
| 0.4 | **Google Sheet `Client Pipeline`** owned by aniket.html@gmail.com, tabs `Leads`, `Scoreboard`, `Log` | Single source of truth | I'll give you the header rows. |
| 0.5 | **Cal.com** (free) on aniket.html@gmail.com — event "Free 20-min automation audit" | Booking link everywhere | |
| 0.6 | **WhatsApp**: a personal/business number that is *not* the clinic's | Your outreach number | WhatsApp Business app is enough. |
| 0.7 | **Employer OK** to show the clinic system (anonymised screenshots, fake-data demo, one quote) | Phase 2 proof | Get it in writing (email is fine). |
| 0.8 | **Cowork** on your personal Claude account with the Gmail + Drive connectors on aniket.html@gmail.com | Research tasks n8n can't do well | |

**Done when:** I can open n8n, see the `Aniket –` credentials, and write a
test row to `Client Pipeline`.

---

## Phase 1 — The system (Week 1–2) · owner: Claude builds, Aniket tests

The machine that finds, tracks and follows up — so outreach later is only
you pressing send.

| # | Build | Tool | What it does |
|---|---|---|---|
| 1.1 | Tracker sheet + status model | Sheets | `new → ready → contacted → followup_1-3 → replied → call_booked → proposal_sent → won/lost/not_now` |
| 1.2 | **Pipeline 00 · Import leads** | n8n form | Paste a Lead Research Tool/Maps CSV → dedupe → `Leads` |
| 1.3 | **Pipeline 01 · Enrich & score** | n8n + Claude (personal key) | Reads each lead's site, scores it, drafts WhatsApp opener + email |
| 1.4 | **Pipeline 02 · Buyer signals** | n8n RSS + Claude | Watches Reddit search feeds (r/n8n, r/forhire, r/smallbusiness, r/IndianStartups…) and the n8n forum Jobs feed every 2h; keeps real buyer posts, drafts a helpful reply; into `Leads` as type `buyer` |
| 1.5 | **Pipeline 03 · Morning digest (09:00)** | n8n + Gmail | One email: hot replies, follow-ups due, top 20 new — with tap-to-open WhatsApp links and tap-to-update buttons |
| 1.6 | **Pipeline 04 · Lead action links** | n8n webhook | The buttons in the digest: Sent / Replied / Call booked / Later / Not a fit |
| 1.7 | **Pipeline 05 · Email follow-ups + reply detection** | n8n + Gmail | Day 3/7/14 for email leads, stops the moment they reply |
| 1.8 | **Pipeline 06 · Lead intake** | n8n webhook | Portfolio form + Cal.com bookings → sheet → alert you → auto-reply with booking link |
| 1.9 | **Pipeline 07 · Sunday scoreboard** | n8n + Gmail | Weekly numbers + what to change |
| 1.10 | **Error alerts** | n8n error workflow | Any pipeline failure emails you |
| 1.11 | Cowork tasks T1 (buyer hunt on LinkedIn/Quora), T5 (content), call-prep, proposal | Cowork | The research-heavy bits |
| 1.12 | Export all workflows to `n8n/pipeline/` in the portfolio repo | Git | Backup + the "move off company n8n" plan |

**Test script (Aniket, Day 10):** import 10 real leads → run 01 → get the
digest → tap "Sent" on 3 → check the sheet moved → submit the portfolio form
→ get the alert + auto-reply → force a follow-up date → see it send and stop
on a reply.

**Done when:** the test script passes end to end and the digest has arrived
3 mornings in a row without you touching n8n.

---

## Phase 2 — Portfolio as a sales page (Week 2–3) · owner: Claude builds, Aniket supplies proof

From the audit. Ordered by impact.

| # | Change | Needs from Aniket |
|---|---|---|
| 2.1 | Hero: outcome headline + proof line + "Book free audit" as the main CTA | — |
| 2.2 | Wire the contact form to Pipeline 06 (`VITE_LEAD_WEBHOOK_URL`) + Cal.com link | Cal.com link |
| 2.3 | **Demo clinic**: fake-data booking page → real WhatsApp confirmation → reminder, with a "Try it on your phone" section | WhatsApp sending setup on your own number/account |
| 2.4 | 90-second walkthrough video on the flagship case study | Record it (I'll script it) |
| 2.5 | Anonymised screenshots of the clinic app | Employer OK (0.7) |
| 2.6 | Rewrite case studies buyer-first (before → built → after), tech details collapsed | Real numbers you can confirm (client count: 750+ or ~1,230?) |
| 2.7 | Testimonial band: real quote, or remove the empty "In their words" | One quote from the clinic |
| 2.8 | Real photo (eyes visible), surname, LinkedIn link; hide empty About slots | Photo, surname choice |
| 2.9 | Split "Client systems" vs "Products I built"; add a "Full platform" pricing tier | — |
| 2.10 | Legibility pass (diagram labels, grey text), trim motion | — |
| 2.11 | GitHub profile README + 2 public templates rebuilt from scratch on your accounts | — |

**Done when:** a stranger can, in 60 seconds, tell who you help, see it
working on their own phone, and book a call — and the form lands in the sheet.

---

## Phase 3 — Accounts & social proof (starts Day 1, runs in the background)

You wanted outreach after the portfolio — agreed. But **account age and karma
can't be rushed**, and many subreddits block new or low-karma accounts. So the
*warm-up* starts on Day 1 at 15 minutes a day, while Phases 1–2 are built.
No selling during warm-up.

### LinkedIn (under your real name)
| Week | Do |
|---|---|
| 1 | Headline: "I build WhatsApp booking, reminders & AI assistants for clinics and service businesses". Banner with the one-line offer. About = the clinic story in 5 lines. Photo. |
| 1–3 | Connect with 15–20/day: clinic owners, physios, dentists, salon/studio owners in your cities + founders. Personal note, no pitch. |
| 2+ | Post 3×/week from the Cowork content task: build-in-public, one real screen recording each. |
| 3 | Featured section: demo video, case study, portfolio. Ask 3–5 people you've worked with for a recommendation (the clinic team). |

### Reddit (one account, your own)
| Week | Do |
|---|---|
| 1–3 | 10 min/day: genuinely helpful comments in r/n8n, r/automation, r/smallbusiness, r/Entrepreneur, r/IndianStartups. Answer questions properly. Aim ~200+ karma. |
| 2 | One "how I built WhatsApp reminders that never double-send" post in r/n8n (value, no pitch). |
| 3+ | Profile bio with portfolio link. Then [For Hire] in r/forhire and replies to real buyer posts from Pipeline 02. |

### Social proof you can honestly collect
- Testimonial + recommendation from the clinic team (with employer OK).
- The public "how I built it" posts — people see you know the work.
- GitHub templates with real READMEs and a demo GIF.
- Upwork/Contra: 1–2 small paid jobs for first reviews.
- After client #1: case study with their real numbers and quote.

**Done when:** LinkedIn has 150+ relevant connections and 6+ posts; Reddit has
~200 karma, 3+ weeks of age and one well-received post; at least one real
testimonial is live.

---

## Phase 4 — Outreach (Week 4 onward) · owner: Aniket sends, system supports

| Daily (≈1 hr) | Weekly |
|---|---|
| Read the 09:00 digest · answer hot replies first · send 20 messages (WhatsApp/LinkedIn/email) · tap the buttons · 1 helpful Reddit/forum reply | 3 LinkedIn posts · 1 Quora answer · Sunday scoreboard review · 10 warm-network messages in week 4 |

Targets: first 30 days → ~300 touches → ~20 replies → ~7 calls → 2 clients.
Offers, scripts, call flow and follow-up wording: `client-acquisition-plan.md`.
Ads only after 5 calls and 1 close.

---

## Accountability

| What | Where | When |
|---|---|---|
| Phase checklist (this file) — tick items, date them | Git, this file | As done |
| Daily: touches sent, replies, calls | `Client Pipeline` sheet (updated by the buttons) | Daily, automatic |
| Weekly scoreboard + 3 actions | Email + `Scoreboard` tab | Sunday 18:00, automatic |
| Build log — what changed, what broke | `Log` tab + commit messages | Every change |
| Review with Claude | New session: "review this week's scoreboard and the plan" | Sunday |

**The one rule if you fall behind:** don't restart and don't rebuild — send
today's 20 messages. Everything else can wait a day; conversations can't.

---

## Timeline at a glance

```
Week 1   Phase 0 access ─► Phase 1 build (00–04)        │ Phase 3 warm-up: LinkedIn profile, Reddit comments
Week 2   Phase 1 finish (05–07, Cowork) + test script   │ connections 15–20/day, Reddit 10 min/day
Week 3   Phase 2 portfolio (hero, form, demo, proof)    │ first posts (LinkedIn + r/n8n)
Week 4+  Phase 4 outreach: 20/day, digest-driven        │ keep posting; testimonials in
```
