import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ArrowIcon from './ArrowIcon.jsx'
import WhatsAppCta from './WhatsAppCta.jsx'
import { hasWhatsApp } from '../whatsapp.js'
import { whatsappPrefill } from '../data.js'

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

  // Close the mobile panel whenever the route changes. Derived during
  // render rather than in an effect so it lands in the same commit as
  // the navigation instead of flashing the open panel on the new page.
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
          Aniket<sup aria-hidden="true">&trade;</sup>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>

        {/* The bar is tight, so the label is just "WhatsApp" here rather
            than the full sentence used further down the page. */}
        <div className="nav-actions">
          {hasWhatsApp ? (
            <WhatsAppCta
              message={whatsappPrefill.nav}
              label="WhatsApp"
              className="btn-pill"
            />
          ) : (
            <Link to="/contact" className="btn-pill">
              Get in touch
              <span className="btn-pill-icon" aria-hidden="true">
                <ArrowIcon />
              </span>
            </Link>
          )}
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
        <nav className="nav-panel" aria-label="Mobile">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {/* Room to breathe here, so the panel offers both routes. */}
          <WhatsAppCta
            message={whatsappPrefill.nav}
            label="Message me on WhatsApp"
            className="btn-pill nav-panel-cta"
          />
          <Link to="/contact" className="btn-pill nav-panel-cta">
            Get in touch
            <span className="btn-pill-icon" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </nav>
      )}
    </header>
  )
}
