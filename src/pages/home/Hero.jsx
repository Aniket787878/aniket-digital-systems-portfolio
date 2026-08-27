import { Link } from 'react-router-dom'
import { capabilities, site, whatsappPrefill } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import { hasWhatsApp } from '../../whatsapp.js'

/* ---------------------------------------------------------------
   1 — Hero. Full-bleed portrait ground, content anchored to the
   bottom, capability range as a numbered rule beneath it.
   --------------------------------------------------------------- */
export default function Hero() {
  return (
    <section className="hero">
      {/* Shows for the instant before the JPEG decodes, and is the whole
          picture if it never arrives — hence a designed ramp sampled from
          the photograph rather than a flat fill. */}
      <div className="hero-ground" aria-hidden="true" />
      {/* An <img> rather than a CSS background, for the two things a
          background cannot do: hand the browser a srcset to choose from,
          and start the fetch from the markup instead of from the stylesheet.
          index.html preloads the same pair, so it is in flight before this
          element exists. */}
      <img
        className="hero-photo"
        src="/hero.jpg"
        srcSet="/hero-960.jpg 960w, /hero.jpg 1913w"
        sizes="100vw"
        width="1913"
        height="822"
        alt="Aniket, with an n8n AI Agent workflow reflected in his glasses"
      />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-content">
        <div className="hero-grid">
          <div>
            <p className="hero-eyebrow">Hey, I&rsquo;m Aniket &mdash; I build</p>
            <h1 className="hero-title">Systems that run themselves</h1>
          </div>
          <div className="hero-support">
            {/* A result, not a slogan. "Good systems should feel
                invisible" said nothing a visitor could check; the number
                below is the same length and does the persuading. The
                sentiment still opens the footer. */}
            <p className="hero-claim">{site.heroProof.claim}</p>
            <p className="hero-lede">
              For clinics, studios, agencies and consultancies: bookings,
              intake and follow-ups in one place instead of across WhatsApp
              threads and spreadsheets.
            </p>
            <p className="hero-proof-note">
              {site.heroProof.note}{' '}
              <Link
                to={`/projects/${site.heroProof.slug}`}
                className="hero-proof-link"
              >
                {site.heroProof.linkLabel}
                <span className="arrow" aria-hidden="true">
                  &nbsp;&rarr;
                </span>
              </Link>
            </p>
            {/* WhatsApp leads when it exists, because the buyer already
                lives there; the form drops to a quiet second path. With no
                number set, the form is the only route and keeps the fill. */}
            <div className="hero-actions">
              <WhatsAppCta
                message={whatsappPrefill.hero}
                label="Message me on WhatsApp"
                className="btn-pill btn-pill-accent hero-cta"
              />
              {hasWhatsApp ? (
                <Link to="/contact" className="arrow-link hero-alt-cta">
                  Or send a message
                  <span className="arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              ) : (
                <Link
                  to="/contact"
                  className="btn-pill btn-pill-accent hero-cta"
                >
                  Get in touch
                  <span className="btn-pill-icon" aria-hidden="true">
                    <ArrowIcon />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        <ol className="capabilities-row">
          {capabilities.map((item) => (
            <li key={item.index} className="capability">
              <span className="capability-index">
                <span className="capability-hash" aria-hidden="true">
                  #
                </span>
                {item.index}
              </span>
              <span className="capability-title">{item.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
