import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  projects,
  capabilities,
  process,
  faq,
  images,
  site
} from '../data.js'
import Media from '../components/Media.jsx'
import './HomePage.css'

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14m0 0-6-6m6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div className="home">
      <Hero />
      <Work />
      <Process />
      <Faq />
      <Gallery />
    </div>
  )
}

/* ---------------------------------------------------------------
   1 — Hero. Full-bleed image ground, content anchored to the
   bottom, capability range as a numbered rule beneath it.
   --------------------------------------------------------------- */
function Hero() {
  return (
    <section className="hero">
      <Media
        className="hero-media"
        src={images.hero}
        label="Hero image"
        alt=""
      />
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

/* ---------------------------------------------------------------
   2 — Selected work. Real case studies, each with its own image
   slot; the card is the link.
   --------------------------------------------------------------- */
function Work() {
  return (
    <section className="work">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">Selected Work</p>
            <h2 className="split-title">Problems, turned into systems</h2>
          </div>
          <p className="split-lede">
            Four builds for service businesses that were running their
            operations by hand. Each one starts with the process, not the tool.
          </p>
        </div>

        <ul className="work-grid">
          {projects.map((project) => (
            <li key={project.slug} className="work-item">
              <Link to={`/projects/${project.slug}`} className="work-card">
                <Media
                  className="work-media"
                  src={images.projects[project.slug]}
                  label={`Project ${project.index}`}
                  alt=""
                />
                <div className="work-body">
                  <div className="work-meta">
                    <span className="work-index">{project.index}</span>
                    {project.private && (
                      <span className="work-tag">Private client</span>
                    )}
                    <span className="work-tag">{project.timeline}</span>
                  </div>
                  <h3 className="work-title">{project.title}</h3>
                  <p className="work-summary">{project.summary}</p>
                  <span className="arrow-link">
                    View system
                    <span className="arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   3 — Process. Hovering a row fills it with the accent and slides
   an image in from the right. The image is decorative: every word
   of the step is readable without hovering anything.
   --------------------------------------------------------------- */
function Process() {
  return (
    <section className="process">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">Step-by-Step</p>
            <h2 className="split-title">How a build actually goes</h2>
          </div>
          <p className="split-lede">
            I don&rsquo;t start with the tool. I start with how the work happens
            today, and where the friction actually is.
          </p>
        </div>

        <ol className="process-steps">
          {process.map((step) => (
            <li key={step.index} className="process-step">
              <span className="process-rule" aria-hidden="true" />
              <span className="process-index">{step.index}</span>
              <h3 className="process-title">{step.title}</h3>
              <p className="process-text">{step.text}</p>
              <Media
                className="process-media"
                src={images.process[step.key]}
                label={step.title}
                alt=""
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   4 — FAQ. Real disclosure buttons, one open at a time.
   --------------------------------------------------------------- */
function Faq() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq">
      <div className="container faq-grid">
        <div className="faq-intro">
          <p className="kicker">Frequently Asked Questions</p>
          <h2 className="split-title">Answers to common questions</h2>
          <p className="faq-lede">
            Scope, cost, ownership and what I need from you before anything
            starts.
          </p>
          <Link to="/contact" className="btn-pill">
            Contact me
            <span className="btn-pill-icon" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </div>

        <ul className="faq-list">
          {faq.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <li
                key={item.q}
                className={`faq-item${isOpen ? ' faq-item-open' : ''}`}
              >
                <h3>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span className="faq-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="faq-q-text">{item.q}</span>
                  </button>
                </h3>
                {isOpen && (
                  <div
                    className="faq-a"
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                  >
                    <p>{item.a}</p>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   5 — Closing CTA over a fanned strip of image slots. The strip is
   purely decorative; the heading and button carry the meaning.
   --------------------------------------------------------------- */
function Gallery() {
  const slots = images.gallery
  const mid = (slots.length - 1) / 2

  return (
    <section className="gallery">
      <div className="gallery-stage" aria-hidden="true">
        <div className="gallery-fan">
          {slots.map((src, i) => {
            // Rotate away from the centre so the row reads as an arc.
            const offset = i - mid
            const style = {
              '--fan-rotate': `${offset * -9}deg`,
              '--fan-lift': `${Math.abs(offset) * 14}px`,
              '--fan-scale': `${1 + Math.abs(offset) * 0.13}`
            }
            return (
              <div className="gallery-slot" key={i} style={style}>
                <Media src={src} label={`Slot ${i + 1}`} alt="" />
              </div>
            )
          })}
        </div>
      </div>

      <div className="container gallery-content">
        <p className="kicker">Behind the systems</p>
        <h2 className="gallery-title">Curious what else I&rsquo;ve built?</h2>
        <p className="gallery-lede">
          The full set of booking flows, intake systems, dashboards and
          automations &mdash; with the problem each one started from.
        </p>
        <Link to="/projects" className="btn-pill gallery-cta">
          See more projects
          <span className="btn-pill-icon" aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
        {site.availability && (
          <p className="gallery-availability">{site.availability}</p>
        )}
      </div>
    </section>
  )
}
