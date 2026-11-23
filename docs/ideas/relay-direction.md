# Direction: the whole site and every film in the Relay style (for approval)

Written 2026-10-01. Aniket's call: "I want the website and all videos like Relay
style." Reference: `docs/ideas/relay-story-loop/` (the Relay hero, the story loop).
**Nothing is built from this page until Aniket approves it.**

This replaces the "Dusk" design system (docs/design-system.md, getstage.co-based)
once it ships. His brand colour stays: **saffron, not Relay's lime**.

---

## 0. The spine: the 4-step loop (from the reel screenshot)

Every page and every film is built on the same loop Aniket shared
(`relay-story-loop/story-loop-reel.png`): **Stakes → Big question → Headfake →
Rehook**, and back to Stakes. Relay is how it *looks*; the loop is how it *reads*.

| Step | What it does to the visitor | On the site |
|---|---|---|
| **Stakes** | makes them care: someone to root for, something at risk, urgency | the business owner losing enquiries, bookings and evenings to admin |
| **Big question** | a question they need answered | "What if the enquiries answered themselves?" |
| **Headfake** | goes against what they expect | "It's not more software. It's fewer steps." / "The best AI says I don't know." |
| **Rehook** | restarts the loop before they leave | the next proof, the next page, the call |

**Rules:**
- Every page runs at least one full loop; the home page runs several in a row
  (good stories have one loop, great ones cascade).
- Every section ends on a rehook: a line or a teaser that pulls into the next one.
  No dead-end section.
- Each case study and each film is one loop (beats in `film-direction-ai-demos.md`).

**The loop as a visual:** a glowing saffron **infinity loop** (∞), like the one in
the reel, drawn in the Relay style (a thin glass tube with a saffron glow and small
light points travelling along it) with the four step names around it. It appears:
- on the home page as the "How I work" section: the four stops are Aniket's own
  (Find the leak → Map it → Build it → Measure it, and back again), and a light point
  runs the loop as you scroll, lighting each stop;
- small, in the corner of each case study, lighting the step the reader is on;
- as the closing shot of the brand film.
The thin saffron **stream of light** that runs down the page is the same line: it
leaves the loop, threads through the page and returns to it at the call to action.

---

## 1. The system ("Stage")

### Ground and light
- **One ground: near-black `#0b0b0c`** everywhere. The light "paper" bands are
  retired. Rhythm comes from glow and density, not from switching light and dark.
- **Faint dot grid:** 1px dots every 24px, white at 7%, faded towards the edges.
- **One saffron glow per section,** placed behind the thing that matters (the hero
  window, the active step), never a wash over the whole band.
- **One stream of light:** a thin saffron line (1px with a soft glow) that runs down
  the page from the hero, threading through sections as you scroll and ending at the
  closing call to action. Relay's signature, in saffron.
- Dusk hills, sunset sky and stars are retired from the site and the films.

### Type
- Inter 500 for headings (tight tracking, as now), Inter 400 for body.
- **One italic serif word** (Instrument Serif) ends each big heading, in peach
  `#ffc89a`: "Enquiries answered. Bookings *confirmed.*"
- **Mono labels** (system mono, 12px) for status pills, step counters, tags and
  small facts: "taking on projects", "01 / 05", "recorded test run".

### Colour tokens

| Token | Value | Use |
|---|---|---|
| `--night` | `#0b0b0c` | ground |
| glass | `rgba(28,26,24,.78)` to `rgba(16,15,14,.82)`, border white 8% | windows, cards |
| `--ink` | `#f2f0ed` | text |
| `--muted` | `#9a958f` | secondary text |
| `--accent` | `#f5871e` | saffron: buttons, dots, wires, the light stream, active states |
| `--peach` | `#ffc89a` | the serif word |
| glow | saffron 16% fading to 0 | one per section |

### Components
- **Floating pill nav,** dark glass, with a mono status pill beside the button:
  "● taking on projects".
- **Buttons:** solid saffron primary (dark text), dark outlined secondary with an
  icon ("▶ Watch a build, 1 minute").
