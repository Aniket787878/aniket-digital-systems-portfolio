import { useState } from 'react'
import { m } from 'motion/react'
import { site, packages, carePlan, whatsappPrefill, explainers, explainersReady } from '../../data.js'
import { whatsappHref, hasWhatsApp } from '../../whatsapp.js'
import { hasBooking } from '../../booking.js'
import { useCurrency, setCurrency, inCurrency } from '../../currency.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import BookingCta from '../../components/BookingCta.jsx'
import VideoDialog from '../../components/VideoDialog.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   4 — Services, on the light ground. The entry offer (the Quick-Win)
   runs full width above the three larger builds, so the cheapest first
   yes is the first price a visitor reads; then the priced cards, each
   with its 30-second explainer one click away, then the retainer.

   Why the Quick-Win is the featured one rather than the Sprint: a cold
   visitor from outreach has never worked with Aniket, and one workflow
   live in 5 days for a fixed small price is the lowest-risk way to find
   out. The Sprint is what that client buys next, so it sits first in the
   row beneath.

   Prices follow the USD / INR toggle (src/currency.js).
   --------------------------------------------------------------- */
export default function Services() {
  const [film, setFilm] = useState(null)
  const currency = useCurrency()
  const [entry, ...builds] = packages

  return (
    <section className="paper services" id="services">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="chart">Services</PillLabel>
          <h2 className="h2">
            Fixed scope. Fixed price.
            <br />
            <span className="soft">A date it goes live.</span>
          </h2>
          <p className="center-lede">
            No hourly billing. A one-page proposal before anything starts, half
            up front and half on delivery.
          </p>
          <p className="guarantee">
            <Icon name="lock" size={16} />
            {site.guarantee}
          </p>
          <CurrencyToggle currency={currency} />
        </m.header>

        <m.article className="price price-entry is-featured" {...reveal}>
          <div className="price-entry-head">
            <div className="price-top">
              <h3>{entry.name}</h3>
              <span className="price-badge">Start here</span>
            </div>
            <p className="price-for">{entry.forWho}</p>
            <p className="price-amount">{inCurrency(entry.price, currency)}</p>
            <p className="price-time">{entry.timeline}</p>
          </div>
          <div className="price-entry-body">
            <p className="price-deliverable">{entry.deliverable}</p>
            <TickList items={entry.includes} />
          </div>
          <div className="price-actions">
            <OfferCta pkg={entry} primary />
          </div>
        </m.article>

        <m.ul className="price-grid" {...revealStagger}>
          {builds.map((pkg) => {
            const ex = explainersReady && pkg.explainer ? explainers[pkg.explainer] : null
            return (
              <m.li
                key={pkg.name}
                className={`price${pkg.featured ? ' is-featured' : ''}`}
                variants={fadeUp}
              >
                <div className="price-top">
                  <h3>{pkg.name}</h3>
                </div>
                <p className="price-for">{pkg.forWho}</p>
                <p className="price-amount">{inCurrency(pkg.price, currency)}</p>
                <p className="price-time">{pkg.timeline}</p>
                <p className="price-deliverable">{pkg.deliverable}</p>
                <TickList items={pkg.includes} />
                <div className="price-actions">
                  <OfferCta pkg={pkg} />
                  {ex && (
                    <button type="button" className="watch-link" onClick={() => setFilm(ex)}>
                      <span className="watch-icon" aria-hidden="true">
                        <Icon name="play" size={11} />
                      </span>
                      Watch the 30-second explainer
                    </button>
                  )}
                </div>
              </m.li>
            )
          })}
        </m.ul>

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
      </div>

      <VideoDialog film={film} onClose={() => setFilm(null)} />
    </section>
  )
}

/* The card's button. With a booking link: the call (saffron on the entry
   offer, dark on the rest) plus WhatsApp as a quiet text link. Without
   one: WhatsApp, prefilled with the offer name, as before. */
function OfferCta({ pkg, primary = false }) {
  const tone = primary ? 'btn-saffron' : 'btn-dark'
  const wa = hasWhatsApp
    ? whatsappHref(whatsappPrefill.pricing.replace('{offer}', pkg.name))
    : ''

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
      Start here
    </a>
  )
}

function CurrencyToggle({ currency }) {
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
