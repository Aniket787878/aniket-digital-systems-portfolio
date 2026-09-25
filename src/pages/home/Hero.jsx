import { lazy, Suspense, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { site, whatsappPrefill } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import SafeMount from '../../components/SafeMount.jsx'
import { hasWhatsApp } from '../../whatsapp.js'
import { heroContainer, heroItem } from '../../motion/variants.js'

/* three.js / R3F live behind this dynamic import, so they are a separate
   chunk that only downloads when the 3D actually mounts — never on mobile,
   never under reduced motion, never in the first-load bundle. */
const Hero3D = lazy(() => import('../../components/Hero3D.jsx'))

/* ---------------------------------------------------------------
   1 — Hero. Full-bleed portrait ground, content anchored to the
   bottom.

   Four things speak here and no more: who, what, the one result
   worth checking, and the way to start. The numbered capability
   range that used to close this section has moved out entirely —
   it repeated section 2b word for word three bands later, and it
   was 179px of the reason the hero did not fit a 900px laptop.
   --------------------------------------------------------------- */
export default function Hero() {
  // The 3D accent is opt-in: only a wide viewport with motion allowed gets
  // it. Everyone else keeps the photograph alone. Computed after mount so it
  // never runs during SSR/first paint and never blocks the hero.
  const [enable3D, setEnable3D] = useState(false)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wide = window.matchMedia('(min-width: 1024px)').matches
    if (reduce || !wide) return undefined
    // Load the three.js chunk only once the browser is idle — after the
    // photo and copy have painted and the hero is interactive — so the 3D
    // never sits on the critical path or competes for the first frames.
    const ric = window.requestIdleCallback
    if (ric) {
      const id = ric(() => setEnable3D(true), { timeout: 1800 })
      return () => window.cancelIdleCallback?.(id)
    }
    const t = setTimeout(() => setEnable3D(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="hero">
      {/* Shows for the instant before the JPEG decodes, and is the whole
          picture if it never arrives — hence a designed ramp sampled from
          the photograph rather than a flat fill. */}
      <div className="hero-ground" aria-hidden="true" />
      {/* An <img> rather than a CSS background, for the two things a
          background cannot do: hand the browser a srcset to choose from,
          and start the fetch from the markup instead of from the stylesheet.
          index.html preloads the same set, so it is in flight before this
          element exists.

          The <source> is not an optimisation, it is a different photograph.
          The landscape frame is 2.33:1 and his face occupies the right
          quarter of it; a phone asks that frame to fill a box nearer 0.45:1,
          so a cover fit threw away four fifths of the width and what
          survived was an unreadable slice of one lens. hero-portrait.jpg is
          the same shot cropped to 4:5 around him, which is the only version
          of this picture that still reads as a person on a phone.

          600px, not the 810px where the layout changes. Between the two the
          band is wider than it is tall, and a 4:5 crop poured into a 1.4:1
          box comes back out as an extreme close-up with the top of his head
          and his chin both gone. A tablet is better served by the landscape
          frame the band was cut from. */}
      <picture>
        <source
          media="(max-width: 600px)"
          srcSet="/hero-portrait.jpg"
          width="720"
          height="900"
        />
        <img
          className="hero-photo"
          src="/hero.jpg"
          srcSet="/hero-960.jpg 960w, /hero.jpg 1913w"
          sizes="100vw"
          width="1913"
          height="822"
          alt="Aniket, with an n8n AI Agent workflow reflected in his glasses"
        />
      </picture>
      <div className="hero-scrim" aria-hidden="true" />

      {/* Pointer-reactive network, above the scrim and behind the copy.
          Suspense fallback is null — the photograph is already the ground,
          so there is nothing to show while the chunk loads. */}
      {enable3D && (
        <SafeMount>
          <Suspense fallback={null}>
            <Hero3D />
          </Suspense>
        </SafeMount>
      )}

      <div className="container hero-content">
        <m.div
          className="hero-grid"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <m.div variants={heroContainer}>
            <m.p className="hero-eyebrow" variants={heroItem}>
              Hey, I&rsquo;m Aniket &mdash; I build
            </m.p>
            <m.h1 className="hero-title" variants={heroItem}>
              Complete systems, end to end
            </m.h1>
          </m.div>
          <m.div className="hero-support" variants={heroContainer}>
            {/* A result, not a slogan. "Good systems should feel
                invisible" said nothing a visitor could check; the number
                below is the same length and does the persuading. The
                sentiment still opens the footer.

                The claim and its note are one object, not two lines of
                copy: an unqualified number is exactly what the note exists
                to prevent, so nothing may separate them. */}
            <m.p className="hero-claim" variants={heroItem}>
              {site.heroProof.claim}
            </m.p>
            <m.p className="hero-proof-note" variants={heroItem}>
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
            </m.p>
            {/* WhatsApp leads when it exists, because the buyer already
                lives there; the form drops to a quiet second path. With no
                number set, the form is the only route and keeps the fill. */}
            <m.div className="hero-actions" variants={heroItem}>
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
            </m.div>
          </m.div>
        </m.div>
      </div>
    </section>
  )
}
