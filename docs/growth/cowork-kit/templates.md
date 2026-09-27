# Templates — Reddit, forum, Quora, GitHub, DMs

Edit to your voice. Never paste the same text in two places — communities
notice, and so do spam filters.

---

## r/forhire — [For Hire] post

Check the sub's current title format in its rules first.

**Title:** `[For Hire] WhatsApp booking, reminders & AI assistants for clinics, studios and service businesses — from $200 / fixed price`

```
Hi — I'm Aniket, a solo developer in India.

I build the systems appointment-based businesses run on:
- WhatsApp booking confirmations and 24h/1h reminders (fewer no-shows)
- Online booking synced with Google Calendar
- Digital intake/consent forms that deliver a signed PDF
- WhatsApp or website AI assistants that answer FAQs and book slots
- Small internal dashboards to replace the spreadsheet

Proof: a booking + reminder + consent system I built runs a real clinic
with 11 therapists every day. 60-second demo: <DEMO_URL>
Portfolio: <PORTFOLIO_URL>

Fixed price, written scope, live in 1–2 weeks, you own everything.
DM me what's eating your team's time — I'll tell you honestly whether
automation fixes it.
```

## r/n8n / r/automation — "how I built it" post (value first)

**Title:** `How I built WhatsApp appointment reminders that never double-send (24h + 1h)`

```
Context: a clinic with 11 therapists was calling clients the night before.
Here's the shape of what replaced it:

1. Every 30 min, pull sessions starting in the next 25h and next 70 min.
2. For each, check a "sent" log keyed on (booking id + reminder type) —
   this is what stops double sends when runs overlap.
3. Send an approved WhatsApp template; write the log row only after a
   successful send.
4. Calendar sync every 15 min catches bookings made directly in Google
   Calendar, so reminders cover those too.

Pitfalls: timezones (store UTC, render IST), template approval times,
people with non-Indian numbers, and cancellations that arrive after the
24h reminder.

Happy to answer questions on any step.
```

(Write it from a generic rebuild on your own account — no company workflow
exports, IDs or data.)

## n8n community forum — replying to a Jobs post

```
Hi <name> — this is close to what I build day to day. For <their need>
I'd do it as: <2–3 concrete steps>. I built a similar WhatsApp booking +
reminder flow that runs a clinic with 11 therapists; 60-sec demo: <DEMO_URL>.
Fixed price after a 20-min call to confirm scope — want me to DM you?
```

## Quora answer — "How can a clinic reduce no-shows?"

```
The cheapest fix is almost always automatic reminders — not a new
software suite.

What works in India specifically:
1. Confirm on WhatsApp at the moment of booking (not SMS — people read
   WhatsApp).
2. Send two reminders: 24 hours before (with a one-tap reschedule option)
   and 1 hour before (with the location/meeting link).
3. Make rescheduling easy. People who can't reschedule easily simply don't
   show up.
4. Keep one calendar as the source of truth, so reminders cover bookings
   made by phone, WhatsApp and walk-in.
5. Track it: no-shows per week before vs after.

A clinic I built this for runs 11 therapists on it; the front desk stopped
making night-before calls entirely.

(If you want to see what it looks like on a phone: <DEMO_URL>)
```

## GitHub — profile README (github.com/Aniket787878)

Create a repo named exactly `Aniket787878` with this `README.md`:

```
### Hi, I'm Aniket 👋
I build the software appointment-based businesses run on — WhatsApp
booking & reminders, intake/consent forms, AI assistants and internal
tools. Solo, fixed price, live in 1–2 weeks.

- 🌐 Portfolio & case studies: <PORTFOLIO_URL>
- 🎥 60-second demo: <DEMO_URL>
- 📅 Free 20-min automation audit: <BOOKING_URL>

**Public templates**
- `whatsapp-appointment-reminders` — 24h/1h reminders with no double-sends
- `clinic-booking-starter` — booking page + Google Calendar + WhatsApp confirm
- the consent signer, shared inbox and lead research tool: tools I built and use
```

Pin: the two templates (build them fresh on your own account), the
consent signer, the shared inbox, the lead research tool, and the portfolio repo. Each README: one-line pitch,
demo GIF, live link, features, stack, decisions, how to run. (That's the
useful part of the PDF's README template.)

## WhatsApp / DM openers (local businesses)

```
Hi Dr. <Name> — saw <specific detail>. Quick question: are bookings at
<Clinic> still mostly coming in over calls and WhatsApp? I set up
automatic WhatsApp confirmations and reminders for a clinic with 11
therapists — happy to show you a 60-second demo if useful.
```

```
Hi <Name>, loved <specific post/service>. Most studios I talk to lose a
few sessions a week to people who simply forget. I build automatic
WhatsApp reminders + easy rescheduling — worth a quick look?
```

## Warm-network message

```
Hey <Name>! I've been building booking + WhatsApp reminder systems — the
one I built runs a clinic with 11 therapists. I'm taking 3 businesses
this month at a reduced rate. Know any clinic, studio or salon owner
drowning in WhatsApp bookings? 60-sec demo: <DEMO_URL>
```
