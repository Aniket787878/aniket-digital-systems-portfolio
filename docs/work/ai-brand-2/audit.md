# AI brand slices 2 to 6: audit

Run by `node scripts/audit-ai.mjs` on 2026-10-25, against the built site (`vite preview`), at 1440x900 and 390x844, reduced motion on, after scrolling every band into view.
axe-core from `/root/projects/relay/node_modules/axe-core`, WCAG 2.0, 2.1 and 2.2 A and AA rules.

**Skipped:**

- Lighthouse: not in the npx cache (nothing installed)

## axe-core

| Page | Size | Critical | Serious | Moderate | Minor |
|---|---|---|---|---|---|
| `/ai` | desktop | 0 | 1 | 0 | 0 |
| `/ai` | phone | 0 | 1 | 0 | 0 |
| `/ai-check` | desktop | 0 | 0 | 0 | 0 |
| `/ai-check` | phone | 0 | 0 | 0 | 0 |
| `/ai/try` | desktop | 0 | 0 | 0 | 0 |
| `/ai/try` | phone | 0 | 0 | 0 | 0 |
| `/ai/for/clinics` | desktop | 0 | 0 | 0 | 0 |
| `/ai/for/clinics` | phone | 0 | 0 | 0 | 0 |
| `/ai/pricing` | desktop | 0 | 0 | 0 | 0 |
| `/ai/pricing` | phone | 0 | 0 | 0 | 0 |
| `/ai/every-enquiry` | desktop | 0 | 0 | 0 | 0 |
| `/ai/every-enquiry` | phone | 0 | 0 | 0 | 0 |

### Violations

- `/ai` desktop: **serious** `color-contrast`, Elements must meet minimum color contrast ratio thresholds (3 element(s): `.guarantee`, `#svc-prices-title > .soft`, `#faq > .container > .center-head > .h2[data-string="split"][data-string-split="word"] > .soft`)
- `/ai` phone: **serious** `color-contrast`, Elements must meet minimum color contrast ratio thresholds (3 element(s): `.guarantee`, `#svc-prices-title > .soft`, `#faq > .container > .center-head > .h2[data-string="split"][data-string-split="word"] > .soft`)

<!-- notes -->

## Notes

**Fixed on this branch (slice 6):**

- `color-contrast` (serious) on `/ai/for/clinics` and `/ai/pricing`: the soft second line of the paper headings (`.paper .soft`, #a59d94 on the paper ground), the guarantee chip and the "Start here" badge (`--accent-deep` on `--accent-tint`) fell short of AA. Fixed for the `/ai/*` pages only, one step darker, in `src/pages/ai/AiPages.css` (`.aip` scope). Re-run: 0 violations on every new page at both sizes.

**Left, with reasons:**

- `/ai` (slice 1, live): the same three `color-contrast` findings (`.guarantee`, the soft lines of the prices and FAQ headings). They come from the site-wide values in `src/pages/HomePage.css`, which this branch must not touch (spec: "no change to HomePage.css"), and the same values sit on the home page, `/websites` and `/software`. **For the owner:** approve a one-line site-wide fix (`.paper .soft` to about #857d74, `.guarantee` and `.price-badge` text to about #8a3f05) as its own small change.
- Lighthouse did not run: it is not in the npx cache and the brief forbids installing it. Run `npx lighthouse` once it is available, or check the pages in PageSpeed Insights after merge.
- axe-core is not a project dependency and is not in the npx cache; this run used the copy already on the server at `/root/projects/relay/node_modules/axe-core` through `AXE_CORE_PATH` (read only, nothing installed).
