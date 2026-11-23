# Council verdict: portfolio vs. the "Awesome Opus 5.5 Videos" motion library (11 Oct 2026)

**Question.** Measured against what the 513-prompt Opus 5.5 motion library shows is possible with code-made motion, where does the portfolio fall short, and which 5-8 additions would most increase the one outcome that matters: a visitor gets in touch (WhatsApp "Book a free call" or the /start plan)?

**Short answer.** The site does not fall short on motion. It falls short on two things the library cannot fix: it cannot yet see most of its own WhatsApp taps, and the phone home page is still too long before the proof and price. Fix the measuring, ship the Wave C proof deck, then stop and read the numbers. Port nothing from the library this round.

---

## Where the Council Agrees

1. **Most of the library is off-limits by your own rules.** Shader/GLSL backgrounds (`monokern-832979.md`, `zheke-622583.md`), three.js product reveals (`dannnnnok-716687.md`), physics toys (`froessell-562325.md`), playable games (`zacxbt-944604.md`) and AI-image zoom loops (`koldo2k-778767.md`) are either desktop-only, video-only, or break "phones first, three.js never on phones". All five advisors drop them.
2. **Only two families could work: kinetic type and SVG line-drawing.** (`moritzkremb-466494.md`, `visheshbaghell-119508.md`.) The site already has both: Motion-driven headline settles on every page, and `FlowGraph.jsx` already draws its wires in on view.
3. **Wave C beats any motion add.** Four of five advisors (all except the Outsider, who did not address it) put the unbuilt Wave C proof deck first: it cuts the phone home from 17.8 to 12.8 screens and brings the first proof forward. It shortens the distance to the button; motion only decorates it.
4. **The 2 Oct finding still holds.** The bottleneck is how many people reach the site, not how it looks. Nothing shipped since then changes that.

## Where the Council Clashes

- **Motion as a sales demo vs. motion as decoration.** The Expansionist argues every animation should prove Aniket can build what he sells (the plan diagram "drawing itself", proof cards as 3-second trailers). The Contrarian and First Principles say that is polish theatre on pages that are not the bottleneck. **Verdict: the Contrarian side wins.** The Expansionist's ideas are sound in spirit but wrong in detail. They target the wrong files, ignore phone cost, and the visitor who reaches the plan result has already decided to engage. Trailer cards on the phone deck would put video weight on the page Wave A just slimmed down.
- **Add a few cheap touches vs. add nothing.** The Executor wants three small touches after Wave C: a kinetic price reveal, a line-draw underline on the dock, and line-draw diagrams. First Principles wants zero. **Verdict: zero for now.** Two of the three rest on wrong facts (see Blind Spots). The third, an animated underline under "Free call", is a distraction cue on a bar that is already fixed under the thumb.
- **Is the hero the problem?** The Outsider, the only advisor who looked at the live phone site, found the hero's two buttons ("Get started" and "Book a free call") ambiguous, and found that the tagline ("Hand the repeated work to AI. Keep the decisions.") does not say what gets built. The reviewers split on whether that is a copy audit or a real finding. **Verdict: it is a real finding, and it is testable, but not today.** The two buttons are a deliberate choice ("one primary per view", in code). The AI-led headline was approved on 9 Oct. Settle it with data, not opinion.

## Blind Spots the Council Caught

