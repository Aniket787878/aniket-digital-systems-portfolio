import { AbsoluteFill, interpolate } from 'remotion'
import { C, SANS, Cursor, Ripple, rise, pop, tween, clamp, lerp, easeInOut } from '../shared.jsx'
import { FlowNode, Wire, wireGeometry, port } from '../FlowGraph.jsx'
import { Icon } from '../icons.jsx'
import { Shell, StepHeadline } from './Shell.jsx'
import { ChatBubble, cardShadow } from './illustrative.jsx'

/*
  AI Assistant Build, ~30s. A client asks "Do you have evening slots this
  week?"; the assistant reads the business's own documents (the SOP and
  price-list cards fan out), drafts a reply, a person approves it with one
  tap, and it is sent. Every document and message is illustrative.
*/

const PAPER_AT = 104
const PAPER_END = 600
export const AI_LEN = PAPER_AT + PAPER_END + 196

const T = { ask: 36, read: 110, fan: 128, scan: 172, draft: 240, type: [262, 318], approve: 340, tap: 378, send: 414 }

const LINES = [
  { at: 24, text: 'A question comes in.' },
  { at: T.read, text: 'It reads {your own documents.}' },
  { at: T.draft, text: 'It drafts {an answer.}' },
  { at: T.approve, text: 'You approve it {with one tap.}' },
  { at: T.send, text: 'Sent. {Your words, your say-so.}', exit: PAPER_END - 10 },
]

const PANEL = { x: 110, y: 236, w: 560, h: 640 }
const BOT = { id: 'bot', x: 1010, y: 452, w: 470, h: 140, label: 'AI assistant', icon: 'spark', sub: 'Waiting', subLit: 'Reading your documents', labelSize: 32 }
const DOCS = [
  { title: 'Booking SOP', icon: 'doc', line: 'Evenings: Tue, Thu, 6 to 8 pm', x: 1560, y: 318, r: -4 },
  { title: 'Price list', icon: 'tag', line: 'Evening sessions: usual fee', x: 1590, y: 520, r: 0 },
  { title: 'Opening hours', icon: 'clock', line: 'Open late on Tue and Thu', x: 1560, y: 722, r: 4 },
]
const DOC = { w: 440, h: 176 }
const DRAFT = { x: 1000, y: 790, w: 660 }
const REPLY = 'Yes! We have evening slots on Tuesday and Thursday from 6 pm. Shall I hold one for you?'

export function ExplainerAiAssistant() {
  return (
    <Shell hook={'The same questions.\n{Every single day.}'} hookIcon="chat" paperAt={PAPER_AT} paperEnd={PAPER_END} offerKey="assistant">
      {(f) => <Paper f={f} />}
    </Shell>
  )
}

function Paper({ f }) {
  const botIn = 20
  const bot = { ...BOT, appear: botIn, lit: T.read + 22 }
  if (f > T.draft) bot.subLit = 'Draft ready'
  const chatPort = { x: PANEL.x + PANEL.w, y: 420, nx: 1, ny: 0 }
  const wIn = wireGeometry(chatPort, port(bot, 'l'))
  const docWires = DOCS.map((d) => wireGeometry({ x: d.x - DOC.w / 2, y: d.y, nx: -1, ny: 0 }, port(bot, 'r')))
  const wDraft = wireGeometry(port(bot, 'b'), { x: DRAFT.x, y: DRAFT.y - 150, nx: 0, ny: -1 })
  const sendT = rise(f, T.send, { stiffness: 70 })

  return (
    <AbsoluteFill>
      <StepHeadline f={f} items={LINES} size={76} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="glow-ai" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <Wire geo={wIn} frame={f} show={T.ask + 10} run={T.read} dur={22} idle uid="ai" />
        {docWires.map((g, i) => (
          <Wire key={i} geo={g} frame={f} show={T.fan + 20 + i * 4} run={T.scan + 10 + i * 6} dur={22} idle uid="ai" />
        ))}
        {/* the wire to the draft leaves with it once the reply is sent */}
        <g opacity={1 - sendT}>
          <Wire geo={wDraft} frame={f} show={T.draft - 16} run={T.draft - 4} dur={18} idle={false} uid="ai" />
        </g>
      </svg>

      <ChatPanel f={f} sendT={sendT} />
      <FlowNode n={bot} frame={f} />
      {DOCS.map((d, i) => (
        <DocCard key={d.title} d={d} i={i} f={f} />
      ))}
      <DraftCard f={f} sendT={sendT} />
      <Pointer f={f} />
    </AbsoluteFill>
  )
}

