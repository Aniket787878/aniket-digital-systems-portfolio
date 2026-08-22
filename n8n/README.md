# n8n — Lead Intake Workflow

Setup checklist for `lead-intake-workflow.json`.

1. **Import** the workflow: n8n → Workflows → Import from File → `lead-intake-workflow.json`.
2. **Create the two credentials** (n8n → Credentials):
   - `airtable_aniket` — Airtable Personal Access Token (credential type `airtableTokenApi`)
   - `gmail_aniket` — Gmail OAuth2
3. **Create the Airtable base** `Prospects` with table `Leads` and columns: `Name`, `Email`, `Company`, `Workflow`, `Budget`, `Source`, `Submitted At`, `Stage`. Then open the **Airtable** node and select the base, the table, and the `airtable_aniket` credential.
4. **Activate** the workflow (toggle in the top-right).
5. **Copy the production webhook URL** (`{n8n-url}/webhook/aniket-leads`) and paste it into the portfolio `.env.local` as `VITE_LEAD_WEBHOOK_URL`.
6. **Test with curl**:

```bash
curl -X POST https://n8n.example.com/webhook/aniket-leads \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "company": "Example Corp",
    "workflow_broken": "I manually copy data between sheets and invoices every week.",
    "budget_band": "50k-2L",
    "source": "direct",
    "submitted_at": "2026-08-22T12:00:00.000Z"
  }'
```

A valid payload returns `200 {"status":"ok","lead_id":"..."}`. A payload missing `name`, `email`, or `workflow_broken` (or with an unparseable email) returns `400 {"status":400,"error":"missing_required_fields"}`.

## After import

- Open each **Gmail** node and the **Airtable** node and assign the credentials you created in step 2.
- The Gmail nodes are set to **Continue On Fail**, so a Gmail hiccup still returns `200` with a `warning` field.
- **Airtable** is the source of truth — its failure is a hard `500`.
- The webhook responds using **Last Node** mode, so the `{ status: "ok", lead_id }` body is returned after all writes succeed.