1. **StringTune never runs on phones.** The Executor and Expansionist both proposed a "kinetic price reveal reusing StringTune". StringTune loads only on desktop with a mouse at 1024px+, and since Wave A it is not even downloaded on phones. Any phone-visible reveal must use Motion or CSS, which is already how `StageHero.jsx` animates.
2. **Wrong files.** The live home hero is `src/pages/home/stage/StageHero.jsx`, and it already shows "From ₹20,000. Free 15-minute call first." The live home work band is `src/pages/home/stage/StageWork.jsx` ("Phones … get plain stacked cards"), not `Work.jsx`. `FlowGraph.jsx` is used only by `home/Connect.jsx`, which is no longer on the live home, and it hides its wires below 640px. It is not on /start or /ai-check at all. So "animate the plan diagram as you answer" has nothing to animate today.
3. **Measurement exists, but it has a hole.** All five reviewers said nobody proposed measuring. The main session confirmed `track()` events ship (`dock_click`, `result_cta`, `cta_click`, `flow_start`/`flow_submit`, `film_sound`). **The chairman's own check of `origin/main` shows the gap:** `TalkCta` / `WhatsAppCta` / `BookingCta` in `src/components/FunnelCta.jsx` and `WhatsAppCta.jsx` fire **no event**. So the hero's "Book a free call", the WhatsApp buttons on /projects, case studies and /about, and the WhatsApp button under the price on plan results (it only shows up inside the generic `result_cta`) are invisible as WhatsApp taps. Today you cannot answer "how many people tapped WhatsApp from the hero?"
4. **Check that custom events are actually recorded.** Vercel Web Analytics custom events have historically been a Pro-plan feature, and the portfolio is on the free plan (that is why the repo must stay public). Before relying on any number, open Vercel → Analytics → Events and confirm `dock_click` rows exist. If the tab is empty or locked, the fallback is page-view based: route WhatsApp taps through a tiny `/go/whatsapp?from=…` redirect page so they appear as page views.
5. **Traffic is too small for A/B tests.** Reviewers asked for A/B framing. At current lead volume a split test will never reach significance. Use before/after raw counts over two-week windows, plus the cheapest tool there is: ask every new lead "what made you message?"

## The Recommendation

Ranked shortlist. Source prompt files are listed only where the item actually draws on the library.

| # | What | Page / component | Source prompts | Effort | Why it moves "gets in touch" | How it is measured |
|---|---|---|---|---|---|---|
| 1 | **Track every WhatsApp/booking tap.** Add `track('talk_click', { placement, channel })` inside `TalkCta`, `WhatsAppCta` and `BookingCta`, with a `placement` prop at each call site (home-hero, projects, case-&lt;slug&gt;, about, contact, plan-result). First confirm custom events record on the current Vercel plan; if not, use the `/go/whatsapp` redirect fallback. | `src/components/FunnelCta.jsx`, `WhatsAppCta.jsx`, `BookingCta.jsx`, call sites | none | S (1-2 h) | It does not move the number. It makes the number exist. Without it, every item below is opinion. | New `talk_click` events appear in Vercel Events within a day of deploy. Record a 2-week baseline. |
| 2 | **Wave C proof deck on phones.** Swipeable deck of the existing project cards for the phone branch of the work band. Plain CSS scroll-snap, the existing posters and stills, no autoplay video, no new dependency, reduced motion respected. | `src/pages/home/stage/StageWork.jsx` + `work/work.css` | none (do not use trailer cards) | M (1-2 days) | Home goes from 17.8 to 12.8 phone screens. Proof and the close arrive about 5 screens sooner for a visitor who came from a WhatsApp link to decide fast. | Home `dock_click{action:whatsapp}` + `talk_click{placement:home-*}` + `cta_click{placement:home-hero}` per home visit, 2 weeks before vs. 2 weeks after. |
| 3 | **Case-study "at a glance" card + mid-page rehook.** The problem, what was built and the result in four lines at the top (real facts only), then a rehook to WhatsApp/plan halfway down. | `src/pages/ProjectDetailPage.jsx` | none | S-M (half day) | A case study is where trust peaks. Today the ask sits only at the bottom. | `talk_click{placement:case-*}` + `cta_click` from case pages. |
| 4 | **/projects three-way switch, leading with "in real use".** | `src/pages/ProjectsPage.jsx` | none | S-M (half day) | Puts the client platforms (the strongest trust signal) first instead of mixed with concepts. | `talk_click{placement:projects}`, clicks into case pages. |
| 5 | **Hero button test, data-first.** No build. After 2 weeks of item 1, compare `cta_click{home-hero}` with `talk_click{home-hero}`. If WhatsApp clearly wins on phones, make it the single primary on phones only. | `StageHero.jsx` (later) | none | S (a read, then a 1-line change) | Settles the Outsider's "two buttons, unclear weight" finding with evidence instead of taste. | Those two counts, phone vs. desktop (Vercel shows device). |
| 6 | **Optional, only if /ai visitors stall: a phone-legible FlowGraph on /ai.** Reuse the existing line-draw `FlowGraph` (stack the nodes and draw short vertical wires on phones instead of hiding them) to show "your tools → one system → the work it now does". | `src/components/FlowGraph.jsx` on `ServicePage` for `/ai` | `visheshbaghell-119508.md`, `rammanq-034553.md` (line-draw family, few paths) | M (1 day) | The one library technique that explains instead of decorating, answering the Outsider's "what actually gets built?" for the AI line. | `flow_start{service:ai}` and `talk_click` from /ai, before/after. |
| 7 | **Do not port anything else from the library.** No shader or particle backgrounds (`ajith-io-890146.md`, `monokern-832979.md`), no 3D reveals, no games, no AI-image zooms, no StringTune-based phone effects, no kinetic price reveal, no animated dock underline, no trailer cards. | site-wide | (the rest of the 513) | none | Each one costs phone weight or attention and has no line to a WhatsApp tap. The library's real value here is reassurance: the Stage look is not under-built for 2026. | Nothing to measure. Keep the Wave A load gains (re-run the Lighthouse baseline once after item 2). |

