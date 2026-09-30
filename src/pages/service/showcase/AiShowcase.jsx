import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { m, AnimatePresence, useReducedMotion } from 'motion/react'
import './stage.css'
import './ai.css'
import { EXCHANGES, OPENING_LINE, TOOL_CARDS } from './ai/script.js'
import ToolIcon from './ai/icons.jsx'

const EASE = [0.22, 1, 0.36, 1]
const WORD_MS = 28
const CLOCK_START = 9 * 3600 + 41 * 60 // 09:41:00, a fake running clock for the rail only

function formatClock(totalSeconds) {
  const s = totalSeconds % 86400
  const h = String(Math.floor(s / 3600)).padStart(2, '0')
  const m2 = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const sec = String(Math.floor(s % 60)).padStart(2, '0')
  return `${h}:${m2}:${sec}`
}

/* Reply text into paragraphs / "- " bullet lists, the only markdown-ish
   shape the recorded replies use. */
function formatReply(text) {
  const blocks = []
  let bullets = null
  for (const line of text.split('\n')) {
    if (line.startsWith('- ')) {
      bullets = bullets || []
      bullets.push(line.slice(2))
    } else {
      if (bullets) {
        blocks.push({ type: 'list', items: bullets })
        bullets = null
      }
      if (line.trim() !== '') blocks.push({ type: 'p', text: line })
    }
  }
  if (bullets) blocks.push({ type: 'list', items: bullets })
  return blocks
}

/* Renders up to `wordCount` words of the reply, so mid-stream text keeps
   the same paragraph/bullet shape as the finished reply. */
function StreamedReply({ text, wordCount }) {
  const blocks = useMemo(() => formatReply(text), [text])
  let remaining = wordCount
  const out = []
  for (const [bi, block] of blocks.entries()) {
    if (remaining <= 0) break
    if (block.type === 'p') {
      const words = block.text.split(' ')
      const shown = words.slice(0, remaining).join(' ')
      remaining -= words.length
      out.push(<p key={bi}>{shown}</p>)
    } else {
      const items = []
      for (const item of block.items) {
        if (remaining <= 0) break
        const words = item.split(' ')
        const shown = words.slice(0, remaining).join(' ')
        remaining -= words.length
        items.push(shown)
      }
      out.push(
        <ul key={bi}>
          {items.map((it, ii) => (
            <li key={ii}>{it}</li>
          ))}
        </ul>
      )
    }
  }
  return <>{out}</>
}

function FullReply({ text }) {
  const blocks = formatReply(text)
  return (
    <>
      {blocks.map((block, i) =>
        block.type === 'p' ? (
          <p key={i}>{block.text}</p>
        ) : (
          <ul key={i}>
            {block.items.map((it, ii) => (
              <li key={ii}>{it}</li>
            ))}
          </ul>
        )
      )}
    </>
  )
}

function wordCountOf(text) {
  return text.split('\n').filter((l) => l.trim() !== '').reduce((n, l) => n + l.replace(/^- /, '').split(' ').length, 0)
}

/* --------------------------------------------------------------
   "Ask the front desk": a replay, word by word, of real recorded
   replies from the Appointment Desk demo (n8n/demos/appointment-desk),
   with a "What it did" rail that lights up as each reply's tool calls
   are replayed. No network calls, nothing generated live, see
   ai/script.js for the source of every line.
   -------------------------------------------------------------- */
