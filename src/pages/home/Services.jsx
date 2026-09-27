import { useState } from 'react'
import { m } from 'motion/react'
import { packages, carePlan, whatsappPrefill, explainers } from '../../data.js'
import { whatsappHref, hasWhatsApp } from '../../whatsapp.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import VideoDialog from '../../components/VideoDialog.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   4 — Services, on the light ground. The three productized offers
   as priced cards (docs/system/02-service-catalog.md), each with its
   30-second explainer one click away, then the retainer.
   --------------------------------------------------------------- */
export default function Services() {
  const [film, setFilm] = useState(null)

  return (
    <section className="paper services" id="services">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="rupee">Services</PillLabel>
          <h2 className="h2">
            Fixed scope. Fixed price.
            <br />
            <span className="soft">A date it goes live.</span>
          </h2>
          <p className="center-lede">
            No hourly billing. A one-page proposal before anything starts, half
            up front and half on delivery.
          </p>
        </m.header>

        <m.ul className="price-grid" {...revealStagger}>
          {packages.map((pkg) => {
            const ex = explainers[pkg.explainer]
            return (
              <m.li
                key={pkg.name}
                className={`price${pkg.featured ? ' is-featured' : ''}`}
                variants={fadeUp}
              >
                <div className="price-top">
                  <h3>{pkg.name}</h3>
                  {pkg.featured && <span className="price-badge">Most start here</span>}
                </div>
                <p className="price-for">{pkg.forWho}</p>
                <p className="price-amount">{pkg.price}</p>
                <p className="price-time">{pkg.timeline}</p>
                <p className="price-deliverable">{pkg.deliverable}</p>
                <TickList items={pkg.includes} />
                <div className="price-actions">
                  {hasWhatsApp && (
                    <a
                      className={pkg.featured ? 'btn-saffron' : 'btn-dark'}
                      href={whatsappHref(whatsappPrefill.pricing.replace('{offer}', pkg.name))}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Start here
                    </a>
                  )}
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
              {carePlan.name} <span>{carePlan.price}</span>
            </strong>
            <p>{carePlan.blurb}</p>
          </div>
        </m.div>
      </div>

      <VideoDialog film={film} onClose={() => setFilm(null)} />
    </section>
  )
}
