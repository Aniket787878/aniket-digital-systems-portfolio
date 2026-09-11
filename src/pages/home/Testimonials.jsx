import { Link } from 'react-router-dom'
import { testimonials, social } from '../../data.js'

/* ---------------------------------------------------------------
   3b — Testimonials. The market's #1 trust lever (docs/research/06),
   built as a slot rather than faked.

   `testimonials` in data.js is empty on purpose — CLAUDE.md forbids
   placeholder quotes — so until a real, attributed one lands this band
   renders an honest stand-in: the case studies above are real builds,
   named quotes are coming, references are available on request. The
   moment an entry exists, the same band renders it as a quote card and
   the stand-in disappears. Nothing here is invented.
   --------------------------------------------------------------- */
export default function Testimonials() {
  const hasQuotes = testimonials.length > 0
  const github = social.find((s) => s.icon === 'github' && s.href)

  return (
    <section className="voices">
      <div className="container">
        <p className="kicker">In their words</p>

        {hasQuotes ? (
          <ul className="voices-grid">
            {testimonials.map((t) => (
              <li key={`${t.name}-${t.business}`} className="voice-card">
                <blockquote className="voice-quote">{t.quote}</blockquote>
                <div className="voice-attr">
                  <span className="voice-name">{t.name}</span>
                  <span className="voice-role">
                    {t.role}
                    {t.role && t.business ? ', ' : ''}
                    {t.business}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="voices-empty">
            <p className="voices-empty-lead">
              The four systems above are real builds, not mockups.
            </p>
            <p className="voices-empty-body">
              Named client quotes are going up here as each one signs off on
              being credited. In the meantime, references are available on
              request &mdash; and the code speaks for itself.
            </p>
            <div className="voices-empty-actions">
              <Link to="/contact" className="arrow-link">
                Ask for a reference
                <span className="arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
              {github && (
                <a
                  href={github.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="arrow-link"
                >
                  See the work on GitHub
                  <span className="arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
