import { Link } from 'react-router-dom'
import Media from '../components/Media.jsx'
import WhatsAppCta from '../components/WhatsAppCta.jsx'
import { hasWhatsApp } from '../whatsapp.js'
import { founder, site, whatsappPrefill } from '../data.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import './AboutPage.css'

/*
  About — the person behind the work. The site sells a solo specialist
  (docs/research/06), so this page exists to put a real human on it.

  Everything renders from `founder` in data.js: honest facts where they
  exist, labelled slots where they don't. The photo well and the story
  slot both stay visible while empty, so dropping the real content in
  later changes pixels, not layout — the same rule as the image
  placeholders elsewhere on the site. Nothing here is invented.
*/
export default function AboutPage() {
  useDocumentTitle('About — Aniket')
  const hasStory = founder.story.trim().length > 0

  return (
    <section className="container page about">
      <p className="eyebrow">About</p>
      <h1 className="page-title">The person you&rsquo;ll actually work with</h1>
      <p className="page-lede">{founder.intro}</p>

      <div className="about-top">
        <Media
          src={founder.photo}
          alt={founder.photo ? founder.name : ''}
          label="Photo of Aniket"
          className="about-photo"
        />

        <dl className="about-facts">
          {founder.quickFacts.map((fact) => (
            <div key={fact.label} className="about-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="about-story">
        <h2 className="about-h2">How I got here</h2>
        {hasStory ? (
          <p className="about-story-body">{founder.story}</p>
        ) : (
          /* Empty slot, said out loud rather than papered over with
             invented biography. */
          <p className="about-story-slot">
            The longer version &mdash; the practice this grew out of, and the
            builds since &mdash; is going here shortly.
          </p>
        )}
      </div>

      <div className="about-principles">
        <h2 className="about-h2">What working with me is like</h2>
        <ul className="about-principle-list">
          {founder.principles.map((p) => (
            <li key={p.title} className="about-principle">
              <h3 className="about-principle-title">{p.title}</h3>
              <p className="about-principle-text">{p.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="about-cta">
        <h2 className="about-cta-title">Tell me which part is breaking.</h2>
        <p className="about-cta-body">
          {site.availability} If your bookings, intake, follow-ups or team
          coordination are running on WhatsApp threads and spreadsheets,
          that&rsquo;s the conversation to start.
        </p>
        <div className="about-cta-actions">
          {hasWhatsApp && (
            <WhatsAppCta
              message={whatsappPrefill.contact}
              label="Message me on WhatsApp"
              className="btn-pill btn-pill-accent"
            />
          )}
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
        </div>
      </div>
    </section>
  )
}
