import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { site, whatsappPrefill } from '../../data.js'

const heroProof = site.heroProof
import ArrowIcon from '../../components/ArrowIcon.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import Magnetic from '../../motion/Magnetic.jsx'
import SplitText from '../../motion/SplitText.jsx'
import { hasWhatsApp } from '../../whatsapp.js'
import { heroContainer, heroItem } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   1 — Hero. Proof-led, per the 2026-09-13 reposition ("sell the
   proof: complete production systems, built solo").

   No photograph and no 3D accent here any more: the fold now leads
   with the claim and two real proof figures rather than a portrait.
   The hero-photo files stay in public/ so the photographic hero can
   be brought back, but nothing on this page references them.

   The 750+ figure never appears without heroProof.note beneath the
   cards — the house rule that no number renders without the caveat
   that qualifies it (CLAUDE.md rule 6, data.js heroProof).
   --------------------------------------------------------------- */
export default function Hero() {
  return (
    <section className="hero">
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
            {site.availability
              ? 'Available · 2 build slots a month'
              : 'Systems builder'}
          </m.div>

          <m.p className="hero-eyebrow" variants={heroItem}>
            Hey, I&rsquo;m Aniket &mdash; I build
          </m.p>
          <SplitText
            as="h1"
            className="hero-title"
            text="Complete production systems. End to end. Solo."
            standalone={false}
          />
          <m.p className="hero-sub" variants={heroItem}>
            Site, app, payments, backend, AI and the infrastructure
            underneath &mdash; the whole thing built and shipped by one person,
            for founders who need it done, not a team to manage.
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
              <Link to="/projects" className="arrow-link hero-alt-cta">
                See the work
                <span className="arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            ) : (
              <Link to="/contact" className="btn-pill hero-cta">
                Get in touch
                <span className="btn-pill-icon" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </Link>
            )}
          </m.div>
        </m.div>

        {/* Two real proof figures. The first is a row count from a live
            production database; the second is the count of shipped systems.
            heroProof.note qualifies the number directly beneath. */}
        <m.div
          className="hero-proof"
          variants={heroItem}
          initial="hidden"
          animate="show"
        >
          <div className="hero-proof-row">
            <div className="hero-proof-card">
              <span className="hero-proof-num">1,200+</span>
              <p className="hero-proof-text">
                client records across <strong>11 therapists</strong>, in daily
                use on one system I designed, built and ship.
              </p>
              <Link
                to={`/projects/${heroProof.slug}`}
                className="hero-proof-link"
              >
                {heroProof.linkLabel}
                <span className="arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="hero-proof-card">
              <span className="hero-proof-num">5</span>
              <p className="hero-proof-text">
                systems shipped end to end &mdash;{' '}
                <strong>two production platforms</strong> and three working
                tools.
              </p>
            </div>
          </div>
          <p className="hero-proof-note">{heroProof.note}</p>
        </m.div>
      </div>
    </section>
  )
}
