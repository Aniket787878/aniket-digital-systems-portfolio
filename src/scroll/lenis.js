import Lenis from 'lenis'
import { frame, cancelFrame } from 'motion/react'

/*
  The Lenis side of smooth scrolling. This file is the lazy chunk:
  smooth.js imports it with import(), after first paint, and never for a
  visitor who asked for reduced motion or who only has touch. Nothing here
  may be imported statically from the app.

  Settings, tuned on the pinned Stakes band (home), where every wheel notch
  scrubs a blur/fade reveal:
   - lerp 0.08: each frame closes 8% of the gap to the target. Gentle, ends
     in well under a second, never floaty. (Not duration + easing: that
     restarts its curve on every notch, which reads as stutter on a long,
     fast wheel spin.)
   - wheelMultiplier 1: a notch still travels as far as it does natively,
     so the page does not feel slower than before, only softer.
   - syncTouch false (the default): touch keeps the browser's own momentum.
   - Keys are never touched: Lenis listens to wheel/touch only, so arrows,
     Space, Page Up/Down, Home and End scroll natively; Lenis follows the
     native scroll events and picks up from wherever they leave the page.

  One loop: Lenis is ticked from Motion's own frame loop (the same rAF that
  runs every useScroll/useTransform on the page), not a second
  requestAnimationFrame of its own, so the scroll position and the
  scroll-linked styles it drives are produced in the same frame.
*/
export function create() {
  const lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    autoResize: true,
    /* Anything that scrolls on its own keeps native wheel scrolling: native
       <dialog>s (the film lightbox), and any element marked
       data-lenis-prevent (the AI chat log, the mobile nav panel). */
    prevent: (node) => node.nodeName === 'DIALOG'
  })

  const tick = ({ timestamp }) => lenis.raf(timestamp)
  frame.update(tick, true)

  /* In-page anchors (#work, #close): glide there instead of the browser's
     jump, clearing the fixed nav. The skip link keeps the native jump, since
     what it is for is moving keyboard focus, instantly. The URL hash is not
     written: React Router would read the change as a navigation and run the
     route's scroll restore on top of the glide. */
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target.closest?.('a[href^="#"]')
    if (!a || a.classList.contains('skip-link')) return
    const id = decodeURIComponent(a.getAttribute('href').slice(1))
    const target = id && document.getElementById(id)
    if (!target) return
    e.preventDefault()
    const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    const nav = document.querySelector('header.nav')
    const clear = nav ? nav.getBoundingClientRect().bottom : 0
    lenis.scrollTo(target, { offset: margin > 0 ? 0 : -clear })
  }
  document.addEventListener('click', onClick)

  return {
    stop: () => lenis.stop(),
    start: () => lenis.start(),
    reset: () => lenis.reset(),
    resize: () => lenis.resize(),
    scrollTo: (target, opts) => lenis.scrollTo(target, opts),
    destroy: () => {
      document.removeEventListener('click', onClick)
      cancelFrame(tick)
      lenis.destroy()
    }
  }
}
