# Council verdict: which audit fixes are real (2 Oct 2026)

Five advisors (Contrarian, First Principles, Expansionist, Outsider, Executor), each reviewing as a site/UX designer from the live screenshots. Then five anonymous peer reviews. The main session chaired. The full transcript is in `council-transcript-2026-10-02.md`.

## Where the council agrees (5 of 5)
- **Keep the vision.** The dark Stage look, the story loop and the WhatsApp-first CTA all read as intentional and well made. "It looks like a studio built it, not a freelancer."
- **Keep WhatsApp as the main CTA (P1-2: LEAVE).** It is the channel the outreach arrives on. A booking link is already planned: `site.bookingUrl` is waiting on Aniket's Cal.com link.
- **Fix now, no effect on the vision:**
  - the contrast token (P1-4);
  - the "aprice" heading bug (P2-5);
  - the tool chips on /projects (P1-3), which sit right under "11 therapists on one system" and undercut the strongest stat on the page;
  - small tap targets (P2-9);
  - unreadable text in the hero flow (P2-8).
- **Home length (P1-1) is a sequencing problem, not a length problem.** Keep the story. Show the price sooner, and make the cards lighter.

## Where the council clashes
- **How bad P1-1 is.** The Contrarian said visitors are warm (they come from outreach), so length matters less. The Outsider said: "If I hadn't been sent this link by someone I trust, I leave at screen 4." The chair sides with the Outsider. A warm link still opens on a phone between appointments.
- **Desktop nav duplicate (P3-11).** First Principles: merge. The others: leave. **Leave it**, since it's desktop only and costs a phone visitor nothing.

## Corrections (verified by the chair)
- **The first price on home is at screen ~12 of 19 on a phone.** The audit said 14. One advisor said 6–7, which was a misread.
- **P2-6 was wrong.** The contact budget options already switch to USD (`budgetBands[currency]`). Withdrawn.
- **P3-10 (repeated card notes) stays.** Repo rule: "every outcome number renders with its outcomeNote."
- **The footer is not a dead end.** It already has a WhatsApp button.
- **Reduced motion is already respected** site-wide (`MotionConfig reducedMotion="user"`, StringTune off).

## Blind spots the peer review caught
- **No CTA on screen while scrolling on phones.** Desktop has "Let's talk" in the floating nav, but phones only get the logo and a menu button through 19 screens.
- **P1-1 and P2-7 touch the same home files**, so they go to one builder.
- **Measure the change.** Record time-to-first-price before and after.
- The contact page's WhatsApp prefill asks "Do you have 20 minutes?" while every other page offers a 15-minute call.

## The recommendation: what gets fixed
1. **Contrast:** saffron pill text on cream goes to #a04a08 (4.99 : 1).
2. **Split headings:** no lost spaces at any width.
3. **/projects:** remove the tool chips from the cards. Tool names live in the closed developer panel.
4. **Phone tap targets:** at least 44 px hit area with no visual change.
5. **Phone header:** a compact saffron "Let's talk" (WhatsApp) beside the menu, matching desktop.
6. **Home hero:** the reassurance line gets a price anchor, e.g. "from ₹20,000 · free 15-minute call", and follows the currency toggle.
7. **Home work cards on phones:** fewer bullets per card. The outcome note stays and must still match what's shown. Target: first price by screen 8 or sooner.
8. **Hero flow on phones:** text that carries meaning at 13 px or more. The "Booked" moment is the brightest line.
9. **Desktop story beats:** text sharp early in each beat, less dead scroll. Keep the beats.
10. **Contact prefill:** "20 minutes" becomes "15 minutes".

**Left alone on purpose:** the WhatsApp CTA, the dark look, the story loop, the outcome notes, the desktop nav, concept-site labelling (already labelled).

## The one thing to do first
Ship 1–5 (pure fixes, zero vision risk). Then 6–9 together, as one pass on the home page.
