import { useRef, useState } from 'react'
import { m, useScroll, useTransform, useMotionValueEvent } from 'motion/react'
import './stage.css'
import './software.css'

/*
  "Take it apart" — the software showpiece. A real screen (the Shared
  Inbox demo, public/walkthroughs/shared-inbox/03.png) lifts apart into
  three glass plates as the visitor scrolls: the screen, the rules it
  follows, and what it remembers. Desktop + motion only; the fallback
  below is the same three ideas as a plain stacked read.

  The scroll math lives here rather than in CSS because every plate's
  depth, tilt and brightness is a continuous function of one scroll
  progress value (see `stage()` below) — the same shape as the product
  tour on the home page (src/pages/home/Tour.jsx).
*/

const STEPS = [
  {
    title: 'The screen your team uses.',
    body: 'Every WhatsApp, email and website enquiry in one list. Reply, assign or add a private note without switching apps.'
  },
  {
    title: 'The rules it follows.',
    body: 'Reply and the conversation moves to pending by itself. Nothing waits on someone remembering.'
  },
  {
    title: 'What it remembers.',
    body: 'Each conversation is tied to a client, and every client moves from new enquiry to won. The inbox and the client list are the same thing.'
  }
]

const RULE_NODES = [
  { label: 'Enquiry arrives', sub: 'whatsapp · email · web' },
  { label: 'Assigned to a teammate', sub: 'shared inbox' },
  { label: 'Reply sent', sub: 'thread' },
  { label: 'Moved to pending', sub: 'automatic' }
]

/* Five pipeline columns. Meera starts in "New enquiry" and is the one
   card that moves to "Qualified" while the third plate is active — the
   rest sit still. Names are the demo's own fictional seed data. */
const COLUMNS = [
  { name: 'New enquiry', cards: ['Joseph'] },
  { name: 'Qualified', cards: ['Daniel'] },
  { name: 'Active', cards: ['Farah'] },
  { name: 'Won', cards: ['Tenzin'] },
  { name: 'Lost', cards: ['Ana'] }
]
const COL_COUNT = COLUMNS.length
const colCenter = (i) => `${(i / COL_COUNT) * 100 + 100 / COL_COUNT / 2}%`

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
/* A small overshoot-then-settle for the snap back at the end (p 0.8–1),
   so the plates close with a bit of weight instead of stopping dead. */
const easeOutBack = (t) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

/* Every value the choreography needs, as one function of scroll
   progress `p`. Kept pure so it is easy to reason about the five beats
   from the brief: hold / tilt+separate / step 1 / step 2 / step 3 / snap
   back — see the comment above each range. */
function stage(p) {
  const v = clamp01(p)

  // 0 → 0.12 hold flat. 0.12 → 0.3 tilt and separate. 0.3 → 0.8 hold
  // exploded. 0.8 → 1 snap back flat (eased with a touch of overshoot).
  let explode
  if (v <= 0.12) explode = 0
  else if (v <= 0.3) explode = easeInOut((v - 0.12) / 0.18)
  else if (v <= 0.8) explode = 1
  else explode = clamp01(1 - easeOutBack((v - 0.8) / 0.2))

  // Which step/plate is lit right now.
  let active = 0
  if (v >= 0.55) active = 2
  else if (v >= 0.3) active = 1

  // Meera's move across the board, inside the third plate's window.
  const move = clamp01((v - 0.6) / 0.16)

  // The closing line, fading in as the plates settle back.
  const close = clamp01((v - 0.84) / 0.14)

  return { explode, active, move, close }
}

