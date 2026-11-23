# AI consultancy funnel audit (2026-10-09)

Goal: turn the portfolio into an AI consultancy site that converts visitors into booked calls and paid first steps.
Method: our live site mapped as a funnel, then 14 live competitor sites taken apart (7 India, 7 US/UK/AU), all read on 2026-10-09.
Uncommitted on purpose (the repo is public).

## 1. Where we stand

| Area | Today | Gap |
|---|---|---|
| Positioning | "Websites that bring the work in. Software and AI that run the rest." AI is 1 of 3 equal services | Not an AI consultancy. Every competitor leads with one AI promise |
| Primary CTA | "Book a 15-min call", but no Cal.com link, so it falls back to WhatsApp | Competitors: one booking button (6/7 international) |
| Buttons per page | 3-4 (book, WhatsApp, form, email) | Too many choices |
| Free first step | None | 13/14 competitors offer a free audit, check or snapshot |
| Paid first step | AI Roadmap Session ₹20k / $490, credited | Good, and matches the best competitor model; badly named and buried |
| Lead magnet | None | Scorecard, ROI calculator or instant check is standard |
| Qualification | 6-field form, budget optional | OK; no "how many enquiries / hours lost" questions |
| Proof | 5 real client projects (anonymised), 3 labelled demos, no testimonials | Competitors lead with one hard number per case |
| Risk reversal | "Live by the date in writing or you don't pay the second half" | Already stronger than most. Make it louder |
| Reply promise | "within 24 hours" (only after submit) | 5/7 India show it up front |
| Tracking | None | No way to know what converts |
| Lead handling | n8n: Sheet + Gmail alert + auto-reply + 24h reminder | Solid, keep |

## 2. What competitors do (table stakes)

- A free diagnostic before any sales talk (13/14): "AI Readiness Check", "Free AI Audit", "AI Risk Snapshot".
- One primary "book a call" button to a calendar (most).
- One hard number per case study (hours saved, % more bookings).
- A 3-4 step process (Discover > Build > Launch > Improve). Now so common it doesn't stand out; make ours specific.
- FAQ before the final call to action.
- India: WhatsApp as both product and contact channel; a 24-48h reply promise; vertical examples (clinics, real estate, coaching, D2C).

## 3. Tactics worth copying (ranked)

1. **Free instant check feeding a paid audit.** Free Me Up (AU): free 8-question "AI Risk Snapshot" with a 1-page result in 24h, then a $500 "Readiness Check", then a fixed-price 90-day pilot. That ladder fits ours almost exactly.
2. **Show the workflow questions on the page** (Branditify): what triggers it, what info is needed, which tools, who decides, what outcome. Makes "AI" concrete before the call.
3. **Paid audit credited to the build** (Mayank Digital Labs, Free Me Up). We already do this; say it in the headline of the offer.
4. **Live proof you can try** (Staxx "Speak to AI" phone line). We have three working demos (Appointment Desk, Knowledge Assistant, Website Widget) on a dummy clinic. Let visitors try one.
5. **Quotable risk reversal** (AY Automate "month one refundable"). Ours exists: lift it into the hero area.
6. **3-input "what slow replies cost you" calculator** (Staxx, Teknesya): enquiries a week, % answered late, value of a client.
7. **Buyer's checklist** (Neogen): "questions to ask any AI vendor" builds trust by inviting scrutiny.

Mistakes to avoid: hiding all prices (we show them, keep it), stat-only proof without real cases, generic process diagrams, vague guarantees, cheap "₹15k full automation" positioning.

## 4. Pricing check

- India market (published): simple WhatsApp bot ₹3k-30k; multi-channel systems ₹50k-2L setup; support ₹15k-1L/mo; free audit everywhere.
- International: paid diagnostics $500 (Free Me Up); pilots from $4,500-5,500; subscriptions £350-950/mo.
- Ours (₹20k/$490 roadmap, ₹30k/$690 quick win, sprints and assistants above) sits in the premium-but-normal band. No change needed; what's missing is a free step in front.

## 5. Proposed funnel (for approval, not built)

```
Visitor
 -> Home: one AI promise + 1 button "Get your free AI check"
 -> Free AI check: 6-8 plain questions (business type, enquiries/week, where time goes, tools used, reply speed)
      -> instant on-screen result: top 3 things to hand to AI + rough hours saved (labelled an estimate)
      -> same answers go to the existing n8n lead flow (Sheet + alert)
 -> Offer: "AI Roadmap": ₹20k / $490, 1 week, fee credited to the build
 -> Book a call (Cal.com) | WhatsApp as the one backup
 -> Build: Quick Win / Sprint / Assistant (existing prices, existing guarantee)
 -> Care plan (existing)
```

Home page order (each section ends by hooking into the next; honest hooks only):
1. Hero: the result-led promise, now AI-first, e.g. "Your enquiries answered, bookings confirmed and follow-ups sent by AI, checked by a person." + the free check + reply-time and guarantee line.
2. The cost of slow replies (the calculator, 3 inputs).
3. What AI takes off your plate: 3-4 jobs in plain words, each linked to a demo you can try.
4. Proof: the anonymised clinic system with one hard number + the real projects.
5. How it works: Free check > Roadmap (credited) > Build by a fixed date > Care.
6. Prices (existing) + guarantee.
7. Questions to ask any AI partner (buyer's checklist) + FAQ.
8. Final CTA.

Websites and software stay as "what we build around the AI", not equal headline services.

## 6. Smallest version first (suggested order)

1. Set the Cal.com link (identity basic, already on the launch to-do).
2. Rewrite the home hero + CTAs: AI-first, one primary button, reply-time + guarantee line.
3. Rename and reframe the Roadmap as the paid first step.
4. Free AI check page (questions + instant result + existing n8n intake).
5. Turn on Vercel Analytics so we can see what converts.
6. Later: calculator, try-a-demo, buyer's checklist, rework /ai, /websites, /software around the new spine.

## Sources
India: teknesya.com, thegrowingai.com, branditify.com, xaylonlabs.com, neogenmedia.com, scalifylabs.com, mayankdigitallabs.in
International: axeautomation.co, morningside.ai, ayautomate.com, bluprintcreations.com, upagents.app, freemeupai.com.au, staxxsolutions.co.uk
