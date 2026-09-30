import { useState } from 'react'
import { m, AnimatePresence } from 'motion/react'
import { faq } from '../../data.js'
import { useCurrency, inCurrency } from '../../currency.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   5 — FAQ, on the light ground. Real disclosure buttons, one open at
   a time; the answer eases open rather than snapping. The service
   pages pass their own questions and heading.
   --------------------------------------------------------------- */
export default function Faq({ items = faq, heading = ['Before you ask.', 'Scope, cost and who owns what.'] }) {
  const [openIndex, setOpenIndex] = useState(0)
  const currency = useCurrency()

  return (
    <section className="paper faq" id="faq">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="search">FAQ</PillLabel>
          <h2 className="h2">
            {heading[0]}
            <br />
            <span className="soft">{heading[1]}</span>
          </h2>
        </m.header>

        <m.ul className="faq-list" {...revealStagger}>
          {items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <m.li key={item.q} className={`faq-item${isOpen ? ' is-open' : ''}`} variants={fadeUp}>
                <h3>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      className="faq-a"
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p>{inCurrency(item.a, currency)}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.li>
            )
          })}
        </m.ul>
      </div>
    </section>
  )
}
