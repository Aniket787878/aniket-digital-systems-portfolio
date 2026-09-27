import { useRef, useState } from 'react'
import { m, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { process } from '../../data.js'
import Icon from '../../components/icons.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* What each step looks like in practice. Illustrative, generic: no client
   names, no run counts. Step 2 is a real capture of a working demo. */
const VISUALS = {
  map: MapVisual,
  build: BuildVisual,
  automate: AutomateVisual,
  improve: ImproveVisual
}

/* ---------------------------------------------------------------
   3 — Process, on the dark ground. On wide screens the section pins
   while the page scrolls through it: the active step follows the
   scroll position, a saffron line fills down the list, and the
   picture beside it changes. On phones (and under reduced motion)
   the steps simply stack, each with its picture.
   --------------------------------------------------------------- */
export default function Process() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(process.length - 1, Math.max(0, Math.floor(v * process.length * 0.999)))
    if (next !== active) setActive(next)
  })

  const Visual = VISUALS[process[active].key]

  return (
    <section className={`night process${reduce ? ' is-static' : ''}`} ref={ref}>
      <div className="process-pin">
        <div className="container process-grid">
          <div className="process-copy">
            <PillLabel icon="pulse" className="on-night">Process</PillLabel>
            <h2 className="h2">
              How a build goes.
              <br />
              <span className="soft">Work first, tools second.</span>
            </h2>
            <ol className="process-steps" style={{ '--progress': (active + 1) / process.length }}>
              {process.map((step, i) => (
                <li
                  key={step.key}
                  className={i === active ? 'is-active' : i < active ? 'is-done' : ''}
                >
                  <span className="process-num">{step.index}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="process-stage" aria-hidden="true">
            <AnimatePresence mode="wait">
              <m.div
                key={process[active].key}
                className="process-visual"
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Visual />
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Phones: every step with its picture, no pinning. */}
      <div className="container process-stack">
        {process.map((step) => {
          const V = VISUALS[step.key]
          return (
            <div key={step.key} className="process-stack-item">
              <span className="process-num">{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <div className="process-visual">
                <V />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Window({ title, children }) {
  return (
    <div className="pv-window">
      <div className="pv-bar">
        <i />
        <i />
        <i />
        <span>{title}</span>
      </div>
      <div className="pv-body">{children}</div>
    </div>
  )
}

function MapVisual() {
  const rows = [
    ['whatsapp', 'Enquiry arrives on WhatsApp', 'Copied to a sheet by hand', 'manual'],
    ['calendar', 'Booking confirmed', 'Phone call, then a calendar entry', 'manual'],
    ['bell', 'Reminder the day before', 'When someone remembers', 'fix'],
    ['rupee', 'Payment chased', 'Three follow-up messages', 'manual']
  ]
  return (
    <Window title="Where the week goes">
      <ul className="pv-map">
        {rows.map(([icon, what, how, tag], i) => (
          <m.li
            key={what}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <span className="pv-icon">
              <Icon name={icon} size={16} />
            </span>
            <span className="pv-text">
              <strong>{what}</strong>
              <span>{how}</span>
            </span>
            <span className={`pv-tag pv-tag-${tag}`}>{tag === 'fix' ? 'Automate first' : 'Manual'}</span>
          </m.li>
        ))}
      </ul>
    </Window>
  )
}

function BuildVisual() {
  return (
    <Window title="shared-inbox.app / inbox">
      <img className="pv-shot" src="/walkthroughs/shared-inbox/02.png" alt="" loading="lazy" />
    </Window>
  )
}

function AutomateVisual() {
  const steps = [
    ['calendar', 'New booking'],
    ['whatsapp', 'Confirm on WhatsApp'],
    ['calendar', 'Add to the calendar'],
    ['bell', 'Remind 24 hours before']
  ]
  return (
    <Window title="New booking, handled">
      <ol className="pv-flow">
        {steps.map(([icon, label], i) => (
          <m.li
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.16 }}
          >
            <span className="pv-icon">
              <Icon name={icon} size={16} />
            </span>
            <strong>{label}</strong>
            <m.span
              className="pv-done"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + i * 0.16, type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Icon name="check" size={12} strokeWidth={2.6} />
            </m.span>
          </m.li>
        ))}
      </ol>
    </Window>
  )
}

function ImproveVisual() {
  const rows = ['Lead intake', 'Booking reminders', 'Consent PDFs', 'Weekly report']
  return (
    <Window title="Care Plan / monitoring">
      <ul className="pv-health">
        {rows.map((r, i) => (
          <m.li
            key={r}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <span className="pv-ok" />
            <strong>{r}</strong>
            <span>Healthy</span>
          </m.li>
        ))}
      </ul>
      <svg className="pv-spark" viewBox="0 0 300 60" preserveAspectRatio="none">
        <m.path
          d="M0 45 L30 40 L60 42 L90 30 L120 34 L150 22 L180 26 L210 16 L240 20 L270 10 L300 12"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <p className="pv-note">Anything that breaks is fixed inside 24 hours.</p>
    </Window>
  )
}
