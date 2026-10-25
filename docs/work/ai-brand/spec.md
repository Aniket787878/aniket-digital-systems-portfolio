# AI brand home at /ai (slice 1 of 6)

**Ask:** "Go" (25 Oct 2026) on the AI consultancy plan: the brand lives inside this repo under /ai. Slice 1 turns /ai into the brand home: brand name, his four-step method, the "you own everything" band. Plan: `docs/plans/AI-CONSULTANCY-PLAN.md`, site plan: `docs/plans/2026-10-25-ai-consultancy-site-plan.md`.
**Who it affects:** visitors to /ai and the nav. No booking, recording or sign-in. No n8n change (CTAs keep going to the existing /ai-check, source stays `ai-check`).

Working brand name: **Befikr** (not bought, not final). It lives in ONE place, `brand.name` in `src/data.js`, and every render reads it, so a rename is a one-line change.

## Files
- `src/data.js` (new `brand` export: name, sayIt, meaning, line, lede, method[4], ownIt{title, points[4]}; update `services[ai]` title/sub/promise/points to the plan's copy)
- `src/pages/ServicePage.jsx` (for slug ai only: BrandHero, Method, OwnIt bands before the existing showcase/Proof/Offers/Faq/Cta)
- `src/pages/service/BrandHero.jsx` (new)
- `src/pages/service/Method.jsx` (new)
- `src/pages/service/OwnIt.jsx` (new)
- `src/pages/ServicePage.css` (new `svc-brand-*`, `svc-method-*`, `svc-own-*` rules; keep HomePage.css untouched)
- `src/components/Nav.jsx` (the "AI" link label reads `brand.name`, desktop and mobile)
- `docs/system/01-website-map.md` (the /ai row and data.js schema: `brand`)
- `docs/MAP.md` (status board row "AI brand under /ai: slice 1 live")
- `.gitignore` (ignore `docs/work/*/shots/`; proof lives on the `review-shots` branch)
- `scripts/shoot-ai-brand.mjs` (new: Playwright shots and text checks of /ai)
- `docs/work/ai-brand/shots/` (the screenshots)

## Other side
- `services[ai].docTitle` and the OG/JSON-LD built by the `siteMeta` plugin from `site.*` → docTitle updated to "<brand.name> · AI front desk for service businesses"; OG image unchanged (later slice).
- `src/pages/home/Services.jsx` and the home service door read `services[ai].title/sub` → they will show the new copy; checked, acceptable.
- `startChoices` and `/ai-check` copy still say "AI check" → unchanged this slice.

## Copy (plain, no em dashes, premium and confident)
- Hero: eyebrow "Befikr · AI front desk for service businesses". Headline "Every enquiry answered. Every booking confirmed. Every follow-up sent." Accent words in serif: "answered", "confirmed", "sent". Lede: "By AI, checked by a person, on accounts you own. For clinics, studios, coaching and agencies with 2 to 30 staff." Buttons: primary "Get your free AI check" (/ai-check, existing CheckCta), secondary TalkCta. Under them: `site.replyPromise` and `site.guarantee`.
- Method band title "How it works. The way it really went for our first clients." Steps: 01 Map "One working session. We walk your day from the first message to the last invoice and write down where time and money leak." 02 Build "The whole flow, not one tool. Bookings, replies, reminders, notes and invoices in one system. Live by a date in writing." 03 Train and stay "Your team learns it in an afternoon. We fix in days and keep improving for months." 04 Hand over "Your accounts, your data, your playbook. You own every part of it."
- OwnIt band title "You own everything." Points: "Every account is in your name", "Your data stays in your tools, and leaves when you say", "A written playbook your team keeps", "No lock-in. Leave any time and it keeps running". Closing line: "Live by the date in writing, or the second half is free." (reuse `site.guarantee` if it already says this).

## Slices
1. (this) Brand export + BrandHero + Method + OwnIt on /ai + nav label + docs. Checked by: `npm run lint`, `npm run build`, Playwright shots of /ai at 390x844 and 1440x900 (`scripts/shoot-ai-brand.mjs`, writes to `docs/work/ai-brand/shots/`).
2. /ai-check becomes the Enquiry Leak Check (copy, 48h report option, source `ai-brand-check`).
3. /ai/try: the three demo tools with one-line captions.
4. /ai/for/<clinics|studios|coaching|agencies> from one template.
5. /ai/pricing with running-cost line and handover pack; /ai/every-enquiry ad landing page.
6. OG image, SEO, accessibility and device audits, launch.

## Done when
- /ai opens on the brand hero with the three accent words, two buttons, reply promise and guarantee visible without scrolling on 1440x900, and stacked cleanly on 390x844.
- The four steps read Map, Build, Train and stay, Hand over, in that order.
- The "You own everything" band shows four points and the guarantee line.
- Nav says "Befikr" where it said "AI"; changing `brand.name` changes every mention.
- `npm run lint` and `npm run build` pass; gate prints `GATE: PASS`.

## Not doing
- No new routes, no n8n or server change, no OG re-render, no price changes, no new dependencies, no changes to HomePage.css or the home hero.
