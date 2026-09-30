# Portfolio project 1: Appointment Desk

A front-desk assistant for a physiotherapy clinic, built on n8n. Patients message it; an AI agent answers questions and books, moves and cancels appointments in Google Calendar; a weekday 08:00 job asks tomorrow's patients to confirm; anything sensitive, urgent or clinical is refused and handed to a human. Every booking action is logged to a Google Sheet for the owner.

The clinic is **"Demo Physio Clinic"**, an obviously fictional clinic. All names, numbers, prices and addresses are dummy data.

n8n workflow: **Portfolio demo · Appointment Desk** (ID `OaopI9RUsFqHZ35F`), inactive.

## Built on n8n template 3694 by Luciano Gutierrez (MIT)

This workflow is built on n8n template 3694, "Multi-Agent AI Clinic Management with WhatsApp, Telegram, and Google Calendar", by Luciano Gutierrez: https://n8n.io/workflows/3694

The template page states: "This workflow is provided under the MIT License. Feel free to adapt and customize it for your clinic's specific needs." No separate copyright line is printed on the page, so the notice below names the author as credited there.

```
MIT License

Copyright (c) Luciano Gutierrez (n8n template 3694)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## What it does, in plain words

1. **Patient chats** (n8n Chat Trigger, or WhatsApp through MSG91 for one allowlisted number, or WhatsApp Business Cloud later, disabled).
2. A **keyword screen** checks for emergency wording (chest pain, can't breathe, self-harm and so on). If it hits, the patient gets a fixed "call 112 / go to the nearest emergency department" reply, the model is never called, and a row goes to the Handoffs sheet.
3. Otherwise the **AI agent** takes over. It answers fees, hours, address, payment and cancellation questions from a small FAQ inside its system prompt, and uses Google Calendar tools to check free slots, book, reschedule, cancel and mark confirmed. After every booking action it writes a row to the "Bookings log" sheet.
4. **Clinical questions** ("my knee is swollen, what should I take?") are refused, logged to the Handoffs sheet, and the patient is told a team member will follow up and to call 112 or their doctor if it is severe.
5. **Weekdays 08:00:** reads tomorrow's appointments from the calendar and asks each patient to reply CONFIRM, RESCHEDULE or CANCEL. A CONFIRM reply is handled by the agent, which prefixes the event title with "[Confirmed]".
6. **Mon-Sat 18:30:** for today's finished visits, sends a **review request** if the front desk marked the event "[Attended]", otherwise a **no-show follow-up** inviting the patient to rebook. Both are logged.

The agent never gives clinical advice, never claims HIPAA or GDPR compliance, records only name, mobile number and appointment time, and never reveals other patients' details.

## What was changed from the template, and what was added

Kept from the template (idea, adapted, not copied): a WhatsApp-style front-desk agent that uses Google Calendar to book, reschedule and cancel; a weekday 08:00 confirmation job for tomorrow's appointments; escalation to a human for urgent or sensitive cases; patient details stored in the calendar event description.

Changed:
- Prompts rewritten in English for "Demo Physio Clinic", with a strict guardrail (no diagnosis, no clinical advice, emergencies to 112 / your doctor, no compliance claims).
- Chat Trigger as the working demo channel. WhatsApp uses the **official WhatsApp Business Cloud** trigger and send nodes, present but **disabled**. The template's unofficial Evolution API, Telegram staff bot, Google Tasks, audio/image/document processing, Postgres memory, OpenAI/OpenRouter models and MCP calendar server were left out.
- Native Google Calendar tool nodes replace the MCP calendar server.
- Chat memory is n8n's Simple Memory (window buffer), no database.
- The model is Google Gemini via one shared chat-model node.
- The template's date-of-birth and health-condition capture was dropped on purpose. Only name, mobile number, appointment type and time are stored.
- The human handoff writes to a Handoffs sheet (the template used a sub-workflow that messaged a human over the unofficial API).

Added:
- Emergency keyword pre-screen that bypasses the model.
- No-show follow-up and review request (18:30 job).
- Google Sheets log of every booking action ("Bookings log") and of every handoff ("Handoffs").
- Identity check before reschedule or cancel (mobile number must match the calendar event).

## WhatsApp through MSG91 (allowlisted demo path)

A third entry path lets the demo run on WhatsApp through an existing MSG91 account, without exposing it to the public.

- **Inbound:** node "MSG91 inbound webhook" (POST). Point MSG91's inbound-message webhook at `https://<your-n8n-host>/webhook/appointment-desk-msg91-REPLACE_WITH_RANDOM_SUFFIX` once the workflow is active. The path has a random suffix so it cannot be guessed. n8n answers MSG91 with HTTP 200 straight away in every case.
- **Hard allowlist:** the next node, "Sender allowlist (edit ALLOWED_SENDER here)", strips the sender to digits and compares it with one constant, `ALLOWED_SENDER = "919136582842"`, in the first lines of the code. Any other sender, or any non-text message (image, document, contact, delivery report), stops there: no reply, no model call, and nothing written anywhere, because the node outputs only `{allowed:false}`. To use another number, change that one line.
- **Allowed sender:** the message goes through the same emergency keyword screen, the same agent and the same guardrails as the chat path. Memory is keyed `wa-<phone digits>`. A repeat delivery of the same MSG91 message id within two minutes is ignored.
- **Outbound:** "Build MSG91 session message" prepares `integrated_number`, `recipient_number`, `content_type = text` and `text`, and "MSG91 WhatsApp reply (session message, text only)" POSTs them to `https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/` (query parameters `integrated_number`, `recipient_number`, `content_type`, JSON body `{"text": ...}`) with an HTTP Header Auth credential (MSG91 `authkey` header). The recipient is always the allowlisted number, never the raw payload sender. Free-form session messages only reach a user who wrote in the last 24 hours, which fits a reply. No templates, no media.
- **Formats** were learned read-only from an existing MSG91 inbound bot: inbound `body.incoming_message[0]` with `from`, `from_name`, `message_id`, `message_type` and `text_type.text` (a flat `customerNumber`/`sender` + `text` form is also accepted); outbound as above. The integrated number in the "Build MSG91 session message" node is the WhatsApp number registered in MSG91.
- **No message storage:** workflow settings save neither successful nor failed production executions (`saveDataSuccessExecution` and `saveDataErrorExecution` are `none`), so real messages that arrive on the webhook are never kept in n8n. Manual test runs are still saved (`saveManualExecutions` stays true) so tests can be inspected. The Sheets logs are separate and only receive rows from allowlisted senders.
- The Meta WhatsApp Cloud API nodes stay disabled and are untouched.

