import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { m, AnimatePresence, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './stage.css'
import './ai.css'
import { CLOCK_MS, DAY_END, DAY_LABEL, DAY_START, MOMENTS, SCHEDULES, TALLY, minutesOf } from './ai/day.js'
import FlowCanvas from './ai/FlowCanvas.jsx'
import { NODES } from './ai/graph.js'
import Chat from './ai/Chat.jsx'
import Glyph from './ai/icons.jsx'

/* --------------------------------------------------------------
   "A day at the front desk": seven recorded, successful runs from
   the demo clinic, replayed as one day. The whole piece is a pure
   function of (moment, t): one animation-frame clock advances t, and
   the chat, the wires, the tool results, the day clock and the tally
   are all read off the schedule in ai/day.js. Pausing stops t;
   reduced motion pins t at the end of the moment.
   -------------------------------------------------------------- */

const EASE = [0.22, 1, 0.36, 1]
const N = MOMENTS.length
const reveal = {
  hidden: { opacity: 0, y: 12, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } },
}

const WIDE = '(min-width: 1024px)'
const subscribeWide = (cb) => {
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const useWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE).matches,
    () => true
  )

const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
const along = (min) => `${((min - DAY_START) / (DAY_END - DAY_START)) * 100}%`
const easeOut = (x) => 1 - Math.pow(1 - x, 3)

/* Everything the flow shows at time t of moment idx. */
function derive(idx, t) {
  const lit = new Set()
  const flash = new Set()
  const results = {}
  const pulses = []
  for (const p of SCHEDULES[idx].pulses) {
    if (t < p.start) continue
    lit.add(p.edge)
    if (t < p.end) pulses.push(p)
    else if (t < p.end + 1100) flash.add(p.toDesk ? 'desk' : p.edge)
    if (p.result && t >= p.end) results[p.edge] = p.result
  }
  return { lit, flash, results, pulses, t, channel: MOMENTS[idx].channel, active: t >= CLOCK_MS }
}

const doneThrough = (idx, t) => (t >= SCHEDULES[idx].doneAt ? idx : idx - 1)

const HOUR_TICKS = [8, 11, 14, 17, 20, 23]

