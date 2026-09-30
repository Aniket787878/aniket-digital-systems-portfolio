import { useState } from 'react'
import { fx } from '../../interactions/attrs.js'
import { m } from 'motion/react'
import { site, packages } from '../../data.js'
import { useCurrency } from '../../currency.js'
import { reveal, revealStagger } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import VideoDialog from '../../components/VideoDialog.jsx'
import { PriceCard, CurrencyToggle, CarePlanCard } from '../../components/Pricing.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   3 — The area's offers, on the light ground: the same price cards
   the home page used to carry, only this area's, with the guarantee,
   the currency toggle and the Care Plan. The target of the hero's
   "See the prices".
   --------------------------------------------------------------- */
export default function Offers({ area }) {
  const [film, setFilm] = useState(null)
  const currency = useCurrency()
  const offers = packages.filter((p) => p.lane === area.slug)

  return (
    <section className="paper services svc-offers" id="prices" aria-labelledby="svc-prices-title">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="rupee">Prices</PillLabel>
          <h2 className="h2" {...fx('split')} id="svc-prices-title">
            Fixed scope. Fixed price.
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

        <m.ul className="price-grid svc-price-grid" data-count={offers.length} {...revealStagger}>
          {offers.map((pkg) => (
            <PriceCard key={pkg.name} pkg={pkg} currency={currency} onWatch={setFilm} />
          ))}
        </m.ul>

        <CarePlanCard currency={currency} reveal={reveal} />
      </div>

      <VideoDialog film={film} onClose={() => setFilm(null)} />
    </section>
  )
}
