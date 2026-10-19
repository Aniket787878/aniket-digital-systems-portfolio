# Stack layers: motion, 3D, interactions, smooth scroll

Moved verbatim from CLAUDE.md. Read before touching `src/motion/`, `src/interactions/`, `src/scroll/` or the hero.

**Motion layer.** `motion` (Framer Motion, imported as `m` via
`LazyMotion`/`domAnimation` in `App.jsx`) drives the scroll-reveals and the
hero entrance — shared variants live in `src/motion/variants.js`. Every
animation respects `prefers-reduced-motion` through the one
`<MotionConfig reducedMotion="user">` wrapper, so components need no
per-element guard.

**3D hero accent.** `three` + `@react-three/fiber` + `@react-three/drei`
render the pointer-reactive node network in `components/Hero3D.jsx`. It is
**code-split** (a `lazy()` import in `Hero.jsx`) and only mounts on a wide
viewport with motion allowed — never on mobile, never under reduced motion,
never in the first-load bundle. A `SafeMount` boundary drops it silently if
WebGL is unavailable, leaving the photograph. Keep it lazy: the three.js
chunk is ~220KB gzip and must never re-enter the main bundle.

**Interaction layer.** `@fiddle-digital/string-tune` (a runtime dependency
because it is the one library that gives cursor portals, magnetic pull and
word splitting from plain attributes) drives the custom cursor, magnetic
primary buttons, word-by-word headings and scroll-linked depth. It lives in
`src/interactions/` and follows these rules:

- **Lazy.** `controller.js` (main bundle, tiny) imports `stringtune.js` (the
  ~62KB gzip chunk) after `load` plus an idle slot. Never import the library
  statically. It never starts under `prefers-reduced-motion` (and stops if
  that flips); cursor and magnetic only for `(hover: hover) and (pointer: fine)`
  at 1024px+.
- **StringTune scroll stays `default`.** Its desktop default mode is `smooth`,
  which `preventDefault()`s wheel *and* arrow/space/page/home/end keys.
  `stringtune.js` switches both modes to `default` synchronously after
  `getInstance()`. Never enable StringTune's smooth mode; smooth scrolling
  comes from Lenis (below).
- **Nothing hidden until it runs.** Effects are `data-string*` attributes from
  `fx()` (`attrs.js`), styled by `interactions.css` only under `html.st-on`;
  var() fallbacks are the resting pose.
- **No fight with Motion.** This layer never writes `transform` or `opacity` on
  an element Motion animates: it uses the individual `translate`/`scale`
  properties on inner elements, or elements Motion never touches. Progress goes
  to `--st-progress` because the page has its own `--progress`.
- **SPA-safe.** One instance, idempotent start/stop (StrictMode, reduced-motion
  toggle). The library watches the DOM itself for route changes; the controller
  only re-measures. `StringSplit` rewrites a heading's innerHTML and drops
  `<br>`: split only static headings, break lines with a block span
  (`.h2 .soft`), and `key` any route that reuses one component for different
  text (the three service routes). The ring `<div>` stays mounted, since the
  library keeps a reference to that exact node.
- **Library gaps** (stuck hover after scrolling away, magnet never returning) are
  fixed by the two subclasses in `stringtune.js`; re-check them on upgrade.

**Smooth scrolling.** `lenis` (a runtime dependency since 2026-10-09: Aniket
asked for site-wide smooth scrolling so the scroll-linked bands play smoothly,
and Lenis is the one library that smooths the wheel while leaving the real
window scroll, keys and touch alone; ~6KB gzip, lazy) lives in `src/scroll/`:

- **Lazy, one instance.** `smooth.js` (main bundle, tiny) imports `lenis.js`
  (the chunk) after `load` plus an idle slot. Lenis is ticked from Motion's
  frame loop (`frame.update`), not a second rAF. Settings: `lerp 0.1`,
  `wheelMultiplier 1`, `syncTouch false`.
- **Native where it should be.** Never under `prefers-reduced-motion` (the chunk
  is not fetched; destroyed if it flips on, so no `html.lenis`), never on a
  touch-only device (`(any-hover: hover)` fails). Only wheel/trackpad is
  smoothed: keys, scrollbar, find-in-page and touch are native. Lenis moves
  `window.scrollY` itself, so `position: sticky`, Motion's `useScroll` and
  StringTune keep working. Never `preventDefault` a key.
- **Programmatic scrolls go through `smooth.js`:** `jumpTo(y)` for instant
  jumps (ScrollToTop does this on every route change), `syncScroll()` after a
  native `scrollIntoView`, `glideTo(el|y)` for animated ones. A bare
  `window.scrollTo` mid-glide gets overridden by Lenis on the next frame.
  Same-page `#hash` links glide, clearing the fixed nav; the skip link stays
  a native jump.
- **Anything with its own scroll** gets `data-lenis-prevent` (the AI chat log,
  the mobile nav panel, the film `<dialog>`; every `<dialog>` is also exempt
  by default). Something that must hold the page still calls `holdScroll()`
  and runs the release on close (VideoDialog does).
- Lenis's base CSS is inlined at the top of `index.css` (all under `html.lenis`).
