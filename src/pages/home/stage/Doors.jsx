import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m, useInView, useReducedMotion } from 'motion/react'
import { services } from '../../../data.js'
import { concepts } from '../../../concepts/registry.js'
import { MOMENTS } from '../../service/showcase/ai/day.js'
import { useCurrency, inCurrency } from '../../../currency.js'
import { CurrencyToggle } from '../../../components/Pricing.jsx'
import Stream from './work/Stream.jsx'
import { firstSentence, settle } from './work/shared.js'
import '../../service/showcase/stage.css'
import './work/doors.css'

/* ---------------------------------------------------------------
   The three service areas as three tall glass doors, each opening its
   own page, each with a small live picture of what is behind it:
   the five concept sites crossfading, the Shared Inbox screen on a
   tilted plate, and one real booking reply typing out. Prices are the
   same data and wording as the old Services band ("From", the USD/INR
   toggle). Rehooks into how a project runs.
   --------------------------------------------------------------- */

export default function Doors() {
  const reduce = useReducedMotion()
  const currency = useCurrency()
  const ref = useRef(null)

  return (
    <section className="stage sd" id="services" aria-labelledby="sd-title" ref={ref}>
      <Stream target={ref} />
      <div className="stage-glow" style={{ '--glow-x': '50%', '--glow-y': '58%' }} aria-hidden="true" />

      <div className="sd-inner">
        <m.header className="sd-head" {...settle(reduce)}>
          <div>
            <p className="stage-pill stage-mono">
              <span className="stage-dot" aria-hidden="true" />
              Services
            </p>
            <h2 id="sd-title" className="stage-title">
              Three ways in. One <span className="stage-serif">system.</span>
            </h2>
            <p className="stage-lede">
              The website brings the enquiry in, the software keeps track of it, and the AI does the repeat work.
              Start with whichever part costs you the most.
            </p>
          </div>
          <CurrencyToggle currency={currency} />
        </m.header>

        <ul className="sd-doors">
          {services.map((area, i) => (
            <m.li key={area.slug} {...settle(reduce, 0.08 * i)}>
              <Link to={area.path} className="sd-door stage-glass">
                <div className="sd-mini" aria-hidden="true">
                  {area.slug === 'websites' && <SitesMini reduce={reduce} />}
                  {area.slug === 'software' && <InboxMini />}
                  {area.slug === 'ai' && <ChatMini reduce={reduce} />}
                </div>
                <div className="sd-body">
                  <h3 className="sd-name">{area.name}</h3>
                  <p className="sd-sub">{firstSentence(area.sub)}</p>
                  <p className="sd-from">
                    From <strong>{inCurrency(area.from, currency)}</strong>
                  </p>
                  <span className="sd-open stage-mono" aria-hidden="true">
                    Open →
                  </span>
                </div>
              </Link>
            </m.li>
          ))}
        </ul>

        <p className="sd-rehook">
          So where do you start, and what does it cost to find out?
          <span className="sd-rehook-arrow" aria-hidden="true">
            ↓
          </span>
        </p>
      </div>
    </section>
  )
}

/* Plays only while the door is on screen and motion is allowed. */
function useLive(reduce) {
  const ref = useRef(null)
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  return [ref, inView && !reduce]
}

/* Websites: the five concept heroes, one every 2.5s, each drifting in
   a slow Ken Burns while it is on. */
function SitesMini({ reduce }) {
  const [ref, live] = useLive(reduce)
  const [on, setOn] = useState(0)

  useEffect(() => {
    if (!live) return undefined
    const t = setInterval(() => setOn((i) => (i + 1) % concepts.length), 2500)
    return () => clearInterval(t)
  }, [live])

  return (
    <div ref={ref} className="sd-sites">
      <div className="sd-sites-frame">
        <span className="sd-sites-bar">
          <i />
          <i />
          <i />
        </span>
        <div className="sd-sites-screen">
          {concepts.map((c, i) => (
            <img
              key={c.slug}
              className={`${i === on ? 'is-on' : ''}${live ? ' is-live' : ''}`}
              src={`/showcase/websites/${c.slug}-hero.webp`}
              alt=""
              width="1440"
              height="900"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>
      <span className="sd-mini-tag stage-mono">Concept designs</span>
    </div>
  )
}

/* Software: the real Shared Inbox screen on a tilted plate. */
function InboxMini() {
  return (
    <div className="sd-inbox">
      <div className="sd-plate sd-plate-ghost" />
      <div className="sd-plate">
        <img src="/showcase/software/inbox-1200.webp" alt="" width="1200" height="750" loading="lazy" decoding="async" />
      </div>
      <span className="sd-mini-tag stage-mono">Real screen · working demo</span>
    </div>
  )
}

/* AI: one real reply from a recorded test run (the late-night booking in
   the AI page's day), typed out, then the calendar's own result as a chip.
   Both strings come from day.js; only the first sentence of each message
   is used, so nothing is reworded. */
const BOOKING = MOMENTS.find((x) => x.id === 'booking')
const TURN = BOOKING.turns[BOOKING.turns.length - 1]
const ASK = firstSentence(TURN.user)
const REPLY = firstSentence(TURN.reply)
const BOOKED = TURN.tools.find((t) => t.node === 'cal')?.result

function ChatMini({ reduce }) {
  const [ref, live] = useLive(reduce)
  const [shown, setShown] = useState(reduce ? REPLY.length : 0)
  const done = shown >= REPLY.length

  useEffect(() => {
    if (!live) return undefined
    let i = 0
    let t = 0
    const tick = () => {
      i += 1
      if (i <= REPLY.length) {
        setShown(i)
        t = setTimeout(tick, 28)
      } else if (i > REPLY.length + 110) {
        /* ~3s hold on the booked chip, then type it again. */
        i = 0
        setShown(0)
        t = setTimeout(tick, 600)
      } else {
        t = setTimeout(tick, 28)
      }
    }
    t = setTimeout(() => {
      setShown(0)
      t = setTimeout(tick, 700)
    }, 0)
    return () => clearTimeout(t)
  }, [live])

  const full = reduce || !live ? REPLY : REPLY.slice(0, shown)
  const showChip = reduce || !live || done

  return (
    <div ref={ref} className="sd-chat">
      <span className="sd-chat-head stage-mono">{BOOKING.header}</span>
      <p className="sd-bubble sd-bubble-user">{ASK}</p>
      <p className="sd-bubble sd-bubble-ai">
        {full}
        {live && !done && <span className="sd-caret" />}
      </p>
      <span className={`sd-chip stage-mono${showChip ? ' is-on' : ''}`}>
        <span className="stage-dot" />
        {BOOKED}
      </span>
      <span className="sd-mini-tag stage-mono">Replayed from a recorded test run</span>
    </div>
  )
}
