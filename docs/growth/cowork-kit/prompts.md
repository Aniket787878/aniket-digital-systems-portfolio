# Cowork task prompts

Paste each block into a new Cowork task. Scheduled ones: set the schedule shown,
run once by hand, then click **Schedule**. Fill **My context** once and paste
it at the top of every prompt (or save it as a Cowork project instruction if
your plan has projects, so every task inherits it).

---

## My context (paste at the top of every task)

```
ABOUT ME
I'm Aniket, a solo builder in India. I set up WhatsApp booking, automatic
appointment reminders, digital intake/consent forms, AI assistants and small
internal tools for appointment-based businesses (clinics, physio, dental,
therapy, salons, studios, coaching). Proof: a booking + WhatsApp reminder +
consent-form system I built runs a real clinic with 11 therapists every day.
I also built a full online recovery-care platform, an e-signature tool, a
shared-inbox CRM and a lead-research scraper.

OFFERS
- No-Show Fix: WhatsApp confirmations + 24h/1h reminders — ₹15–25k, 7 days
- Clinic Autopilot: booking + reminders + intake/consent forms + daily digest — ₹40–60k, 14 days
- WhatsApp/website AI assistant: FAQs, pricing, bookings, human handoff — ₹25–50k, 10 days
- Care Plan: ₹5–10k/month
First 3 clients get these prices in exchange for a testimonial + case study.

LINKS
Portfolio: <PORTFOLIO_URL>
90-second demo: <DEMO_VIDEO_URL>
Book a free 20-min audit: <BOOKING_URL>
WhatsApp: <WHATSAPP_NUMBER>

TARGET
Cities: <CITY_1>, <CITY_2>   (plus remote/international buyers online)

TRACKER
Google Sheet "Client Pipeline" (tab "Client Pipeline"), columns as in row 1.
status values: new → ready → contacted → followup_1 → followup_2 → followup_3
→ replied → call_booked → proposal_sent → won | lost | not_now

HARD RULES
- Never send, post or publish anything. Only research, write drafts, and
  update the tracker. Gmail: create drafts only, labelled "pipeline".
- Never invent facts about a business or person. If unsure, leave it out.
- No emojis, no hype words (revolutionise, seamless, leverage, game-changer,
  unlock). Write like one busy person to another.
- Skip anyone already in the tracker (match on link, email, phone or name).
- Don't mention my employer or any client by name.
```

---

## T1 · Buyer Hunt — daily 07:30

```
Find people who are asking for help right now with something I sell, and
draft a genuinely helpful reply for each.

Search the last 72 hours on:
- Reddit: r/n8n, r/forhire, r/automation, r/AI_Agents, r/smallbusiness,
  r/Entrepreneur, r/IndianStartups, r/indianbusiness, r/privatepractice,
  r/physicaltherapy, r/dentistry, r/salons, r/sweatystartup
- community.n8n.io Jobs category
- Quora questions
- Public LinkedIn posts
Search for phrases like: "looking to hire" automation, "need someone"
WhatsApp bot, "no-shows", "appointment reminders", "booking system" clinic,
"n8n developer", "automate WhatsApp", "manual follow-up", "spreadsheet"
bookings, "chatbot for my business".

Keep only posts where a real person or business has a real need I can meet
(skip other freelancers advertising, courses, spam, anything older than
7 days). Up to 10.

For each one:
1. Score 0–100: clear need (40), budget/paid signal (20), fits my offers (20),
   recent (10), reachable (10).
2. Draft a PUBLIC reply (4–7 sentences) that actually helps: answer their
   question or give the 2–3 concrete steps I'd take, mention I've built this
   for a clinic in one line, no link unless the post asks for recommendations
   or a freelancer. Follow that subreddit's self-promotion rules.
3. Draft a short DM (2–3 sentences) to send only after the public reply,
   offering the 60-sec demo link.

Add each to the tracker: type = "buyer", found_on = platform, link, the
post's key sentence in post_or_signal, score, pain, opener = the public reply
+ "---" + the DM, status = ready.

Finish with a list ranked by score: title, link, why it's a fit, and the two
drafts ready to copy.
```

## T2 · Local Prospects — daily 07:45 (Mon–Sat)

```
Find 15 appointment-based businesses in my target cities that are likely to
lose bookings to phone/WhatsApp back-and-forth, and write each a personal
first message.

Rotate categories by weekday: Mon physiotherapy · Tue dental · Wed
psychologists/therapy/counselling · Thu dermatology/skin clinics · Fri salons
& spas · Sat fitness/yoga studios & coaching institutes.

Sources: Google Maps listings, Justdial, Practo, their own website and
Instagram. Prefer businesses with 2+ practitioners, 50+ reviews, an active
Instagram, and bookings by "call/WhatsApp us" rather than an online booking
link. Skip chains and hospitals.

For each business, visit its website/Instagram and note one specific, true
detail (a service, a recent post, a review theme like "hard to get through on
the phone"). Then:
- score 0–100: no online booking (30), books via WhatsApp/phone (20),
  multiple practitioners (15), reviews mention waiting/booking/reminders (15),
  has email (10), active Instagram (10)
- WhatsApp/DM opener: max 3 short sentences — the specific detail, one likely
  pain in plain words, the 11-therapist clinic proof, end with a soft
  question. No link in the first message.
- Email: subject ≤ 6 words; body 60–90 words, includes the demo link once,
  signed Aniket.

Add each to the tracker (type = "local", status = ready) with phone, email,
instagram, link, pain, score, and opener = WhatsApp text + "---" + email
subject + "---" + email body.

Finish with a table: business, city, score, the one specific detail you used.
```

