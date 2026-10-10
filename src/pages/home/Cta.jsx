import { m } from 'motion/react'
import { site, whatsappPrefill, services } from '../../data.js'
import { StartCta, TalkCta } from '../../components/FunnelCta.jsx'
import { hasBooking } from '../../booking.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'
import { reveal } from '../../motion/variants.js'

const FAR = ridge({ seed: 71, base: 190, amp: 55, detail: 0.8 })
const NEAR = ridge({ seed: 83, base: 270, amp: 40, detail: 1.1 })
const STARS = starField(40, 19)

/* ---------------------------------------------------------------
   6 — Closing call to action, back at dusk: the page ends where it
   began. Used as the closing band of the three service pages: the ask
   is the area's own free plan (website plan, software plan or AI
   check, see StartCta in components/FunnelCta.jsx), the call second,
   and `service` preselects that area in the contact form. Without a
   `service` the ask is "Get started".
   --------------------------------------------------------------- */

/* The pill and the line under the title, per area. */
const ASK = {
  websites: {
    pill: 'Free website plan',
    sub: 'Answer a few plain questions about your business and what the site must do, and see straight away which package fits, what it starts at and how long it takes. Then I will tell you straight what it would take.'
  },
  software: {
    pill: 'Free software plan',
    sub: 'Answer a few plain questions about how the work runs today, and see straight away the scope that fits, its price range and the first screens it would have. Then I will tell you straight what it would take.'
  },
  ai: {
    pill: 'Free AI check',
    sub: 'Answer a few plain questions about your week and see straight away which jobs AI could take off your plate. Whatever you need next, website, software or AI, I will tell you straight what it would take and whether it is worth doing.'
  },
  start: {
    pill: 'Get started',
    sub: 'Pick a website, software or AI and answer a few plain questions. You see straight away what fits and what it starts at, and I will tell you straight what it would take and whether it is worth doing.'
  }
}
export default function Cta({ service }) {
  const contact = service ? `/contact?service=${service}#write` : '/contact'
  const currency = useCurrency()
  const ask = ASK[service] || ASK.start
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
          {ask.pill}
        </p>
        <h2 className="dusk-title dusk-cta-title">
          Something to build,
          <br />
          <span className="dusk-title-warm">or a week to win back?</span>
        </h2>
        <p className="dusk-sub">{ask.sub}</p>
        <div className="dusk-actions">
          <StartCta service={service} placement={service ? `${service}-close` : 'close'} magnet />
          <TalkCta
            message={hasBooking ? whatsappPrefill.cta : whatsappPrefill.audit}
            contact={contact}
            placement={service ? `${service}-close-band` : 'close-band'}
          />
        </div>
        <p className="dusk-footnote">{anchor}</p>
      </m.div>
    </section>
  )
}
