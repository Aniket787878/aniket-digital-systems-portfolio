# Layout audit — screens from 360px to 3440px, Chromium and WebKit

Date: 2026-10-06. Branch `work/2026-10-06` (= latest `main`). Tested against a
production build (`npm run build` + `vite preview`), not the dev server.

**Scope.** 10 pages (`/`, `/websites`, `/software`, `/ai`, `/projects`,
`/projects/therapist-pwa`, `/about`, `/contact`, `/privacy`, a 404) across 11
viewports in Chromium (360px to 3440px) and 6 in WebKit, as a Safari proxy
(phone, tablet portrait, tablet landscape, desktop, 1080p, 1440p). Every page
was scrolled fully before the full-page shot, and a separate "first screen"
shot was taken. Console errors and layout geometry (overflow, font sizes, tap
targets, container widths) were measured with a script, not eyeballed.

**Bottom line.** The site holds together well mechanically — no horizontal
overflow, no console errors, on any of the 170 page/viewport/browser
combinations tested. The real issue is the one Aniket already named: on large
screens, every page *except the home page* keeps its content at a fixed width
and leaves the rest of the screen empty, rather than growing the page to use
the space. That's one root cause, verified in the code below, not a dozen
unrelated bugs.

---

## What works

- **No broken layouts anywhere tested.** Zero horizontal scrollbars, zero
  console errors, across all 170 combinations (Chromium 360px–3440px, WebKit
  iPhone/iPad/desktop sizes).
- **The phone header CTA is smaller than it looks, on purpose, and it's done
  right.** The "Let's talk" button shrinks to a 36px-tall pill under 810px,
  but a transparent `::after` grows its actual tap target to 44px — the
  comment in the code explains this was a deliberate fix for a cramped header,
  not an oversight.
- **Contact form radio buttons are fully clickable**, not just the small
  visible circle — the whole padded row is the `<label>`, so the real tap
  target is generous even though the input itself measures 18px.
- **The home page hero already does the "wide screen" thing right**: its grid
  is deliberately capped wider (1600px) than the rest of the site and is full
  bleed behind that, with the light-trail art filling the sides. This is the
  one place that doesn't feel narrow at 2560px+ — which makes the contrast
  with every other page more obvious, not less.
- **Deliberate choices left alone, as instructed**: the dark "Stage" look,
  the reading-width caps on `/privacy` (816px) and the 404 page (600px), the
  WhatsApp CTA, and the story-loop copy pattern are not flagged — they're
  working as designed.

---

## Findings

### P1 — Every page but the home page stays ~1280px wide no matter how big the screen gets

**Where:** `/websites`, `/software`, `/ai`, `/projects`,
`/projects/therapist-pwa`, `/about`, `/contact` — all of them, from 1680px
viewports up to 3440px. Both Chromium and WebKit (this is pure CSS, not a
rendering difference).

**What happens:** The content column (hero text, feature cards, case-study
tiles, the portrait on `/about`) is capped at 1280px border-box width. That
cap is reached around laptop size (1280–1440px) and then **never grows
again** — not at 1680px, not at 1920px, not at 2560px, not at 3440px. On a
1440p monitor that's content occupying exactly half the screen, with the
other half split into two equal black gutters. On an ultrawide it's worse. It
reads exactly like Aniket described it: a narrow site floating in a dark
void, not a page that was designed for the space.

**Evidence:** `docs/audits/2026-10-06-screens/cs2-wide-screen-emptiness.png`
— `/websites` at 1280 / 1680 / 2560 / 3440px side by side, plus `/about` and
the project detail page at 2560px. The gutters are visibly identical in
pixels from 1680px up — the page stops responding to the viewport entirely
past that point.

