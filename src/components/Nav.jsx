import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { StartCta, TalkCta } from './FunnelCta.jsx'
import { whatsappPrefill } from '../data.js'

/*
  Fixed overlay header: transparent while it sits on the hero, then a
  blurred dark bar once the page scrolls past ~40px. Brand left,
  links centred, pill CTA right.
*/
export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [quiet, setQuiet] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* One primary per view: while a page's own primary (any saffron
     StartCta: "Get started", "Plan your website", "Plan your software"
     or "Get your free AI check", marked data-primary) is on screen, the
     nav's "Get started" steps back to an outline so two saffron buttons
     never compete. Checked once per frame at most, on scroll, resize and
     route change (the page's buttons are found fresh each time, so new
     routes need no wiring). */
  useEffect(() => {
    let raf = 0
    const check = () => {
      raf = 0
      const h = window.innerHeight
      const own = document.querySelectorAll('main a[data-primary].btn-saffron')
      let seen = false
      for (const el of own) {
        const r = el.getBoundingClientRect()
        if (r.width > 0 && r.bottom > 0 && r.top < h) {
          seen = true
          break
        }
      }
      // Inside a plan (or the chooser) the page's own Next button is the
      // primary, and the nav's would only lead back to the start.
      const path = window.location.pathname
      setQuiet(seen || path === '/ai-check' || path.startsWith('/ai-check/') || path === '/start' || path.startsWith('/start/'))
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

  // Escape closes the mobile panel — the standard exit for a disclosure
  // menu. Only bound while it is open, so it never swallows Escape
  // elsewhere. Focus returns to the toggle so a keyboard user is not
  // dropped at the top of the document.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        document.querySelector('.nav-toggle')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Close the mobile panel whenever the route changes. Derived during
  // render rather than in an effect so it lands in the same commit as
  // the navigation instead of flashing the open panel on the new page.
  //
  // This alone is not enough: tapping the link for the page you are
  // already on leaves pathname untouched, so the panel just sat there and
  // the tap read as broken. The panel also closes on any click inside it
  // — see the handler on .nav-panel below.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  // Sub-pages have no hero behind the header, so they get the solid bar
  // immediately rather than white-on-white at the top of the scroll.
  const solid = scrolled || open || pathname !== '/'

  return (
    <header className={`nav${solid ? ' nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="nav-mark" aria-hidden="true">
            {/* A sunrise over a ridge: the Dusk mark. */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 10.5a4.5 4.5 0 0 1 9 0z" fill="#f5871e" />
              <path d="M1.5 12.5h13" stroke="#ffc89a" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          Aniket
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/websites">Websites</NavLink>
          <NavLink to="/software">Software</NavLink>
          <NavLink to="/ai">AI</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* One primary everywhere: "Get started", to the chooser
            (website, software or AI, each with its own free plan). */}
        <div className={`nav-actions${quiet ? ' is-quiet' : ''}`}>
          <StartCta placement="nav" />
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 8h16M4 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav
          className="nav-panel"
          aria-label="Mobile"
          data-lenis-prevent
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/websites">Websites</NavLink>
          <NavLink to="/software">Software</NavLink>
          <NavLink to="/ai">AI</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {/* Room to breathe here: "Get started" first, then the call
              (booking link, else WhatsApp). Contact is in the list. */}
          <StartCta placement="nav-panel" className="btn-saffron nav-panel-cta" />
          <TalkCta className="btn-light nav-panel-cta" message={whatsappPrefill.nav} />
        </nav>
      )}
    </header>
  )
}
