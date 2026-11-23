# Idea: Relay look + story loop (not started)

Saved 2026-10-01. Aniket shared these as ideas. **Do not build until he says go.**

## 1. Story loop (from a reel)

Source: Kallaway (@kallawaymarketing), "How to make your storytelling addictive",
https://www.instagram.com/reel/DaiCxAkOpNb/ (July 8, 2026).
Screenshot: `story-loop-reel.png`, cover: `reel-cover.jpg`.

The "Dopamine Addiction Loop", four steps, repeated:

1. **Stakes**: a character to root for, something at risk, urgency.
2. **Big question**: enough context that a juicy question pops into the reader's head.
3. **Headfake**: set up what the reader expects, then go against it.
4. **Rehook**: restart the loop fast. Good stories have one loop; great ones cascade several.

How it could apply to the portfolio:

- Case studies told as a loop. Stakes (a business losing bookings, staff buried in
  admin), big question (can one system fix it without new hires?), headfake ("it
  wasn't more software, it was fewer steps"), rehook (the result, then straight
  into the next case study).
- A "how I work" feature: a glowing loop graphic with his own four steps
  (e.g. find the leak, map it, automate, measure, repeat).

## 2. Relay look (getlayers.ai template)

Source: https://www.getlayers.ai/templates?layer=relay (full page: /layer/relay).
Screenshot: `relay-hero.png`. It's a premium template, so only the preview image is public.

Their description: a workflow-automation landing page in black and lime where one
stream of light runs the whole length of the site; a lime ring counts the page in
and folds into the logo; a live refund flow runs inside a tilting glass window in
the hero; a plate opens out of the logo and folds back mid-page; every section,
down to a draggable pricing meter, arrives out of focus and settles into place.

Visual traits seen in the hero:

- Near-black ground with a faint dot grid and a soft accent glow behind the hero.
- Headline: bold sans line, then one word in italic serif ("The handoffs run *themselves.*").
- Small monospace labels: a status pill ("all systems normal"), a beta tag, "free for 14 days /".
- Right side: a tilted glass window holding a live automation flow (trigger, condition,
  true/else branches, "waiting on a yes · 26 min", a "last runs" log).
- Pill buttons: solid accent primary, dark outlined secondary with a play icon ("Watch a build, 2 minutes").

## Decisions Aniket already made

- **Accent: keep his saffron**, not Relay's lime (Relay's layout and feel, his colour).
- **Scope: homepage first**, preview link to review, then the other pages.

## Things to remember when building

- This replaces the "Dusk" system (docs/design-system.md), which he approved twice.
  Update that doc and CLAUDE.md when the change lands.
- House rules still hold: plain-language copy, no em dashes, broad service-business
  positioning (clinics as proof, not the market), never invent numbers or testimonials.
- The glass flow window is a natural home for his real n8n flows (e.g. enquiry
  answered, booked, followed up), labelled as a schematic if not a real capture.
- `current-home-hero.png` is the Dusk hero as of 2026-10-01, for before/after.

## 3. Filled with our own projects (plan, 2026-10-01)

No template filler: every part of the Relay-style homepage is filled by work that
already exists. All eight are already on the site (`projects` in `src/data.js`);
their folder names in `/root/projects` are given in brackets.

| On the site | Folder | What it is | Honesty label to keep |
|---|---|---|---|
| Therapist PWA | `mindset-task-manager` (Mindset Workspace) | Staff system an eleven-therapist clinic runs its day on: records, bookings, AI session notes | Client platform: schematic, real screens hold client records |
| Care Journey Platform | `udaan` | 12-week recovery programme: course, live therapy, safety net, one private portal | Client platform: schematic |
| Shared Inbox CRM | `relay` | WhatsApp, email and web enquiries in one shared inbox tied to a simple pipeline | Working demo, channels simulated |
| Consent & Contract Signer | `signet` | Sign on any phone, sealed so nobody can quietly change it, publicly checkable | Working demo |
| Lead Research Tool | `prospector` | Paste a website, get a scored lead; missing details say "Not found" | Working demo, reading is real |
| Appointment Desk | n8n (#42/#43) | Enquiry to booked appointment | Working demo |
| Knowledge Assistant | n8n (#42/#43) | Answers from the business's own documents | Working demo |
| Website Answer Widget | n8n (#43) | Answers visitors on the website | Working demo |

Note: his shared-inbox project is itself called **Relay**. If the site takes the Relay
look, avoid naming confusion (keep "Shared Inbox" on the site, or call the look something else).

### Where each project goes

- **Hero glass window:** the Appointment Desk flow running live
  (enquiry arrives → answered → slot offered → booked → follow-up sent, with a
  "waiting on a yes" step and a "last runs" log). It's the headline promise
  ("Enquiries answered. Bookings confirmed.") shown as a mechanism.
- **Status pill:** "Taking on new projects" (from `site.availability`), in mono.
- **Proof band (big, first):** Therapist PWA and Care Journey, the two real client
  platforms. These are the stakes: real businesses running on them.
- **Working demos row:** Shared Inbox, Consent Signer, Lead Research, using their
  existing real captures and films.
- **AI row:** Appointment Desk, Knowledge Assistant, Website Answer Widget.

### Each project as a story loop (for case-study copy)

Numbers stay out until Aniket supplies real ones.

- **Therapist PWA.** Stakes: eleven therapists, notes and bookings eating into
  session time. Big question: can admin run itself without a new hire? Headfake:
  the fix wasn't another app, it was one place instead of five. Rehook: then the
  clients' side needed the same thing → Care Journey.
- **Care Journey.** Stakes: people in recovery who can't fall through the gaps
  between sessions. Big question: how do you stay with someone all week, not one
  hour? Headfake: not more content, a safety net that's always on. Rehook: every
  client also has to sign consent first → Consent Signer.
- **Consent Signer.** Stakes: a signed form someone could quietly change later.
  Big question: how do you prove it wasn't touched? Headfake: no login needed to
  sign, yet anyone can check it. Rehook: once a client signs, the messages start
  → Shared Inbox.
- **Shared Inbox.** Stakes: leads lost in one person's phone. Big question: who
  replied to whom? Headfake: the inbox and the client list are the same thing.
  Rehook: but first you need people to talk to → Lead Research.
- **Lead Research.** Stakes: hours spent copying contact details by hand. Big
  question: can a list build itself? Headfake: it refuses to guess; "Not found"
  beats a wrong email. Rehook: and when they reply → Appointment Desk (back to the hero).

The last rehook loops back to the hero flow, so the page itself is one loop.