export default function SoftwareShowcase() {
  const wrapRef = useRef(null)
  const [active, setActive] = useState(0)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })

  const explode = useTransform(scrollYProgress, (v) => stage(v).explode)
  const tiltX = useTransform(explode, (e) => e * 52)
  const tiltZ = useTransform(explode, (e) => e * -32)
  const move = useTransform(scrollYProgress, (v) => stage(v).move)
  const meeraLeft = useTransform(move, (m2) => {
    const from = parseFloat(colCenter(0))
    const to = parseFloat(colCenter(1))
    return `${from + (to - from) * m2}%`
  })
  const closeOpacity = useTransform(scrollYProgress, (v) => stage(v).close)
  const streamOpacity = useTransform(explode, (e) => e * 0.8)

  // Each plate fans out along its own local Y (so the tilt on .sw-stack
  // turns it into a diagonal "staircase") plus a small Z push for real
  // depth. The tiny resting Z offset keeps plate 1 on top of 2 and 3
  // even at explode = 0, so the flat stack reads as "one screen".
  const y1 = useTransform(explode, [0, 1], [0, -148])
  const y3 = useTransform(explode, [0, 1], [0, 148])
  const z1 = useTransform(explode, [0, 1], [0.6, 46])
  const z2 = useTransform(explode, () => 0)
  const z3 = useTransform(explode, [0, 1], [-0.6, -46])
  const b1 = useTransform([explode, scrollYProgress], ([e, v]) => {
    const on = stage(v).active === 0
    return `brightness(${on || e === 0 ? 1 : 0.5})`
  })
  const b2 = useTransform([explode, scrollYProgress], ([_e, v]) => {
    const on = stage(v).active === 1
    return `brightness(${on ? 1 : 0.5})`
  })
  const b3 = useTransform([explode, scrollYProgress], ([_e, v]) => {
    const on = stage(v).active === 2
    return `brightness(${on ? 1 : 0.5})`
  })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = stage(v).active
    if (next !== active) setActive(next)
  })

  return (
    <section className="stage sw-apart" aria-labelledby="sw-apart-title" style={{ '--glow-x': '62%', '--glow-y': '50%' }}>
      <div className="stage-glow" aria-hidden="true" />

      {/* Desktop, motion-allowed version: pinned while the plates take
          themselves apart and snap back. Hidden below 768px and under
          reduced motion — see software.css. */}
      <div className="sw-wrap" ref={wrapRef}>
        <div className="sw-pin">
          <div className="container sw-grid">
            <div className="sw-copy">
              <span className="stage-pill stage-mono">
                <span className="stage-dot" aria-hidden="true" />
                Shared Inbox · working demo
              </span>
              <h2 id="sw-apart-title" className="stage-title sw-title">
                Good software is more than a <span className="stage-serif">screen.</span>
              </h2>

              <ol className="sw-steps">
                {STEPS.map((step, i) => (
                  <li key={step.title} className={i === active ? 'is-active' : ''}>
                    <span className="sw-step-count stage-mono">{String(i + 1).padStart(2, '0')}</span>
                    <span className="sw-step-copy">
                      <strong>{step.title}</strong>
                      <span>{step.body}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <m.p className="sw-close" style={{ opacity: closeOpacity }}>
                Built around how your team already works, and yours to keep.
              </m.p>
            </div>

            <div className="sw-object" aria-hidden="true">
              <m.div className="sw-stack" style={{ rotateX: tiltX, rotateZ: tiltZ }}>
                <m.div className="stage-glass sw-plate sw-plate-1" style={{ translateY: y1, translateZ: z1, filter: b1 }}>
                  <div className="sw-plate-chrome">
                    <span className="sw-plate-dots">
                      <i /><i /><i />
                    </span>
                    <span className="sw-plate-url stage-mono">shared-inbox.app/inbox</span>
                  </div>
                  <img
                    src="/walkthroughs/shared-inbox/03.png"
                    width={2880}
                    height={1800}
                    loading="lazy"
                    decoding="async"
                    alt="The Shared Inbox demo: a list of enquiries from WhatsApp, email and the website, with one conversation open"
                    className="sw-plate-shot"
                  />
                  <span className="sw-plate-tag stage-mono">Real screen</span>
                </m.div>

                <m.div className="stage-glass sw-plate sw-plate-2" style={{ translateZ: z2, filter: b2 }}>
                  <div className="sw-rules">
                    {RULE_NODES.map((node, i) => (
                      <div className="sw-node-wrap" key={node.label}>
                        <div className="stage-glass sw-node">
                          <span className="sw-node-label">{node.label}</span>
                          <span className="sw-node-sub stage-mono">{node.sub}</span>
                        </div>
                        {i < RULE_NODES.length - 1 && (
                          <span className={`sw-wire${active === 1 ? ' is-active' : ''}`}>
                            <i className="sw-pulse" style={{ animationDelay: `${i * 0.7}s` }} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="sw-plate-tag stage-mono">Diagram</span>
                </m.div>

                <m.div className="stage-glass sw-plate sw-plate-3" style={{ translateY: y3, translateZ: z3, filter: b3 }}>
                  <div className="sw-board">
                    {COLUMNS.map((col) => (
                      <div className="sw-col" key={col.name}>
                        <span className="sw-col-label stage-mono">{col.name}</span>
                        <div className="sw-col-cards">
                          {col.cards.map((name) => (
                            <span className="sw-card" key={name}>{name}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <m.span className="sw-card sw-card-moving" style={{ left: meeraLeft }}>Meera</m.span>
                  </div>
                  <span className="sw-plate-tag stage-mono">Diagram · demo data</span>
                </m.div>

                <m.span className="sw-stream" style={{ opacity: streamOpacity }} />
              </m.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / reduced-motion fallback: the same three ideas, no
          pin, no 3D — each plate flat and full width, its step text
          straight below it. Nothing here moves. */}
      <div className="sw-fallback container">
        <span className="stage-pill stage-mono">
          <span className="stage-dot" aria-hidden="true" />
          Shared Inbox · working demo
        </span>
        <h2 className="stage-title sw-title">
          Good software is more than a <span className="stage-serif">screen.</span>
        </h2>

        <div className="sw-flat">
          <div className="stage-glass sw-plate sw-plate-1">
            <div className="sw-plate-chrome">
              <span className="sw-plate-dots">
                <i /><i /><i />
              </span>
              <span className="sw-plate-url stage-mono">shared-inbox.app/inbox</span>
            </div>
            <img
              src="/walkthroughs/shared-inbox/03.png"
              width={2880}
              height={1800}
              loading="lazy"
              decoding="async"
              alt="The Shared Inbox demo: a list of enquiries from WhatsApp, email and the website, with one conversation open"
              className="sw-plate-shot"
            />
            <span className="sw-plate-tag stage-mono">Real screen</span>
          </div>
          <p className="sw-flat-step">
            <strong>{STEPS[0].title}</strong> {STEPS[0].body}
          </p>

          <div className="stage-glass sw-plate sw-plate-2">
            <div className="sw-rules">
              {RULE_NODES.map((node, i) => (
                <div className="sw-node-wrap" key={node.label}>
                  <div className="stage-glass sw-node">
                    <span className="sw-node-label">{node.label}</span>
                    <span className="sw-node-sub stage-mono">{node.sub}</span>
                  </div>
                  {i < RULE_NODES.length - 1 && (
                    <span className="sw-wire">
                      <i className="sw-pulse is-static" />
                    </span>
                  )}
                </div>
              ))}
            </div>
            <span className="sw-plate-tag stage-mono">Diagram</span>
          </div>
          <p className="sw-flat-step">
            <strong>{STEPS[1].title}</strong> {STEPS[1].body}
          </p>

          <div className="stage-glass sw-plate sw-plate-3">
            <div className="sw-board">
              {COLUMNS.map((col) => (
                <div className="sw-col" key={col.name}>
                  <span className="sw-col-label stage-mono">{col.name}</span>
                  <div className="sw-col-cards">
                    {col.cards.map((name) => (
                      <span className="sw-card" key={name}>{name}</span>
                    ))}
                    {col.name === 'Qualified' && <span className="sw-card">Meera</span>}
                  </div>
                </div>
              ))}
            </div>
            <span className="sw-plate-tag stage-mono">Diagram · demo data</span>
          </div>
          <p className="sw-flat-step">
            <strong>{STEPS[2].title}</strong> {STEPS[2].body}
          </p>
        </div>

        <p className="sw-close">Built around how your team already works, and yours to keep.</p>
      </div>

      <div className="container">
        <p className="stage-note stage-mono">
          <span className="stage-dot" aria-hidden="true" />
          Top layer: real screens from the Shared Inbox demo. Lower layers: diagrams of how it works. Demo data, not a client project.
        </p>
      </div>
    </section>
  )
}
