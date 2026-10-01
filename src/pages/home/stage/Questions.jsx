import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'
import { faq } from '../../../data.js'
import { useCurrency, inCurrency } from '../../../currency.js'
import Stream from './work/Stream.jsx'
import { EASE, settle } from './work/shared.js'
import '../../service/showcase/stage.css'
import './work/questions.css'

/* ---------------------------------------------------------------
   The FAQ on the stage: the heading pinned on the left, the questions
   as glass rows on the right. Real disclosure buttons, one open at a
   time, all closed to start. The questions are data.js `faq`, word for
   word (the price answer follows the USD / INR choice). The service
   pages keep using home/Faq.jsx; nothing here touches it.
   --------------------------------------------------------------- */
const pad = (n) => String(n).padStart(2, '0')

export default function Questions() {
  const reduce = useReducedMotion()
  const currency = useCurrency()
  const [open, setOpen] = useState(null)
  const ref = useRef(null)

  return (
    <section className="stage sq" id="faq" aria-labelledby="sq-title" ref={ref}>
      <Stream target={ref} />
      <div className="stage-glow" style={{ '--glow-x': '68%', '--glow-y': '45%' }} aria-hidden="true" />

      <div className="sq-inner">
        <m.header className="sq-head" {...settle(reduce)}>
          <p className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Questions
          </p>
          <h2 id="sq-title" className="stage-title">
            Before you <span className="stage-serif">ask.</span>
          </h2>
          <p className="stage-lede">Scope, cost and who owns what.</p>
        </m.header>

        <div className="sq-main">
          <ul className="sq-list">
            {faq.map((item, i) => {
              const isOpen = open === i
              return (
                <m.li
                  key={item.q}
                  className={`sq-row stage-glass${isOpen ? ' is-open' : ''}`}
                  {...settle(reduce, 0.05 * i)}
                >
                  <h3 className="sq-q-wrap">
                    <button
                      type="button"
                      className="sq-q"
                      id={`sq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`sq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span className="sq-count stage-mono" aria-hidden="true">
                        {pad(i + 1)}
                      </span>
                      <span className="sq-text">{item.q}</span>
                      <span className="sq-icon" aria-hidden="true" />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        className="sq-a"
                        id={`sq-a-${i}`}
                        role="region"
                        aria-labelledby={`sq-q-${i}`}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                      >
                        <p>{inCurrency(item.a, currency)}</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </m.li>
              )
            })}
          </ul>

          <p className="sq-rehook">
            Still wondering about something?{' '}
            <Link to="/contact" className="sq-rehook-link">
              Ask me directly<span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
