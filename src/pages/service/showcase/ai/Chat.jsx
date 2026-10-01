import { useLayoutEffect, useMemo, useRef } from 'react'
import { CLOCK_MS, WORD_MS } from './day.js'

const LINK_TOKEN = 'REPLACE_WITH_REVIEW_LINK'

/* The recorded follow-up carried a placeholder where the review link
   goes; draw it as a link chip instead of printing the placeholder. */
function inline(text) {
  if (!text.includes(LINK_TOKEN)) return text
  const [a, b] = text.split(LINK_TOKEN)
  return (
    <>
      {a}
      <span className="ai-linkchip">review link</span>
      {b}
    </>
  )
}

/* Reply text into paragraphs, "- " lists and the "Sources:" footer:
   the only shapes the recorded replies use. */
function blocksOf(text) {
  const blocks = []
  let list = null
  for (const line of text.split('\n')) {
    if (line.startsWith('- ')) {
      list = list || { type: 'list', items: [] }
      list.items.push(line.slice(2))
      continue
    }
    if (list) blocks.push(list)
    list = null
    if (line.trim()) blocks.push({ type: line.startsWith('Sources:') ? 'src' : 'p', text: line })
  }
  if (list) blocks.push(list)
  return blocks
}

/* The first `limit` words of the reply's blocks, keeping the finished
   reply's shape so nothing reflows when the last word lands. */
function truncate(blocks, limit) {
  let left = limit
  const out = []
  for (const b of blocks) {
    if (left <= 0) break
    if (b.type === 'list') {
      const items = []
      for (const it of b.items) {
        if (left <= 0) break
        const words = it.split(' ')
        items.push(words.slice(0, left).join(' '))
        left -= words.length
      }
      out.push({ ...b, items })
    } else {
      const words = b.text.split(' ')
      out.push({ ...b, text: words.slice(0, left).join(' ') })
      left -= words.length
    }
  }
  return out
}

function Reply({ text, limit }) {
  const blocks = useMemo(() => blocksOf(text), [text])
  return truncate(blocks, limit).map((b, i) =>
    b.type === 'list' ? (
      <ul key={i}>
        {b.items.map((it, j) => (
          <li key={j}>{it}</li>
        ))}
      </ul>
    ) : (
      <p key={i} className={b.type === 'src' ? 'ai-src stage-mono' : undefined}>
        {inline(b.text)}
      </p>
    )
  )
}

function Typing() {
  return (
    <div className="ai-bubble is-desk ai-typing" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  )
}

/* The last couple of moments' messages, faded, so the window opens onto a
   running thread instead of an empty screen. Full text, no typing beats:
   these moments already finished. */
function History({ moments }) {
  if (!moments.length) return null
  return (
    <div className="ai-history" aria-hidden="true">
      {moments.map((mo) => (
        <div className="ai-history-moment" key={mo.id}>
          <div className="ai-daychip stage-mono">Today {mo.time}</div>
          {!mo.turns[0].user && (
            <div className="ai-auto stage-mono">Prepared automatically at {mo.time}</div>
          )}
          {mo.turns.map((turn, i) => (
            <div key={i}>
              {turn.user && (
                <div className="ai-bubble is-visitor">
                  <p>{turn.user}</p>
                </div>
              )}
              <div className="ai-bubble is-desk">
                <Reply text={turn.reply} limit={Infinity} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* The phone-style window: one moment's conversation, derived from t. */
export default function Chat({ moment, sched, t, onHover, prevMoments = [] }) {
  const scroller = useRef(null)
  const items = []
  let composing = ''

  if (moment.turns[0].user && t >= CLOCK_MS)
    items.push(
      <div className="ai-daychip stage-mono" key="day">
        Today {moment.time}
      </div>
    )

  moment.turns.forEach((turn, i) => {
    const s = sched.turns[i]
    if (!turn.user && i === 0 && t >= CLOCK_MS) {
      items.push(
        <div className="ai-auto stage-mono" key="auto">
          Prepared automatically at {moment.time}
        </div>
      )
    }
    if (turn.user) {
      if (t >= s.composeStart && t < s.sentAt) composing = turn.user.slice(0, Math.ceil(((t - s.composeStart) / (s.sentAt - s.composeStart)) * turn.user.length))
      if (t >= s.sentAt)
        items.push(
          <div className="ai-bubble is-visitor" key={`u${i}`}>
            <p>{turn.user}</p>
          </div>
        )
    }
    const thinkFrom = turn.user ? s.sentAt + 300 : CLOCK_MS
    if (t >= thinkFrom && t < s.replyStart) items.push(<Typing key={`d${i}`} />)
    if (t >= s.replyStart) {
      const limit = Math.min(s.words, Math.floor((t - s.replyStart) / WORD_MS) + 1)
      items.push(
        <div className="ai-bubble is-desk" key={`r${i}`}>
          <Reply text={turn.reply} limit={limit} />
        </div>
      )
    }
  })

  // Keep the newest line in view inside the window; never scroll the page.
  useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  })

  const auto = !moment.turns[0].user

  return (
    <div className="ai-phone stage-glass" onMouseEnter={() => onHover(true)} onMouseLeave={() => onHover(false)}>
      <div className="ai-phone-bar">
        <span className="ai-avatar" aria-hidden="true">
          DP
        </span>
        <span className="ai-phone-who">
          <span className="ai-phone-name">Demo Physio Clinic</span>
          <span className="stage-mono ai-phone-sub">{moment.header}</span>
        </span>
      </div>
      <div className="ai-phone-log" ref={scroller} aria-hidden="true">
        <History moments={prevMoments} />
        {items}
      </div>
      <div className="ai-composer" aria-hidden="true">
        <span className={`ai-composer-field${composing ? ' is-typing' : ''}`}>
          {auto ? <span className="stage-mono">Automatic message</span> : composing || 'Message'}
          {composing && <span className="ai-caret" />}
        </span>
        <span className="ai-send">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  )
}
