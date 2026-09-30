/*
  Boots the StringTune interaction layer. This file is in the main bundle, so it
  stays tiny and touches no library code: it only decides *whether* and *when*
  to fetch the lazy chunk (./stringtune.js).

  Rules it enforces:
   - never under prefers-reduced-motion (the library is not even downloaded),
     and it is stopped if the setting flips on mid-session;
   - only after first paint (window load, then an idle slot), never on the
     critical path;
   - cursor and magnetic effects only for a real mouse on a wide window.
*/
export const REDUCED = '(prefers-reduced-motion: reduce)'
export const FINE_POINTER = '(hover: hover) and (pointer: fine) and (min-width: 1024px)'

let current = null // { stop, refresh } while the library is running

function whenIdle(fn) {
  let cancelled = false
  let id
  const run = () => {
    if (cancelled) return
    id =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(fn, { timeout: 2500 })
        : window.setTimeout(fn, 400)
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

/* Returns the cleanup. Safe to call twice in a row (StrictMode mounts,
   unmounts and mounts again): the first call's timers are cancelled before the
   chunk is ever requested, and start() in the chunk is idempotent. */
export function enableInteractions() {
  const reduce = window.matchMedia(REDUCED)
  let dead = false

  const boot = () => {
    if (dead || reduce.matches || current) return
    import('./stringtune.js')
      .then((mod) => {
        if (dead || reduce.matches) return
        current = mod.start({ fine: window.matchMedia(FINE_POINTER).matches })
      })
      .catch(() => {
        /* A failed chunk leaves the plain page, which is the fallback anyway. */
      })
  }

  const cancelIdle = whenIdle(boot)

  const onReduceChange = () => {
    if (reduce.matches) {
      current?.stop()
      current = null
    } else {
      cancelIdle()
      whenIdle(boot)
    }
  }
  reduce.addEventListener('change', onReduceChange)

  return () => {
    dead = true
    cancelIdle()
    reduce.removeEventListener('change', onReduceChange)
    current?.stop()
    current = null
  }
}

/* Called after a route change. The library watches the DOM and picks up the
   new page's elements and drops the old page's on its own; what it cannot know
   is that the document height just changed, so re-measure once the new page has
   laid out and again after images and fonts have had time to settle. */
export function refreshInteractions() {
  const timers = [150, 900].map((ms) =>
    window.setTimeout(() => current?.refresh(), ms)
  )
  return () => timers.forEach((t) => window.clearTimeout(t))
}
