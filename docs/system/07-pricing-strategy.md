# 07 — Pricing strategy (2026-10-01)

Method: the `pricing-strategy` skill from emotixco/claude-skills-founder
(`skills/pricing-strategy/SKILL.md`), adapted from SaaS subscriptions to a
project studio. Competitor prices were checked on 2026-10-01 and are listed
at the end with links. **Proposed, not confirmed:** the new USD prices and the
Roadmap credit are live only on the preview branch until Aniket says yes.

## 1. Pricing model

| Model | Fit (1-5) | Why |
|---|---|---|
| Fixed-price productised packages | 5 | Buyers see the price before the call; matches "never hourly" |
| Retainer (Care Plan) | 4 | The recurring layer, sold after a build ships |
| Value-based quote | 3 | Right for Custom Platform only; needs a mapped process first |
| Hourly | 1 | Punishes speed, and speed is the selling point |
| Subscription / SaaS seat | 1 | Off-the-shelf bots (₹999-₹1,350/mo) own that ground; competing there means competing on price |
| Revenue share | 1 | No audited numbers to share against yet |

**Keep fixed-price packages plus a retainer,** because a service business
wants a number up front, and the retainer is where the income becomes steady.

## 2. Tiers per area

Each area keeps an entry offer, a target offer and a bigger build. The middle
one is the one to sell.

| Area | Entry (the first yes) | Target | Bigger build |
|---|---|---|---|
| Websites | Business Website | **Website + AI Assistant** | Custom Platform |
| AI | AI Roadmap Session / Quick-Win | **Ops Automation Sprint** | AI Assistant Build |
| Software | — | **Internal Tool** | Custom Platform |

## 3. The prices

INR stays where it is: against India's published prices it already sits
just above budget shops, which fits the wiring and AI it adds. USD was
priced like an Indian shop converted to dollars, and against international
studios that reads as cheap rather than competitive. It moves up, and still
lands well under them.

| Offer | INR | USD before | USD now | Why |
|---|---|---|---|---|
| Business Website | from ₹25,000 | from $690 | **from $1,200** | Studio Utexo £999, F5 Studio $2,500. $690 signals low quality abroad |
| Website + AI Assistant | from ₹60,000 | from $1,500 | **from $2,400** | Keeps the same 2x step over the plain site as in INR |
| AI Roadmap Session | ₹15,000 | $290 | **$490, taken off the first build** | Value Consulting $599, Prime AI £999. The credit makes it a free door into a build |
| Automation Quick-Win | ₹25,000 | $490 | **$690** | One automation sells for $400-$1,200; Value Consulting $899 |
| Ops Automation Sprint | ₹40k-₹80k | $1,500-$2,500 | **$1,900-$3,200** | Goodspeed $5,000 for up to 4 workflows; Bluelinks from $497 per package |
| AI Assistant Build | ₹80k-₹1.5L | $2,500-$4,500 | **$2,900-$4,900** | No like-for-like price published; moved in step with the sprint |
| Internal Tool | ₹1.5L-₹3L | $4,000-$8,000 | unchanged | AIPixel's ₹2,50,000 SaaS package sits inside the range |
| Custom Platform | quoted | quoted | unchanged | Depends on the mapped process |
| Care Plan | ₹15k-₹30k/mo | $250-$500/mo | unchanged | Aarav Infotech tops out at ₹29,999/mo; Utexo £49-£149/mo |

## 4. Unit economics (estimates, not confirmed)

- **Websites:** hosting on Vercel is free at this size. The client pays for
  the domain. Cost is mostly time: about 2 weeks.
- **Automations:** n8n runs on the existing server, so the extra cost per
  client is close to nothing until volume grows. *Estimate.*
- **AI assistants:** each answer costs money for the AI and, on WhatsApp,
  per message. This cost **must be passed through** (the client's own
  account, or a line in the Care Plan). Never absorb it inside a fixed
  build price, or one busy client erases the margin. *Amount unconfirmed:
  measure it on the first live client.*
- **Break-even:** depends on Aniket's monthly target, which isn't written
  down. Fill it in: target ÷ ₹25,000 = Quick-Wins a month to cover it.

## 5. Price psychology (three tactics)

1. **Anchor:** each service page lists its larger offers beside the entry
   one, so ₹25,000 reads as the easy start, not the whole bill.
2. **Decoy:** Website + AI Assistant (₹60,000) costs less than the website
   plus the standalone AI Assistant Build (₹25,000 + ₹80,000), which makes
   the bundle the obvious pick.
3. **Risk reversal, not discounts:** "fixed before work starts, half to
   begin, half when it goes live" (now in the FAQ), and the Roadmap fee
   credited against the build. No fake "50% off" or countdowns.

## 6. Launch pricing, then scale pricing

- **Now (first 3 paying clients per area):** these prices. Ask each
  client for a short testimonial and permission to show the real numbers.
- **Raise INR by about 20%** once an area has 3 shipped clients with
  numbers you can show. The proof replaces the discount.
- **Grandfathering:** Care Plan clients keep their monthly rate for 12
  months after any rise.
- **Raise sooner if** more than 2 in 3 proposals are accepted without
  pushback on price. That means the price is too low.

## Open for Aniket

1. Confirm the new USD prices (or pick different ones).
2. Confirm the Roadmap credit: the fee comes off the first build if the
   client goes ahead. It is a promise on the live site once merged.
3. Optional new offer, not built: a **Site Care** plan around ₹4,999/month
   for website-only clients (India market: Aarav ₹3,999-₹29,999/mo). The
   current Care Plan (₹15k+) is sized for systems, not a 5-page site.

## Sources (checked 2026-10-01)

- GIT Infosys, ₹15,000 for 5 pages: gitinfosys.com/website-development-cost-in-india
- F5 Studio, $2,500 / $4,000 business website: f5-studio.com/services/fixed-price-website
- Studio Utexo, £999+ launch site, £49 and £149/mo care: studioutexo.com/pages/pricing
- ChatMitra, ₹999/mo AI chatbot plan: chatmitra.com/pricing
- AiSensy, ₹1,350/mo WhatsApp AI agent: aisensy.com/pricing
- AIPixel Studio, ₹2,50,000 SaaS package: aipixel.studio/pricing
- Value Consulting, $129 session, $599 roadmap, $899 automation: valueconsulting.ai
- Prime AI Solutions, from £999 AI blueprint: primeai.solutions/services/ai-audit-assessment
- Goodspeed, $5,000 for up to 4 workflows: goodspeed.studio (n8n agency pricing article)
- Bluelinks Agency, Make packages from $497: bluelinks.agency/automation/make/services
- Aarav Infotech, ₹3,999-₹29,999/mo maintenance: aaravinfotech.com/website-maintenance-services

No published like-for-like price was found for a website + AI bundle, an
internal tool or a custom assistant build; those prices rest on the
neighbouring offers, not on a competitor.
