# SPEC — Contact form component

**Audience:** MonkeyCode task. Self-contained.

## Budget & scope (hard rules — do NOT exceed)

- **Token budget:** stop and report if you exceed **15M tokens** on this task.
- **Time budget:** stop and report if you exceed **90 minutes** wall-clock.
- **Scope:** only modify files listed in "File changes" below. If you believe another file needs editing, **STOP and open a PR-comment / report asking**. Do not touch it silently.
- **No new dependencies.** If you think one is needed, STOP and report.
- **When acceptance checklist passes: open a PR to `main` from `feat/contact-form` and stop.** Do not keep iterating.

## Goal

Replace the current mailto-only contact page (`src/pages/ContactPage.jsx`) with a real form that POSTs JSON to an n8n webhook. Keep the existing site look (Inter/Archivo, minimal, plenty of whitespace, no framework CSS libraries).

## Stack (do not add deps)

- React 18, Vite 5, React Router 6
- Plain CSS (`src/pages/HomePage.css` shows the style vocabulary — reuse tokens/classes where sensible)
- No form libraries, no `axios` — use native `fetch`
- No state library — `useState` only

## Env

Read the webhook URL from `import.meta.env.VITE_LEAD_WEBHOOK_URL`. If it's missing, fall back to logging the payload and showing a friendly "we're getting set up, email us at {site.email}" fallback. Do NOT throw.

## Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | text | yes | max 100 |
| `email` | email | yes | HTML5 validation |
| `company` | text | no | max 100 |
| `workflow_broken` | textarea | yes | placeholder: "What's the manual/repetitive workflow you'd want automated?" — max 1000, min 20 |
| `budget_band` | radio | yes | options: `<50k`, `50k-2L`, `2L+`, `not_sure` (labels: "Under ₹50k", "₹50k – ₹2L", "₹2L+", "Not sure yet") |
| `source` | hidden | auto | value: `document.referrer || 'direct'` |
| `submitted_at` | hidden | auto | ISO timestamp |

## Behavior

1. On submit: disable button, show "Sending…"
2. POST JSON to webhook. Headers: `Content-Type: application/json`.
3. On 2xx: replace form with a success block (see copy below). Do NOT redirect.
4. On non-2xx or network error: show inline error under button: "Couldn't send — please email {site.email} directly." Keep form filled so user can retry.
5. All state resets if user navigates away and back.

## Copy

**Page eyebrow / title / lede** — keep existing wording from current ContactPage.

**Success block:**
> **Got it.**
> I'll reply within 24 hours (usually much faster).
> If it's urgent, WhatsApp me: [add later — leave placeholder text `{whatsapp}`].

**Submit button label:** `Send it →` · while sending: `Sending…`

## Accessibility

- Every input has a visible `<label>` (not placeholder-only)
- Textarea min-height 6 rows
- Error text uses `role="alert"`
- Radio group uses `<fieldset>` + `<legend>`
- Button has `aria-busy` while submitting

## File changes

Replace only:
- `src/pages/ContactPage.jsx`

You may create:
- `src/pages/ContactPage.css` (mirror the style discipline of `HomePage.css` — CSS variables, no !important, no libraries)
- `src/components/ContactForm.jsx` (optional, only if it keeps ContactPage cleaner)

Do NOT touch: `data.js`, `App.jsx`, `Nav.jsx`, `Footer.jsx`, any other page.

## Env file

Add to `.env.local` (create if missing, add to `.gitignore` if not already):
```
VITE_LEAD_WEBHOOK_URL=https://n8n.example.com/webhook/aniket-leads
```
Add `.env.local` to `.gitignore` if not already there.

## Acceptance checklist (verify before returning)

- [ ] Runs `npm run dev` without console errors
- [ ] All 5 required fields validate on submit
- [ ] Submit with no webhook URL → shows friendly fallback, no throw
- [ ] Submit with fake webhook (e.g. `https://httpbin.org/post`) → success state renders
- [ ] Submit while network offline → error state renders, form stays filled
- [ ] Passes `npm run lint`
- [ ] No new dependencies added to `package.json`

## Return format

Post the full contents of every file changed/created. No explanations. Aniket will diff and paste.
