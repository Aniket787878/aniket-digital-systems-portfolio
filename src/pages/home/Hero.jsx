import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { whatsappPrefill } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import Magnetic from '../../motion/Magnetic.jsx'
import SplitText from '../../motion/SplitText.jsx'
import { hasWhatsApp } from '../../whatsapp.js'
import { heroContainer, heroItem } from '../../motion/variants.js'
import HeroMountains from './HeroMountains.jsx'
import HeroWorkflow from './HeroWorkflow.jsx'

/* ---------------------------------------------------------------
   1 — Hero.

   Composition inspired by getstage.co: centred copy over a parallax
   mountain scene, then a wide showcase card below with a standing
   figure on the left and the spider workflow on the right.

   The portrait slot renders an SVG silhouette placeholder — the real
   standing-pose photograph of Aniket is not yet supplied, so we mark
   the slot honestly rather than repurpose the old face crop as a
   stand-in.
   --------------------------------------------------------------- */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-ground" aria-hidden="true" />
      <HeroMountains />

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
            wired into WhatsApp, Slack, email and the tools your team
            already uses.
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

        <m.div
          className="hero-showcase"
          variants={heroItem}
          initial="hidden"
          animate="show"
        >
          <div className="hero-showcase-portrait">
            <StandingFigure />
            <div className="hero-portrait-caption">
              <span className="hero-portrait-name">Placeholder</span>
              <span className="hero-portrait-role">
                Standing-pose photograph &mdash; pending
              </span>
            </div>
          </div>
          <div className="hero-showcase-workflow">
            <div className="hero-workflow-bar" aria-hidden="true">
              <span className="hero-workflow-dots">
                <i /><i /><i />
              </span>
              <span className="hero-workflow-label">n8n &middot; live workflow</span>
            </div>
            <HeroWorkflow />
          </div>
        </m.div>
      </div>
    </section>
  )
}

/* Silhouette of a standing figure. Not a photograph, not stock — a
   deliberate placeholder so the slot reads as awaiting a real image
   rather than pretending to have one. */
function StandingFigure() {
  return (
    <svg
      className="hero-standing-figure"
      viewBox="0 0 240 400"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label="Placeholder silhouette of a standing person"
    >
      <defs>
        <linearGradient id="figure-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a1a08" />
          <stop offset="100%" stopColor="#0a0402" />
        </linearGradient>
        <linearGradient id="figure-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,135,30,0.18)" />
          <stop offset="100%" stopColor="rgba(245,135,30,0)" />
        </linearGradient>
      </defs>
      {/* Floor pool of light */}
      <ellipse cx="120" cy="380" rx="90" ry="14" fill="url(#figure-floor)" />
      {/* Head */}
      <circle cx="120" cy="70" r="28" fill="url(#figure-g)" />
      {/* Neck + shoulders */}
      <path
        d="M108 92 Q120 108 132 92 L154 118 Q170 150 168 185 L166 240 Q166 260 158 275 L146 340 L152 384 L138 384 L128 340 L122 300 L118 340 L108 384 L94 384 L100 340 L88 275 Q80 260 80 240 L78 185 Q76 150 92 118 Z"
        fill="url(#figure-g)"
      />
    </svg>
  )
}