**For the developer:** `src/index.css` sets `--container-max: 1200px`
(line 108) and `.container`'s `max-width: calc(var(--container-max) +
var(--container-pad) * 2)` (line 240) — with the padding clamp topping out at
2.5rem (line 109), that's a hard 1280px ceiling. There is **no `min-width`
media query anywhere in the codebase above ~1001px**
(`grep -rn "@media" src | grep min-width` returns only
`HomePage.css:920` at 1001px and two in `ServicePage.css` at ~1000/761px) —
so nothing in the system currently has an opinion about what a 1920px or
2560px screen should look like; it just inherits the laptop layout and
centers it. The one exception, the home hero's `.sh-grid`
(`src/pages/home/stage/hero/hero.css:47`), intentionally caps at 1600px and
explains why in a comment — that part is fine and shows the site already
knows how to do this on at least one page.

**Suggested fix:** This is a design call, not a one-line patch — raising
`--container-max` everywhere would also widen `/privacy` and the 404 page,
which are deliberately narrow for reading. The shape of a fix: add a
`min-width` tier (e.g. 1600px+) that either (a) raises `--container-max` for
the card-grid and hero bands specifically, the way `.sh-grid` already does,
or (b) keeps the reading column at 1280px but gives the surrounding bands
(case-study grid, feature-card rows) a wider, independent max-width so they
visually fill more of a 2560px+ screen, with the dot-grid/glow background
elements (already used in the Stage hero) extended to dress the remaining
space instead of leaving it flat black.

### P3 — Small mono "micro-label" captions render under 12px on phones

**Where:** home page ("Work that's running" step counters, case-study
captions), `/websites`, `/software`, `/ai` (same shared components). Phone
viewports (360–430px), both browsers.

**What happens:** The small mono-font tags that label things ("01 / 06",
"Recorded test run · made-up physio clinic", "Concept designs") render at
9.75–12px on phones — under the 14px comfortable-reading floor. They're
secondary/decorative (step counters, source labels), not primary copy, so
this is low severity, but a few are right at the edge of legible at normal
arm's length.

**Evidence:**
`docs/audits/2026-10-06-screens/evidence-small-text-phone.png` (phone,
390×844, "01 / 06" step label and "Schematic film · client data never
shown" caption).

**For the developer:** `.stage-mono` base size is 0.75rem = 12px
(`src/pages/service/showcase/stage.css:57`); `.sw-caption`
(`src/pages/home/stage/work/work.css:98`) and `.sw-bar-label`
(`work.css:272`) are 0.6875rem = 11px; `.sd-mini-tag`
(`src/pages/home/stage/work/doors.css:169`) is also 11px; and
`.hl-figure-label .stage-mono` (`src/pages/home/stage/loop/loop.css:360`)
is `0.75em` of an already-small parent, measuring 9.75px in practice — the
smallest text found on the site. None of these shrink further in a phone
media query; they're just small everywhere.

**Suggested fix:** Raise the floor on these specific classes to ~12–12.5px
on phones only (a `max-width: 480px` tweak, not a global change, to avoid
disturbing the compact desktop look these were tuned for).

### P3 — One `backdrop-filter` rule has no WebKit fallback

**Where:** `.showcase-badge` (case-study card badges), all pages that show
project cards. WebKit only; cosmetic.

**What happens:** Every other `backdrop-filter: blur(...)` rule in the
codebase is paired with `-webkit-backdrop-filter` — except this one, so the
badge won't blur the background behind it in Safari. In practice this is
nearly invisible: the badge's own background (`rgba(16,16,16,0.84)`) is
already close to opaque, so the missing blur barely changes how it looks.
Flagging it only because it's the one real inconsistency found, and it's a
one-line fix.

**For the developer:** `src/index.css:2256` — add
`-webkit-backdrop-filter: blur(6px);` next to the existing
`backdrop-filter: blur(6px);`.

### Not flagged, checked and ruled out

A few things that looked like findings in the raw measurements turned out
not to be, once checked against the code — noting them so the same false
leads don't come back:

- **"Stretched/pixelated images"**: the automated probe reported
  `naturalWidth` values on `/about`'s portrait and a couple of case-study
  thumbnails that didn't match the real files on disk (confirmed via `curl`
  and `file` — e.g. `aniket.jpg` is really 1120×1400, `aniket-560.jpg` really
  560×700). A plain `<img>` with the same URL, loaded in isolation, reports
  the correct size; only inside the live page does Chromium's headless
  `naturalWidth` return a scaled-down number. This looks like a headless/
  automation decode quirk, not a real site defect, and visual inspection of
  the screenshots shows no visible pixelation. Not included as a finding;
  worth a manual zoom-in check if there's ever doubt.
- **Nav "Let's talk" button, 36px tall on phones**: see "What works" above —
  has a compensating 44px `::after` hit area, documented in the CSS.
- **18px contact-form radio inputs**: the clickable area is the whole padded
  `<label>`, not the bare input. Not a real tap-target problem.
- **"150 characters per line" on `/websites`**: a false positive from the
  measurement heuristic — it was measuring a short CTA link ("Want one like
  this for your business? Let's talk. →") sitting in a full-width box, not
  actual wrapped text filling that width.

---

## WebKit vs Chromium

No overflow, no console errors, and no visually different layout in either
browser across all 59 WebKit combinations tested. Fonts, spacing and the dark
"Stage" gradients render consistently between the two (see
`cs3-chromium-vs-webkit.png`). The only WebKit-specific issue found is the
missing `-webkit-backdrop-filter` on `.showcase-badge` above, and it's barely
visible even there.

---

## Fix plan

**Batch 1 — quick CSS-only fixes, low risk, ship together.**
Add the missing `-webkit-backdrop-filter` to `.showcase-badge`
(`index.css:2256`); raise the phone-only floor on `.stage-mono`,
`.sw-caption`, `.sw-bar-label`, `.sd-mini-tag` to ~12–12.5px. Both are
isolated, single-file-ish changes with no layout risk.

**Batch 2 — the large-screen width decision.** This is the one that needs
Aniket's call before any code: should case-study grids and hero bands get a
wider cap (match the home hero's 1600px pattern) on 1600px+ screens, should
the surrounding space get background treatment instead, or both? Once
decided, it's a `min-width: 1600px` tier added next to the existing
`--container-max` system, applied band by band (feature-card rows,
case-study grid, the about-page layout) rather than a single global change,
so `/privacy` and the 404 page keep their intentional reading width.

**Batch 3 — re-verify.** Re-run this same audit (script is reusable) after
Batches 1–2 land, focused on the large-screen viewports and WebKit, to
confirm the fix doesn't reintroduce overflow or break the home hero's
existing wide treatment.
