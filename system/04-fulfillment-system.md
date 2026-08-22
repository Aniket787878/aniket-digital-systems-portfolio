# 04 — Fulfillment System

What happens after "yes."

## Stages

```
Signed → Kickoff → Build → Review → Launch → Retainer offer → Care plan
```

## Per-project artifacts (create every time)

Store each client in `/clients/{client-slug}/` (or Notion workspace):
- `scope.md` — what's in, what's out, timeline, price
- `system-diagram.md` — the actual automation flow (mermaid)
- `credentials.md` — encrypted / 1Password link (never plaintext)
- `handoff.md` — how to use, how to fix, what to call you about
- `retainer-offer.md` — sent day of launch

## Kickoff (Day 0-3)

1. **Kickoff form** (typeform / tally) — captures tools, access, decision-makers, success metric
2. **60-min kickoff call** — walk through scope, agree success metric, get credentials
3. **Written scope confirmation** email — signed / thumbs-up before build starts

## Build (Day 4 → 80% of timeline)

- Build in n8n / Make / Claude / Supabase / whatever fits
- **Weekly async update** (Loom + written) — not a call, respects their time
- Test with fake data first, then their real data

## Review (last 20%)

- Live review call — walk through system with them
- One round of revisions included, scoped in writing
- Anything beyond = change order

## Launch

- Turn it on
- Send `handoff.md` (recorded loom + written)
- Send `retainer-offer.md` (see 02-service-catalog)

## Retention loop

Day 7 post-launch: check-in email — "anything broken? anything to tweak?"
Day 30: metric review — did it hit the success metric?
Day 60: pitch next build

## Anti-patterns to avoid

- Building without written scope
- No weekly updates ("silence" = client anxiety = scope creep)
- Handoff without documentation (guarantees 3am "it's broken" texts)
- Not asking for the retainer

## Referral loop

Every launch email includes: *"If you know one other business drowning in a similar workflow, an intro is the best thing you can send me."*

Simple. Consistent. Compounds.
