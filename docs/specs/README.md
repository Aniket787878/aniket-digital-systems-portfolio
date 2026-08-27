# specs/ — Hand-off docs for MonkeyCode

These specs are **self-contained tasks** for MonkeyCode (CyberServal Pro, 100M tokens/day quota). Claude writes specs, MonkeyCode builds, you review PRs. Claude reviews only if something looks off — this saves Claude tokens for architecture and judgment calls.

## The routing

| Who | Does what |
|-----|-----------|
| Claude | Specs, architecture, PR review, judgment |
| MonkeyCode | Executes one spec = one task. Commits via bound GitHub identity (Aniket787878). |
| You | Kick off tasks, review PRs, kill runaways |

## How to hand off (MonkeyCode)

1. MonkeyCode → **Start task**. Project: "Aniket Digital System…".
2. Paste the spec verbatim as the task prompt.
3. Add this preamble line at the top of the prompt: `Repo: aniket-digital-systems-portfolio. Branch off main as feat/<spec-name>. Open a PR when the acceptance checklist passes.`
4. Hit Run. Watch the first 5 minutes to confirm it stays in scope.
5. When the PR opens, review the diff and merge (or comment for changes).

## Kill rules (READ THIS)

MonkeyCode can burn tokens fast — one task ran 8 days / 368M tokens before we noticed. Prevent that:

- **One spec = one task.** Never "fix the portfolio" — always a specific spec file.
- **Every spec must include a budget cap and scope allow-list** (already added to the specs below).
- **If a task exceeds its budget or runs > 2 hours without a PR: kill it.** Take whatever diff exists, dismiss the task, and re-plan.
- **Don't stack tasks.** Run one at a time until we trust the pattern.

## What Claude keeps doing (do NOT delegate to MonkeyCode)

- Writing/editing `system/` docs
- Writing/editing `specs/*.md`
- Skill maintenance
- Reviewing final wired systems for edge cases + security
- Architectural decisions (new offer? new channel? pivot?)
- Anything requiring cross-file repo judgment

## What to delegate to MonkeyCode

- Building components from a spec (`specs/*.md`)
- Bulk copy work (200 openers, 20 subject-line variants) — as a scoped task with a file target
- Boilerplate config (dockerfiles, workflows, sitemap)
- Rewrites for tone against a spec

## Cost discipline

- Never paste MonkeyCode's raw output back to Claude. Summarize: "It built X, one issue: Y."
- Never re-explain the project to Claude — memory + the `portfolio-lead-system` skill carry context.
- Batch questions to Claude ("review these 3 things") instead of one at a time.
- Track daily quota. 100M is a lot; runaway tasks make it small fast.

## What Claude keeps doing (do NOT delegate)

- Writing/editing system/ docs
- Skill maintenance
- Reviewing final wired systems for edge cases + security
- Architectural decisions (new offer? new channel? pivot?)
- Anything requiring cross-file repo context

## What to delegate to smaller models

- Building components from a spec (specs/*.md)
- Bulk copy work (200 openers, 20 subject-line variants)
- Rewriting for tone
- Summarizing long threads/PDFs
- Boilerplate config (dockerfiles, workflows, sitemap)

## Cost discipline

- Never paste a smaller model's raw output back to Claude. Summarize it: "It built X, one issue: Y."
- Never re-explain the project to Claude — memory + the `portfolio-lead-system` skill carry context.
- Batch questions to Claude ("review these 3 things") instead of one at a time.