## Setup

1. Import `workflow.json` (n8n, Workflows, Import from file). It imports inactive.
2. Credentials: the export contains no credential fields, so nothing is linked on import. Attach a Google Gemini (PaLM) API credential to the "Gemini chat model" node, a Google Calendar OAuth2 credential to the calendar nodes, a Google Sheets OAuth2 credential to the Sheets nodes, and (only for the MSG91 path) an HTTP Header Auth credential with the MSG91 `authkey` header to "MSG91 WhatsApp reply (session message, text only)".
3. **Demo calendar ID:** already set. Every Calendar node points at Aniket's dedicated demo calendar (ID ending `...@group.calendar.google.com`, in the `calendar` field). To use another calendar, replace it in all nine Calendar nodes (seven agent tool nodes and two scheduled-job nodes). Never point it at a real patient calendar. The Google account behind the Calendar credential needs **writer** access to that calendar.
4. **Demo sheet ID:** create a demo Google Sheet with two tabs.
   - `Bookings log`, header row: `timestamp, action, patient_name, patient_phone, appointment_start, calendar_event_id, channel, note`
   - `Handoffs`, header row: `timestamp, urgency, channel, patient_name, patient_phone, reason, last_message`

   Then replace `REPLACE_WITH_DEMO_SHEET_ID` in the five Sheets nodes (Log emergency handoff, Log_booking_action, Flag_for_human_handoff, Log confirmation request, Log follow-up message).
5. Chat: open the workflow, click "Open chat" (or publish and use the chat URL).
6. Front-desk convention: after a visit, add `[Attended] ` to the start of the calendar event title. Untagged events that have ended by 18:30 are treated as no-shows.
7. Workflow timezone is `Asia/Kolkata`. Change it in workflow settings if the clinic is elsewhere.

### What Aniket must add before WhatsApp goes live
- **WhatsApp Business Cloud API credential** (Meta developer app, permanent token, phone number ID). Create it in n8n, attach it to the WhatsApp trigger and the three WhatsApp send nodes, set `REPLACE_WITH_WHATSAPP_PHONE_NUMBER_ID` in each send node, then enable the four nodes.
- **Review link:** replace `REPLACE_WITH_REVIEW_LINK` in the "Write review request or no-show follow-up" node.
- **A staff alert for handoffs** (the demo only writes to the Handoffs sheet): add a notification node such as email or a WhatsApp message to staff after the handoff rows. Not included because no such credential was allowed for this demo.
- Note for a real clinic: WhatsApp business-initiated messages (the 08:00 confirmations and 18:30 follow-ups) need Meta-approved message templates outside the 24-hour window. Swap the send nodes to the "send template" operation.

## Limits and honesty notes

- This is a portfolio demo with dummy data. It is not a medical device, not a compliance-reviewed system, and makes no HIPAA or GDPR claim.
- The emergency keyword list is a safety net, not a classifier. The system prompt is the second layer.
- The model is `models/gemini-3.1-flash-lite`. It was chosen because `gemini-2.5-flash` is no longer served and `gemini-3.8-flash` hit the free-tier limit (about 20 requests a day per model) plus intermittent 503 (high demand) errors. The agent node retries twice. On a free key expect occasional errors; a paid key removes the quota.
- **Calendar write access was not available while testing.** The credential could read the demo calendar (list events, free/busy) but got `403 Forbidden` on create. So create, reschedule, confirm and cancel were tested with pinned tool output; the agent's reply when the write failed is recorded in `test-log.md` (it tells the patient it could not finish and offers a handoff, and does not claim a booking). Once the credential's Google account has writer access, these run for real.
- Google Sheets appends and WhatsApp sends have not run for real (no demo sheet, no WhatsApp credential). See `test-log.md` for exactly what was real and what was pinned.
