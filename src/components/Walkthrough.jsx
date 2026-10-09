import { useEffect, useState } from 'react'
import { m, useReducedMotion } from 'motion/react'
import ScreenStill from './ScreenStill.jsx'
import { stillLabel } from '../data.js'

/*
  The case-study stand-in for a film, for a demo that has real screens and
  no film yet: every captured step, one at a time, on the reader's command.

  Deliberately calm. Nothing advances on its own (no autoplay, no timer);
  the step list, the Previous and Next buttons and the arrow keys move it.
  The only motion is a short opacity fade between screens, and the site's
  one <MotionConfig reducedMotion="user"> governs it like every other
  animation (and is dropped entirely under reduced motion). Each screen is cropped to its step's `focus` rect, the same
  region the capture script marked as the point of that step.

  Desktop: the numbered steps on the left (the design system's step list,
  the active one filled saffron), the screen on the right. Below 900px the
  list would push the screen off the top, so the screen comes first and
  the active caption sits under it instead.
*/
const pad = (n) => String(n).padStart(2, '0')

/* `label` (badge + caption) defaults to the recorded-test-run wording;
   demo screens pass their own (data.js labelFor). */
export default function Walkthrough({ steps, title, label = stillLabel }) {
  const [active, setActive] = useState(0)
  /* MotionConfig's reducedMotion="user" stops movement but keeps opacity
     fades; a screen swap should simply be instant for those readers. */
  const reduce = useReducedMotion()
  const count = steps.length
  const step = steps[active]
  const go = (i) => setActive(Math.min(Math.max(i, 0), count - 1))

  // Warm the neighbours so a step change does not flash an empty frame.
  useEffect(() => {
    for (const i of [active - 1, active + 1]) {
      if (steps[i]) new Image().src = steps[i].src
    }
  }, [active, steps])

  // Left and right only: they do not scroll this page, so taking them
  // costs nothing (and nothing here calls preventDefault on a scroll key).
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') go(active + 1)
    if (e.key === 'ArrowLeft') go(active - 1)
  }

  if (!count) return null

  return (
    <figure className="walk" onKeyDown={onKeyDown}>
      <div className="walk-grid">
        <ol className="walk-steps" aria-label={`Steps in the ${title} walkthrough`}>
          {steps.map((s, i) => (
            <li key={s.file}>
              <button
                type="button"
                className="walk-step"
                aria-current={i === active ? 'step' : undefined}
                onClick={() => go(i)}
              >
                <span className="walk-step-n" aria-hidden="true">{pad(i + 1)}</span>
                <span className="walk-step-text">{s.caption}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="walk-stage">
          <div className="walk-frame">
            <m.div
              key={step.file}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <ScreenStill
                src={step.src}
                focus={step.focus}
                aspect={4 / 3}
                eager
                alt={`${title}, step ${active + 1} of ${count}: ${step.caption}`}
              />
            </m.div>
            <span className="walk-badge">{label.badge}</span>
          </div>

          <div className="walk-controls">
            <button
              type="button"
              className="walk-btn"
              onClick={() => go(active - 1)}
              disabled={active === 0}
            >
              <span aria-hidden="true">&larr;</span> Previous
            </button>
            <span className="walk-count" aria-live="polite">
              Step {active + 1} of {count}
              <span className="sr-only">: {step.caption}</span>
            </span>
            <button
              type="button"
              className="walk-btn"
              onClick={() => go(active + 1)}
              disabled={active === count - 1}
            >
              Next <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
          <p className="walk-caption" aria-hidden="true">{step.caption}</p>
        </div>
      </div>

      <figcaption className="case-caption">
        {label.caption}{' '}
        <a href={step.src} target="_blank" rel="noopener noreferrer">
          Open this screen full size
        </a>
      </figcaption>
    </figure>
  )
}
