# SPEC — n8n lead-intake workflow

**Audience:** MonkeyCode task. Output must be an n8n workflow JSON that imports cleanly (n8n → Workflows → Import from File).

## Budget & scope (hard rules — do NOT exceed)

- **Token budget:** stop and report if you exceed **10M tokens** on this task.
- **Time budget:** stop and report if you exceed **60 minutes** wall-clock.
- **Scope:** create ONE file only — `n8n/lead-intake-workflow.json` in the repo. Also append a short setup checklist to `n8n/README.md` (create if missing).
- **Do NOT touch:** anything in `src/`, `system/`, `specs/`, `package.json`, or the site build.
- **When the JSON validates and the checklist is written: open a PR from `feat/n8n-lead-webhook` and stop.**

## Goal

Receive a JSON POST from the portfolio contact form, log the lead, notify Aniket, and auto-reply the sender within seconds.

## Trigger

**Webhook node**
- HTTP method: `POST`
- Path: `aniket-leads`
- Response mode: `Last Node` (so we can return a proper 200 after all writes succeed)
- Authentication: none (form is public)
- Response code: 200

## Expected input (from `specs/contact-form.md`)

```json
{
  "name": "string",
  "email": "string",
  "company": "string | ''",
  "workflow_broken": "string",
  "budget_band": "<50k | 50k-2L | 2L+ | not_sure",
  "source": "string",
  "submitted_at": "ISO 8601"
}
```

## Nodes (in order)

### 1. Webhook
As above.

### 2. Validate (Function or IF)
Reject if `name`, `email`, or `workflow_broken` is missing/empty. On reject: return `{ status: 400, error: "missing_required_fields" }` and stop.

Basic email regex check on `email`. On fail: same 400.

### 3. Airtable — "Prospects" base, "Leads" table
Create row with fields:
- `Name`, `Email`, `Company`, `Workflow`, `Budget`, `Source`, `Submitted At`, `Stage` (default: `Engaged`)

Use credential `airtable_aniket` (Aniket will create in n8n; do not embed key).

### 4. Gmail — notify Aniket
- To: `aniket@mindsetwellness.in`
- Subject: `New lead: {{ $json.name }} — {{ $json.budget_band }}`
- Body (plain text):
  ```
  {{ $json.name }} ({{ $json.email }}) from {{ $json.company || 'no company given' }}
  Budget: {{ $json.budget_band }}
  Source: {{ $json.source }}

  Workflow they want automated:
  ---
  {{ $json.workflow_broken }}
  ---

  Reply within 24h. Airtable row created.
  ```
- Use credential `gmail_aniket`.

### 5. Gmail — auto-reply to sender
- To: `{{ $json.email }}`
- Subject: `Got your note — I'll reply within 24h`
- Body (plain text):
  ```
  Hey {{ $json.name.split(' ')[0] }},

  Got your message. I'll read it properly and reply within 24 hours.

  Quick note: I only take on projects I'm confident I can genuinely help with, so if what you sent me isn't the right fit, I'll say that too — and try to point you somewhere useful.

  In the meantime, if you want to see what I've built before: https://[your-domain]/projects

  — Aniket
  Digital Systems Builder
  ```

### 6. Respond (implicit via "Last Node")
Return `{ status: "ok", lead_id: "{{ $node['Airtable'].json.id }}" }` with 200.

## Error handling

- Any node failure after Airtable: still return 200 to the form (Aniket doesn't want the form to error just because Gmail hiccuped), but attach a `warning` field.
- Use n8n's `Continue On Fail` on Gmail nodes.
- Airtable failure = hard fail = 500 (this is the source of truth).

## Optional (v2 — do not build now, note only)

- WhatsApp notify via Twilio / Meta API
- Slack notify to a `#leads` channel
- Enrichment: Clearbit or Apollo lookup on the email domain, write company info back to Airtable

## Deliverable

Single `workflow.json` file, ready to import into a self-hosted or cloud n8n instance. Include a top-level `meta.description` field explaining what it does.

Also return a short setup checklist:
1. Import JSON
2. Create the 2 credentials (`airtable_aniket`, `gmail_aniket`)
3. Create Airtable base "Prospects" with table "Leads" and the listed columns
4. Activate workflow
5. Copy webhook production URL → paste into portfolio `.env.local` as `VITE_LEAD_WEBHOOK_URL`
6. Test with `curl` (include an example curl command)