export default function AiShowcase() {
  const reduce = useReducedMotion()
  const wide = useWide()
  const sectionRef = useRef(null)
  const tlRef = useRef(null)
  const stageRef = useRef(null)
  const inView = useInView(stageRef, { amount: 0.35 })

  const [play, setPlay] = useState({ idx: 0, from: 0, t: 0 })
  const [userPlaying, setUserPlaying] = useState(true)
  const [hover, setHover] = useState(false)
  const [kbFocus, setKbFocus] = useState(false)

  const running = !reduce && userPlaying && inView && !hover && !kbFocus
  const t = reduce ? Infinity : play.t
  const { idx } = play
  const moment = MOMENTS[idx]
  const sched = SCHEDULES[idx]

  useEffect(() => {
    if (!running) return undefined
    let raf
    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min(100, now - last)
      last = now
      setPlay((s) => {
        const next = s.t + dt
        if (next < SCHEDULES[s.idx].total) return { ...s, t: next }
        return { idx: (s.idx + 1) % N, from: s.idx, t: 0 }
      })
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [running])

  // On narrow screens the timeline scrolls sideways inside itself: keep
  // the current moment in view (this never scrolls the page).
  useEffect(() => {
    const box = tlRef.current
    const dot = box?.querySelectorAll('.ai-tl-dot')[idx]
    if (!box || !dot || box.scrollWidth <= box.clientWidth) return
    const left = dot.offsetLeft - box.clientWidth / 2
    box.scrollTo({ left, behavior: reduce ? 'auto' : 'smooth' })
  }, [idx, reduce])

  // A paused jump shows the whole moment at once; a playing one plays it.
  const jump = (i) => setPlay((s) => ({ idx: i, from: s.idx, t: running ? 0 : Infinity }))

  // Keyboard focus pauses the replay (so it holds still while read);
  // mouse clicks do not, and neither does the play button itself.
  const onFocus = (e) => {
    if (e.target.matches(':focus-visible') && !e.target.closest('.ai-play')) setKbFocus(true)
  }
  const onBlur = (e) => {
    if (!sectionRef.current?.contains(e.relatedTarget)) setKbFocus(false)
  }

  // The flow window starts tilted and settles a little as it arrives.
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'center center'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [8, 4])
  const rotateY = useTransform(scrollYProgress, [0, 1], [-10, -5])

  // Day clock: rolls from the previous moment's time to this one's.
  const cur = minutesOf(moment.time)
  const prev = minutesOf(MOMENTS[play.from].time)
  const k = easeOut(Math.min(1, t / CLOCK_MS))
  const clock = Math.round(prev + (cur - prev) * k)

  const flow = derive(idx, t)
  const through = doneThrough(idx, t)
  const tally = { q: 0, b: 0, r: 0, f: 0 }
  for (let i = 0; i <= through; i++) for (const [key, v] of Object.entries(MOMENTS[i].tally)) tally[key] += v
  const recent = MOMENTS.slice(0, through + 1).slice(-3).reverse()

  const used = [moment.channel, ...new Set(moment.turns.flatMap((tn) => tn.tools.map((x) => x.node)))]
  const status = reduce ? 'replay' : running ? 'replaying' : 'paused'
  const motionProps = reduce ? {} : { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount: 0.25 } }

  return (
    <section
      className="stage ai-day"
      aria-labelledby="ai-day-title"
      ref={sectionRef}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{ '--glow-x': '62%', '--glow-y': '58%' }}
    >
      <div className="stage-glow" aria-hidden="true" />
      <div className="container">
        <m.div className="ai-day-head" variants={reveal} {...motionProps}>
          <div className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Appointment Desk &middot; one day, replayed
          </div>
          <h2 className="stage-title" id="ai-day-title">
            One front desk. The whole <span className="stage-serif">day.</span>
          </h2>
          <p className="stage-lede">
            It answers questions, books and moves appointments, sends reminders and follows up after visits, at eight in
            the morning or ten at night, with nobody sitting at the desk.
          </p>
        </m.div>

        <m.div className="ai-day-stage" ref={stageRef} variants={reveal} {...motionProps}>
          <div className="ai-day-bar">
            <div className="ai-clock" aria-hidden="true">
              <span className="ai-clock-time">{hhmm(clock)}</span>
              <span className="stage-mono ai-clock-day">{DAY_LABEL}</span>
            </div>

            <div className="ai-tl-scroll" ref={tlRef}>
              <div className="ai-tl" role="group" aria-label="Moments in the day">
                <span className="ai-tl-track" aria-hidden="true" />
                <span className="ai-tl-fill" style={{ width: along(clock) }} aria-hidden="true" />
                {HOUR_TICKS.map((h) => (
                  <span key={h} className="ai-tl-tick stage-mono" style={{ left: along(h * 60) }} aria-hidden="true">
                    {hhmm(h * 60)}
                  </span>
                ))}
                {MOMENTS.map((mo, i) => (
                  <button
                    key={mo.id}
                    type="button"
                    className={`ai-tl-dot${i === idx ? ' is-current' : ''}${i <= through ? ' is-done' : ''}`}
                    style={{ left: along(minutesOf(mo.time)) }}
                    onClick={() => jump(i)}
                    aria-label={`${mo.time}, ${mo.label}`}
                    aria-current={i === idx ? 'step' : undefined}
                  >
                    <span className="ai-tl-time stage-mono" aria-hidden="true">
                      {mo.time}
                    </span>
                    <span className="ai-tl-pip" aria-hidden="true" />
                  </button>
                ))}
                <span className="ai-tl-head" style={{ left: along(clock) }} aria-hidden="true" />
              </div>
            </div>

            {!reduce && (
              <button
                type="button"
                className="ai-play"
                onClick={() => setUserPlaying((p) => !p)}
                aria-label={userPlaying ? 'Pause the replay' : 'Play the replay'}
              >
                {userPlaying ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M8 5v14M16 5v14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="ai-day-now">
            <AnimatePresence mode="wait" initial={false}>
              <m.span
                key={moment.id}
                className="ai-day-label"
                initial={reduce ? false : { opacity: 0, filter: 'blur(6px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
              >
                <span className="stage-mono ai-day-when">{moment.time}</span> {moment.label}
              </m.span>
            </AnimatePresence>
            <span className="stage-mono ai-honest">Recorded test runs · made-up physio clinic · dummy data</span>
          </div>

          <div className="ai-day-grid">
            <Chat moment={moment} sched={sched} t={t} onHover={setHover} />

            {wide ? (
              <div className="ai-flow-persp" aria-hidden="true">
                <m.div className="ai-flow-win stage-glass" style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1600 }}>
                  <div className="ai-flow-head">
                    <span className="ai-flow-title">Front desk</span>
                    <span className="stage-mono">2 channels / 5 tools</span>
                    <span className="stage-mono ai-flow-status">
                      <span className={`ai-live${running ? ' is-on' : ''}`} />
                      {status}
                    </span>
                  </div>
                  <FlowCanvas state={flow} />
                  <div className="ai-flow-foot">
                    <span className="stage-mono ai-flow-foot-label">done today</span>
                    <ul className="ai-runs">
                      {recent.map((mo) => (
                        <li key={mo.id} className="stage-mono">
                          <span className="ai-runs-dot" />
                          <span className="ai-runs-time">{mo.time}</span>
                          {mo.log}
                        </li>
                      ))}
                    </ul>
                  </div>
                </m.div>
              </div>
            ) : (
              <ul className="ai-used stage-glass" aria-label="Used in this moment">
                {used.map((key) => (
                  <li key={key} className={`ai-used-row${flow.lit.has(key) ? ' is-lit' : ''}`}>
                    <Glyph name={key} className="ai-used-icon" />
                    <span className="ai-used-name">{NODES[key].label}</span>
                    <span className="stage-mono ai-used-res">{flow.results[key] || (key === moment.channel && flow.lit.has(key) ? (moment.turns[0].user ? 'message received' : 'message sent') : '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ai-tally">
            <span className="stage-mono ai-tally-label">In this replay</span>
            {TALLY.map(({ key, label }) => (
              <div className="ai-tally-item" key={key}>
                <span className="ai-tally-num" aria-hidden="true">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <m.span
                      key={tally[key]}
                      initial={reduce ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                      transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
                    >
                      {tally[key]}
                    </m.span>
                  </AnimatePresence>
                </span>
                <span className="ai-tally-name">{label}</span>
                <span className="sr-only">
                  {tally[key]} {label}
                </span>
              </div>
            ))}
          </div>

          {/* The visible chat and flow are drawn from a moving clock and
              hidden from screen readers; this is the same moment, whole. */}
          <div className="sr-only">
            <p>
              {moment.time}, {moment.header}. {moment.label}.
            </p>
            {moment.turns.map((tn, i) => (
              <div key={i}>
                {tn.user && (
                  <p>
                    {moment.channel === 'inbox' ? 'Staff' : 'Patient'}: {tn.user}
                  </p>
                )}
                <p>Front desk: {tn.reply.replace('REPLACE_WITH_REVIEW_LINK', 'review link')}</p>
                <p>Used: {tn.tools.map((x) => `${NODES[x.node].label}, ${x.result}`).join('; ')}.</p>
              </div>
            ))}
          </div>
        </m.div>

        <p className="stage-note ai-rehook">
          <span className="stage-dot" aria-hidden="true" />
          <Link to="/projects/appointment-desk">See how the front desk was built</Link>
        </p>
      </div>
    </section>
  )
}
