import { useRef, useState, useSyncExternalStore } from 'react'
import { fx } from '../../interactions/attrs.js'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { founder, packages, whatsappPrefill } from '../../data.js'
import { reveal } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'
import { handleTabKey } from './tabs.js'
import { Rehook } from '../../components/FunnelCta.jsx'
import { glideTo } from '../../scroll/smooth.js'

const EASE = [0.22, 1, 0.36, 1]
const pad = (n) => String(n).padStart(2, '0')

/* Tablet and up: the scroll-driven stepper. Phones get the stacked list. */
const PINNED = '(min-width: 768px)'
const subscribe = (cb) => {
  const mq = window.matchMedia(PINNED)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const usePinnedLayout = () =>
  useSyncExternalStore(subscribe, () => window.matchMedia(PINNED).matches, () => true)

/* Scroll per step while the band is pinned, in vh. About one screen per
   step (2026-10-09, Aniket: "make this section a scrolling one"). */
const STEP_VH = 120

/* ---------------------------------------------------------------
   How a project runs: enquiry, call, scope, build, handover. Content is
   `founder.steps` (data.js), each line a promise the site already makes.
   Beside each step sits a small drawn artifact of what that step
   produces: the message, the call, the one-page proposal, the timelines,
   the handover list.

   Tablet and desktop: the band pins (a sticky frame inside a track
   STEP_VH per step taller than the screen) and scrolling walks the steps
   01 to 05; the rail's line fills with the scroll itself. A dot click
   glides to that step's stretch of the track (through Lenis when it
   runs). Phones and reduced motion: the five steps stacked, nothing
   pinned and nothing hidden.

   In the pinned build all five panels stay in the DOM, stacked in one grid
   cell, so the frame is as tall as its tallest step. Inactive panels are
   visibility:hidden (after their fade), which also takes them out of the
   tab order and the accessibility tree.
   --------------------------------------------------------------- */
export default function Steps() {
  const reduce = useReducedMotion()
  const wide = usePinnedLayout()
  const pinned = wide && !reduce

  return (
    <section className="paper about-steps" aria-labelledby="about-steps-title">
      <div className="container">
        <m.header className="about-band-head" {...reveal}>
          <PillLabel icon="flow">How I work</PillLabel>
          {/* Keyed: StringSplit rewrites the heading's markup, so a layout
              switch that changes the line must mount a fresh heading. */}
          <h2 className="h2" {...fx('split')} id="about-steps-title" key={pinned ? 'pin' : 'list'}>
            From first message to handover.
            <span className="soft">{pinned ? 'Five steps. Scroll through them.' : 'Five steps, in order.'}</span>
          </h2>
        </m.header>
      </div>

      {pinned ? <Pinned /> : <Stacked />}

      <div className="container">
        {/* Points onward, into the page's one ask: /start, where the
            visitor picks a website, software or AI (or the AI check, if
            they are not sure yet). */}
        <Rehook
          tone="paper"
          question="Ready for step one?"
          label="Start with what you want to build"
          placement="about-steps"
        />
      </div>
    </section>
  )
}

function Pinned() {
  const steps = founder.steps
  const n = steps.length
  const track = useRef(null)
  const [active, setActive] = useState(0)

  const { scrollYProgress: p } = useScroll({ target: track, offset: ['start start', 'end end'] })
  /* Step i owns [i/n, (i+1)/n) of the pin. The line reaches dot i in the
     middle of that stretch, so the fill and the active dot always agree. */
  useMotionValueEvent(p, 'change', (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.floor(v * n)))
    setActive((prev) => (prev === i ? prev : i))
  })
  const fill = useTransform(p, (v) => Math.min(1, Math.max(0, (v * n - 0.5) / (n - 1))))

  /* The middle of step i's stretch, in page pixels. */
  const go = (i) => {
    const el = track.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const run = el.offsetHeight - window.innerHeight
    glideTo(Math.round(top + ((i + 0.5) / n) * run))
  }

  return (
    <div className="about-steps-track-scroll" ref={track} style={{ height: `calc(100vh + ${n * STEP_VH}vh)` }}>
      <div className="about-steps-pin">
        <div className="container">
          <div className="about-steps-rail" role="tablist" aria-label="Steps of a project">
            <span className="about-steps-track" aria-hidden="true">
              <m.span className="about-steps-fill is-scrubbed" style={{ scaleX: fill }} />
            </span>
            {steps.map((step, i) => (
              <button
                key={step.key}
                type="button"
                role="tab"
                id={`about-step-tab-${step.key}`}
                aria-selected={i === active}
                aria-controls={`about-step-panel-${step.key}`}
                tabIndex={i === active ? 0 : -1}
                className={`about-steps-tab${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
                onClick={() => go(i)}
                onKeyDown={(e) => handleTabKey(e, i, n, go)}
              >
                <span className="about-steps-dot">
                  {i < active ? <Icon name="check" size={14} strokeWidth={2.4} /> : pad(i + 1)}
                </span>
                <span className="about-steps-label">{step.label}</span>
              </button>
            ))}
          </div>

          <div className="about-steps-stage">
            {steps.map((step, i) => {
              const on = i === active
              return (
                <m.div
                  key={step.key}
                  role="tabpanel"
                  id={`about-step-panel-${step.key}`}
                  aria-labelledby={`about-step-tab-${step.key}`}
                  className={`about-steps-panel${on ? ' is-active' : ''}`}
                  initial={false}
                  /* Slides in the direction of travel: a step already
                     passed leaves upward, one still to come waits below. */
                  animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: i < active ? -14 : 14 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <StepBody step={step} i={i} n={n} on={on} />
                </m.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stacked() {
  const steps = founder.steps
  return (
    <div className="container">
      <ol className="about-steps-list">
        {steps.map((step, i) => (
          <m.li key={step.key} className="about-steps-panel is-listed" {...reveal}>
            <StepBody step={step} i={i} n={steps.length} on />
          </m.li>
        ))}
      </ol>
    </div>
  )
}

function StepBody({ step, i, n, on }) {
  const Artifact = ARTIFACTS[step.key]
  return (
    <>
      <div className="about-steps-copy">
        <p className="about-steps-count">
          Step {i + 1} of {n}
        </p>
        <h3 className="about-steps-title">{step.title}</h3>
        <p className="about-steps-text">{step.text}</p>
        <TickList items={step.gets} className="about-steps-gets" />
      </div>
      <div className="about-steps-art" aria-hidden="true">
        <Artifact on={on} />
      </div>
    </>
  )
}

/* ---------- The five artifacts. Decorative (aria-hidden): the copy
   beside each one already says everything it shows. ---------- */

function Card({ title, icon, children }) {
  return (
    <div className="about-art-card">
      <div className="about-art-bar">
        <Icon name={icon} size={15} />
        <span>{title}</span>
      </div>
      <div className="about-art-body">{children}</div>
    </div>
  )
}

function EnquiryArt({ on }) {
  return (
    <Card title="WhatsApp" icon="whatsapp">
      <m.p
        className="about-art-bubble"
        initial={false}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
      >
        {whatsappPrefill.contact}
      </m.p>
      <p className="about-art-status">
        <Icon name="check" size={13} strokeWidth={2.4} /> Personal reply within 24 hours
      </p>
    </Card>
  )
}

function CallArt({ on }) {
  const questions = ['Who touches it?', 'Where does it stall?', 'What does it cost in hours?']
  return (
    <Card title="Call · 15 minutes" icon="calendar">
      <div className="about-art-call">
        <svg className="about-art-ring" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" className="about-art-ring-bg" />
          <m.circle
            cx="40"
            cy="40"
            r="34"
            className="about-art-ring-fg"
            initial={false}
            animate={{ pathLength: on ? 1 : 0 }}
            transition={{ duration: 1.1, delay: 0.1, ease: EASE }}
          />
          <text x="40" y="45" textAnchor="middle">15:00</text>
        </svg>
        <ol className="about-art-list">
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

function ScopeArt({ on }) {
  const rows = [
    ['Scope', 'Written down, one page'],
    ['Price', 'Fixed'],
    ['Live date', 'In writing'],
    ['Payment', 'Half now, half on delivery']
  ]
  return (
    <Card title="Proposal · one page" icon="form">
      <dl className="about-art-doc">
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
      <p className="about-art-status">
        <Icon name="lock" size={13} /> No hourly billing
      </p>
    </Card>
  )
}

/* Bar length is the offer's live time in days, parsed from `timeline`
   ("Live in 5 days", "Live in 3–4 weeks": the upper bound counts). Only
   the offers marked `timelineChart` in data.js, one or two per service
   area, so the chart stays a glance rather than a list of eight. */
const CHART = packages.filter((p) => p.timelineChart)

function days(timeline) {
  const nums = timeline.match(/\d+/g) || ['0']
  const n = Number(nums[nums.length - 1])
  return /week/.test(timeline) ? n * 7 : n
}

function BuildArt({ on }) {
  const max = Math.max(...CHART.map((p) => days(p.timeline)))
  return (
    <Card title="Live in" icon="chart">
      <ul className="about-art-bars">
        {CHART.map((p, i) => (
          <li key={p.name}>
            <span className="about-art-bar-name">{p.name}</span>
            <span className="about-art-bar-track">
              <m.span
                className="about-art-bar-fill"
                style={{ width: `${(days(p.timeline) / max) * 100}%` }}
                initial={false}
                animate={{ scaleX: on ? 1 : 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: EASE }}
              />
            </span>
            <span className="about-art-bar-time">{p.timeline.replace('Live in ', '')}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function HandoverArt({ on }) {
  const items = [
    ['Set up in your name', true],
    ['Automations on your accounts', true],
    ['Walkthrough with your team', true],
    ['Care Plan, if you want one', false]
  ]
  return (
    <Card title="Handover" icon="check">
      <ul className="about-art-checks">
        {items.map(([label, done], i) => (
          <li key={label} className={done ? '' : 'is-optional'}>
            <m.span
              className="about-art-tick"
              initial={false}
              animate={{ scale: on ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.15 + i * 0.12 }}
            >
              <Icon name={done ? 'check' : 'pulse'} size={12} strokeWidth={2.4} />
            </m.span>
            {label}
          </li>
        ))}
      </ul>
    </Card>
  )
}

const ARTIFACTS = {
  enquiry: EnquiryArt,
  call: CallArt,
  scope: ScopeArt,
  build: BuildArt,
  handover: HandoverArt
}