- **Glass window:** the frame for every piece of proof (films, screens, flows).
  Tilted in 3D in heroes, flat everywhere else.
- **Flow chips:** small glass nodes joined by saffron wires with a travelling pulse,
  used wherever the site explains how something works.
- **Mono tags** on media: "Real screens · recorded test run", "Illustrated · client
  data never shown", "Concept design".

### Motion
- Sections arrive **out of focus and settle** (blur 10px to 0, 12px rise), Relay's
  "precise mechanism" feel. Ease `(0.22, 1, 0.36, 1)`, 0.6 to 0.9 s.
- Flows draw themselves and pulses travel along wires.
- Heroes: the glass window tilts gently with the pointer (desktop only).
- Everything has a reduced-motion version; phones get no pinned scroll sections.

---

## 2. Page by page

| Page | Hero | What changes |
|---|---|---|
| **Home** | Left: status pill, headline with serif word, sub, buttons. Right: a tilted glass window with a **live enquiry flow** (web form → answered → slot offered → booked → follow-up sent, with "waiting on a yes" and a "last runs" log), like Relay's refund flow | Statement, work, services, process, FAQ and CTA all move to the stage ground. Runs the loop three times in a row: (1) stakes: the problem, big question, headfake: fewer steps not more software, rehook: the work; (2) the work as its own loop, each project rehooking into the next; (3) the ∞ "How I work" loop, rehooking into the call |
| **/websites** | Same hero pattern, window shows a site being assembled | Showpiece: the five-site orbit (being built now) |
| **/software** | Window shows the Shared Inbox screen | Showpiece: the take-apart layers (being built now) |
| **/ai** | Window shows the Appointment Desk chat | Showpiece: "Ask the front desk" chat with tool cards (being built now) |
| **/projects + case studies** | Glass window with the project's film | Case studies told as a story loop (stakes, big question, headfake, rehook), captions in mono tags |
| **/about** | Portrait slot in a glass frame, mono facts | Same content, stage style |
| **/contact** | Status pill "replies within a day", the form in a glass window | Next steps as flow chips |

---

## 3. Every film, re-rendered in the same style

All films open on the black dot grid with a saffron glow; the app window arrives
out of focus inside a tilted glass frame and settles flat; the camera pushes in with
a saffron-edged spotlight; captions are Inter with a mono step counter; small
"what it did" flow chips appear beside the screen when the app does something real;
the end card uses the serif-word heading and the saffron button. A fixed mono tag
says what the footage is on every frame.

| Film | Now | After |
|---|---|---|
| Appointment Desk, Knowledge Assistant, Website Answer Widget (new) | stills only | new films + loops (see `film-direction-ai-demos.md` for the beat sheets) |
| Consent Signer, Shared Inbox, Lead Research | Dusk | re-rendered in Stage |
| Therapist PWA, Care Journey (schematics) | Dusk | re-rendered in Stage, schematic label kept on every frame |
| Five explainers (brand, brand vertical, ops sprint, AI assistant, internal tool) | Dusk | re-rendered in Stage |
| Home hero reel | Dusk | re-rendered in Stage |
| Card loops, framed loops, posters | Dusk | all regenerated |

**Builder: Sonnet** for all film work (Aniket's call).

---

## 4. Order of work (proposed)

1. **System first:** tokens, the stage primitives, nav, buttons, footer, and the
   updated `docs/design-system.md`. Everything else builds on this.
2. **Home page**, then the **three service pages** (their showpieces are already
   being built in this style).
3. **Films:** the three new AI demo films first (they have none), then the rest.
4. **Case studies, projects, about, contact.**
5. A final design pass across everything, then one preview link for Aniket.
   Nothing goes live until he says yes.

## 5. Rules that still hold

Plain words, no em dashes, no dev jargon in visible text; service businesses
broadly (clinics as proof, not the market); no "solo" framing; never invent numbers,
testimonials or results; every demo and schematic labelled for what it is.
