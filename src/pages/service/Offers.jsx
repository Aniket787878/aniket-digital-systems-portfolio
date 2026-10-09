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
import PathStrip from '../../components/PathStrip.jsx'
import { Rehook } from '../../components/FunnelCta.jsx'

/* How this area connects to the one primary action: every service,
   not only AI, starts with the free AI check (the hero's foot says so
   too), and the build itself is step 3 of the same four-step path. */
const PATH_INTRO = {
  websites:
    'A website starts where everything here starts: the free AI check. It shows which jobs in your week are worth handing over first. If the website is one of them, it is step 3, built by a fixed date.',
  software:
    'A tool for your team starts with the free AI check too. It shows where your week loses the most time. If a tool is the fix, it is step 3, built by a fixed date.',
  ai: 'The Roadmap below is step 2, never a standalone product. Step 1 is the free AI check: a few plain questions, and you see on the spot which jobs to hand over first.'
}

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

        {/* The path these prices sit in, shown first on all three areas
            (they stay equal): the check is step 1, the build step 3. */}
        <m.div className="svc-path" {...reveal}>
          <p className="svc-path-intro">{PATH_INTRO[area.slug]}</p>
          <PathStrip />
          <Rehook
            tone="paper"
            className="svc-path-rehook"
            question="Step 1 is free and takes about three minutes."
            label="Take the free AI check"
            placement={`${area.slug}-path`}
          />
        </m.div>

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
