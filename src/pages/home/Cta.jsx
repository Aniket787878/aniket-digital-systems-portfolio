import { Link } from 'react-router-dom'
import { fx } from '../../interactions/attrs.js'
import { m } from 'motion/react'
import { site, whatsappPrefill, services } from '../../data.js'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import BookingCta from '../../components/BookingCta.jsx'
import { hasBooking } from '../../booking.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'
import { hasWhatsApp } from '../../whatsapp.js'
import { reveal } from '../../motion/variants.js'

const FAR = ridge({ seed: 71, base: 190, amp: 55, detail: 0.8 })
const NEAR = ridge({ seed: 83, base: 270, amp: 40, detail: 1.1 })
const STARS = starField(40, 19)

/* ---------------------------------------------------------------
   6 — Closing call to action, back at dusk: the page ends where it
   began. The free call is the ask (docs/research/06, gap G5). Also the
   closing band of the three service pages, so the copy stays general;
   there `service` preselects that area in the contact form.
   --------------------------------------------------------------- */
export default function Cta({ service }) {
  const contact = service ? `/contact?service=${service}#write` : '/contact'
  const currency = useCurrency()
  const anchor = services.reduce(
    (text, area) => text.replace(`{${area.slug}}`, inCurrency(area.from, currency)),
    site.pricingAnchor
  )

  return (
    <section className="dusk-cta">
      <div className="dusk-sky dusk-sky-low" aria-hidden="true">
        <div className="dusk-stars">
          {STARS.map((s) => (
            <i
              key={s.id}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.o, animationDelay: `${s.d}s` }}
            />
          ))}
        </div>
        <div className="dusk-sun" />
      </div>
      <div className="dusk-layer dusk-far" aria-hidden="true">
        <Ridge d={FAR} fill="#3a1b0b" />
      </div>
      <div className="dusk-layer dusk-near" aria-hidden="true">
        <Ridge d={NEAR} fill="var(--night)" />
      </div>

      <m.div className="container dusk-cta-inner" {...reveal}>
        <p className="glass-pill">
          <span className="status-dot" aria-hidden="true" />
          Free 15-minute call
        </p>
        <h2 className="dusk-title dusk-cta-title">
          Something to build,
          <br />
          <span className="dusk-title-warm">or a week to win back?</span>
        </h2>
        <p className="dusk-sub">
          Tell me what your business needs or what is eating your week, and
          I will tell you straight what it would take and whether it is
          worth doing.
        </p>
        <div className="dusk-actions">
          {hasBooking ? (
            <>
              <BookingCta className="btn-saffron" magnet />
              <WhatsAppCta message={whatsappPrefill.cta} label="WhatsApp me" className="btn-light" />
            </>
          ) : (
            <>
              {hasWhatsApp ? (
                <WhatsAppCta message={whatsappPrefill.audit} label="Book the free call" className="btn-saffron" magnet />
              ) : (
                <Link to={contact} className="btn-saffron" {...fx('magnet')}>
                  Book the free call
                </Link>
              )}
              <Link to={contact} className="btn-light">
                Send a message
              </Link>
            </>
          )}
        </div>
        <p className="dusk-footnote">{anchor}</p>
      </m.div>
    </section>
  )
}
