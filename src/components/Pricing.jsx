import { m } from 'motion/react'
import { carePlan, whatsappPrefill, explainers, explainersReady } from '../data.js'
import { whatsappHref, hasWhatsApp } from '../whatsapp.js'
import { hasBooking } from '../booking.js'
import { setCurrency, inCurrency } from '../currency.js'
import { fadeUp } from '../motion/variants.js'
import Icon from './icons.jsx'
import BookingCta from './BookingCta.jsx'
import { CheckCta } from './FunnelCta.jsx'
import { TickList } from './ui.jsx'

/* ---------------------------------------------------------------
   The price pieces shared by the home page's Services band and the
   three service pages (/websites, /software, /ai). Their styles
   (.price, .care-card, .currency-toggle) live in HomePage.css, which
   App loads on every route, so nothing here imports a stylesheet.
   --------------------------------------------------------------- */

/* One offer as a card in a .price-grid. `onWatch` opens the offer's
   explainer film, when it has one and the films are rendered. */
export function PriceCard({ pkg, currency, onWatch }) {
  const ex = explainersReady && pkg.explainer ? explainers[pkg.explainer] : null
  return (
    <m.li className={`price${pkg.featured ? ' is-featured' : ''}`} variants={fadeUp}>
      <div className="price-top">
        <h3>{pkg.name}</h3>
        {pkg.featured && <span className="price-badge">Start here</span>}
      </div>
      {pkg.step && <p className="price-step">{pkg.step}</p>}
      <p className="price-for">{pkg.forWho}</p>
      <p className="price-amount">{inCurrency(pkg.price, currency)}</p>
      <p className="price-time">{pkg.timeline}</p>
      <p className="price-deliverable">{pkg.deliverable}</p>
      <TickList items={pkg.includes} />
      <div className="price-actions">
        <OfferCta pkg={pkg} />
        {ex && onWatch && (
          <button type="button" className="watch-link" onClick={() => onWatch(ex)}>
            <span className="watch-icon" aria-hidden="true">
              <Icon name="play" size={11} />
            </span>
            Watch the 30-second explainer
          </button>
        )}
      </div>
    </m.li>
  )
}

/* The card's button. Always dark: the one saffron button in any view is
   the page's free first step (StartCta, components/FunnelCta.jsx), so a grid of offers
   never shows three competing primaries. With a booking link: the call
   plus WhatsApp as a quiet text link. Without one: WhatsApp, prefilled
   with the offer name. The AI Roadmap card (the one with a `step`) is
   step 2 of the path, so its button starts step 1, the free AI check. */
export function OfferCta({ pkg }) {
  const tone = 'btn-dark'
  const wa = hasWhatsApp
    ? whatsappHref(whatsappPrefill.pricing.replace('{offer}', pkg.name))
    : ''

  if (pkg.step) {
    return (
      <>
        <CheckCta placement="roadmap-card" className={tone} label="Start with the free AI check" />
        {wa && (
          <a className="watch-link" href={wa} target="_blank" rel="noreferrer noopener">
            Or ask about the Roadmap on WhatsApp
          </a>
        )}
      </>
    )
  }

  if (hasBooking) {
    return (
      <>
        <BookingCta className={tone} />
        {wa && (
          <a className="watch-link" href={wa} target="_blank" rel="noreferrer noopener">
            Or ask on WhatsApp
          </a>
        )}
      </>
    )
  }

  if (!wa) return null
  return (
    <a className={tone} href={wa} target="_blank" rel="noreferrer noopener">
      Ask about this
    </a>
  )
}

export function CurrencyToggle({ currency }) {
  return (
    <div className="currency-toggle" role="group" aria-label="Show prices in">
      {[
        ['usd', 'USD $'],
        ['inr', 'INR ₹']
      ].map(([code, label]) => (
        <button
          key={code}
          type="button"
          aria-pressed={currency === code}
          className={currency === code ? 'is-on' : ''}
          onClick={() => setCurrency(code)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/* The retainer, offered after a build ships, never instead of one. */
export function CarePlanCard({ currency, reveal }) {
  return (
    <m.div className="care-card" {...reveal}>
      <span className="care-icon" aria-hidden="true">
        <Icon name="pulse" size={20} />
      </span>
      <div>
        <strong>
          {carePlan.name} <span>{inCurrency(carePlan.price, currency)}</span>
        </strong>
        <p>{carePlan.blurb}</p>
      </div>
    </m.div>
  )
}
