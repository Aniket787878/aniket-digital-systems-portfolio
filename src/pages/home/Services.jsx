import { m } from 'motion/react'
import { site, services } from '../../data.js'
import { useCurrency } from '../../currency.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import ServiceDoor from '../../components/ServiceDoor.jsx'
import { CurrencyToggle, CarePlanCard } from '../../components/Pricing.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   4 — Services, on the light ground: three doors, one per service
   area (websites, software, AI), each opening onto its own page with
   the full offers, proof and FAQ. The home page only has to say what
   the three are and where each starts, so a buyer picks a door
   instead of reading eight price cards. Positioning:
   docs/system/05-icp-positioning.md (2026-09-30).

   "From" prices follow the USD / INR toggle (src/currency.js).
   --------------------------------------------------------------- */
export default function Services() {
  const currency = useCurrency()

  return (
    <section className="paper services" id="services">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="chart">Services</PillLabel>
          <h2 className="h2">
            Three things I build.
            <br />
            <span className="soft">One system underneath.</span>
          </h2>
          <p className="center-lede">
            The website brings the enquiry in, the software keeps track of
            it, and the AI does the repeat work. Start with whichever part
            costs you the most.
          </p>
          <p className="guarantee">
            <Icon name="lock" size={16} />
            {site.guarantee}
          </p>
          <CurrencyToggle currency={currency} />
        </m.header>

        <m.ul className="cards doors" {...revealStagger}>
          {services.map((area) => (
            <m.li key={area.slug} variants={fadeUp}>
              <ServiceDoor area={area} currency={currency} />
            </m.li>
          ))}
        </m.ul>

        <CarePlanCard currency={currency} reveal={reveal} />
      </div>
    </section>
  )
}
