# October 2026: close 4 clients, mostly international

Written 2026-09-27. Standalone: it does not rely on the older notes in
`docs/growth/`, which Aniket considers assumption-based. Facts used here come
only from the live site and the shipped work (the projects, films and counts
on the portfolio).

Working rules: real accounts under your own name, no fake reviews or bought
engagement, and nothing sent automatically on cold channels (you press send).

Not committed on purpose: the portfolio repo is **public**, and this file
holds pricing strategy and outreach scripts.

---

## 0. The honest maths

Four closes in one month from a standing start is aggressive but doable,
**if** the daily volume below actually happens and there is a small entry
offer that a stranger can say yes to quickly.

**Every rate in this section is a starting estimate, not data.** Replace them
with your own numbers after week 2 (the scoreboard in section 6 is where they
come from), and re-plan from those.

Assuming about a 25% close rate on qualified calls, 4 clients needs about
**16 sales calls** in October. Where they might come from:

| Channel | Volume in October | Expected calls | Expected closes |
|---|---|---|---|
| Cold email (personalised, Prospector-built lists) | ~400 sends | 6–8 | 1–2 |
| LinkedIn (connections + DMs to people who accept) | ~300 requests | 3–4 | 1 |
| Upwork + Contra (already-buying clients) | ~40 proposals | 4–5 interviews | 1–2 |
| Communities (HN, Reddit, n8n forum) | daily scanning | 2–3 | 0–1 |
| Warm network + agency partners | ~40 messages | 2–3 | 1 |
| **Total** | | **17–23** | **4–6** |

Channels that will **not** close anything in October, but build Nov–Jan
pipeline, and so get small daily doses only: Quora, LinkedIn posts, GitHub
and n8n templates, SEO.

**The one rule:** replies and follow-ups first, every day. A reply answered in
10 minutes closes; the same reply answered tomorrow goes cold.

---

## 1. Decisions to make this weekend (before 1 October)

### 1a. International pricing (USD), fixed price, half up front

Recommendation, pitched well below a US agency and well above Indian local
rates, with fixed prices that remove the "offshore risk" objection:

| Offer | Price | Live in | What it is |
|---|---|---|---|
| **Automation Quick-Win** (new entry offer) | **$490** | 5 days | One workflow end to end, e.g. web form → CRM → instant reply → team alert. The "yes" that gets you in the door. |
| **Ops Automation Sprint** | $1,500–2,500 | 2 weeks | 3–5 automations on the tools they already pay for |
| **AI Assistant Build** | $2,500–4,500 | 3 weeks | Assistant on their own documents, human-approved replies |
| **Internal Tool / Dashboard** | $4,000–8,000 | 3–4 weeks | Replaces the spreadsheet |
| **Care Plan** | $250–500 / month | ongoing | Monitoring, 24-hour fixes, small monthly changes |

A realistic October mix is **2 Quick-Wins + 2 Sprints ≈ $4,000–6,000**. Every
Quick-Win should end with a Sprint proposal.

Risk reversal to put in every proposal: *"If it isn't live by the date in
writing, you don't pay the second half."*

India stays on the existing INR packages. Don't lead with India, but don't
turn Indian leads away.

### 1b. Two outreach lanes (one lane per message, never both)

- **Lane A: appointment-based businesses** in the US, UK, Australia, UAE and
  Singapore: therapy and wellness clinics, physio, dental, med-spa, yoga and
  pilates studios. They run on Calendly, Jane, Mindbody or SimplePractice and
  still do intake, reminders, no-show follow-up and reviews by hand. Your
  live clinic system is the proof.
- **Lane B: small agencies and consultancies** (5–30 people): client
  onboarding, reporting, lead handling. They buy online, fast, in English and
  async, and they are all over LinkedIn and Upwork.

Skip cold email to Canada (CASL) and to consumers anywhere.

### 1c. Trust basics international buyers check (about $20 total)

| Item | Why | Cost |
|---|---|---|
| Domain (e.g. `aniket.systems` or `aniketbuilds.com`) | a vercel.app link and Gmail read as hobbyist | ~$12/yr |
| Branded inbox (Zoho Mail free, or Google Workspace) | replies from `you@yourdomain` | $0–7/mo |
| **Cal.com** "15-min intro call" link | international buyers book calendar slots; they rarely WhatsApp a stranger | free |
| **Wise Business** (USD account) + Stripe or PayPal for card payers | get paid in USD cheaply | free to open |
| GST **LUT** filed (export of services without IGST) and FIRA per payment | stay clean as an exporter of services | free |
| Real headshot + surname on site and LinkedIn | faces close deals | — |

