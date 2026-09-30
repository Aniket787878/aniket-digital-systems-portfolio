import { m } from 'motion/react'
import { services } from '../../data.js'
import { useCurrency } from '../../currency.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import ServiceDoor from '../../components/ServiceDoor.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   5 — The other two areas, on the night ground before the closing
   dusk band: most projects start in one area and grow into the others,
   so each page ends by opening the two it is not.
   --------------------------------------------------------------- */
export default function OtherAreas({ area }) {
  const currency = useCurrency()
  const others = services.filter((s) => s.slug !== area.slug)

  return (
    <section className="night svc-others" aria-labelledby="svc-others-title">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="flow" className="on-night">
            One system
          </PillLabel>
          <h2 className="h2" id="svc-others-title">
            Most projects grow into the rest.
            <br />
            <span className="soft">Built to work together.</span>
          </h2>
        </m.header>

        <m.ul className="cards doors svc-cards" data-count={others.length} {...revealStagger}>
          {others.map((other) => (
            <m.li key={other.slug} variants={fadeUp}>
              <ServiceDoor area={other} currency={currency} />
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}
