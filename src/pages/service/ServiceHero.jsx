import { useRef } from 'react'
import { fx } from '../../interactions/attrs.js'
import { Link } from 'react-router-dom'
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react'
import Icon from '../../components/icons.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import BookingCta from '../../components/BookingCta.jsx'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'
import { whatsappPrefill } from '../../data.js'
import { hasWhatsApp } from '../../whatsapp.js'
import { hasBooking } from '../../booking.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { heroContainer, heroItem } from '../../motion/variants.js'

/* Seeded once: the same range on every visit, and not the home or
   contact page's. One range for all three service pages, so moving
   between them reads as the same place. */
const FAR = ridge({ seed: 43, base: 200, amp: 58, detail: 0.8 })
const NEAR = ridge({ seed: 97, base: 280, amp: 40, detail: 1.1 })
const STARS = starField(50, 31)

/* ---------------------------------------------------------------
   A service page's dusk header: the area's two-line claim, the ask,
   and three glass cards resting on the range that say what the buyer
   gets. The far ridge drifts a little on scroll; reduced motion keeps
   it still. Mirrors contact/ContactHero.jsx.
   --------------------------------------------------------------- */
export default function ServiceHero({ area }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const currency = useCurrency()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const yFar = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120])
  const yStars = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 160])
  const prefill = whatsappPrefill[area.slug] || whatsappPrefill.hero

  return (
    <section className="svc-hero" ref={ref} aria-labelledby="svc-title">
      <div className="dusk-sky dusk-sky-low" aria-hidden="true">
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
        <Ridge d={FAR} fill="#3a1b0b" />
      </m.div>
      <div className="dusk-layer dusk-near" aria-hidden="true">
        <Ridge d={NEAR} fill="var(--night)" />
      </div>

      {/* Keyed on the area so moving between service pages replays the
          entrance instead of swapping the words in place. */}
      <m.div
        key={area.slug}
        className="container svc-hero-inner"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <m.p className="glass-pill svc-kicker" variants={heroItem}>
          <Icon name={area.icon} size={15} />
          {area.name}
        </m.p>
        <m.h1 className="dusk-title svc-title" id="svc-title" variants={heroItem}>
          {area.title[0]}
          <span className="dusk-title-warm"> {area.title[1]}</span>
        </m.h1>
        <m.p className="dusk-sub svc-sub" variants={heroItem}>
          {area.sub}
        </m.p>

        <m.div className="dusk-actions" variants={heroItem}>
          {hasBooking ? (
            <>
              <BookingCta className="btn-saffron" magnet />
              <WhatsAppCta message={prefill} label="WhatsApp me" className="btn-light" />
            </>
          ) : (
            <>
              {hasWhatsApp ? (
                <WhatsAppCta message={prefill} label="Book a free call" className="btn-saffron" magnet />
              ) : (
                <Link to={`/contact?service=${area.slug}#write`} className="btn-saffron" {...fx('magnet')}>
                  Book a free call
                </Link>
              )}
              <a href="#prices" className="btn-light">
                See the prices
              </a>
            </>
          )}
        </m.div>
        <m.p className="dusk-footnote" variants={heroItem}>
          From {inCurrency(area.from, currency)}. Free 15-minute call first, no obligation.
        </m.p>

        <m.ul className="svc-points" variants={heroItem} aria-label={`What you get with ${area.name.toLowerCase()}`}>
          {area.points.map((point) => (
            <li key={point.title} className="svc-point">
              <span className="svc-point-icon" aria-hidden="true">
                <Icon name={point.icon} size={20} />
              </span>
              <span className="svc-point-title">{point.title}</span>
              <span className="svc-point-text">{point.text}</span>
            </li>
          ))}
        </m.ul>
      </m.div>
    </section>
  )
}
