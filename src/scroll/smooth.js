/*
  Smooth (inertia) wheel scrolling, site-wide. This file is in the main
  bundle, so it stays tiny and touches no library code: it decides *whether*
  and *when* to fetch the lazy chunk (./lenis.js) and gives the rest of the
  app a few calls that work the same before, during and without it.

  Rules it enforces (see CLAUDE.md, "Smooth scrolling"):
   - never under prefers-reduced-motion (the library is not even downloaded),
     and it is destroyed, not paused, if the setting flips on mid-session;
   - never on a touch-only device (phones keep the browser's own momentum),
     where the chunk is not downloaded either;
   - only after first paint (window load, then an idle slot);
   - only the mouse wheel / trackpad is smoothed. Keys, the scrollbar, find
     in page and touch all stay native: Lenis drives window.scrollY itself,
     it never moves the page with a transform, so position: sticky, Motion's
     useScroll and StringTune's scroll reading all see the real scroll.
*/
import { REDUCED } from '../interactions/controller.js'

const CAN_HOVER = '(any-hover: hover)'

let lenis = null // the one instance, while it runs
let locks = 0 // open lightboxes etc. that want the page held still

function whenIdle(fn) {
  let cancelled = false
  let id
  const run = () => {
    if (cancelled) return
    id =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(fn, { timeout: 2000 })
        : window.setTimeout(fn, 300)
  }
  if (document.readyState === 'complete') run()
  else window.addEventListener('load', run, { once: true })
  return () => {
    cancelled = true
    window.removeEventListener('load', run)
    if ('cancelIdleCallback' in window) window.cancelIdleCallback(id)
    window.clearTimeout(id)
  }
}

/* Returns the cleanup. Safe to call twice in a row (StrictMode). */
export function enableSmoothScroll() {
  const reduce = window.matchMedia(REDUCED)
  const hover = window.matchMedia(CAN_HOVER)
  let dead = false
  let pending = false

  const wanted = () => !dead && !reduce.matches && hover.matches

  const boot = () => {
    if (!wanted() || lenis || pending) return
    pending = true
    import('./lenis.js')
      .then((mod) => {
        pending = false
        if (!wanted() || lenis) return
        lenis = mod.create()
        if (locks > 0) lenis.stop()
      })
      .catch(() => {
        /* A failed chunk leaves native scrolling, which is the fallback anyway. */
        pending = false
      })
  }

  let cancelIdle = whenIdle(boot)

  const onChange = () => {
    if (wanted()) {
      cancelIdle()
      cancelIdle = whenIdle(boot)
    } else {
      lenis?.destroy()
      lenis = null
    }
  }
  reduce.addEventListener('change', onChange)
  hover.addEventListener('change', onChange)

  return () => {
    dead = true
    cancelIdle()
    reduce.removeEventListener('change', onChange)
    hover.removeEventListener('change', onChange)
    lenis?.destroy()
    lenis = null
  }
}

/* Hold the page still while something with its own scroll is open (the
   film lightbox). Counted, so two holders cannot release each other.
   Returns the release. */
export function holdScroll() {
  locks += 1
  if (locks === 1) lenis?.stop()
  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0) lenis?.start()
  }
}

/* Jump with no animation (route changes, back/forward restore). The native
   jump always happens; Lenis is then told where the page now is, or it
   would carry on gliding to wherever the last wheel turn was heading. */
export function jumpTo(top) {
  window.scrollTo({ top, left: 0, behavior: 'instant' })
  lenis?.scrollTo(top, { immediate: true, force: true })
}

/* After a native jump the page made by itself (scrollIntoView). */
export function syncScroll() {
  lenis?.reset()
}

/* A deliberate glide to an element or a y offset (in-page links, "next"
   buttons). Uses Lenis when it runs, so the two never fight; otherwise the
   browser's own smooth scroll. `offset` is added to the target position. */
export function glideTo(target, { offset = 0 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset })
    return
  }
  const smooth = !window.matchMedia(REDUCED).matches
  const top =
    typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + window.scrollY - scrollMargin(target)
  window.scrollTo({ top: top + offset, behavior: smooth ? 'smooth' : 'instant' })
}

/* Page height changed (a new route rendered, media loaded). Lenis also
   watches the document's size itself; this is the explicit nudge. */
export function refreshSmooth() {
  const timers = [120, 800].map((ms) => window.setTimeout(() => lenis?.resize(), ms))
  return () => timers.forEach((t) => window.clearTimeout(t))
}

function scrollMargin(el) {
  const v = Number.parseFloat(getComputedStyle(el).scrollMarginTop)
  return Number.isNaN(v) ? 0 : v
}
