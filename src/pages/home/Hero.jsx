import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { whatsappPrefill } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import Magnetic from '../../motion/Magnetic.jsx'
import SplitText from '../../motion/SplitText.jsx'
import { hasWhatsApp } from '../../whatsapp.js'
import { heroContainer, heroItem } from '../../motion/variants.js'
import HeroWorkflow from './HeroWorkflow.jsx'

/* ---------------------------------------------------------------
   1 — Hero.

   Composition inspired by getstage.co: centred copy at the top,
   a wide showcase card below. The showcase carries the two things
   that describe the offer at a glance — who is building this, and
   the shape of the systems he builds.

   The showcase is a two-column card:
     · Left  — the portrait, the person you'd be working with.
     · Right — three n8n-style workflows drawn as a schematic, so
               the reader sees the mechanism, not a stock diagram.

   The photograph is `/hero-portrait.jpg` — the same real photo of
   Aniket already deployed. A proper standing-pose shot has been
   requested and will drop straight into the same <img>; nothing
   about the layout depends on it being a face crop today.
   --------------------------------------------------------------- */
export default function Hero() {
  return (
    <section className="hero">
      {/* The hero ground: dark gradient, no full-bleed photograph any
          more — the portrait now lives inside the showcase card so it
          reads as a person, not as a background. */}
      <div className="hero-ground" aria-hidden="true" />

      <div className="container hero-content">
        <m.div
          className="hero-lockup"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <m.div className="hero-badge" variants={heroItem}>
            <span className="hero-badge-dot" aria-hidden="true" />
            Available &middot; 2 build slots a month
          </m.div>

          <m.p className="hero-eyebrow" variants={heroItem}>
            Hey, I&rsquo;m Aniket &mdash; I build
          </m.p>
          <SplitText
            as="h1"
            className="hero-title"
            text="Complete systems, end to end."
            standalone={false}
          />
          <m.p className="hero-sub" variants={heroItem}>
            AI agents, n8n workflows and the software behind them &mdash;
            wired into WhatsApp, email and the tools your team already uses.
          </m.p>

          <m.div className="hero-actions" variants={heroItem}>
            <Magnetic>
              <WhatsAppCta
                message={whatsappPrefill.hero}
                label="Message me on WhatsApp"
                className="btn-pill btn-pill-accent hero-cta"
              />
            </Magnetic>
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
          </m.div>
        </m.div>

        {/* The showcase card. Two panels sit inside one frame so the
            person on the left and the systems on the right read as one
            offer, not two adjacent slots. */}
        <m.div
          className="hero-showcase"
          variants={heroItem}
          initial="hidden"
          animate="show"
        >
          <div className="hero-showcase-portrait">
            <img
              className="hero-portrait-img"
              src="/hero-portrait.jpg"
              width="720"
              height="900"
              alt="Aniket"
              loading="eager"
              decoding="async"
            />
            <div className="hero-portrait-caption">
              <span className="hero-portrait-name">Aniket</span>
              <span className="hero-portrait-role">
                Solo builder &middot; AI &amp; ops automation
              </span>
            </div>
          </div>
          <div className="hero-showcase-workflow">
            <div className="hero-workflow-bar" aria-hidden="true">
              <span className="hero-workflow-dots">
                <i /><i /><i />
              </span>
              <span className="hero-workflow-label">n8n &middot; live workflows</span>
            </div>
            <HeroWorkflow />
          </div>
        </m.div>
      </div>
    </section>
  )
}