### 1d. Site changes (Claude builds, same day, once 1c exists)

1. USD prices for international visitors (a small toggle, INR for India).
2. "Book a 15-min call" (Cal.com) as the primary button, WhatsApp second.
3. LinkedIn link in the footer (currently empty), headshot on About.
4. Point the new domain at Vercel.

---

## 2. Platform setup (28 Sept – 4 Oct)

### LinkedIn: the main international channel

**Profile (Mon 28 Sept)**
- **Headline:** `I build the automations and internal tools service businesses run on | n8n · AI assistants · web apps | 5 systems shipped solo`
- **Banner:** the dusk ridge art with one line: *"Your tools, wired into one system that runs itself."* (Claude can render it.)
- **About**, five short paragraphs: the problem you fix, the clinic system as proof (1,200+ client records, 11 therapists, row counts), what you build, how you work (fixed scope, fixed price, live date), and CTA with the Cal.com link.
- **Featured:** (1) the vertical one-minute explainer, uploaded natively; (2) portfolio with the product tour; (3) one case study.
- **Services section** on: Automation, Web Development, AI.
- **Recommendations:** ask 3–5 people who have seen your work.
- **Sales Navigator free trial (1 month): start it on 1 Oct** and cancel before
  it bills. Filters: owner or founder; clinics, wellness or agencies; 1–50
  employees; US, UK, AU or UAE; "posted in the last 30 days".

**Daily:** 15 personalised connection requests (keep under ~100 a week), a DM
to everyone who accepted, and 2 thoughtful comments on posts by ICP owners.

**Weekly posts (3):**
- **Mon, build breakdown:** a 30–60 s clip from one of your films, plus "the problem → what I built → the result".
- **Wed, teardown:** "How I'd automate intake for a physio clinic in 4 steps."
- **Fri, proof or lesson:** e.g. "The AI note-taker that refused to invent a patient."

**No automation tools on LinkedIn.** They get accounts restricted.

### Upwork: the fastest route to a first international review

- **Title:** `n8n & AI Automation Expert | Workflows, AI Assistants, Internal Tools`
- **Overview:** the first two lines matter most (they show in search). Lead with a result, not "Hi, I'm Aniket".
- **Specialized profiles:** (1) Workflow Automation (n8n, Make, Zapier); (2) AI Assistant / Chatbot; (3) Web App Development.
- **Portfolio:** five items, each with the matching film or explainer and a one-line outcome.
- **Project Catalog:** three listings: Quick-Win $490 · Sprint $1,500 · AI Assistant $2,500.
- **Hourly rate:** $45–60, to anchor. Sell fixed-price.
- **Job filters:** payment verified, $1k+ spent, fewer than 10 proposals, posted in the last 24 hours. Keywords: n8n, Make.com, Zapier, "automation", "AI agent", "CRM integration", "GoHighLevel", "Airtable".
- **Two proposals a day**, each opening with their problem in one line, one specific idea, and a link to the closest film. Budget roughly $30–50 for Connects in October.
- **First job:** take a good small fixed-price job to earn the first 5-star review. Reviews compound.

### Contra (commission-free, US startup buyers)
Profile plus the same three services. Two proposals a week. Share your Contra
link in communities where Upwork links look odd.

### Hacker News: first weekday of every month
- **Thu 1 Oct:** post in **"Ask HN: Who wants to be hired? (October 2026)"**, in the thread's format: location (India, remote), remote yes, willing to relocate no, technologies, résumé (the portfolio link), email.
- In **"Ask HN: Who is hiring?"**, reply only to companies that mention contract work or automation.

### Reddit: value first, then [For Hire]
- If the account is new, it is **warm-up only** until mid-October: helpful comments in r/n8n, r/automation, r/smallbusiness, r/Entrepreneur, r/SaaS and r/startups. Many subreddits block new or low-karma accounts.
- **Week 2:** one value post in r/n8n, e.g. "How I stopped WhatsApp reminders double-sending (with the workflow)".
- **From week 3:** a weekly **[For Hire]** post in r/forhire in its required format, and replies to genuine buyer posts. Search for "[Hiring] automation", "looking for n8n", "need a Zapier expert".
- Use the weekly self-promotion threads in r/startups and r/SaaS.
- **Never** DM-blast or post links in comments where a subreddit's rules forbid it.

### GitHub: turns technical buyers into believers (Claude can do all of it)
- **Publish Signet, Relay and Prospector** as public repos: MIT licence, a README with a GIF from each card loop, a "Try it" section, and a "Built by Aniket, available for projects" footer linking the portfolio.
- **Profile README:** the dusk banner, "I build systems that run businesses", three pinned demos, "Available for 2 builds a month", and links.
- **`n8n-workflows` repo:** five importable templates. Start with the lead-intake workflow already in `/n8n`, then booking reminder, review request, invoice chaser and weekly report.
- **Repo topics:** n8n, automation, crm, e-signature, lead-generation.

