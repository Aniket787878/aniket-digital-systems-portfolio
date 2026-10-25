# AI brand, slices 2 to 6: check, try, verticals, pricing, landing, SEO (one branch, one PR)

**Ask:** "Next and finish" (25 Oct 2026) after slice 1 (PR #81, live). Finish the AI brand pages under /ai per `docs/plans/2026-10-25-ai-consultancy-site-plan.md` and `docs/plans/AI-CONSULTANCY-PLAN.md`. Brand name stays `brand.name` only.
**Who it affects:** visitors to /ai-check and the new /ai/* pages; leads from the check (source value changes). No booking, recording or sign-in. No server or n8n change.

## Files
- `src/data.js` (aiCheck copy + one new step; `brand` gains `tryIntro`, `verticals[4]`, `pricingExtras`, `landing`, `proofNote`; `services[ai].faq` + 2 questions)
- `src/pages/AiCheckPage.jsx` (copy from aiCheck; `source: 'ai-brand-check · <ref>'`; append "Wants 48h leak report: yes/no" to `workflow_broken`; result screen 48h-report WhatsApp line)
- `src/pages/aicheck/rules.js` (only if the new step needs a rule)
- `src/pages/ai/TryPage.jsx`, `src/pages/ai/VerticalPage.jsx`, `src/pages/ai/PricingPage.jsx`, `src/pages/ai/LandingPage.jsx`, `src/pages/ai/AiPages.css` (new, prefix `aip-`)
- `src/pages/ai/ProofNote.jsx` (new: the sample weekly note, dummy data, labelled "Sample")
- `src/pages/service/BrandHero.jsx` (adds a small link strip: Try it · For clinics · For studios · For coaching · For agencies · Pricing)
- `src/App.jsx` (routes `/ai/try`, `/ai/for/:vertical`, `/ai/pricing`, `/ai/every-enquiry`)
- `vite.config.js` (routes list for the sitemap: the new routes)
- `scripts/shoot-ai-brand.mjs` (extend: shoot every new page at both sizes, assert key text, click the check CTA on the landing page)
- `scripts/audit-ai.mjs` (new: axe-core via Playwright if `axe-core` resolves from node_modules or the npx cache, else skip with a printed reason; Lighthouse via `npx lighthouse` only if already cached, never install; writes `docs/work/ai-brand-2/audit.md`)
- `docs/system/01-website-map.md`, `docs/MAP.md`, `docs/work/ai-brand-2/audit.md`
- `.gitignore` (already ignores `docs/work/*/shots/`)

## Other side
- n8n lead intake (dUHbHJPBhHFB79qu) reads `source` as free text → new value `ai-brand-check · …` needs no workflow change; "Wants 48h leak report" rides inside `workflow_broken` so no new column. Checked, no change.
- `startChoices` (data.js) sends AI to `/ai-check` → label updated to "Free enquiry leak check".
- Sitemap and JSON-LD come from `vite.config.js` routes → new routes added.
- `ProjectDetailPage` demo cards → TryPage links to existing `/projects/<slug>`; nothing changes there.

## Copy rules
Plain, premium, confident, no em dashes, no dev jargon, no invented numbers. Demos labelled "demo" or "sample". Prices only from `packages` and `carePlan`. Guarantee from `site.guarantee`. Never hardcode an email or number.

## Slices
2. **/ai-check becomes the Free Enquiry Leak Check.** Title "Free enquiry leak check", intro "Two minutes. Where enquiries, bookings and follow-ups leak, and what to hand to AI first." New last question before contact: "Want a one-page leak report in 48 hours? Send last month's enquiries with names hidden and we read them by hand." Yes / Not now. Result screen: existing result + if yes, a line "Send a screenshot of last month's enquiries (names hidden) on WhatsApp. One page back within 48 hours." with the WhatsApp CTA. Source `ai-brand-check`. Checked by: lint, build, shots, the POST payload printed by the shoot script from a stubbed `/api/lead`.
3. **/ai/try.** Hero "Try it before you talk to anyone." Six cards (the three working demo tools first, then the three demo screens) from `projects`, each with a one-line "What you are seeing" from `brand.tryIntro[slug]`, honest kind badge, link to the case page. Closing: CheckCta.
4. **/ai/for/:vertical** for clinics, studios, coaching, agencies. Template bands: hero (vertical headline + lede), "Where it leaks" (3 pains in the owner's words), "What we hand to AI first" (4 jobs), "See it working" (one demo project card), the four steps (reuse Method), FAQ (2), CheckCta + TalkCta. Unknown vertical → NotFound.
5. **/ai/pricing** and **/ai/every-enquiry.** Pricing: the four `packages` lane ai as `PriceCard`s + `CarePlanCard` (Care plan text adds "a person checks the AI's replies every day, weekly proof note, fixes within 24h"), bands: "What runs it each month" (model, WhatsApp API, hosting are passed through at cost, stated on every quote), "Handover pack, included" (training session, written playbook, every account in your name), the you-own-it points, `site.guarantee`, 50/50 terms, FAQ. Landing (/ai/every-enquiry): hook "It is 10:40 pm. You are still replying to enquiries.", sub "Every enquiry answered, every booking confirmed, every follow-up sent. By AI, checked by a person. Owned by you.", the four steps, "The person who checks" (Aniket, photo slot empty and labelled, 2 lines), `ProofNote` sample, "from ₹20,000 / $490" price signal from packages, privacy line "Consent handled. Your data stays in your tools. Written for the DPDP Act.", one primary CheckCta, WhatsApp as the second button, no nav distractions beyond the normal nav.
6. **SEO + audits + launch.** `document.title` and meta description per new page the way existing pages do; routes in the sitemap; BrandHero link strip; `scripts/audit-ai.mjs` run on /ai, /ai-check, /ai/try, /ai/for/clinics, /ai/pricing, /ai/every-enquiry; real defects fixed, the rest listed in `docs/work/ai-brand-2/audit.md` with reasons; docs updated.

## Done when
- Every new page opens, reads cleanly at 390x844 and 1440x900, and its primary button reaches /ai-check.
- The check's POST carries `source: ai-brand-check · …` and the 48h-report answer; the n8n intake needs no change.
- Shoot script PASS, gate PASS, audit.md written with no serious axe violations on the new pages.

## Not doing
- No new OG image, no new n8n workflow, no new form, no price changes, no new runtime dependency, no change to HomePage.css or the home page, no nav restructure beyond the strip on /ai.
