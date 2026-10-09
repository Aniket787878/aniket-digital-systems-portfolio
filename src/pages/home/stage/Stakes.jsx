import { useLayoutEffect, useRef, useState } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import '../../service/showcase/stage.css'
import './hero/stakes.css'
import { useWide } from './hero/useStage.js'

const EASE = [0.22, 1, 0.36, 1]

/* The first story loop (docs/ideas/relay-direction.md, section 0):
   stakes, big question, headfake, rehook into the work. */
const MANUAL = ['Read the message', 'Check the diary', 'Reply', 'Wait', 'Chase', 'Log it', 'Send a reminder']
const AUTO = ['Answered and booked', 'You see the summary']

const BEATS = [
  {
    id: 'stakes',
    lead: 'Every message you miss is work that goes to someone',
    serif: 'else.',
    note: 'a missed call · an unread WhatsApp · a form nobody answered'
  },
  { id: 'question', lead: 'What if the enquiries answered', serif: 'themselves?' },
  { id: 'headfake', lead: 'The answer isn’t more software. It’s fewer', serif: 'steps.' },
  { id: 'rehook', lead: 'Here’s what that looks like in real', serif: 'work.' }
]

/* The pinned band is BAND_VH tall, so the pin lasts BAND_VH - 100 of
   scroll. Each beat gets a share of it by weight: the headfake gets the
   most, because its seven steps need room to fold. 340vh was too long a
   hold per beat (a normal scroll could leave the middle line still
   blurred); cut by ~40% (2026-10 UX pass), scaling every beat's hold by
   the same amount so the weights still read the same.

   2026-10-09 (smooth-scroll pass): the headfake still left its row of
   steps blurred. Its fold, fade and the two "after" chips were packed into
   ~60px of scroll each, so almost any resting point caught one of them
   mid-blur. The headfake now gets more of the pin (weight 2, band 230vh)
   and the steps sit sharp before folding and the result sits sharp after
   (see Collapse), so every resting point but a short crossfade is clean. */
const BAND_VH = 230
const WEIGHTS = [1, 0.85, 2, 0.9]
const TOTAL = WEIGHTS.reduce((a, b) => a + b, 0)
const SPANS = WEIGHTS.map((w, i) => {
  const from = WEIGHTS.slice(0, i).reduce((a, b) => a + b, 0) / TOTAL
  return { from, to: from + w / TOTAL }
})
/* Where each beat sits on the stream (fraction of the band's height).
   The stream's tip is held at the middle of the screen, so it passes
   beat i when the pin is at that beat's middle. */
/* Share of each beat's span spent fading in (and again fading out). Was
   0.3; at 0.18 a beat is sharp for 64% of its span instead of 40%, so a
   reader who stops scrolling almost always stops on clean type. */
const EDGE = 0.18
const DOTS = SPANS.map(({ from, to }) => (50 + (BAND_VH - 100) * ((from + to) / 2)) / BAND_VH)

export default function Stakes() {
  const reduce = useReducedMotion()
  const wide = useWide()
  return wide && !reduce ? <Pinned /> : <Stacked reduce={reduce} />
}

function Heading({ beat, as: Tag = 'p', id }) {
  return (
    <Tag className="stage-title sk-line" id={id}>
      {beat.lead} <span className="stage-serif">{beat.serif}</span>
    </Tag>
  )
}

/* ---------------- desktop: one pinned, scroll-driven band ---------------- */

function Pinned() {
  const ref = useRef(null)
  const { scrollYProgress: q } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const { scrollYProgress: tip } = useScroll({ target: ref, offset: ['start center', 'end center'] })

  return (
    <section ref={ref} className="stage sk sk-pinned" aria-labelledby="sk-title" style={{ height: `${BAND_VH}vh` }}>
      <Stream tip={tip} />
      <div className="sk-sticky">
        <div className="stage-glow sk-glow" aria-hidden="true" />
        {BEATS.map((beat, i) => (
          <Beat key={beat.id} beat={beat} i={i} q={q} />
        ))}
      </div>
    </section>
  )
}

function Beat({ beat, i, q }) {
  const { from: a, to: b } = SPANS[i]
  const first = i === 0
  const last = i === BEATS.length - 1
  /* Offsets stay inside 0..1 (motion hands these to a scroll timeline):
     the first beat is already in focus when the pin starts, the last one
     stays in focus as the pin lets go. One beat leaves before the next
     arrives, so two lines of big type never sit on top of each other.
     The fade-in/out edge is EDGE of THIS beat's own span, not a fixed
     slice of the whole band, so every beat (long or short) reaches full
     sharpness by the same point in its own scroll progress. */
  const edge = (b - a) * EDGE
  const range = [first ? 0 : a, first ? 0.001 : a + edge, last ? 0.999 : b - edge, last ? 1 : b]
  const opacity = useTransform(q, range, [first ? 1 : 0, 1, 1, last ? 1 : 0])
  const blur = useTransform(q, range, [first ? 0 : 10, 0, 0, last ? 0 : 10])
  const filter = useTransform(blur, (v) => (v < 0.05 ? 'none' : `blur(${v}px)`))
  const y = useTransform(q, range, [first ? 0 : 16, 0, 0, last ? 0 : -16])
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? 'hidden' : 'visible'))

  return (
    <m.div className={`sk-beat sk-beat-${beat.id}`} style={{ opacity, filter, y, visibility }}>
      <Heading beat={beat} as={first ? 'h2' : 'p'} id={first ? 'sk-title' : undefined} />
      {beat.note && <p className="stage-mono sk-note">{beat.note}</p>}
      {beat.id === 'headfake' && <Collapse q={q} from={a} to={b} />}
      {beat.id === 'rehook' && <Rehook />}
    </m.div>
  )
}

