import StringTune, {
  StringProgress,
  StringLerp,
  StringSplit,
  StringCursor,
  StringMagnetic
} from '@fiddle-digital/string-tune'

/*
  The StringTune side of the interaction layer. This file is the lazy chunk:
  controller.js imports it with import(), after first paint, and never for a
  visitor who asked for reduced motion. Nothing here may be imported
  statically from the app.

  start() returns { stop, refresh }. It is idempotent, so React StrictMode's
  double mount and a reduced-motion toggle mid-session cannot leave two loops
  running.
*/
const root = document.documentElement
let running = null

/* Three gaps in the library's own bookkeeping, all found by testing in a
   real browser, all fixed here rather than by patching node_modules. */

/* StringCursor drops an element's mouseenter/mouseleave listeners when the
   element scrolls out of range. If the pointer was resting on it, the "over"
   state is never cleared, and the ring stays stuck in that element's shape
   (a "View" disc over empty page) until it is entered and left again. Clear
   the state as the element leaves. */
class Cursor extends StringCursor {
  onLeaveObject(object) {
    if (object.getProperty('is-mouse-over')) this.onMouseLeave(object)
    super.onLeaveObject(object)
  }
}

/* StringMagnetic only wakes an element while the pointer is inside its
   radius. Once a button has settled (asleep) and the pointer then leaves, the
   target is reset to 0 but nothing wakes the element to animate back, so it
   stays displaced. Wake any element whose current offset differs from its
   target. */
class Magnetic extends StringMagnetic {
  onMouseMoveMeasure() {
    super.onMouseMoveMeasure()
    for (const object of this.objects) {
      const moving =
        object.getProperty('magnetic-x') !== object.getProperty('magnetic-target-x') ||
        object.getProperty('magnetic-y') !== object.getProperty('magnetic-target-y')
      if (moving) {
        object.setProperty('magnetic-active', true)
        this.wake(object)
      }
    }
  }
}

/* StringSplit ('word' mode) puts the space between words inside each word
   span ("price&nbsp;") and leaves it off wherever it predicts the word ends
   a line. Its width maths rounds wrong often enough around one-letter words
   (seen on /contact at 390px: "a" before "price") that the prediction and the
   browser's real wrap disagree, and the two words render glued ("aprice").
   Patch exactly that shape: a word span with no trailing space whose next
   sibling is another word span. Correct words already end in a space, so
   nothing is ever doubled. It re-splits on resize, so watch the DOM as well
   as sweeping once after the first split. */
const SPACE_END = /[\s\u00a0]$/
function fixSplitWordSpacing(scope) {
  scope.querySelectorAll('.-s-word').forEach((word) => {
    const next = word.nextSibling
    if (
      next &&
      next.nodeType === Node.ELEMENT_NODE &&
      next.classList.contains('-s-word') &&
      !SPACE_END.test(word.textContent)
    ) {
      word.after(document.createTextNode(' '))
    }
  })
}

function watchSplitWordSpacing() {
  const observer = new MutationObserver((mutations) => {
    const parents = new Set()
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.parentElement) parents.add(node.parentElement)
      }
    }
    parents.forEach(fixSplitWordSpacing)
  })
  observer.observe(document.body, { childList: true, subtree: true })
  fixSplitWordSpacing(document.body)
  return observer
}

export function start({ fine }) {
  if (running) return running

  const st = StringTune.getInstance()

  /* NATIVE SCROLL. StringTune's desktop default is 'smooth': it calls
     preventDefault() on every wheel event and on arrow / space / page / home /
     end key presses, then drives scrollTop itself. That is scroll hijacking, and
     it also breaks find-in-page, anchor links and trackpad momentum. 'default'
     leaves the browser in charge and only reads scrollTop. The smooth
     controller is already active by the time getInstance() returns (it
     registers its key handler in the constructor), so both modes are switched
     here, synchronously, before anything can be pressed. */
  st.scrollDesktopMode = 'default'
  st.scrollMobileMode = 'default'

  /* Progress goes to --st-progress, not the library's default --progress: the
     site already has its own --progress custom properties (the Process and
     About step trackers), and a name they share would be inherited into and
     overwritten across each other's subtrees. Being unregistered, an unset
     --st-progress also falls back to each rule's own default (the element's
     resting pose) instead of an injected 0, so nothing flashes before the
     first frame writes it. */
  st.use(StringProgress, { key: '--st-progress' })
  st.use(StringLerp)
  st.use(StringSplit)
  if (fine) {
    /* 'cursor-lerp' sets how far the ring trails the pointer (0..1, higher is
       tighter). StringCursor disables itself on touch or a narrow window. */
    st.use(Cursor, { 'cursor-lerp': 0.5 })
    st.use(Magnetic)
  }
  st.start(60)
  const splitWordSpacingObserver = watchSplitWordSpacing()

  root.classList.add('st-on')
  if (fine) root.classList.add('st-fine')
  /* Show the ring only once the pointer has actually moved (a ring parked at
     0,0 before that reads as a bug) and hide it when the pointer leaves the
     window. */
  const onMove = (e) => {
    if (e.pointerType === 'mouse') root.classList.add('st-live')
  }
  const onLeave = (e) => {
    if (!e.relatedTarget) root.classList.remove('st-live')
  }
  if (fine) {
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('mouseout', onLeave)
  }

  running = {
    /* Page height changes when a route swaps or media loads: re-measure. */
    refresh: () => st.onResize(true),
    stop: () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('mouseout', onLeave)
      splitWordSpacingObserver.disconnect()
      st.destroy()
      root.classList.remove('st-on', 'st-fine', 'st-live', '-string')
      running = null
    }
  }
  return running
}
