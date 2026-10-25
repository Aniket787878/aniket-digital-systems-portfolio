import { m } from 'motion/react'
import { brand, site } from '../../data.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   /ai band 3, on the light ground: "You own everything." Four points
   and the guarantee (site.guarantee, said once in data.js) as the
   closing line. Copy: `brand.ownIt` in data.js.
   --------------------------------------------------------------- */
export default function OwnIt() {
  return (
    <section className="paper svc-own" aria-labelledby="svc-own-title">
      <div className="container">
        <m.header className="center-head svc-own-head" {...reveal}>
          <PillLabel icon="lock">Yours to keep</PillLabel>
          <h2 className="h2" id="svc-own-title">
            {brand.ownIt.title}
          </h2>
        </m.header>

        <m.ul className="svc-own-points" {...revealStagger}>
          {brand.ownIt.points.map((point) => (
            <m.li key={point} className="svc-own-point" variants={fadeUp}>
              <span className="svc-own-tick" aria-hidden="true">
                <Icon name="check" size={16} strokeWidth={2.4} />
              </span>
              <span>{point}</span>
            </m.li>
          ))}
        </m.ul>

        <m.p className="guarantee svc-own-close" {...reveal}>
          <Icon name="lock" size={16} />
          {site.guarantee}
        </m.p>
      </div>
    </section>
  )
}
