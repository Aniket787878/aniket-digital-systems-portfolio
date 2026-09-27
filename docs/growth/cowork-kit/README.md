# Client Pipeline in Claude Cowork — setup & daily routine

Replaces the n8n version (n8n is the company account — keep personal client
hunting off it). Everything here runs in **Claude Cowork** (Claude Desktop) on
your personal Claude account, with scheduled tasks doing the research and
drafting, and **you** doing the sending.

Files in this folder:

| File | What it is |
|---|---|
| `README.md` | This — setup, daily routine, where clients actually are |
| `prompts.md` | Copy-paste prompts for every scheduled and on-demand Cowork task |
| `templates.md` | Reddit / Quora / GitHub / DM / email templates |
| `tracker-template.csv` | Header row for the pipeline tracker sheet |

---

## 1. One-time setup (≈45 minutes)

1. **Claude Desktop → Cowork**, signed in with your *personal* account.
2. **Connectors:** turn on **Gmail** (search, read, draft) and **Google Drive**.
   Optional: **Claude in Chrome**, so a task can read pages that need you to be
   logged in (LinkedIn, Facebook groups).
3. **Tracker:** in Google Drive create a Google Sheet called
   **`Client Pipeline`** and paste `tracker-template.csv` as the first row.
   Add a second tab called **`Scoreboard`**.
4. **Personal Gmail label:** create a label `pipeline` — tasks put every draft
   under it so nothing mixes with company mail. Use a personal address, not
   the company one.
5. **Proof links** (fill these in `prompts.md` → "My context" before pasting):
   portfolio URL, 90-second demo video, Cal.com / Google Calendar booking link,
   WhatsApp number.
6. **Create the scheduled tasks** from `prompts.md` (Cowork → new task → paste
   → set schedule → Schedule). Run each once by hand first and check it can
   read/write the sheet. If a task can't write to the sheet, tell it to put
   the rows in its output as a table and paste them yourself — same result.

> **Company boundary.** The clinic systems were built for your employer. Show
> *what* you built (anonymised screenshots, a demo on fake data) only with
> their OK, and rebuild any public template on your own accounts from scratch.
> Never copy company workflows, data or credentials into anything public.

---

## 2. The system

```
07:30  T1 Buyer Hunt ........ Reddit · n8n forum · Quora · LinkedIn posts
                              → people asking for help RIGHT NOW → drafted reply + DM
07:45  T2 Local Prospects ... 15 clinics/studios in your city from Maps/Justdial/Practo
                              → researched, scored, personal opener
08:00  T3 Morning Brief ..... one page: hot replies, follow-ups due, today's 20 messages
                              → email openers saved as Gmail drafts
  ▼
09:00–10:00  YOU: send 20 messages by hand (WhatsApp / DM / email drafts), post 1 reply
  ▼
18:00  T4 Reply & Follow-up . scans Gmail for replies → updates tracker → drafts follow-ups
Mon    T5 Content Engine .... 3 posts + 1 Reddit/Quora value post from real work
Sun    T6 Scoreboard ........ numbers → what to change next week
On demand: Call Prep · Proposal · Case Study · Reddit/Quora answer
```

**Rule: Cowork never sends.** It researches, scores, writes and saves drafts.
You read and send. That protects your number, your accounts and your
reputation, and it keeps every message sounding like you.

---

## 3. Where clients actually are (ranked for you right now)

| # | Channel | Why it works for you | Daily time |
|---|---|---|---|
| 1 | **Warm network + clinic referrals** | Highest trust. Therapists know other clinic owners. | 1 week burst |
| 2 | **Local businesses, direct** (WhatsApp/Instagram DM/email) | Your proof is local-appointment-business proof. Nobody else will personalise. | 45 min |
| 3 | **Reddit — people asking for help** | Buyers post pain publicly: r/n8n "looking to hire", r/forhire [Hiring], r/smallbusiness, r/Entrepreneur, r/automation, r/AI_Agents, r/IndianStartups, r/indianbusiness, r/physicaltherapy, r/dentistry, r/salons, r/privatepractice | 20 min |
| 4 | **n8n community forum → Jobs** (community.n8n.io/c/jobs) | People post paid n8n work with budgets. Reply fast with a demo. | 10 min |
| 5 | **Quora answers** | Slow but compounding: "how to reduce no-shows", "WhatsApp appointment reminder", "clinic management software India". Each answer ranks for years. | 2 answers/week |
| 6 | **GitHub** | Not a client marketplace — it's your *credibility* layer. A clean profile + 2–3 public, generic templates gets you found and trusted. | 1 hr/week |
| 7 | **Upwork / Contra** | First reviews. Search "WhatsApp", "appointment", "n8n", "booking". | 20 min |
| 8 | **Facebook/Instagram ads** | Only after #2 converts (≥5 calls, 1 close). | later |

**Reddit etiquette that keeps you from getting banned:** read each sub's rules
first; reply publicly with real help before any DM; one link at most, and only
when asked or clearly useful; post [For Hire] only in subs that allow it
(r/forhire, r/n8n on its allowed days); never paste the same message twice.
T1 drafts replies with this built in.

---

## 4. Your daily hour

| Time | Do |
|---|---|
| 5 min | Read the Morning Brief (T3). |
| 15 min | Hot replies first — anyone who answered gets a reply within the hour. |
| 30 min | Send 20 messages: open the WhatsApp link / DM / Gmail draft, tweak one line, send. Mark each **sent** in the tracker (or tell Cowork "mark these sent"). |
| 10 min | Post 1 helpful Reddit/forum reply from T1. |

Weekly: 1 content post Mon/Wed/Fri (T5), 1 Quora answer, Sunday review (T6).

---

## 5. What to take from the "30-Day Portfolio Plan" PDF

That plan is for freshers with no projects hunting jobs — you're past it. Keep
four of its ideas, pointed at clients instead of recruiters:

- **A 30–60s demo clip on every project card.** Buyers "see it work" in ten
  seconds — the demo clinic video is exactly this.
- **README/case-study structure** → problem, what was built, decisions, result.
  Use it for the case-study page and GitHub templates.
- **Ship before polish, time-box every day** → 20 messages sent beats a perfect
  pipeline.
- **Launch publicly** → post the portfolio + demo on LinkedIn and ask 3 people
  for feedback (and intros).

Skip the rest (to-do apps, weather apps, three new projects). You don't need
more projects; you need more conversations.
