# Film direction: the three AI demos (for approval, not started)

Written 2026-10-01. **Builder: Sonnet** (Aniket's call; overrides the "films on Opus"
line in CLAUDE.md, which gets updated when this ships). Nothing is rendered until
Aniket approves this page.

## What we're making

For each of **Appointment Desk**, **Practice Knowledge Assistant** and **Website
Answer Widget**, three pieces, like the other working demos:

| Piece | Where it plays | Length |
|---|---|---|
| Walkthrough film | the case study page, and "watch" buttons | about 40 s |
| Card loop | project cards on /ai, /websites and /projects (plays on hover) | about 12 s, silent, loops |
| Framed loop | the proof cards on the service pages | about 12 s, in a browser frame |

Plus a poster frame for each.

## The look: Relay style ("Stage"), decided 2026-10-01

Aniket chose the Relay style for the whole site and every film (see
`relay-direction.md`, section 3). So these films do **not** use the Dusk hills:

- Open on the black dot grid with one saffron glow. The stakes line appears as a
  heading with one italic serif word.
- The app window arrives out of focus in a tilted glass frame, settles flat, and the
  camera pushes in with a saffron-edged spotlight. Captions in Inter with a mono step
  counter ("03 / 06").
- **Every pixel inside the window is the real captured screen.** The film only adds
  the camera, pointer, spotlight, captions and the "what it did" chips.
- **A fixed mono tag on every frame:** "Recorded test run · dummy data".
- **"What it did" chips:** small glass flow chips joined by a saffron wire slide in
  beside the chat when the assistant really did something in the recorded run, e.g.
  "Calendar · free times checked", "Calendar · booked", "Sheet · logged",
  "Team · flagged".
- End card: the serif-word heading and the saffron button, same as the site.

## The story shape (from the saved story-loop idea)

Each film runs stakes → big question → headfake → rehook, using the steps we
already captured. Captions in plain words, no em dashes, no tool jargon.

### 1. Appointment Desk (6 steps, about 38 s)

- **Stakes (title card):** "Every missed message is a missed booking."
- **Big question:** can a front desk answer, book and stay safe, at any hour?

| # | Screen | Caption | Tag | Hold |
|---|---|---|---|---|
| 1 | 01 | Ready at any hour, even at 11 pm | | normal |
| 2 | 02 | Fees and timings, straight from the clinic's own list | FAQ · answered | normal |
| 3 | 03 | Asks to book: it checks the calendar and offers real free times | Calendar · free times checked | normal |
| 4 | 04 | Picks 10:00, gives a name: booked and logged | Calendar · booked, Sheet · logged | normal |
| 5 | 05 | **Headfake:** a medical question. It doesn't guess. It hands it to a person | Team · flagged | long |
| 6 | 06 | An emergency gets a fixed safety reply. No AI involved | Team · flagged urgent | longest |

- **Rehook (end card):** "It knows when not to answer." then the usual call to action.

### 2. Practice Knowledge Assistant (7 steps, about 43 s)

- **Stakes:** "The answers are written down somewhere. Nobody can find them."
- **Big question:** can staff and patients just ask?

| # | Screen | Caption | Tag | Hold |
|---|---|---|---|---|
| 1 | 01 | Ask anything. Answers come only from the clinic's own documents | | normal |
| 2 | 02 | A policy question, answered, with the document named | Source · named | normal |
| 3 | 03 | Prices come from the price list, not from memory | Price list · read | normal |
| 4 | 04 | A pack of five, worked out properly: ₹4,050 | | normal |
| 5 | 05 | **Headfake:** not in the documents? It says "I don't know" | | long |
| 6 | 06 | No medical advice. It points to a physiotherapist | | normal |
| 7 | 07 | Told to change the clinic's records, it refuses | | normal |

- **Rehook:** "An assistant you can trust says 'I don't know'."

### 3. Website Answer Widget (6 steps, about 38 s)

- **Stakes:** "Visitors ask at midnight. The contact form answers on Monday."
- **Big question:** what if the website answered?

| # | Screen | Caption | Tag | Hold |
|---|---|---|---|---|
| 1 | 01 | A visitor lands on the clinic's site. The answer bubble waits in the corner | | normal |
| 2 | 02 | Saturday hours? Answered, with the source | Source · named | normal |
| 3 | 03 | Prices from the clinic's own list | Price list · read | normal |
| 4 | 04 | **Headfake:** it doesn't know, so it doesn't guess. It offers a callback | | long |
| 5 | 05 | A name and number (dummy details) | | normal |
| 6 | 06 | The front desk gets the question. The visitor gets a clear thank-you | Sheet · callback saved | long |

- **Rehook:** "No question ends in a dead end."

(The ₹4,050 and "11 pm" details come from the recorded runs and the brand explainer.
The builder checks each against `n8n/demos/<slug>/test-log.md` and drops anything
not in the log.)

## Timing

Current film beats: 3.5 s opening, 4.8 s per step, 5.7 s ending. Proposed: "long" is
6.5 s, "longest" is 8 s, so the safety moments land. The title card with the stakes
line sits in the opening.

## Rules the builder follows

- Plain words, no em dashes, no "n8n", "model", "API" or "workflow" in any caption.
  (Today's saved captions say "no model involved"; that becomes "No AI involved".)
- No invented numbers or results. Demo, dummy data, made-up clinic: labelled on
  every frame and in the page captions.
- Render with the existing script (`scripts/render-videos.sh <slug>`); even pixel
  sizes; about 6 MB per film at most.
- Frames checked by eye before commit. No push, no merge, no deploy.

## Decisions for Aniket

1. ~~Dusk or Stage look~~: **Stage (Relay style)**, decided 2026-10-01.
2. ~~"What it did" tags~~: **yes**, part of the Relay style.
3. OK with the **stakes lines and rehook lines** above, or change any?