## T3 · Morning Brief — daily 08:00 (Mon–Sat)

```
Build my outreach brief for today from the tracker.

Sections, in this order:
1. HOT — status replied / call_booked / proposal_sent where next_touch is
   today or earlier or blank: who, what they said last (check Gmail for the
   latest message from them), and a suggested reply.
2. FOLLOW-UPS DUE — status contacted / followup_1 / followup_2 with
   next_touch today or earlier. Write the next follow-up for each:
   contacted → friendly bump + demo link;
   followup_1 → one question about their no-shows/cancellations per week;
   followup_2 → polite last note + free 20-min audit link.
   Leads whose followup_3 is due: list them to park as not_now.
3. NEW — the 20 highest-score "ready" rows (mix buyers and local).

For every WhatsApp lead give a tap-to-open link:
https://wa.me/<digits with 91 country code>?text=<URL-encoded message>
For every email lead create a Gmail DRAFT (label "pipeline") with the
subject and body — don't send.

Output one clean page I can work through on my phone, top to bottom, with a
checkbox per person. End with: "Reply 'sent: <names>' and I'll update the
tracker."
```

When you reply "sent: …" in that task, Cowork updates those rows:
status → next stage, touches +1, last_touch = today, next_touch = today +3 / +4 / +7 / +60 days.

## T4 · Replies & Follow-ups — daily 18:00

```
Check my Gmail (label "pipeline" and inbox) for replies from anyone in the
tracker in the last 24 hours, and check the tracker for follow-ups due
tomorrow.

For each reply:
- set status = replied, replied_on = today, add a one-line summary to notes
- classify: interested / question / not now / not interested / out of office
- draft a reply in Gmail (don't send): answer their question in plain words
  and offer the free 20-minute audit with my booking link. "Not interested"
  → a two-line gracious close, set status = lost. "Not now" → status =
  not_now, next_touch = today + 60 days.

For email-channel leads with next_touch tomorrow and no reply, create the
next follow-up as a Gmail draft (same sequence as the Morning Brief) and add
the line: If this isn't relevant, just reply "no" and I won't email again.

Output: replies found (who, what they said, the drafted answer), drafts
created, and anything that needs me personally tonight.
```

## T5 · Content Engine — Monday 08:30

```
Write this week's content from real work, not generic tips.

Look at the tracker (what prospects keep saying in replies and posts) and
my portfolio site to pick topics. Produce:
1. Three LinkedIn/Instagram posts (Mon/Wed/Fri). Each: a hook from a real
   pain ("Still calling every patient the night before?"), a 5–8 line story
   of how the system works, one number only if it's real, a soft CTA
   ("comment 'demo' and I'll send the 60-second video"). Include the shot
   list for a 15–30 second screen recording to go with it.
2. One Reddit value post for r/n8n or r/automation: "How I built X" with the
   steps, pitfalls, and what I'd do differently. No selling; one line about
   what I do at the end only if the sub allows it.
3. Two Quora questions (with links) that are getting views and match my
   offers, plus a draft answer for each (250–400 words, practical steps, one
   line about my work).
Save everything into a Google Doc called "Content – week of <date>".
```

## T6 · Sunday Scoreboard — Sunday 18:00

```
Review my pipeline for the last 7 days from the tracker.

Report: messages sent (touches added), first contacts, replies and reply
rate, calls booked, proposals, won and ₹, replies by channel (found_on) and
by category, leads going cold (hot status, no touch for 7+ days), ready
queue size.

Diagnose using these rules: under 100 touches → volume is the problem;
reply rate under 3% → rewrite openers (show me 2 new versions based on the
replies that worked); calls but no closes → offer/price problem; one
channel producing most replies → move time there next week.

Append the numbers as a row in the "Scoreboard" tab. End with exactly three
actions for next week.
```

---

## On-demand tasks (run when needed)

### Call prep — before any audit call
```
I have a 20-minute audit call with <NAME / BUSINESS / LINK> at <TIME>.
Research the business (site, Maps reviews, Instagram, tracker notes, our
email thread). Give me: how they take bookings today, likely pains, an
estimate of monthly revenue lost to no-shows (state assumptions: sessions
per week, no-show rate 10–20%, average session price), which offer fits,
5 questions to ask, and the one demo moment to show. One page.
```

### Proposal — after a good call
```
Write a one-page proposal for <BUSINESS> from these call notes: <NOTES>.
Sections: what you told me (their words), what I'll build (3–5 bullets,
plain language), what you'll need to give me, timeline with a go-live date,
fixed price and 50/50 payment terms, what's not included, and next step.
Friendly, confident, no jargon. Save as a Google Doc and create a Gmail
draft to them with it attached/linked.
```

### Case study — after each go-live
```
Turn these notes into a case study for my portfolio: <NOTES + NUMBERS>.
Structure: the business (anonymised if asked), before, what I built,
after (only real numbers), their quote, what's under the hood (short).
Also write a 5-line LinkedIn post and a 3-sentence version for DMs.
```

### Reply to a specific post
```
Here's a post: <LINK>. Draft a public reply that genuinely helps first and
a follow-up DM, following that community's rules on self-promotion.
```
