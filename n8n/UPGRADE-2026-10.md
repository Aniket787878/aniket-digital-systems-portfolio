# n8n upgrade, October 2026: lead temperature and follow-ups

Reference design only. **Nothing here is deployed.** The live workflows keep
running unchanged until Aniket imports these by hand. Based on
`docs/outreach/2026-10-09-funnel-strategy.md` (sections 2 and 4).

**Rule: WhatsApp only as click-to-chat links (`wa.me`).** No workflow here
connects a WhatsApp number, Business account, API or credential, Mindset's or
anyone else's. Every follow-up goes by email.

## What the site already sends

Since 2026-10-09 every lead (the two plans, the AI check and the contact form)
sends the original fields, unchanged, plus:

| Field | Example | Notes |
|---|---|---|
| `phone` | `+919876543210` | WhatsApp number, normalised; empty when not given (always empty from the contact form) |
| `timing` | `Within a month` | The "When do you need it?" answer; empty for the AI check and the form |
| `package` | `Business Website (From $1,200)` | The package and the price shown on the result screen; AI check: `AI Roadmap Session ($490)`; empty from the form |
| `lead_temp` | `hot` / `warm` / `cold` | Worked out in the browser (`src/leadExtras.js`), rules below; the form sends `warm` |
| `utm_source`, `utm_medium`, `utm_campaign` | `li`, `social`, `oct-outreach` | From the first page of the visit; `?src=` counts as `utm_source` |
| `landing_page` | `/websites?src=li` | First page of the visit |

The live v1 workflow ignores these, so nothing breaks before the upgrade.

**Lead temperature** (strategy section 4):

- Plans: **cold** if the budget is below the package's starting price or the
  answer is "No fixed date yet"; **hot** if the budget fits, it is wanted as
  soon as possible or within a month, and a WhatsApp number was given;
  otherwise **warm** (fits but later, budget "not sure", or no number).
- AI check (asks no budget or date): **cold** for a team of 1 or 2 with fewer
  than 10 enquiries a week; **hot** with a number plus 30+ enquiries a week or
  a team of 3+; otherwise **warm**.

## 1. New sheet columns

Add these headers to the "Leads" tab, after `Service`, spelt exactly like
this (the workflows map by name). `leads-sheet-header.csv` has the full row.

`Phone | Timing | Package | Lead temp | UTM source | UTM campaign | Landing page | Follow-ups sent | Last follow-up`

`UTM campaign` holds the campaign and the medium (`oct-outreach / social`).
`Follow-ups sent` (0 to 4) and `Last follow-up` are written by the follow-up
workflow; leave them empty on old rows (empty counts as 0).

## 2. `lead-intake-workflow-v2.json`

Same shape as v1 (Webhook, Clean fields, Validate, Add to Sheet, Gmail alert,
Gmail auto-reply, Respond OK), with:

- **Clean fields** also fills the nine new columns.
- **Compose messages** (Code node, after the sheet write, so the sheet still
  never gets anything but its columns) builds:
  - the alert subject, prefixed `[HOT]`, `[WARM]` or `[COLD]`;
  - the alert body with a one-tap `wa.me` link to the **lead's** number,
    prefilled with a short opener, plus package, timing, budget, UTM and
    landing page;
  - the auto-reply per service, from the strategy's Day 0 outline: three lines
    of their answers, the package and its starting price ("a starting point,
    not a quote"), the guarantee, how to book, and "within 24 hours, usually
    sooner". Websites, software and AI each get their own copy; the contact
    form keeps the v1 wording.
- `BOOKING_URL` at the top of the Code node is empty. Paste the Cal.com link
  there (and in `site.bookingUrl` on the site) when it exists.

**Install** (about 15 minutes):

1. Add the sheet columns (step 1).
2. n8n → Import from File → `lead-intake-workflow-v2.json`.
3. Credentials: the three nodes show `REPLACE_WITH_...` IDs. Pick the existing
   Google Sheets OAuth2 and Gmail OAuth2 credentials for aniket.html@gmail.com
   in **Add to Sheet**, **Alert Aniket** and **Auto-reply**. In **Add to
   Sheet**, pick `Portfolio leads` → `Leads` (the document ID is a placeholder).
4. The webhook path is the live one (`portfolio-leads`), so two active
   workflows would clash. **Deactivate the live "Portfolio — Lead intake"
   first, then activate v2.** Keep v1 (inactive) for a week as the rollback:
   to roll back, deactivate v2 and reactivate v1. The error workflow setting
   ("Portfolio — Lead intake errors") must be set again on v2 (Settings →
   Error workflow).
5. Test with curl (use your own second address):

```bash
curl -X POST https://YOUR-N8N/webhook/portfolio-leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Lead","email":"YOUR-OTHER-EMAIL@example.com","company":"",
       "workflow_broken":"Free website plan\nWhat kind of business? A clinic\nDo you have a website now? No\nWhat should it do? Take enquiries",
       "service":"websites","budget_band":"usd:5k+","source":"start-website · curl",
       "submitted_at":"2026-10-10T10:00:00Z","phone":"+910000000000","timing":"Within a month",
       "package":"Business Website (From $1,200)","lead_temp":"hot",
       "utm_source":"test","utm_medium":"","utm_campaign":"","landing_page":"/websites"}'
```

   Expect `{"status":"ok"}`, a row with the new columns filled, an alert titled
   `[HOT] New lead: Test Lead ...` and a website auto-reply. Delete the row.

## 3. `followups-workflow.json`

A daily job (10:00 IST) that reads the sheet and, for each row still at Stage
**New** with a valid email, sends the next due email:

| Touch | When (days after Submitted At) | What (outline from the strategy) |
|---|---|---|
| 1 | 1 | One question about their plan, and how to book a free call |
| 2 | 3 | One real project close to their area, with its honest label (client work or working demo) and link |
| 3 | 7 | The question heard most for that area, answered honestly (fixed price in writing, you own it, a person checks the AI) |
| 4 | 14 | "Should I close your plan? Reply 'later' and I'll check in." Then it stops |

- **One email per lead per run**, and only once its day has come, so a lead
  never gets two on the same day.
- **Stops the moment Stage is anything but "New".** Move Stage (for example to
  "Replied" or "Call booked") as soon as you have replied personally,
  including to hot leads you messaged on WhatsApp.
- After each send it writes `Follow-ups sent` and `Last follow-up` on that row
  (matched on the sheet's row number).
- Email only. Day 1 in the strategy is a personal WhatsApp from Aniket for hot
  and warm leads; that stays a manual, one-tap message from the alert's link.

**Install:** import, set the same Sheets and Gmail credentials in **Read
leads**, **Send follow-up** and **Mark as sent**, pick `Portfolio leads` →
`Leads` in both Sheets nodes, then activate. Before activating, run it once by
hand on a copy of the sheet, or check that every row older than a day already
has a Stage other than "New", or old leads will each get touch 1 on the first
run.

The existing "Portfolio — Unanswered lead reminder" (09:30 IST, to Aniket)
keeps running alongside; it is unchanged.

## What still needs Aniket

- The Cal.com link (`BOOKING_URL` in both Code nodes, and `site.bookingUrl`).
- Whether he can keep a faster reply promise for hot leads (the strategy
  suggests "within the hour in working hours"). Until he says so, the site and
  the emails say "within 24 hours, usually sooner".
- Email from his own domain, so auto-replies and follow-ups avoid spam.