export default function AiShowcase() {
  const reduce = useReducedMotion()
  const chatRef = useRef(null)
  const timers = useRef([])
  const liveRegionRef = useRef(null)

  const [messages, setMessages] = useState([{ role: 'clinic', id: 'greet', text: OPENING_LINE }])
  const [typing, setTyping] = useState(false)
  const [streamId, setStreamId] = useState(null)
  const [streamWords, setStreamWords] = useState(0)
  const [played, setPlayed] = useState({})
  const clockRef = useRef(CLOCK_START) // fake running clock for the rail's log lines only
  const [toolState, setToolState] = useState(() =>
    Object.fromEntries(TOOL_CARDS.map((t) => [t.key, { status: 'idle', logs: [] }]))
  )
  const [wire, setWire] = useState(null) // { key, token }
  const [announce, setAnnounce] = useState('')
  const seqRef = useRef(0) // monotonic counter: unique ids and a little timing jitter, no Date.now/Math.random in render scope
  const nextSeq = () => {
    seqRef.current += 1
    return seqRef.current
  }

  const streaming = streamId !== null || typing

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t))
    timers.current = []
  }
  const after = (ms, fn) => {
    const t = setTimeout(fn, ms)
    timers.current.push(t)
    return t
  }

  useEffect(() => () => clearTimers(), [])

  // Auto-scroll the chat area only (never the page) on new content.
  useEffect(() => {
    const el = chatRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, streamWords, typing])

  function fireTool(call, delay) {
    after(delay, () => {
      // 1-4s of fake elapsed time per action; the low bits of the sequence
      // counter give a bit of variety without calling Math.random.
      clockRef.current += 1 + (nextSeq() % 4)
      const ts = formatClock(clockRef.current)
      setToolState((prev) => {
        const card = prev[call.key]
        const logs = [{ line: call.line, ts }, ...card.logs].slice(0, 3)
        return { ...prev, [call.key]: { status: 'lit', logs } }
      })
      if (!reduce) setWire({ key: call.key, token: nextSeq() })
      after(2500, () => {
        setToolState((prev) => ({ ...prev, [call.key]: { ...prev[call.key], status: 'done' } }))
      })
      if (!reduce) after(700, () => setWire(null))
    })
  }

  function playExchange(exchange) {
    if (streaming) return
    const visitorMsg = { role: 'visitor', id: `${exchange.id}-in-${nextSeq()}`, text: exchange.input }
    setMessages((prev) => [...prev, visitorMsg])
    setTyping(true)

    // 700-1100ms typing pause (300ms under reduced motion, no stream after).
    const typingMs = reduce ? 300 : 700 + (nextSeq() % 5) * 80
    after(typingMs, () => {
      setTyping(false)
      const replyId = `${exchange.id}-out-${nextSeq()}`
      const total = wordCountOf(exchange.reply)

      if (exchange.safetyScreen) {
        setMessages((prev) => [...prev, { role: 'tag', id: `${replyId}-tag`, text: 'Safety screen · fixed reply, AI not used' }])
      }

      if (reduce) {
        setMessages((prev) => [...prev, { role: 'clinic', id: replyId, text: exchange.reply, done: true }])
        exchange.tools.forEach((call) => fireTool(call, 0))
        setPlayed((p) => ({ ...p, [exchange.id]: true }))
        setAnnounce(exchange.reply)
        return
      }

      setMessages((prev) => [...prev, { role: 'clinic', id: replyId, text: exchange.reply, done: false }])
      setStreamId(replyId)
      setStreamWords(0)

      // Tools fire while the reply streams, staggered if there is more than one.
      exchange.tools.forEach((call, i) => fireTool(call, 260 + i * 550))

      let word = 0
      const tick = () => {
        word += 1
        setStreamWords(word)
        if (word < total) {
          after(WORD_MS, tick)
        } else {
          setMessages((prev) => prev.map((m2) => (m2.id === replyId ? { ...m2, done: true } : m2)))
          setStreamId(null)
          setPlayed((p) => ({ ...p, [exchange.id]: true }))
          setAnnounce(exchange.reply)
        }
      }
      after(WORD_MS, tick)
    })
  }

  function startOver() {
    clearTimers()
    setMessages([{ role: 'clinic', id: 'greet', text: OPENING_LINE }])
    setTyping(false)
    setStreamId(null)
    setStreamWords(0)
    setPlayed({})
    clockRef.current = CLOCK_START
    setToolState(Object.fromEntries(TOOL_CARDS.map((t) => [t.key, { status: 'idle', logs: [] }])))
    setWire(null)
    setAnnounce('')
  }

  const visibleExchanges = EXCHANGES.filter((e) => !e.requires || played[e.requires])
  const wireCardIndex = wire ? TOOL_CARDS.findIndex((t) => t.key === wire.key) : -1
  const wireY = wireCardIndex >= 0 ? 12 + wireCardIndex * 26 : 0

  return (
    <section className="stage ai-desk" aria-labelledby="ai-desk-title" style={{ '--glow-x': '40%', '--glow-y': '55%' }}>
      <div className="stage-glow" aria-hidden="true" />
      <div className="container ai-desk-in">
        <div className="ai-desk-head">
          <div className="stage-pill stage-mono">
            <span className="stage-dot" aria-hidden="true" />
            Appointment Desk &middot; try it
          </div>
          <h2 className="stage-title" id="ai-desk-title">
            An AI front desk that actually <span className="stage-serif">does things.</span>
          </h2>
          <p className="stage-lede">
            It answers fees and hours, finds a free slot and books it, and passes anything medical to a person. Tap a
            question to see it work.
          </p>
        </div>

        <div className="ai-console stage-glass">
          <div className="ai-console-bar">
            <span className="ai-console-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="ai-console-title stage-mono">Demo Physio Clinic &middot; front desk</span>
            <span className="ai-console-status stage-mono">
              <span className={`ai-status-dot${reduce ? ' is-static' : ''}`} aria-hidden="true" />
              replaying recorded runs
            </span>
          </div>

          <div className="ai-console-grid">
            <div className="ai-chat-col">
              <div className="ai-chat" ref={chatRef} role="log" aria-live="polite">
                {messages.map((msg) => {
                  if (msg.role === 'tag') {
                    return (
                      <div className="ai-safety-tag stage-mono" key={msg.id}>
                        {msg.text}
                      </div>
                    )
                  }
                  const isClinic = msg.role === 'clinic'
                  const isStreaming = msg.id === streamId
                  return (
                    <div className={`ai-bubble ${isClinic ? 'is-clinic' : 'is-visitor'}`} key={msg.id}>
                      {isStreaming ? (
                        <span aria-hidden="true">
                          <StreamedReply text={msg.text} wordCount={streamWords} />
                        </span>
                      ) : isClinic ? (
                        <FullReply text={msg.text} />
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  )
                })}
                {typing && (
                  <div className="ai-bubble is-clinic ai-typing" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                {/* Streaming text above is aria-hidden; this is what the live
                    region actually announces, once a reply finishes. */}
                <div className="sr-only" ref={liveRegionRef}>
                  {announce}
                </div>
              </div>

              <div className="ai-chips">
                {visibleExchanges.map((exchange) => (
                  <button
                    key={exchange.id}
                    type="button"
                    className={`ai-chip${played[exchange.id] ? ' is-played' : ''}`}
                    onClick={() => playExchange(exchange)}
                    disabled={streaming}
                  >
                    {played[exchange.id] && (
                      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" className="ai-chip-check">
                        <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {exchange.chip}
                  </button>
                ))}
                <button type="button" className="ai-start-over" onClick={startOver} disabled={streaming}>
                  Start over
                </button>
              </div>
            </div>

            <div className="ai-rail-col">
              {!reduce && (
                <svg className="ai-wire" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <AnimatePresence>
                    {wire && (
                      <m.path
                        key={wire.token}
                        d={`M 0 46 Q 46 ${wireY} 100 ${wireY}`}
                        pathLength="1"
                        initial={{ strokeDashoffset: 1, opacity: 0.9 }}
                        animate={{ strokeDashoffset: 0, opacity: [0.9, 0.9, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: EASE }}
                      />
                    )}
                  </AnimatePresence>
                </svg>
              )}
              <div className="ai-rail" aria-label="What it did">
                {TOOL_CARDS.map((card) => {
                  const state = toolState[card.key]
                  return (
                    <div className={`ai-tool ai-tool-${state.status}`} key={card.key}>
                      <div className="ai-tool-head">
                        <ToolIcon name={card.key} className="ai-tool-icon" />
                        <span className="ai-tool-name">{card.name}</span>
                        {state.status === 'done' && (
                          <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" className="ai-tool-tick">
                            <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div className="ai-tool-log stage-mono">
                        {state.logs.length === 0 ? (
                          <span className="ai-tool-waiting">waiting</span>
                        ) : (
                          state.logs.map((log, i) => (
                            <div className="ai-tool-line" key={i}>
                              <span className="ai-tool-ts">{log.ts}</span> {log.line}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="stage-note stage-mono ai-note">
          <span className="stage-dot" aria-hidden="true" />A replay of real recorded test runs on dummy data for a
          made-up clinic. The replies are the AI's own words from those runs. Not live, not real patients.
        </div>
        <p className="ai-cta-line">
          Want this answering your customers, on your calendar and sheets?{' '}
          <Link to="/contact?service=ai#write">Let&apos;s talk</Link>
        </p>
      </div>
    </section>
  )
}