### n8n: where people who already want automation hang out
- **Forum profile.** Answer 3 questions a week, and watch the jobs / "hire a freelancer" posts.
- **Submit your templates to the n8n template library** (Creator Hub). Each template carries your profile, so this is long-tail inbound from n8n users worldwide.
- Look at the n8n Expert/Partner programme requirements; apply once you have 2–3 client projects.

### Quora: slow, compounding (15 min a day, 3 answers a week)
- **Credential:** "Builds automation and AI systems for service businesses (n8n, AI assistants)".
- **Topics:** n8n, Zapier alternatives, clinic management software, WhatsApp automation, small-business automation, client onboarding.
- **Answer shape:** direct answer, 3–5 concrete steps, one screenshot, then one link where it genuinely helps.
- Set up one Quora Space: "Automation for service businesses".
- **Expect:** nothing in October, trickle from November. That's why it gets 15 minutes a day, not an hour.

### Warm network and partners: the most underused channel
- **30 people** who know your work (clinic colleagues, friends running businesses, ex-classmates abroad). Ask for an introduction, not work: "Who do you know drowning in admin?" The vertical explainer is the thing to forward.
- **10 web or marketing agencies a week** (UK, US, AU, UAE): offer white-label automation at a partner rate. They already have clients asking for "AI stuff".

### Optional (only if the core is on track)
- X/Twitter build-in-public clips.
- A Product Hunt launch of Signet as open source (week 4).
- Clutch and GoodFirms wait until you have reviews.
- Toptal, Arc and Fiverr: skip for October.

---

## 3. The cold outbound engine

1. **Lists.** Run **Prospector**, your own tool, on clinic and agency websites
   found via Google Maps and directories. It scores each lead by
   reachability. Build about 30 new qualified leads a day into one tracking
   sheet (columns: name, company, lane, country, source, channel, date sent,
   status, next follow-up, notes).
2. **Deliverability.**
   - **Weeks 1–2:** send 20–30 a day **by hand** from the branded inbox.
   - **In parallel:** warm a second sending domain (e.g. `try-aniket.com`) for about 2 weeks, with a warm-up tool (Instantly or Smartlead, ~$37/mo) or manually.
   - **Weeks 3–4:** scale to 40–60 a day across two inboxes.
   - **Every email:** an opt-out line and a postal address (CAN-SPAM).
3. **Sequence:** three short, plain-text emails.
   - **Day 0:** first line about *their* business, one specific automation idea, the 30-second explainer link, "worth 15 minutes?"
   - **Day 3:** a different angle (the product tour link), one question.
   - **Day 7:** break-up email: "Should I close the file?"
4. **Top 20 prospects a week** also get a 60-second personal screen
   recording: their website, and what you would automate. This gets the
   highest reply rate of anything here.

---

## 4. From reply to paid

- **Booking:** every positive reply gets the Cal.com link within 10 minutes. Call windows (IST):
  - UK 13:30–22:30
  - US East 18:30–22:30
  - Australia 04:30–13:30
  - UAE 10:30–19:30
- **The call** (15–20 min):
  1. Their week: where do hours leak?
  2. What have they tried?
  3. Replay the one process they named, in your words.
  4. The fix, in three steps, with a matching film.
  5. Price band and the live date.
  6. "Shall I send a one-page proposal today?"
- **Proposal same day:** one page with problem, scope (in and out), timeline, fixed price, 50% up front, risk reversal and next step. Follow up at 48 hours and 5 days.
- **Close:** a Wise or Stripe invoice for 50%. The start date is the scarcity (2 build slots a month is true, so say it).
- **After delivery:** ask for a testimonial, a case-study permission and two introductions, and offer the Care Plan.

---

## 5. The calendar

**Daily block, about 3.5 hours on weekdays:**

| Time | What |
|---|---|
| 30 min | Replies and follow-ups first, always |
| 60 min | 20 personalised cold emails |
| 30 min | LinkedIn: 15 requests, DMs to accepts, 2 comments |
| 30 min | Upwork: 2 proposals |
| 20 min | Communities: 1 Reddit or n8n answer, scan for buyer posts |
| 15 min | Quora (3 days a week) or the LinkedIn post (3 days a week) |
| 10 min | Log everything in the tracking sheet |

Calls go in the evening (US and UK windows). Saturday: 3 hours on content and
next week's lead list. Sunday: a 30-minute scoreboard review.

