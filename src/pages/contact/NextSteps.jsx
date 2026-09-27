import { useState } from 'react'
import { m } from 'motion/react'
import Icon from '../../components/icons.jsx'
import { PillLabel } from '../../components/ui.jsx'
import { reveal } from '../../motion/variants.js'
import { handleTabKey } from '../about/tabs.js'

const EASE = [0.22, 1, 0.36, 1]

/* Each line is a promise the site already makes (the auto-reply and
   24-hour reply, the free 15-minute call, the fixed-price proposal). */
const STEPS = [
  {
    key: 'reply',
    label: 'A reply within 24 hours',
    text: 'You get a confirmation straight away, then a personal reply from me. If I am not the right person for it, I will say so and point you somewhere better.'
  },
  {
    key: 'call',
    label: 'A 15-minute call',
    text: 'We talk through how things run today: who does what, where it gets stuck, and how many hours it takes each week.'
  },
  {
    key: 'proposal',
    label: 'A one-page proposal',
    text: 'What I will build, one fixed price and the date it will be ready, all in writing. No hourly billing.'
  }
]

/* ---------------------------------------------------------------
   What happens after you get in touch, as the design system's step
   list: numbered steps down the side, the active one filled saffron,
   a line joining them that fills saffron behind you (each tab draws the
   segment to the next dot, see .contact-next-tab::after). Beside it, a small drawn card of what
   that step gives you. Tabs pattern with the About page's keyboard
   handling (about/tabs.js), vertical, so the arrow keys go up and down.

   The three cards share one grid cell, so the band is as tall as the
   tallest and nothing below it jumps when the step changes.
   --------------------------------------------------------------- */
export default function NextSteps() {
  const [active, setActive] = useState(0)

  return (
    <section className="night contact-next" aria-labelledby="contact-next-title">
      <div className="container">
        <m.header className="contact-next-head" {...reveal}>
          <PillLabel icon="flow" className="on-night">What happens next</PillLabel>
          <h2 className="h2" id="contact-next-title">
            From your message to a price in writing.
            <br />
            <span className="soft">Three steps. Pick one.</span>
          </h2>
        </m.header>

        <m.div className="contact-next-grid" {...reveal}>
          <div
            className="contact-next-rail"
            role="tablist"
            aria-orientation="vertical"
            aria-label="What happens after you get in touch"
          >
            {STEPS.map((step, i) => (
              <button
                key={step.key}
                type="button"
                role="tab"
                id={`contact-next-tab-${step.key}`}
                aria-selected={i === active}
                aria-controls={`contact-next-panel-${step.key}`}
                aria-labelledby={`contact-next-label-${step.key}`}
                aria-describedby={`contact-next-text-${step.key}`}
                tabIndex={i === active ? 0 : -1}
                className={`contact-next-tab${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => handleTabKey(e, i, STEPS.length, setActive, 'vertical')}
              >
                <span className="contact-next-dot" aria-hidden="true">
                  {i < active ? <Icon name="check" size={14} strokeWidth={2.4} /> : i + 1}
                </span>
                <span className="contact-next-copy">
                  <span className="contact-next-label" id={`contact-next-label-${step.key}`}>
                    {step.label}
                  </span>
                  <span className="contact-next-text" id={`contact-next-text-${step.key}`}>
                    {step.text}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="contact-next-stage">
            {STEPS.map((step, i) => {
              const on = i === active
              const Art = ART[step.key]
              return (
                <m.div
                  key={step.key}
                  role="tabpanel"
                  id={`contact-next-panel-${step.key}`}
                  aria-labelledby={`contact-next-tab-${step.key}`}
                  className={`contact-next-panel${on ? ' is-active' : ''}`}
                  initial={false}
                  animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  <Art on={on} />
                </m.div>
              )
            })}
          </div>
        </m.div>
      </div>
    </section>
  )
}

/* ---------- The three cards. Each panel's text is in its tab, so the
   card is a picture of the step, read out once by its title. ---------- */

function Card({ icon, title, children }) {
  return (
    <div className="contact-art">
      <div className="contact-art-bar">
        <Icon name={icon} size={15} />
        <span>{title}</span>
      </div>
      <div className="contact-art-body">{children}</div>
    </div>
  )
}

function ReplyArt({ on }) {
  const rows = [
    ['Confirmation', 'Straight away'],
    ['A reply from Aniket', 'Within 24 hours']
  ]
  return (
    <Card icon="inbox" title="Your inbox">
      <ul className="contact-art-mail">
        {rows.map(([who, when], i) => (
          <m.li
            key={who}
            initial={false}
            animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.25, ease: EASE }}
          >
            <span className="contact-art-tick" aria-hidden="true">
              <Icon name="check" size={12} strokeWidth={2.6} />
            </span>
            <span className="contact-art-who">{who}</span>
            <span className="contact-art-when">{when}</span>
          </m.li>
        ))}
      </ul>
    </Card>
  )
}

function CallArt({ on }) {
  const questions = ['Who does it today?', 'Where does it get stuck?', 'How many hours does it take?']
  return (
    <Card icon="calendar" title="Call · 15 minutes">
      <div className="contact-art-call">
        <svg className="contact-art-ring" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="34" className="contact-art-ring-bg" />
          <m.circle
            cx="40"
            cy="40"
            r="34"
            className="contact-art-ring-fg"
            initial={false}
            animate={{ pathLength: on ? 1 : 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          />
          <text x="40" y="45" textAnchor="middle">15:00</text>
        </svg>
        <ol className="contact-art-list">
          {questions.map((q, i) => (
            <m.li
              key={q}
              initial={false}
              animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.12, ease: EASE }}
            >
              {q}
            </m.li>
          ))}
        </ol>
      </div>
    </Card>
  )
}

function ProposalArt({ on }) {
  const rows = [
    ['What gets built', 'Written down'],
    ['Price', 'Fixed'],
    ['Ready by', 'A set date'],
    ['Hourly billing', 'None']
  ]
  return (
    <Card icon="form" title="Proposal">
      <dl className="contact-art-doc">
        {rows.map(([k, v], i) => (
          <m.div
            key={k}
            initial={false}
            animate={on ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
          >
            <dt>{k}</dt>
            <dd>{v}</dd>
          </m.div>
        ))}
      </dl>
    </Card>
  )
}

const ART = { reply: ReplyArt, call: CallArt, proposal: ProposalArt }
