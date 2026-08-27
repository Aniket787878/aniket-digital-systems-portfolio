# Opus Build Plan — the offer website + portfolio engine

**Who you are:** Claude (Opus), the builder. Aniket is the manager: he sells,
supplies real content, and approves diffs. You build.

**Mission:** turn this portfolio site into a page that converts warm clinic
prospects into WhatsApp conversations, and keep it fed as Aniket's demo systems
and client proof arrive. The site's job is narrow: survive the credibility check
a prospect does after an outreach message lands, and start a conversation. It is
not a traffic engine this quarter.

**Read first, every session:** `CLAUDE.md` (binding), then this file, then
`docs/system/01-website-map.md`. The strategy behind this plan lives in the
"First-Client Engine" artifact; you don't need it to execute.

---

## Progress log

Append one line per section as it lands. Keep it terse; the diff is the detail.

| Section | Status | Notes |
|---|---|---|
| M1a — WhatsApp CTA layer | **Built** | `src/whatsapp.js` + `components/WhatsAppCta.jsx`; wired into Nav, Hero, Pricing, CtaBand, Footer, ContactPage. Dormant until `site.whatsapp` is set — verified in both states at 1440, 1280 and 375. |
| M1b — hero proof line | **Built** | `site.heroProof` in data.js carries claim + note together. Replaced the "Good systems should feel invisible" slogan rather than adding height; CTA still above the fold at 1440×900. |
| M4-support — project imagery | **Built** | `images.projects` was defined but only used on the home page. Now also on `/projects` (thumbnail column) and `/projects/:slug` (21:9 banner). Unsplash stand-ins, `alt=""`, never captioned as screenshots. |
| M0 — lead webhook | Not started | Blocked on the n8n workflow + Aniket setting the Vercel env var. |
| M1c — featured offer | **Blocked on a decision** | Needs Aniket to confirm narrowing the public offer to clinics at ₹60k. That contradicts the locked ICP doc (which explicitly rejected a single-vertical headline), so it is a positioning call, not a build task. Do not change prices without it. |
| M1d — video embed | Not started | Blocked on the Loom link. |

## Standing rules (non-negotiable, from CLAUDE.md)

1. **Never invent content.** No placeholder testimonials, no made-up metrics, no
   stock photo presented as a screenshot. Build the slot, leave it empty, tell
   Aniket what's missing.
2. Every `outcome` number renders with its `outcomeNote`. Demo builds keep their
   `outcome` slots **empty** until a real deployment produces numbers.
3. Never hardcode an email — import `site.email` from `src/data.js`. Copy lives
   in `src/data.js` wherever a data slot exists, not in components.
4. `HomePage.css` stays one file. `--container-max` is content width. Don't
   touch `HeroCanvas` cleanup/resize semantics. The WebGL hero is **finished** —
   no redesign, no new animation work anywhere.
5. Five runtime dependencies. Adding one needs a written reason; default is no.
6. `npm run build` and `npm run lint` must pass before any commit. Match each
   file's existing CRLF/LF line endings.
7. Keep `docs/system/01-website-map.md` in sync with structural changes, and
   `docs/system/02-service-catalog.md` in sync with offer/pricing changes.
8. End every work session by telling Aniket: what changed, what you verified,
   and exactly what you still need from him (the "NEEDS" list below).

**Working style:** one milestone per session at most. Small diffs. Verify in the
browser preview at 1920 and 390 widths before calling anything done. Commit only
when Aniket says to. Mind the two probe traps documented in CLAUDE.md
(rAF never fires in the pane; first-load font metrics lie).

---

## Milestone 0 — lead capture live (do before everything; highest priority)

The contact form currently posts to an unset `VITE_LEAD_WEBHOOK_URL`: every
lead is dropped. Fix end to end.

- Build and publish the n8n lead-capture workflow per `docs/specs/` (webhook →
  validate → store lead in a table → notify Aniket). Use the connected n8n MCP.
- Have Aniket set `VITE_LEAD_WEBHOOK_URL` to the production webhook URL on the
  Vercel project (`aniket-portfolio`, team `aniket-s1` — Aniket does this in the
  Vercel dashboard; the connected Vercel MCP is a **different account, stay out
  of it**) and redeploy — the var is baked at build time.
- **Done when:** a test submission on the production site produces a stored lead
  and a notification. This milestone is verified on production, not localhost.
- **NEEDS from Aniket:** setting the env var + redeploy; a WhatsApp/email
  destination for the notification.

## Milestone 1 — conversion layer

### 1a. WhatsApp as primary CTA, site-wide
- Set `site.whatsapp` (NEEDS: the number). Add a WhatsApp CTA using
  `https://wa.me/<number>?text=<url-encoded prefill>` — prefill:
  "Hi Aniket — I saw the booking system. Can we talk about my clinic?"
