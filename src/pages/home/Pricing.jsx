import { Link } from 'react-router-dom'
import { packages, carePlan, whatsappPrefill } from '../../data.js'
import { hasWhatsApp, whatsappHref } from '../../whatsapp.js'

/* ---------------------------------------------------------------
   4b — Pricing. Three productized offers, priced, from the service
   catalog. Naming the number is the whole point: the catalog's own
   rule is fixed scope with a stated timeline, never hourly.
   --------------------------------------------------------------- */
export default function Pricing() {
  return (
    <section className="pricing">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">Pricing</p>
            <h2 className="split-title">Fixed scope, stated timeline</h2>
          </div>
          <p className="split-lede">
            No hourly billing. Every engagement is a fixed price against a
            written scope, with a date attached. Half up front, half on
            delivery.
          </p>
        </div>

        <ul className="pricing-grid">
          {packages.map((pkg) => (
            <li
              key={pkg.name}
              className={`pricing-card${pkg.featured ? ' pricing-card-featured' : ''}`}
            >
              {pkg.featured && (
                <span className="pricing-flag">Most start here</span>
              )}
              <h3 className="pricing-name">{pkg.name}</h3>
              <p className="pricing-price">{pkg.price}</p>
              <p className="pricing-timeline">{pkg.timeline}</p>
              <p className="pricing-for">{pkg.forWho}</p>
              <p className="pricing-deliverable">{pkg.deliverable}</p>
              <ul className="pricing-list">
                {pkg.includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {/* Straight into a chat with the offer already named — the
                  highest-intent click on the page should not become a
                  form the buyer has to fill in from scratch. */}
              {hasWhatsApp ? (
                <a
                  href={whatsappHref(
                    whatsappPrefill.pricing.replace('{offer}', pkg.name)
                  )}
                  className="pricing-cta arrow-link"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Start here
                  <span className="arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              ) : (
                <Link to="/contact" className="pricing-cta arrow-link">
                  Start here
                  <span className="arrow" aria-hidden="true">
                    &rarr;
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>

        <p className="pricing-care">
          <strong>{carePlan.name}</strong> &mdash; {carePlan.price}.{' '}
          {carePlan.blurb}
        </p>
      </div>
    </section>
  )
}
