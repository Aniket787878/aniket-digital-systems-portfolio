# 03 — Client Landing Engine

Cold outbound + LinkedIn/X content, both feeding into the same intake form.

## Weekly target

- **50 personalized cold touches** (email or LinkedIn DM)
- **3 posts** (2 LinkedIn, 1 X thread)
- **Goal:** 2-3 discovery calls booked / week

## Pipeline stages (single source of truth: Airtable or Notion)

| Stage | Definition | Exit criteria |
|-------|------------|---------------|
| Sourced | In target list | Enriched with hook |
| Contacted | First touch sent | Reply received |
| Engaged | Any reply | Discovery call booked |
| Qualified | Call done, fit confirmed | Proposal sent |
| Proposal | 1-page proposal out | Signed / lost |
| Won | Signed + deposit | Kickoff scheduled |
| Retained | Post-project retainer | Renews |

---

## System A — Cold outbound (n8n)

### Weekly flow

```
[Target list source]
   │ (Apollo / Instantly / manual scraping / LinkedIn Sales Nav export)
   ▼
[Airtable — "Prospects" base]
   │ enrich: company, role, tech stack, recent trigger
   ▼
[Claude via n8n] ────▶ personalized opener (1-2 lines)
   │ prompt: {company_context} + {your_offer} → 1 opener referencing a
   │ specific automation you'd build for them (NOT generic)
   ▼
[Send via Gmail / LinkedIn]
   │ 3-touch sequence: opener → value drop → break-up
   ▼
[Reply detection] ─▶ notify you + move stage in Airtable
```

### The opener template (never send without customizing)

> Hey {name} — noticed {specific trigger: e.g., you launched X, hiring for Y, mentioned Z on podcast}.
>
> For businesses like {company}, the {specific manual thing} usually eats 5-8 hrs/week. I build automations that kill that entirely — one client cut it from 6 hrs to 15 min/week.
>
> Worth a 15-min look?

### Do not

- Send 100 identical emails
- Use "hope you're well"
- Attach a deck first touch
- Send from a domain that isn't warmed up

### Tools (all cheap/free)

- **List building:** Apollo (free tier), LinkedIn Sales Navigator, hunter.io
- **Sending:** Gmail (up to ~50/day cleanly) or Instantly (~$37/mo, warmup included)
- **Enrichment + writing:** Claude via n8n
- **Tracking:** Airtable free tier

---

## System B — LinkedIn + X content

### Cadence

- **LinkedIn:** 2 posts/week (Tue + Thu, 9am IST)
- **X:** 1 thread/week (Wed, 8pm IST)

### Content pillars (rotate)

1. **Teardown** — "How I built X for a client in Y hours" (with n8n screenshot)
2. **Automation-in-the-wild** — "This manual process is killing your Tuesday. Here's the fix in 3 nodes."
3. **Result story** — client outcome, anonymized, with numbers
4. **Opinion** — spicy take on tools, AI, ops workflows

### Every post ends with

> If your team has a process like this that's eating hours, my site is [link]. Free 20-min diagnostic call.

### Repurposing flow (n8n)

```
[Write LinkedIn post] ─▶ [Claude: convert to X thread]
                     ─▶ [Claude: convert to newsletter blurb]
                     ─▶ [Buffer/Publer schedule]
```

One idea → 3 formats. Don't write from scratch each channel.

---

## Feeding both channels into one intake

Both cold + inbound lead to the **same contact form** on the site.
Form submission → n8n webhook → Airtable "Prospects" (stage = Engaged) → your notification → your reply within 24h.

## KPIs to review weekly (Sunday, 30 min)

- Touches sent
- Reply rate (target ≥8%)
- Calls booked (target 2-3)
- Posts published (target 3)
- Post impressions + profile visits (LinkedIn analytics)
- Pipeline value in "Qualified" or later
