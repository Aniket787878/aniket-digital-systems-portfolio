import { funnelPath } from '../data.js'
import { useCurrency, inCurrency } from '../currency.js'
import './PathStrip.css'

/* ---------------------------------------------------------------
   The four-step path (funnelPath in data.js) as one compact row:
   free AI check, AI Roadmap, build by a fixed date, Care Plan. Used
   where the Roadmap is sold (the /ai prices) and on the AI check's
   result, so the paid first step is always seen as step 2 of 4.
   `current` marks the step the visitor is on (0-based); `tone` is
   'light' on the paper ground, 'dark' on the stage.
   --------------------------------------------------------------- */
export default function PathStrip({ current = -1, tone = 'light', label = 'How it works, step by step' }) {
  const currency = useCurrency()
  return (
    <ol className={`path-strip path-strip-${tone}`} aria-label={label}>
      {funnelPath.map((step, i) => (
        <li
          key={step.key}
          className={`path-step${i === current ? ' is-current' : ''}${i < current ? ' is-done' : ''}`}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="path-num" aria-hidden="true">
            {i < current ? '✓' : i + 1}
          </span>
          <span className="path-body">
            <span className="path-name">
              <span className="sr-only">Step {i + 1}{i < current ? ', done' : ''}: </span>
              {step.name}
            </span>
            <span className="path-note">{inCurrency(step.note, currency)}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}