| Week | Dates | Focus | Targets |
|---|---|---|---|
| 0 | 28–30 Sep | Decisions 1a–1c; LinkedIn, Upwork and Contra profiles live; Cal.com, domain and inbox; Claude ships the site changes, GitHub publishing and the banner | Everything set up |
| 1 | 1–4 Oct | HN "Who wants to be hired" (Thu 1 Oct); Sales Navigator trial on; first 60 cold emails; 8 Upwork proposals; warm-network messages (all 30) | 3 calls booked |
| 2 | 5–11 Oct | Full daily block; sending domain warming; first LinkedIn posts; n8n value post | 100 emails · 75 LI requests · 10 proposals · **4 calls · first proposal out** |
| 3 | 12–18 Oct | Scale email to 40/day; r/forhire; 10 agency partner emails; first templates to n8n | 150 emails · 10 proposals · **5 calls · close #1–2** |
| 4 | 19–25 Oct | Same volume; follow-ups on every open proposal; ship Quick-Wins fast and upsell | **5 calls · close #3** |
| 5 | 26–31 Oct | Push every open proposal to a decision; ask the first clients for referrals | **close #4** |

---

## 6. Scoreboard and kill rules (review every Sunday)

**Track weekly:** touches sent · replies · calls booked · calls held ·
proposals · closes · $ closed · by channel.

- **Cold email** below 2% reply after 150 sends: rewrite the first line and the offer, not the volume.
- **Upwork:** zero interviews after 25 proposals means a new title and first two overview lines, and apply earlier (under 1 hour after posting).
- **LinkedIn** acceptance below 25%: sharpen the headline and the note.
- **Calls** that end without a proposal twice in a row: tighten the call script.
- **Behind at mid-month:** don't rebuild anything. Double the warm-network and agency-partner outreach; they convert fastest.

---

## 7. Scripts

**LinkedIn connection note (under 200 characters)**
> Hi {Name}, I build automations for {clinics / agencies} (booking,
> intake, follow-ups). Enjoyed your post on {topic}. Would be glad to
> connect.

**LinkedIn DM after they accept**
> Thanks for connecting, {Name}. Quick one: at {Company}, what's the one
> admin task your team still does by hand every week? I built the system
> an 11-therapist clinic now runs its day on, so I'm collecting where
> it hurts most. (No pitch unless you ask.)

**Cold email, day 0**
> Subject: {Company}'s intake
>
> Hi {Name},
>
> {One true line about their site or business}. Noticed new enquiries
> go through {a form / email / WhatsApp} and then presumably get re-typed
> into {Calendly / Jane / a sheet}.
>
> I build that handoff so it runs itself: the enquiry lands in your CRM,
> the client gets an instant reply, the right person is pinged, and a
> reminder goes out before the appointment. 30-second example: {link to
> the Ops Sprint explainer}
>
> Worth a 15-minute call to see if it fits {Company}?
>
> Aniket
> {Portfolio} · {Cal.com}
> (Not relevant? Reply "no" and I won't email again.) {Postal address}

**Upwork proposal opener**
> You need {their outcome in their words}. I've built exactly this kind of
> flow on n8n: {one-line match}. Here's a 30-second film of it working:
> {link}. For your case I'd {3-step plan}. Fixed price ${X}, live in {N}
> days. One question first: {sharp question about their setup}.

**r/forhire post title**
> [For Hire] n8n & AI automation for service businesses: workflows, AI
> assistants, internal tools. Fixed price from $490, live in days.

**HN "Who wants to be hired" entry**
> Location: India · Remote: Yes · Willing to relocate: No
> Technologies: n8n, TypeScript, React, Next.js, Node, Postgres, Claude/Gemini APIs
> Résumé/portfolio: {domain}
> Email: {branded email}
> I build complete production systems solo: automations, AI assistants
> and internal tools for service businesses. Two platforms in daily use;
> real product films on the site.

---

## 8. What Claude can do for you now

| Task | Needs from you |
|---|---|
| USD pricing toggle, Cal.com CTA, LinkedIn link, headshot on the site | Cal.com link, LinkedIn URL, headshot, the prices you pick |
| Publish Signet, Relay and Prospector to GitHub with READMEs, GIFs and licences, plus your profile README | Your OK to make them public |
| `n8n-workflows` repo with 5 templates, ready for the n8n library | Your OK |
| LinkedIn banner, Upwork portfolio covers, a LinkedIn clip set from the films | none |
| First Prospector lead batch: 50 clinics or agencies in one city | The city and lane |
| Personalised first lines for each week's lead list | The sheet |
