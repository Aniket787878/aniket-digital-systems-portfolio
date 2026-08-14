import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { site } from '../data.js'

export default function Nav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-brand" onClick={close}>
          {site.name}
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
        </nav>
        <Link to="/contact" className="nav-cta">
          Get in touch
          <span className="nav-cta-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12h14m0 0-6-6m6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      {open && (
        <nav className="nav-panel open">
          <NavLink to="/" end onClick={close}>
            Home
          </NavLink>
          <NavLink to="/projects" onClick={close}>
            Projects
          </NavLink>
          <Link to="/contact" className="nav-panel-cta" onClick={close}>
            Get in touch
          </Link>
        </nav>
      )}
    </header>
  )
}
