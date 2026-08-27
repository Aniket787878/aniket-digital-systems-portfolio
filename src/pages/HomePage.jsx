import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  projects,
  capabilities,
  process,
  faq,
  images,
  site,
  proofTools,
  packages,
  carePlan
} from '../data.js'
import Media from '../components/Media.jsx'
import HeroCanvas from '../components/HeroCanvas.jsx'
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
      <ProofStrip />
      <Work />
      <Capabilities />
      <Process />
      <Pricing />
      <CtaBand />
      <Faq />
      <Gallery />
    </div>
  )
}

/* ---------------------------------------------------------------
   1b — Proof strip. The stack, named, straight under the hero.

   A tools row is the honest version of the logo wall a template puts
   here: no client logos to show yet, but "n8n, Claude, Supabase" tells a
   technical buyer more than six greyed-out wordmarks would. Each tool
   carries the reason it gets used, so it reads as judgement rather than
   a skills list.
   --------------------------------------------------------------- */
function ProofStrip() {
  return (
    <section className="proof">
      <div className="container">
        <p className="proof-intro">
          Built with tools you keep. Self-hosted where it matters, so the
          system stays yours after I hand it over.
        </p>
        <ul className="proof-grid">
          {proofTools.map((tool) => (
            <li key={tool.name} className="proof-item">
              <span className="proof-name">{tool.name}</span>
              <span className="proof-note">{tool.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   2b — Capabilities. The hero names the four areas; this is where
   they get said properly, with the blurb and the concrete items that
   were already sitting unused in data.js.
   --------------------------------------------------------------- */
function Capabilities() {
  return (
    <section className="caps">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">What I can help you with</p>
            <h2 className="split-title">Four things, done properly</h2>
          </div>
          <p className="split-lede">
            Most engagements touch two or three of these. The point is never
            the tool &mdash; it is the hour a week that stops being spent on
            copy-paste.
          </p>
        </div>

        <ul className="caps-grid">
          {capabilities.map((cap) => (
            <li key={cap.index} className="caps-card">
              <span className="caps-index">
                <span className="capability-hash" aria-hidden="true">
                  #
                </span>
                {cap.index}
              </span>
              <h3 className="caps-title">{cap.title}</h3>
              <p className="caps-blurb">{cap.blurb}</p>
              <ul className="caps-tags">
                {cap.items.map((item) => (
                  <li key={item} className="caps-tag">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   4b — Pricing. Three productized offers, priced, from the service
   catalog. Naming the number is the whole point: the catalog's own
   rule is fixed scope with a stated timeline, never hourly.
   --------------------------------------------------------------- */
function Pricing() {
  return (
    <section className="pricing">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">Pricing</p>
            <h2 className="split-title">Fixed scope, stated timeline</h2>
          </div>
          <p className="split-lede">
            No hourly billing. Every engagement is a fixed price against a
            written scope, with a date attached. Half up front, half on
            delivery.
          </p>
        </div>

        <ul className="pricing-grid">
          {packages.map((pkg) => (
            <li
              key={pkg.name}
              className={`pricing-card${pkg.featured ? ' pricing-card-featured' : ''}`}
            >
              {pkg.featured && (
                <span className="pricing-flag">Most start here</span>
              )}
              <h3 className="pricing-name">{pkg.name}</h3>
              <p className="pricing-price">{pkg.price}</p>
              <p className="pricing-timeline">{pkg.timeline}</p>
              <p className="pricing-for">{pkg.forWho}</p>
              <p className="pricing-deliverable">{pkg.deliverable}</p>
              <ul className="pricing-list">
                {pkg.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/contact" className="pricing-cta arrow-link">
                Start here
                <span className="arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="pricing-care">
          <strong>{carePlan.name}</strong> &mdash; {carePlan.price}.{' '}
          {carePlan.blurb}
        </p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   5b — CTA band. The reference breaks its long middle with a
   full-bleed colour block before the FAQ; this does the same job with
   the availability line, which is the most persuasive sentence on the
   page and was previously buried at the very bottom.
   --------------------------------------------------------------- */
function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <div className="cta-band-inner">
          <p className="kicker cta-band-kicker">Next step</p>
          <h2 className="cta-band-title">
            Tell me the part of the week you dread.
          </h2>
          <p className="cta-band-lede">{site.pricingAnchor}</p>
          <Link to="/contact" className="btn-pill cta-band-cta">
            Get in touch
            <span className="btn-pill-icon" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
          {site.availability && (
            <p className="cta-band-availability">{site.availability}</p>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------
   1 — Hero. Full-bleed image ground, content anchored to the
   bottom, capability range as a numbered rule beneath it.
   --------------------------------------------------------------- */
function Hero() {
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
/* Degrees between adjacent cards around the arc. */
const ARC_STEP = 15

/*
  Drives `--open` on the stage straight from scroll position: 0 while the
  section is still below the fold, 1 once it has risen into view. The arc
  uses it to spread and curve, so the section assembles itself as you
  arrive at it.

  Written to the DOM node rather than held in React state on purpose — a
  setState per scroll frame would re-render eight cards continuously for
  what is a single custom property.
*/
function useArcOpen(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      if (motion.matches) {
        el.style.setProperty('--open', '1')
        return
      }
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // Fully open by the time the top edge has travelled 85% of a
      // viewport upward — the arc finishes settling before it is centred,
      // rather than still moving while you are reading the headline.
      const p = (vh - r.top) / (vh * 0.85)
      el.style.setProperty('--open', String(Math.min(1, Math.max(0, p))))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    motion.addEventListener('change', update)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      motion.removeEventListener('change', update)
    }
  }, [ref])
}

function Gallery() {
  const slots = images.gallery
  const mid = (slots.length - 1) / 2
  const stageRef = useRef(null)
  useArcOpen(stageRef)

  return (
    <section className="gallery">
      <div className="gallery-stage" ref={stageRef} aria-hidden="true">
        <div className="gallery-fan">
          {slots.map((src, i) => {
            /* Lay the cards on a cylinder that curves *towards* the
               viewer, so the outer ones come forward and read larger —
               the shape you get standing inside the curve rather than
               looking at the outside of it.

               sin/cos are resolved here because they only depend on the
               card's index, never on the radius. That leaves the radius
               itself free to stay a responsive CSS clamp, instead of
               being pinned to whatever the viewport was at mount. */
            const offset = i - mid
            const rad = (offset * ARC_STEP * Math.PI) / 180
            const style = {
              '--sin': Math.sin(rad).toFixed(4),
              // 1 - cos: depth measured from the arc's nearest point, so
              // the centre card sits flat on the section plane at z = 0.
              '--depth': (1 - Math.cos(rad)).toFixed(4),
              '--angle': `${-offset * ARC_STEP}deg`,
              // Nearer cards paint over farther ones.
              zIndex: Math.round(10 - Math.abs(offset) * 2)
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
      </div>
    </section>
  )
}
