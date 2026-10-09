import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

/* ------------------------------------------------------------------
   Is one of the page's own primary buttons already on screen? Shared
   by components/Nav.jsx ("one primary per view": the header's own
   "Get started" steps back to an outline, or — on a phone — hides
   behind the action dock, while a page's own saffron primary or
   WhatsApp link is in view) and components/ActionDock.jsx (Spec 1,
   2026-10-09: the dock steps aside whenever one of these is on screen,
   so there is still only ever one saffron button and one WhatsApp
   button visible at a time).

   Looks for `main a[data-primary].btn-saffron` (every StartCta) and
   `main a[href*="wa.me"]` (every WhatsApp button). Checked at most once
   a frame, on scroll, resize and route change — the page's own buttons
   are found fresh each time, so a new route needs no extra wiring.
   ------------------------------------------------------------------ */
export function usePrimaryInView() {
  const { pathname } = useLocation()
  const [inView, setInView] = useState(false)

  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const h = window.innerHeight
      const own = document.querySelectorAll('main a[data-primary].btn-saffron, main a[href*="wa.me"]')
      let seen = false
      for (const el of own) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.bottom > 0 && r.top < h) {
          seen = true
          break
        }
      }
      setInView(seen)
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(check)
    }
    // After the route's first paint, and again once entrances settle.
    queue()
    const late = setTimeout(queue, 900)
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(late)
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
    }
  }, [pathname])

  return inView
}
