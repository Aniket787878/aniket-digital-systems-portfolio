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

/* StringSplit ('word' mode) decides where to put the space between two
   word spans by pre-measuring the heading's own line wrap (character
   widths summed against the element's content width) and skipping the
   separator wherever it thinks a word is last on its own line — two
   adjacent inline-block word spans still get a natural wrap point between
   them with nothing rendered there, which is correct when the prediction
   matches reality. Its width maths rounds wrong often enough for narrow,
   one-letter words (seen on /contact: "a" before "price") that the
   predicted line-end and the browser's actual wrap point disagree; when
   that happens the two spans end up on the same visual line with no
   separator between them at all, so they render glued together ("aprice").
   It re-splits on every resize, so this cannot be a one-time pass at
   boot — watch the DOM instead and patch the exact shape the bug leaves:
   a `.-s-word` whose immediately preceding sibling is another `.-s-word`
   with no text node of any kind between them. Where the library did
   insert its own separator (the normal case), the previous sibling is a
   text node, not an element, so this never double-spaces a heading that
   was already correct. */
function watchSplitWordSpacing() {
  const fixWord = (word) => {
    const prev = word.previousSibling
    if (prev && prev.nodeType === Node.ELEMENT_NODE && prev.classList.contains('-s-word')) {
      word.before(document.createTextNode(' '))
    }
  }
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        if (node.classList.contains('-s-word')) fixWord(node)
        node.querySelectorAll?.('.-s-word').forEach(fixWord)
      }
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
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
