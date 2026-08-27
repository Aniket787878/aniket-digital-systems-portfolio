import { Link } from 'react-router-dom'
import { capabilities } from '../../data.js'
import HeroCanvas from '../../components/HeroCanvas.jsx'
import ArrowIcon from '../../components/ArrowIcon.jsx'

/* ---------------------------------------------------------------
   1 — Hero. Full-bleed image ground, content anchored to the
   bottom, capability range as a numbered rule beneath it.
   --------------------------------------------------------------- */
export default function Hero() {
  return (
    <section className="hero">
      {/* The hero ground is the shader, not photography. This gradient is
          what shows when WebGL is unavailable, so it has to stand on its
          own — hence a designed ramp rather than a flat fill. */}
      <div className="hero-ground" aria-hidden="true" />
      <HeroCanvas />
      <div className="hero-scrim" aria-hidden="true" />

      <div className="container hero-content">
        <div className="hero-grid">
          <div>
            <p className="hero-eyebrow">Hey, I&rsquo;m Aniket &mdash; I build</p>
            <h1 className="hero-title">Systems that run themselves</h1>
          </div>
          <div className="hero-support">
            <p className="hero-claim">
              Good systems should feel invisible.
            </p>
            <p className="hero-lede">
              For clinics, studios, agencies and consultancies: bookings,
              intake and follow-ups in one place instead of across WhatsApp
              threads and spreadsheets.
            </p>
            <Link to="/contact" className="btn-pill btn-pill-accent hero-cta">
              Get in touch
              <span className="btn-pill-icon" aria-hidden="true">
                <ArrowIcon />
              </span>
            </Link>
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