/* Seven manual steps slide together and fold into two. Each chip's
   distance from the row's centre is measured once per resize, and the
   scroll drives one shared factor (--k) through CSS. */
function Collapse({ q, from, to }) {
  const row = useRef(null)
  const [dx, setDx] = useState([])
  const span = to - from
  /* In this beat's own progress (EDGE = 0.18 fade in, 0.82 fade out):
     0.18-0.28 the seven steps sit sharp; 0.28-0.46 they slide together;
     0.42-0.52 they fade; 0.46-0.56 the two that are left arrive; 0.56-0.82
     those two sit sharp. Blur only ever accompanies a fade, never the
     slide, so nothing readable is ever left soft. */
  const k = useTransform(q, [from + span * 0.28, from + span * 0.46], [0, 1], { clamp: true })
  const fade = useTransform(q, [from + span * 0.42, from + span * 0.52], [0, 1], { clamp: true })
  const show = useTransform(q, [from + span * 0.46, from + span * 0.56], [0, 1], { clamp: true })

  useLayoutEffect(() => {
    const el = row.current
    if (!el) return undefined
    const measure = () => {
      const mid = el.clientWidth / 2
      setDx([...el.children].map((c) => mid - (c.offsetLeft + c.offsetWidth / 2)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <m.div className="sk-collapse" style={{ '--k': k, '--f': fade, '--s': show }} aria-hidden="true">
      <div className="sk-manual" ref={row}>
        {MANUAL.map((step, i) => (
          <span key={step} className="sk-chip" style={{ '--dx': `${dx[i] || 0}px` }}>
            {step}
          </span>
        ))}
      </div>
      <div className="sk-auto">
        {AUTO.map((step) => (
          <span key={step} className="sk-chip sk-chip-auto">
            <span className="stage-dot" aria-hidden="true" />
            {step}
          </span>
        ))}
      </div>
    </m.div>
  )
}

function Rehook() {
  return (
    <p className="sk-rehook">
      <span className="sk-arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v16M5.5 13.5 12 20l6.5-6.5" />
        </svg>
      </span>
      <span className="stage-mono">↓ the work</span>
    </p>
  )
}

/* The band's segment of the stream: a straight run at --stream-x, its
   tip held at the middle of the screen, with a node that lights as the
   tip reaches each beat. */
function Stream({ tip }) {
  /* A straight run, so a scaled 1px line draws exactly like a path
     would, without an SVG stretched over 340vh (which breaks dash-based
     drawing once the stroke is kept at 1px). */
  const scaleY = useTransform(tip, [0, 1], [0, 1], { clamp: true })
  return (
    <div className="sk-stream" aria-hidden="true">
      <m.span className="sk-stream-line" style={{ scaleY }} />
      {DOTS.map((at, i) => (
        <StreamDot key={i} at={at} tip={tip} />
      ))}
    </div>
  )
}

function StreamDot({ at, tip }) {
  const on = useTransform(tip, [at - 0.012, at], [0, 1], { clamp: true })
  const scale = useTransform(on, [0, 1], [0.6, 1])
  return (
    <span className="sk-dot" style={{ top: `${at * 100}%` }}>
      <m.span className="sk-dot-on" style={{ opacity: on, scale }} />
    </span>
  )
}

/* ---------------- phones and reduced motion: four plain beats ---------------- */

function Stacked({ reduce }) {
  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12, filter: 'blur(10px)' },
        whileInView: { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.8, ease: EASE }
      }
  return (
    <section className="stage sk sk-stacked" aria-labelledby="sk-title">
      <div className="stage-glow sk-glow" aria-hidden="true" />
      {BEATS.map((beat, i) => (
        <m.div key={beat.id} className={`container sk-block sk-beat-${beat.id}`} {...reveal}>
          <Heading beat={beat} as={i === 0 ? 'h2' : 'p'} id={i === 0 ? 'sk-title' : undefined} />
          {beat.note && <p className="stage-mono sk-note">{beat.note}</p>}
          {beat.id === 'headfake' && (
            <div className="sk-fold">
              <ul className="sk-crossed" aria-label="The steps it takes by hand">
                {MANUAL.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <span className="sk-fold-arrow" aria-hidden="true">
                ↓
              </span>
              <ul className="sk-auto sk-auto-static" aria-label="What is left">
                {AUTO.map((step) => (
                  <li key={step} className="sk-chip sk-chip-auto">
                    <span className="stage-dot" aria-hidden="true" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {beat.id === 'rehook' && <Rehook />}
        </m.div>
      ))}
    </section>
  )
}