After items 1-4 ship: **freeze the site for two weeks** and put the time into lead volume (the 2 Oct verdict and the "clients first" rule). Revisit items 5-6 only with the numbers in hand.

## The One Thing to Do First

Open Vercel → Analytics → Events and check that `dock_click` events are being recorded. Then add `talk_click` tracking to `TalkCta` / `WhatsAppCta` / `BookingCta` (item 1) and deploy it **before** Wave C. Otherwise Wave C ships with no "before" number to compare against.

## What Aniket Must Decide

1. **Wave C now, or outreach only?** The council recommends one more small site push (tracking + phone proof deck + case card + /projects switch, about 3 days), then a two-week freeze for outreach. The alternative is to freeze today and ship only the tracking.
2. **Hero buttons on phones:** keep "Get started" as the main button with WhatsApp second (today's design), or let the 2-week data decide and switch to WhatsApp-first on phones if it wins?
3. **Hero headline:** keep the AI-led line approved on 9 Oct ("Hand the repeated work to AI. Keep the decisions."), or add a plain line saying what gets built (websites, software, AI for service businesses)? A cold visitor found the current line unclear.

---

## Advisor positions

| Advisor | Stance in one line |
|---|---|
| Contrarian | Premise is backwards; 3 of 4 families are banned, the rest already exist; ship Wave C, not a motion audit. (Rated strongest by 4 of 5 reviewers.) |
| First Principles | Motion is not the lever; add nothing from the library, finish Wave C, go back to lead volume. |
| Executor | Ship Wave C first, then three cheap touches (kinetic price, dock underline, line-draw diagrams). Rested partly on wrong files and StringTune-on-phones. |
| Expansionist | Make motion a live demo of the AI pitch (self-drawing plan diagram, trailer proof cards). Rated biggest blind spot by 4 of 5 reviewers for ignoring phone cost. |
| Outsider | Looked at the live phone site: the hero's two buttons and abstract tagline are the real friction; use line-draw and kinetic type only to clarify. |

Full transcript (question, fact pack, all five responses, five peer reviews with the letter mapping, screenshots): `/root/projects/mobile-2026-10-09/council/` (see `council-transcript-2026-10-11.md` and `council-report-2026-10-11.html`).