function ChatPanel({ f, sendT }) {
  const a = rise(f, 12)
  const ask = pop(f, T.ask)
  return (
    <div
      style={{
        position: 'absolute',
        left: PANEL.x,
        top: PANEL.y,
        width: PANEL.w,
        height: PANEL.h,
        boxSizing: 'border-box',
        borderRadius: 28,
        background: C.card,
        border: `1.5px solid ${C.cardLine}`,
        boxShadow: cardShadow,
        fontFamily: SANS,
        color: C.inkDark,
        opacity: a,
        transform: `translateY(${(1 - a) * 30}px)`,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 26px', borderBottom: `1.5px solid ${C.cardLine}` }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.paper2, display: 'grid', placeItems: 'center', color: C.mutedDark }}>
          <Icon name="user" size={28} />
        </div>
        <div style={{ fontSize: 30, letterSpacing: '-0.02em' }}>New client</div>
        <div style={{ marginLeft: 'auto', fontSize: 26, color: C.mutedDark }}>WhatsApp</div>
      </div>
      <div style={{ position: 'absolute', left: 24, right: 24, top: 120, bottom: 24, background: '#faf8f5', borderRadius: 20 }} />
      <div style={{ position: 'absolute', left: 44, top: 150, opacity: Math.min(1, ask * 1.4), transform: `translateY(${(1 - ask) * 24}px) scale(${0.94 + 0.06 * ask})`, transformOrigin: '0 100%' }}>
        <ChatBubble text="Do you have evening slots this week?" time="8:15 pm" width={400} />
      </div>
      <div style={{ position: 'absolute', right: 44, top: 330, opacity: Math.min(1, sendT * 1.4), transform: `translateY(${(1 - sendT) * 60}px)` }}>
        <ChatBubble side="out" text={REPLY} time="8:16 pm" width={430} tag="Approved" />
      </div>
    </div>
  )
}

function DocCard({ d, i, f }) {
  const a = rise(f, T.fan + i * 6, { stiffness: 70 })
  const scan = tween(f, T.scan + i * 6, T.scan + 22 + i * 6, easeInOut)
  const x = lerp(BOT.x + 80, d.x, a)
  const y = lerp(BOT.y, d.y, a)
  return (
    <div
      style={{
        position: 'absolute',
        left: x - DOC.w / 2,
        top: y - DOC.h / 2,
        width: DOC.w,
        height: DOC.h,
        boxSizing: 'border-box',
        padding: '20px 22px',
        borderRadius: 20,
        background: C.card,
        border: `1.5px solid ${scan > 0.9 ? 'rgba(245,135,30,0.6)' : C.cardLine}`,
        boxShadow: cardShadow,
        fontFamily: SANS,
        color: C.inkDark,
        opacity: Math.min(1, a * 1.6),
        transform: `rotate(${lerp(0, d.r, a).toFixed(3)}deg) scale(${(0.6 + 0.4 * a).toFixed(4)})`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name={d.icon} size={28} color={C.accentDeep} />
        <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{d.title}</span>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 11, borderRadius: 11, background: '#ebe5dd', width: '88%' }} />
        <div style={{ position: 'relative', padding: '4px 8px', margin: '0 -8px', borderRadius: 8, fontSize: 26, letterSpacing: '-0.015em', whiteSpace: 'nowrap', color: C.inkDark }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${scan * 100}%`, borderRadius: 8, background: 'rgba(245,135,30,0.22)' }} />
          <span style={{ position: 'relative' }}>{d.line}</span>
        </div>
        <div style={{ height: 11, borderRadius: 11, background: '#ebe5dd', width: '64%' }} />
      </div>
    </div>
  )
}

function DraftCard({ f, sendT }) {
  const a = rise(f, T.draft + 8, { stiffness: 80 })
  const n = Math.round(tween(f, T.type[0], T.type[1], (t) => t) * REPLY.length)
  const approved = f >= T.tap
  const press = interpolate(f, [T.tap - 3, T.tap, T.tap + 6], [0, 1, 0], clamp)
  const gone = sendT
  if (a < 0.001) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: DRAFT.x - DRAFT.w / 2,
        top: DRAFT.y - 150,
        width: DRAFT.w,
        boxSizing: 'border-box',
        padding: '24px 28px',
        borderRadius: 24,
        background: C.card,
        border: `1.5px dashed ${approved ? C.accent : '#d9cfc3'}`,
        boxShadow: cardShadow,
        fontFamily: SANS,
        color: C.inkDark,
        opacity: Math.min(1, a * 1.5) * (1 - gone),
        transform: `translate(${(-gone * 380).toFixed(2)}px, ${((1 - a) * 30 - gone * 120).toFixed(2)}px) scale(${1 - gone * 0.2})`,
        filter: gone > 0.01 ? `blur(${(gone * 8).toFixed(2)}px)` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, color: C.accentDeep, whiteSpace: 'nowrap' }}>
        <Icon name="spark" size={26} />
        Draft reply
        <span style={{ marginLeft: 'auto', color: C.mutedDark, opacity: rise(f, T.type[1] + 2) }}>From: Booking SOP, Opening hours</span>
      </div>
      <div style={{ marginTop: 14, fontSize: 30, lineHeight: 1.3, letterSpacing: '-0.02em', minHeight: 117 }}>
        {REPLY.slice(0, n)}
        {n < REPLY.length && <span style={{ display: 'inline-block', width: 2, height: 30, background: C.accent, marginLeft: 3, verticalAlign: '-4px' }} />}
      </div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, opacity: rise(f, T.approve - 6) }}>
          <span style={{ fontSize: 28, padding: '12px 22px', borderRadius: 999, border: `1.5px solid ${C.cardLine}`, color: C.mutedDark }}>Edit</span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 28,
              padding: '12px 24px',
              borderRadius: 999,
              background: approved ? C.tint : C.accent,
              color: approved ? C.accentDeep : C.onAccent,
              transform: `scale(${1 - press * 0.06})`,
            }}
          >
            {approved && <Icon name="check" size={26} stroke={2.6} />}
            {approved ? 'Approved' : 'Approve'}
          </span>
        </div>
      </div>
    </div>
  )
}

/* The approving hand: glides in to the Approve button and taps once. */
function Pointer({ f }) {
  const a = tween(f, T.approve, T.approve + 8) * (1 - tween(f, T.send, T.send + 10))
  if (a <= 0) return null
  const m = tween(f, T.approve, T.tap - 4, easeInOut)
  const to = { x: DRAFT.x + DRAFT.w / 2 - 96, y: DRAFT.y + 76 }
  const from = { x: to.x + 220, y: to.y + 190 }
  const x = lerp(from.x, to.x, m)
  const y = lerp(from.y, to.y, m) - Math.sin(m * Math.PI) * 30
  const press = interpolate(f, [T.tap - 3, T.tap, T.tap + 6], [0, 1, 0], clamp)
  const ripple = interpolate(f, [T.tap, T.tap + 20], [0, 1], clamp)
  return (
    <>
      <Ripple x={x} y={y} t={ripple} scale={1.2} />
      <Cursor x={x} y={y} press={press} size={40} opacity={a} />
    </>
  )
}