- Primary button in the hero, on `/contact`, and in the footer social row
  (fill the existing empty `social` entry). The form stays as secondary path.
- Style inside the existing design system; no new visual language.
- Done when: link opens with prefill on mobile + desktop; no hardcoded email.

### 1b. Hero proof line
- Keep the locked positioning line (`site.tagline`) as the promise. Add beneath
  it a proof line from project #1: "Built for a 3-practitioner clinic:
  front-desk booking admin from ~2 hours a day to under 30 minutes,
  double-bookings to zero." Render with the directional `outcomeNote`.
- CTAs: primary = WhatsApp (1a); secondary = "See the booking system" → the
  project #1 case study.
- Done when: promise, proof + note, both CTAs visible above the fold at 1920
  and 390.

### 1c. Single featured offer
- Restructure the packages band around one featured offer:
  **Clinic Booking System — ₹60,000 fixed, live in 2 weeks.** Scope: one
  booking flow for phone/WhatsApp/walk-in · practitioner + room availability
  checked automatically · WhatsApp confirmation, day-before reminder, no-show
  follow-up · returning patients recognised. Guarantee: reminders running
  within 14 days of kickoff or the second 50% is waived. Client owns
  everything at handover.
- Demote "AI Assistant Build" and "Internal Tool / Dashboard" to compact
  "what clients add next" cards. Keep the Care Plan (₹15k–₹30k/month).
- Update `site.pricingAnchor`, the pricing FAQ, and
  `docs/system/02-service-catalog.md` **in the same change** — anchor and band
  always move together.
- Done when: site, FAQ, catalog doc and anchor all state the same numbers, and
  the featured offer names the buyer (clinics), not a category (automation).

### 1d. Demo video embed
- NEEDS: the Loom/YouTube link (Aniket records it). Until it exists, build
  nothing — no placeholder player.
- When it exists: embed near the hero or atop the projects band, heading
  "Watch a booking run end to end — 2 minutes." Lazy-load; native embed only,
  no new dependency. Done when: plays inline on mobile, no perf regression.

## Milestone 2 — proof layer (execute as real assets arrive; never before)

### 2a. Real screenshots replace the 16 Unsplash placeholders
- NEEDS: anonymised screenshots from real builds. Swap into `images.projects`
  first, then `images.gallery`, then `images.process`, following the import
  pattern documented at the top of `data.js`. Never substitute other stock.

### 2b. Testimonial band
- NEEDS: client #1's written testimonial (name, business, one number,
  permission). Then add a quote band between projects and packages: quote,
  attribution, before/after number with directional note. Ships dark until the
  content exists.

### 2c. Flagship case study upgrade
- Expand project #1's page with the real screenshots (2a), the demo video
  (1d), and a closing CTA: "Want this for your clinic? ₹60,000, live in two
  weeks" → WhatsApp link.

## Milestone 3 — measurement and plumbing (only after M0–M2)

- **3a.** Enable Vercel Web Analytics (platform-native — no analytics library;
  the dependency rule holds). Track two events: WhatsApp CTA clicks, form
  submissions.
- **3b.** NEEDS: domain purchased, email decided. Then: connect domain on
  Vercel per `docs/deploy.md`, update `site.email` from the placeholder,
  update `social` entries as real profiles go live.

## Milestone 4 — portfolio roster support (ongoing, one per week max)

Aniket is building four demo systems, in order: **(5) Lead Capture &
Follow-up Engine** (this one extends the M0 webhook — build them together),
**(6) WhatsApp AI Receptionist**, **(7) Owner's Morning Dashboard**,
**(8) Review & Reputation Engine**. For each, when Aniket says it's running:

- Scaffold/assist the n8n workflows via the n8n MCP when asked (follow the
  n8n plugin skills — error handling, credentials, lifecycle).
- Add a `projects` entry in `src/data.js` matching the existing schema and
  voice: summary, description, flow, role, timeline, stack, problem, system.
  **Mark it a demo build in the description; leave `outcome` empty** until a
  client deployment produces real numbers. Never fabricate a client.
- Add its screenshot to `images.projects` when supplied.
- Update `docs/system/01-website-map.md`.

## Never build (this quarter)

/about page and CV · blog, SEO content, newsletter capture · any redesign, new
hero, or animation · separate pages for the demoted offers · anything that adds
a runtime dependency without a written reason.

## Session-end checklist

- [ ] `npm run build` passes · `npm run lint` clean
- [ ] Checked at 1920 and 390 in the preview
- [ ] Docs in sync (`01-website-map.md`, `02-service-catalog.md` if touched)
- [ ] Told Aniket: changed / verified / NEEDS
