import { funnelPath, servicePaths } from '../data.js'
import { useCurrency, inCurrency } from '../currency.js'
import './PathStrip.css'

/* ---------------------------------------------------------------
   The four-step path as one compact row, per area (`service`, from
   servicePaths in data.js): for AI, the free AI check, AI Roadmap,
   build by a fixed date, Care Plan (funnelPath); for websites and
   software, their own free plan, a free call and written fixed-price
   proposal, the build, the Care Plan. Used on each service page's
   prices and at the end of each plan. No `service` means the AI path.
   `current` marks the step the visitor is on (0-based); `tone` is
   'light' on the paper ground, 'dark' on the stage.
   --------------------------------------------------------------- */
export default function PathStrip({ service, current = -1, tone = 'light', label = 'How it works, step by step' }) {
  const currency = useCurrency()
  const steps = servicePaths[service] || funnelPath
  return (
    <ol className={`path-strip path-strip-${tone}`} aria-label={label}>
      {steps.map((step, i) => (
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
