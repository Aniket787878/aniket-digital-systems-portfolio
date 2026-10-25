import { m } from 'motion/react'
import { brand } from '../../data.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   /ai band 2, on the night ground: the four-step method (Map, Build,
   Train and stay, Hand over), in the numbered-step look of the home
   Process band, laid out as four cards in a row on wide screens and a
   stack on phones. Copy: `brand.method` in data.js.
   --------------------------------------------------------------- */
export default function Method() {
  const [title, soft] = brand.methodTitle
  return (
    <section className="night svc-method" aria-labelledby="svc-method-title">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="pulse" className="on-night">
            The {brand.name} method
          </PillLabel>
          <h2 className="h2" id="svc-method-title">
            {title}
            <span className="soft">{soft}</span>
          </h2>
        </m.header>

        <m.ol className="svc-method-steps" {...revealStagger}>
          {brand.method.map((step) => (
            <m.li key={step.index} className="svc-method-step" variants={fadeUp}>
              <span className="svc-method-num">{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </m.li>
          ))}
        </m.ol>
      </div>
    </section>
  )
}
