# Agency plan: two people, clinics first, AI drafts and a human sends

Date: 2026-11-08. Owner: Aniket (sells, builds). Partner: Mukul (builds, automation).
Name: working name `brand.name` (Befikr) stays until chosen; shortlist in `spec.md`.
Cities: Mumbai, Pune. First niche: clinics (dental, skin, physio, eye, small multi-doctor).

## 1. What we sell and why clinics believe us

**Promise.** Every enquiry answered fast, by a person, with the clinic's data kept in India,
never sold, never used to train any AI. We build the system, we run it, the clinic owns it.

**USP, said as four promises (the "Your data" page):**
1. Data stays in India, on a server we control.
2. Consent is recorded for every patient message we store.
3. Deleted on request, within 7 days, with a confirmation.
4. Never used to train any AI. Models run with training off; nothing leaves without a contract.

**Rule that protects the USP.** AI drafts, a human sends. Every outbound message to a lead or
client is approved by Aniket or Mukul with one tap and goes out in that person's name. No
silent bot pretending to be a human. This is also what we sell clinics.

**Offer ladder** (prices from `02-service-catalog.md`, unchanged):
free enquiry leak check -> AI Roadmap Session ₹20k -> Quick-Win ₹30k or Ops Sprint ₹40k-80k
-> AI Assistant Build ₹80k-1.5L -> Care Plan ₹15k-30k/month.
Target: 10 clinics on Care Plan in 6 months = ₹1.5L-3L/month recurring.

**What we don't do.** Hourly work, medical advice, anything that sends patient data to a tool
without a signed agreement, fully autonomous replies.

## 2. Roles

| | Aniket | Mukul |
|---|---|---|
| Sales calls, proposals, pricing | yes | sits in on first 5 |
| Approving AI-drafted messages | both, whoever is on duty that day | |
| Building websites, assistants | yes | yes |
| n8n, server, databases, integrations | | lead |
| Weekly proof notes to clients | drafts by AI, approved by whoever owns the client | |

One style guide (20 lines) and one price sheet, shared. Both approve from the same inbox.

## 3. Architecture (all on the existing server)

```
Site (Vercel) --/api/lead--> n8n --> Postgres "agency" (leads, clients, consent, messages)
WhatsApp / Instagram / email in --> n8n intake --> same tables
n8n drafting flows --> Claude (drafts, proposals, briefs) / Gemini paid tier (classify, score)
Approve step --> WhatsApp message to Aniket or Mukul: Send / Edit / Skip
Send --> WhatsApp Business API (phase 2 decision) or tap-to-send link from own phone
Dashboard (small web app, two logins) reads Postgres
Scrapers (Google Maps, Practo) --> Postgres prospects --> weekly top-20 outreach drafts
Backups nightly to a second location; restore drill once a quarter
```

Data rules: Postgres only on the server, encrypted disk, daily backups, consent column on
every person row, delete endpoint, Gemini only on the paid tier with data use off, Claude via
API (no training). The n8n lead sheet is retired once Postgres is live.

## 4. Phases

### Phase 1: Foundation (weeks 1-2). Spec: `spec.md`, PR #85
Two-person brand, clinics as the front door, "Your data" page with sample agreement,
every path books a call, docs and audit. Sell manually from day 1.

### Phase 2: Sales system (weeks 3-5)
1. **Server preflight** and Postgres `agency` schema: prospects, leads, people, consent,
   messages, deals, clients, tasks. Migrations in the repo that owns the server.
2. **Intake**: site webhook (exists), WhatsApp Business inbound, Instagram DM, referral form,
   manual add. Every lead gets source, consent flag, first-touch time.
3. **First reply in 2 minutes**: Claude drafts from the style guide and the lead's answers;
   approve on WhatsApp; sent in the approver's name. Logged.
4. **Follow-ups**: day 1, 3, 7, 14 drafts; stop on reply or booking. Never more than 4.
5. **Meeting brief**: 30 minutes before each Cal.com call, one page: clinic, their leak
   answers, their site and Google profile findings, price band to pitch.
6. **Proposal**: voice note after the call -> proposal from the price sheet -> approve ->
   send with payment link (Razorpay) and the data agreement.
7. **Dashboard v1**: pipeline by stage, who to chase today, money this month. Two logins.
Gate: 10 real leads processed end to end, no message sent without approval, security lead
review of the schema and consent flow.

### Phase 3: Growth engine (weeks 6-8)
1. **Prospect list**: Google Maps and Practo for Mumbai and Pune clinics; name, phone, site,
   reviews, hours. Score: no website, no WhatsApp reply, reviews mentioning waiting or no
   reply, open late. Respect robots and rate limits; business contact data only.
2. **Weekly top 20**: the system runs the real leak check on their site and Google profile,
   drafts one personal WhatsApp or email with one finding and the free check link. Approved
   and sent in Aniket's name. Replies flow into phase 2.
3. **Referral loop**: at day 30 of every live client, a referral ask with a reward; tracked.
4. **Content**: two posts a week drafted from anonymised real work, approved. No invented
   numbers.
5. **Monday 9:00 IST scorecard** to both: leads in, replies, calls, closed, revenue, next 20.
Gate: 4 weeks of outreach, reply rate measured, list cleaned of opt-outs within 24 hours.

### Phase 4: Client ops (weeks 9-10)
1. Onboarding checklist per client, auto-created on payment; owner assigned.
2. Weekly proof note (sample already on `/ai/every-enquiry`) from real numbers, approved.
3. Care Plan renewal reminder 10 days before month end; churn flag if proof numbers fall.
4. First real case study with the clinic's permission; replaces the labelled slot.
5. Restore drill and a one-page incident runbook.

## 5. First 30 days of selling (manual, starts week 1)
- 20 clinics a week visited or called by Aniket, free leak check in hand.
- Script: one finding about their enquiries, the four data promises, book the Roadmap.
- Goal by day 30: 3 Roadmap Sessions paid, 1 build signed.

## 6. Risks and the rule for each
- **DPDP claims**: nothing on the site says "compliant"; says "built for the DPDP Act".
  Agreement marked sample until a lawyer reviews it.
- **WhatsApp bans**: Business API or tap-to-send; never automation on a personal number.
- **Two voices**: one style guide, one price sheet, both reviewed monthly.
- **Gemini and data**: paid tier only, data use off; else Claude only for client text.
- **Scraping**: business listings only, no patient data, honour opt-outs same day.
- **Capacity**: at 6 live clients, stop outreach for 2 weeks and hire delivery help.

## 7. Open decisions for Aniket
1. Brand name and domain (shortlist in `spec.md`).
2. Cal.com link.
3. WhatsApp Business API account, or tap-to-send for now.
4. Gemini paid tier, or Claude only.
5. "Go" on phase 1 slice 1.
