import { Fragment, useRef } from 'react'
import { fx } from '../../interactions/attrs.js'
import { Link } from 'react-router-dom'
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { site, whatsappPrefill, explainers } from '../../data.js'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import BookingCta from '../../components/BookingCta.jsx'
import LoopVideo from '../../components/LoopVideo.jsx'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'
import { hasWhatsApp } from '../../whatsapp.js'
import { hasBooking } from '../../booking.js'
import { useStillMedia } from '../../stillMedia.js'

/* Seeded once at module load: the same range on every visit. */
const FAR = ridge({ seed: 11, base: 150, amp: 60, detail: 0.8 })
const MID = ridge({ seed: 29, base: 210, amp: 70 })
const NEAR = ridge({ seed: 53, base: 300, amp: 44, detail: 1.2 })
const STARS = starField(80, 5)

const EASE = [0.22, 1, 0.36, 1]
const [LINE_1, LINE_2] = site.headline

/* The hero film is the one-minute explainer: it shows the result the
   headline promises (an enquiry answered, booked and followed up) in type
   large enough to read on a phone. Phones get its poster, which is that
   exact frame. The showreel of the real apps now sits in the Statement. */
const FILM = explainers.brand

/* ---------------------------------------------------------------
   1 — Dusk hero (docs/design-system.md). A centred claim over a dusk
   sky; three ridges parallax at different rates as the page scrolls,
   and the one-minute explainer film rises out of the range, with the
   near ridge passing in front of it. Reduced motion: the still scene.
   --------------------------------------------------------------- */
export default function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const stillReel = useStillMedia()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  const still = (v) => (reduce ? 0 : v)
  const yFar = useTransform(scrollYProgress, [0, 1], [0, still(260)])
  const yMid = useTransform(scrollYProgress, [0, 1], [0, still(140)])
  const yStars = useTransform(scrollYProgress, [0, 1], [0, still(320)])
  const cardY = useTransform(scrollYProgress, [0, 0.5], [still(24), still(-40)])
  const cardScale = useTransform(scrollYProgress, [0, 0.45], [reduce ? 1 : 0.94, 1])
  const copyY = useTransform(scrollYProgress, [0, 0.4], [0, still(-80)])
  const copyO = useTransform(scrollYProgress, [0, 0.35], [1, reduce ? 1 : 0])

  return (
    <section className="dusk-hero" ref={ref}>
      <div className="dusk-sky" aria-hidden="true">
        <m.div className="dusk-stars" style={{ y: yStars }}>
          {STARS.map((s) => (
            <i
              key={s.id}
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.r,
                height: s.r,
                opacity: s.o,
                animationDelay: `${s.d}s`
              }}
            />
          ))}
        </m.div>
        <div className="dusk-sun" />
      </div>

      <m.div className="dusk-layer dusk-far" style={{ y: yFar }} aria-hidden="true">
        <Ridge d={FAR} fill="url(#far-grad)">
          <defs>
            <linearGradient id="far-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7a3812" />
              <stop offset="0.6" stopColor="#3a1b0b" />
            </linearGradient>
          </defs>
        </Ridge>
      </m.div>
      <m.div className="dusk-layer dusk-mid" style={{ y: yMid }} aria-hidden="true">
        <Ridge d={MID} fill="url(#mid-grad)">
          <defs>
            <linearGradient id="mid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3b1b0c" />
              <stop offset="0.5" stopColor="#1a0e08" />
            </linearGradient>
          </defs>
        </Ridge>
      </m.div>

      <m.div className="container dusk-copy" style={{ y: copyY, opacity: copyO }}>
        <m.p
          className="glass-pill"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="status-dot" aria-hidden="true" />
          Available for new projects
        </m.p>

        <h1 className="dusk-title" aria-label={`${LINE_1} ${LINE_2}`}>
          <BlurLine text={LINE_1} delay={0.1} />
          <BlurLine text={LINE_2} delay={0.35} className="dusk-title-warm" />
        </h1>

        <m.p
          className="dusk-sub"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
        >
          {site.subtitle}
        </m.p>

        <m.div
          className="dusk-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
        >
          {/* Booking link set: the call is primary, WhatsApp second, and
              "See the work" gives way (three buttons read as a menu).
              Not set: the free call on WhatsApp. */}
          {hasBooking ? (
            <>
              <BookingCta className="btn-saffron" magnet placement="hero" />
              <WhatsAppCta message={whatsappPrefill.hero} label="WhatsApp me" className="btn-light" placement="hero" />
            </>
          ) : (
            <>
              {hasWhatsApp ? (
                <WhatsAppCta
                  message={whatsappPrefill.audit}
                  label="Book a free call"
                  className="btn-saffron"
                  magnet
                  placement="hero"
                />
              ) : (
                <Link to="/contact" className="btn-saffron" {...fx('magnet')}>
                  Book a free call
                </Link>
              )}
              <a href="#work" className="btn-light">
                See the work
              </a>
            </>
          )}
        </m.div>
        <m.p
          className="dusk-footnote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.95 }}
        >
          Free 15-minute call. No obligation.
        </m.p>

      </m.div>

      <m.figure
        className="dusk-card"
        {...fx('media')}
        style={{ y: cardY, scale: cardScale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      >
        <div className="dusk-card-bar">
          <span className="dusk-card-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="dusk-card-title">
            <span className="live-dot" aria-hidden="true" />
            {FILM.title}
          </span>
        </div>
        {stillReel ? (
          <img
            src={FILM.poster}
            alt="An enquiry at 11:04 pm answered in seconds: web form, AI agent, CRM, WhatsApp reply, calendar slot, follow-up"
            className="dusk-card-video"
            width="1920"
            height="1080"
            decoding="async"
          />
        ) : (
          <LoopVideo
            src={FILM.src}
            poster={FILM.poster}
            className="dusk-card-video"
            label={FILM.title}
          />
        )}
      </m.figure>

      <div className="dusk-layer dusk-near" aria-hidden="true">
        <Ridge d={NEAR} fill="var(--night)" />
      </div>
    </section>
  )
}

/* One headline line, word by word, each rising out of a blur. Words are
   grouped by sentence ("Enquiries answered." / "Bookings confirmed."), and
   a sentence only wraps inside itself when it is wider than the screen, so
   the line breaks between sentences instead of leaving an orphan word. */
function BlurLine({ text, delay = 0, className = '' }) {
  const sentences = text.split(/(?<=\.)\s+/).map((t) => t.split(' '))
  let n = 0
  return (
    <span className={`dusk-line ${className}`.trim()} aria-hidden="true">
      {/* The space between sentences sits outside the inline-block phrase:
          a trailing space inside one collapses, gluing "answered.Bookings". */}
      {sentences.map((words, si) => (
        <Fragment key={si}>
        {si > 0 ? ' ' : ''}
        <span className="dusk-phrase">
          {words.map((w, i) => {
            const at = n++
            return (
              <span key={i}>
                <m.span
                  className="dusk-word"
                  initial={{ opacity: 0, y: '0.35em', filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.9, delay: delay + at * 0.07, ease: EASE }}
                >
                  {w}
                </m.span>
                {i < words.length - 1 ? ' ' : ''}
              </span>
            )
          })}
        </span>
        </Fragment>
      ))}
    </span>
  )
}
