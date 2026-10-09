import { fx } from '../../interactions/attrs.js'
import { m } from 'motion/react'
import { useCurrency, inCurrency } from '../../currency.js'
import { reveal } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import { CurrencyToggle } from '../../components/Pricing.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'
import PathStrip from '../../components/PathStrip.jsx'
import { StartCta } from '../../components/FunnelCta.jsx'
import { FLOW } from '../../flows.js'

/* How this area connects to its primary action: each area starts with
   its own free plan (the hero's foot says so too), shown as step 1 of
   the area's own path (servicePaths in data.js). */
const PATH_INTRO = {
  websites:
    'A website starts with the free website plan: a few plain questions about your business and what the site must do. Then a free call and a written proposal with a fixed price, and the build by a fixed date.',
  software:
    'Software starts with the free software plan: a few plain questions about how the work runs today. Then a free call and a written proposal with a fixed price, and the build by a fixed date.',
  ai: 'AI starts with the free AI check: a few plain questions about your week, and you see on the spot which jobs to hand over first. Then the AI Roadmap, a short paid session whose fee is taken off your build.'
}

/* What the area's free first step shows, said under the "from" price. */
const FROM_NOTE = {
  websites: 'answer a few plain questions and you see the package and price that fit your answers, straight away.',
  software: 'answer a few plain questions and you see the scope and price that fit your answers, straight away.',
  ai: 'answer a few plain questions and you see which jobs to hand to AI first, and what the next step costs, straight away.'
}

/* What every project in every area comes with. Promises the site already
   makes (the guarantee, the 50/50 terms, the Care Plan), no amounts. */
const ALWAYS = [
  'One fixed price in writing, before any work starts',
  'A fixed date it goes live, in the same proposal',
  'Not live by that date? You don’t pay the second half',
  'Half up front, half on delivery. No hourly billing',
  'Care Plan after launch, if you want one'
]

/* ---------------------------------------------------------------
   3 — Prices, on the light ground (Aniket, 2026-10-09): one "from"
   price for the area, what every project includes, and the area's own
   free plan as the way to see the exact package and price. The full
   package list is no longer shown up front: the package and its price
   appear on the plan's result screen, once the visitor has answered and
   left their details, while the "from" price still tells anyone whose
   budget is far below it. The target of the hero's "#prices" links.
   --------------------------------------------------------------- */
export default function Offers({ area }) {
  const currency = useCurrency()
  const flow = FLOW[area.slug]

  return (
    <section className="paper services svc-offers" id="prices" aria-labelledby="svc-prices-title">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="rupee">Prices</PillLabel>
          <h2 className="h2" {...fx('split')} id="svc-prices-title">
            Fixed scope. Fixed price.
            <span className="soft">A date it goes live.</span>
          </h2>
        </m.header>

        <m.div className="svc-from" {...reveal}>
          <div className="svc-from-head">
            <p className="svc-from-line">
              {area.name} from <strong>{inCurrency(area.from, currency)}</strong>
            </p>
            <CurrencyToggle currency={currency} />
          </div>
          <p className="svc-from-note">A starting point, not a quote. {flow.name}: {FROM_NOTE[area.slug]}</p>

          <div className="svc-from-body">
            <div>
              <h3 className="svc-from-sub">Always included</h3>
              <TickList items={ALWAYS} />
            </div>
            <div className="svc-from-ask">
              <StartCta service={area.slug} placement={`${area.slug}-prices`} />
              <p className="svc-from-ask-note">
                <Icon name="lock" size={14} />
                Free, about 3 minutes, no obligation.
              </p>
            </div>
          </div>
        </m.div>

        {/* The path the price sits in, on all three areas (they stay
            equal): the area's own free plan is step 1. No package
            prices in it, only what each step costs in plain words. */}
        <m.div className="svc-path" {...reveal}>
          <p className="svc-path-intro">{PATH_INTRO[area.slug]}</p>
          <PathStrip service={area.slug} />
        </m.div>
      </div>
    </section>
  )
}
