import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { packages, carePlan, whatsappPrefill } from '../../data.js'
import { hasWhatsApp, whatsappHref } from '../../whatsapp.js'
import { fadeUp, reveal, revealStagger } from '../../motion/variants.js'

/* The guarantee strip under the grid (docs/research/06, gap G8). Every
   line is a promise already made elsewhere on the site — the pricing lede,
   the FAQ, the handover — surfaced here where the buyer is deciding.
   Nothing new is committed; these are made visible, not invented. */
const GUARANTEES = [
  {
    title: 'Fixed price, written scope',
    text: 'A one-page proposal before anything starts. Never hourly, never a verbal quote.'
  },
  {
    title: 'A date it goes live',
    text: 'Agreed up front. The Sprint is two weeks; larger builds carry their own stated timeline.'
  },
  {
    title: 'You own it',
    text: 'Code in your repository, automations on your accounts, and a walkthrough at handover. No lock-in.'
  }
]

/* ---------------------------------------------------------------
   4b — Pricing. Three productized offers, priced, from the service
   catalog. Naming the number is the whole point: the catalog's own
   rule is fixed scope with a stated timeline, never hourly.
   --------------------------------------------------------------- */
export default function Pricing() {
  return (
    <section className="pricing">
      <div className="container">
        <m.div className="split-head" {...reveal}>
          <div>
            <p className="kicker">Pricing</p>
            <h2 className="split-title">Fixed scope, stated timeline</h2>
          </div>
          <p className="split-lede">
            No hourly billing. Every engagement is a fixed price against a
            written scope, with a date attached. Half up front, half on
            delivery.
          </p>
        </m.div>

        <m.ul className="pricing-grid" {...revealStagger}>
          {packages.map((pkg) => (
            <m.li
              key={pkg.name}
              className={`pricing-card${pkg.featured ? ' pricing-card-featured' : ''}`}
              variants={fadeUp}
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
            </m.li>
          ))}
        </m.ul>

        <ul className="pricing-guarantees">
          {GUARANTEES.map((g) => (
            <li key={g.title} className="pricing-guarantee">
              <span className="pricing-guarantee-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="pricing-guarantee-title">{g.title}</span>
              <span className="pricing-guarantee-text">{g.text}</span>
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
