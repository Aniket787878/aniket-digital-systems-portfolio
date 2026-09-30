# n8n — Lead Intake Workflow

> **Live since 2026-09-27** on the n8n instance, as three workflows:
> "Portfolio — Lead intake" (webhook path `portfolio-leads`), "Portfolio —
> Lead intake errors" (its error workflow, emails Aniket) and "Portfolio —
> Unanswered lead reminder" (09:30 IST daily, emails Aniket about leads
> still at Stage "New" after 24h). Sheet: "Portfolio leads" → "Leads" on
> aniket.html@gmail.com. The site posts to `/api/lead`, which `vercel.json`
> rewrites to the webhook. The JSON below is the reference design; the live
> workflows were built from it and are the source of truth.

`lead-intake-workflow.json` takes the portfolio contact form and:
1. adds a row to a Google Sheet,
2. emails Aniket at aniket.html@gmail.com (Reply-To is set to the lead),
3. sends the lead an auto-reply,
4. answers the site with `200 {"status":"ok"}`.

Everything runs on the aniket.html@gmail.com Google account.

## Setup (about 10 minutes)

1. **Make the sheet.** In Google Sheets, signed in as aniket.html@gmail.com,
   create a sheet named `Portfolio leads` and rename its first tab to `Leads`.
   Paste this into row 1 (or import `leads-sheet-header.csv`):

   `Submitted At | Name | Email | Company | Workflow | Budget | Source | Stage | Service`

   `Service` (added 2026-09-30) is which area the enquiry is for: `websites`,
   `software`, `ai` or `not_sure`, from the form's "What do you need?". On a
   sheet made before then, add the header in the next empty column.

   The workflow maps fields to these headers **by name**, so the spelling has
   to match exactly.
2. **Import.** n8n → Workflows → Import from File → `lead-intake-workflow.json`.
3. **Credentials.** Open each node and pick the credential:
   - **Add to Sheet**: a *Google Sheets OAuth2* credential for
     aniket.html@gmail.com. This type is separate from Gmail and Drive; if you
     don't have it, click "Create new" and sign in with the same account.
     Then choose `Portfolio leads` → `Leads` from the two dropdowns.
   - **Alert Aniket** and **Auto-reply**: your existing *Gmail OAuth2*
     credential for aniket.html@gmail.com.
4. **Activate** the workflow (top-right toggle).
5. **Test** with the production URL (`{your-n8n}/webhook/aniket-leads`):

```bash
curl -X POST https://YOUR-N8N/webhook/aniket-leads \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Lead","email":"YOUR-OTHER-EMAIL@example.com","company":"Test Co",
       "workflow_broken":"Testing the portfolio form, please ignore this row.",
       "budget_band":"not_sure","source":"curl","submitted_at":"2026-09-27T12:00:00Z"}'
```

   Expect `{"status":"ok"}`, a new row, an alert email, and an auto-reply at
   the test address. A missing name, a bad email or a message under 20
   characters returns `400 {"status":400,"error":"missing_required_fields"}`.
6. **Turn the form on.** In Vercel (project `aniket-portfolio`) → Settings →
   Environment Variables, set `VITE_LEAD_WEBHOOK_URL` to that URL for
   Production, then redeploy. It is baked in at build time, so it does nothing
   until the redeploy. `/contact` then shows the form instead of the direct
   routes.

## Behaviour

- The site sends JSON: `name, email, company, workflow_broken, budget_band,
  source, submitted_at`. n8n's Webhook node puts it under `$json.body`; the
  **Clean fields** node flattens and trims it into the sheet's columns.
- **The sheet is the source of truth.** If the Sheets write fails, the
  workflow errors and the site shows its error state (which offers WhatsApp
  and email), so a lead is never silently dropped.
- Both Gmail nodes **continue on fail**: a Gmail hiccup still records the lead
  and still returns 200.
- CORS: the Webhook allows any origin (`*`), so a domain change needs no
  workflow edit. Bots are filtered in the browser by the honeypot field.
