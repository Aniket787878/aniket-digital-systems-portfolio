import { Link } from 'react-router-dom'
import { site, footerMenu, social } from '../data.js'

/*
  Footer: intro column (brand, promise, one-line description, CTA,
  copyright) + Menu + Social, sitting on a rounded dark band with an
  oversized wordmark bleeding off the bottom edge.
*/
export default function Footer() {
  const year = new Date().getFullYear()
  // Social entries without an href are placeholders, not dead links.
  const links = social.filter((s) => s.href)

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-intro">
          <p className="footer-brand">Aniket</p>
          <p className="footer-tagline">
            Good systems should feel like less work, not more software.
          </p>
          <p className="footer-desc">
            I build AI and operations automation for service businesses —
            bookings, client intake, follow-ups and team coordination, running
            in one place instead of across WhatsApp threads and spreadsheets.
          </p>
          <Link to="/contact" className="btn-pill">
            Get in touch
            <span className="btn-pill-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
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
          <p className="footer-copy">
            &copy; {year} Aniket. {site.location}
          </p>
        </div>

        <div>
          <h2 className="footer-col-title">Menu</h2>
          <ul className="footer-list">
            {footerMenu.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="footer-col-title">Social</h2>
          {links.length > 0 ? (
            <ul className="footer-list">
              {links.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <SocialIcon name={item.icon} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="meta">Profiles going up shortly.</p>
          )}
        </div>
      </div>

      <p className="footer-watermark" aria-hidden="true">
        Aniket&reg;
      </p>
    </footer>
  )
}

function SocialIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': true
  }

  if (name === 'linkedin') {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M7.5 10.5V17M7.5 7.6v.1M11.5 17v-3.6a2.2 2.2 0 0 1 4.4 0V17"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (name === 'x') {
    return (
      <svg {...common}>
        <path
          d="M4 4l16 16M20 4 4 20"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (name === 'mail') {
    return (
      <svg {...common}>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="m4 8 7.1 5a1.6 1.6 0 0 0 1.8 0L20 8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // github
  return (
    <svg {...common}>
      <path
        d="M9.5 20.2c-4 1.2-4-2.1-5.5-2.5m11 4.3v-3.4c0-1 .1-1.4-.5-2 2.3-.2 4.5-1.1 4.5-5a3.9 3.9 0 0 0-1.1-2.7 3.6 3.6 0 0 0-.1-2.7s-.9-.2-2.9 1.1a10 10 0 0 0-5 0C7.9 5.9 7 6.1 7 6.1a3.6 3.6 0 0 0-.1 2.7A3.9 3.9 0 0 0 5.8 11.5c0 3.9 2.2 4.8 4.5 5-.6.6-.6 1.2-.5 2v3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
