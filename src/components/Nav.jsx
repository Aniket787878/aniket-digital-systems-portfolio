import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { StartCta, TalkCta } from './FunnelCta.jsx'
import { whatsappPrefill } from '../data.js'
import { usePrimaryInView } from '../usePrimaryInView.js'

/*
  Fixed overlay header: transparent while it sits on the hero, then a
  blurred dark bar once the page scrolls past ~40px. Brand left,
  links centred, pill CTA right.
*/
export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* One primary per view: while a page's own primary (any saffron
     StartCta, marked data-primary) or its WhatsApp link is on screen,
     the nav's "Get started" steps back to an outline so two saffron
     buttons never compete. The "is it on screen" check itself now lives
     in usePrimaryInView.js, shared with the phone action dock
     (components/ActionDock.jsx, Spec 1), which hides this same button
     outright rather than outlining it. */
  const ownPrimaryInView = usePrimaryInView()
  // Inside a plan (or the chooser) the page's own Next button is the
  // primary, and the nav's would only lead back to the start.
  const quiet =
    ownPrimaryInView ||
    pathname === '/ai-check' ||
    pathname.startsWith('/ai-check/') ||
    pathname === '/start' ||
    pathname.startsWith('/start/')

  /* Tells the action dock the mobile menu is open (it hides while the
     menu is), since the dock and this header live in separate
     components and the dock has no other way to see this state. */
  useEffect(() => {
    document.documentElement.classList.toggle('nav-menu-open', open)
    window.dispatchEvent(new Event('navmenu'))
    return () => document.documentElement.classList.remove('nav-menu-open')
  }, [open])

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
          <TalkCta className="btn-light nav-panel-cta" message={whatsappPrefill.nav} placement="nav-menu" />
        </nav>
      )}
    </header>
  )
}
