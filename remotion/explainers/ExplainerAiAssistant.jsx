import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, useStageFonts, Ground, Tag, Beat, Captions, World, camAt, Glass, Bar, Chip, Wire, wirePath, Pointer, Bubble, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, arrive, move, fadeIn, lerp, cl } from './stageLook.jsx'
import { Soundtrack, cue } from '../sound.jsx'

/*
  AI Assistant Build, 30 s, in the Stage look. The story is unchanged: a
  client asks "Do you have evening slots this week?"; the assistant reads
  the business's own documents, drafts a reply, a person approves it with
  one tap, and it is sent. Every document and message is illustrative.

    stakes    "The same questions. Every single day."
    question  a question comes in; it reads your documents; it drafts
    headfake  "But it never sends alone."
    rehook    you approve with one tap; sent, your say-so; end card
*/

export const AI_LEN = 900

const T = {
  hookEnd: 86,
  scene: 90,
  ask: 112,
  read: 176,
  fan: 184,
  scan: 214,
  draft: 296,
  type: [318, 372],
  fake: 402,
  fakeEnd: 446,
  approve: 452,
  tap: 500,
  send: 538,
  end: 700,
}

const CAPS = [
  { at: 100, text: 'A question comes in.' },
  { at: T.read, text: 'It reads your own {documents.}' },
  { at: T.draft, text: 'It drafts the {answer.}', exit: T.fake - 10 },
  { at: T.approve + 4, text: 'You approve with one {tap.}' },
  { at: T.send + 10, text: 'Sent. Your words, your {say-so.}', exit: T.end - 12 },
]

const CHAT = { x: 150, y: 250, w: 520, h: 600 }
const BOT = { x: 990, y: 430, w: 530, h: 128 }
const DOCS = [
  { title: 'Booking SOP', icon: 'doc', line: 'Evenings: Tue, Thu, 6 to 8 pm', y: 320, z: -60, r: -16 },
  { title: 'Price list', icon: 'tag', line: 'Evening sessions: usual fee', y: 520, z: 30, r: -16 },
  { title: 'Opening hours', icon: 'clock', line: 'Open late on Tue and Thu', y: 720, z: -60, r: -16 },
]
const DOC = { x: 1560, w: 450, h: 168 }
const DRAFT = { x: 1010, y: 640, w: 660 }
const REPLY = 'Yes! We have evening slots on Tuesday and Thursday from 6 pm. Shall I hold one for you?'
const ASKS = ['Do you have evening slots?', 'What are your fees?', 'Are you open on Thursday?', 'Can I book for Tuesday?', 'Is there parking?', 'Do you have evening slots?']

const CAM = [
  { x: 960, y: 600, s: 0.86, rx: 16, ry: 0 },
  { at: T.scene, dur: 22, x: 960, y: 560, s: 0.94, rx: 0 },
  { at: T.ask - 8, dur: 16, x: 760, y: 560, s: 1.06 },
  { at: T.read - 4, dur: 18, x: 1060, y: 560, s: 0.98, ry: -3 },
  { at: T.draft - 6, dur: 16, x: 1010, y: 555, s: 1.04, ry: 0 },
  { at: T.approve, dur: 18, x: 1100, y: 700, s: 1.3 },
  { at: T.send - 4, dur: 18, x: 1000, y: 570, s: 0.98 },
]

/* The sound (remotion/sound.jsx), from the beats above: the questions
   piling up behind the hook line, every camera move, the question and the
   documents landing, the headfake, the approving tap, the send and the
   end card. */
const CUES = [
  ...ASKS.map((_, i) => cue('tick', 4 + i * 7 + 1, 0.35)),
  cue('thump', 8 + 1),
  ...CAM.slice(1).map((k) => cue('whoosh', k.at, k.at === T.scene ? 1 : k.at === T.approve ? 0.8 : 0.55)),
  cue('tick', T.ask + 1),
  ...DOCS.map((_, i) => cue('tick', T.fan + i * 5 + 1, 0.55)),
  cue('whooshDown', T.fake - 4, 0.8),
  cue('thump', T.fake + 1),
  cue('click', T.tap),
  cue('tick', T.send + 22 + 1), // the "Sent" chip
  cue('thump', T.end + END_HEADING_AT + 1, 0.7),
  cue('end', T.end + END_BUTTON_AT),
]

export function ExplainerAiAssistant() {
  useStageFonts()
  const f = useCurrentFrame()
  const cam = camAt(f, CAM)
  const fake = cl(fadeIn(f, T.fake - 4, 8) - fadeIn(f, T.fakeEnd, 8))
  const sceneOn = f >= T.scene && f < T.end + 8
  const toEnd = fadeIn(f, T.end, 10)
  // the light follows whatever the story is about
  const glow =
    f < T.scene ? { x: 960, y: 560 } : f < T.read ? { x: 560, y: 540 } : f < T.draft ? { x: 1260, y: 520 } : f < T.send ? { x: 1060, y: 700 } : f < T.end ? { x: 620, y: 560 } : { x: 960, y: 500 }
  const gT = move(f, [T.scene, T.read, T.draft, T.send, T.end].filter((a) => a <= f).pop() ?? 0, 40)
  const g = { x: lerp(960, glow.x, f < T.scene ? 1 : gT), y: lerp(540, glow.y, f < T.scene ? 1 : gT) }
  return (
    <Ground f={f} glow={g}>
      {f < T.scene + 4 && <Hook f={f} />}
      {sceneOn && (
        <AbsoluteFill style={{ opacity: 1 - toEnd, filter: fake > 0.01 ? `blur(${(fake * 14).toFixed(2)}px)` : undefined }}>
          <World cam={cam}>
            <Scene f={f} dof={cl(move(f, T.approve, 18) - move(f, T.send - 4, 18))} />
          </World>
          <AbsoluteFill style={{ opacity: 1 - fake }}>
            <Captions f={f} items={CAPS} top={96} size={70} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {fake > 0.01 && <AbsoluteFill style={{ background: `rgba(11,11,12,${(0.55 * fake).toFixed(3)})` }} />}
      <Beat f={f} text={'But it never\nsends {alone.}'} start={T.fake} end={T.fakeEnd} size={150} />
      {f >= T.end && <EndCard f={f - T.end} />}
      <Tag />
      <Soundtrack cues={CUES} />
    </Ground>
  )
}

/* Stakes: the same questions arriving again and again, behind the line. */
function Hook({ f }) {
  const spots = [
    { x: 250, y: 230, z: 0.5 },
    { x: 1350, y: 190, z: 0.8 },
    { x: 170, y: 760, z: 0.9 },
    { x: 1420, y: 800, z: 0.4 },
    { x: 760, y: 900, z: 1 },
    { x: 860, y: 120, z: 1 },
  ]
  const out = move(f, T.hookEnd - 6, 10)
  return (
    <AbsoluteFill>
      {ASKS.map((q, i) => {
        const s = spots[i]
        const a = arrive(f, 4 + i * 7, 110)
        const drift = (f + i * 30) * 0.25
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y - drift,
              opacity: cl(a * 1.4) * (0.75 - s.z * 0.35) * (1 - out),
              transform: `scale(${(0.82 + (1 - s.z) * 0.2 + (1 - a) * -0.1).toFixed(3)})`,
              filter: `blur(${(s.z * 5 + (1 - a) * 8).toFixed(2)}px)`,
            }}
          >
            <Bubble text={q} width={420} size={28} time={`8:1${i} pm`} />
          </div>
        )
      })}
      <Beat f={f} text={'The same questions.\nEvery single {day.}'} start={8} end={T.hookEnd - 6} size={140} />
    </AbsoluteFill>
  )
}

function Scene({ f, dof }) {
  // depth of field: everything but the draft softens for the close-up
  const back = dof > 0.01 ? { filter: `blur(${(dof * 6).toFixed(2)}px)`, opacity: 1 - dof * 0.35 } : null
  const chatIn = arrive(f, T.scene, 110)
  const botIn = arrive(f, T.ask + 20, 140)
  const reading = f >= T.read + 16 && f < T.draft + 14
  const botLit = cl(fadeIn(f, T.read + 10, 10) - fadeIn(f, T.send + 6, 12) * 0.7)
  const botSub = f < T.read + 16 ? 'Waiting' : f < T.draft + 14 ? 'Reading your documents' : f < T.tap ? 'Draft ready' : 'Approved'
  const sendT = move(f, T.send, 16)

  const chatPort = { x: CHAT.x + CHAT.w, y: 380 }
  const botL = { x: BOT.x - BOT.w / 2, y: BOT.y }
  const botR = { x: BOT.x + BOT.w / 2, y: BOT.y }
  const botB = { x: BOT.x, y: BOT.y + BOT.h / 2 }
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', ...back }}>
      {/* wires sit under the panels */}
      <Wire uid="ai-in" d={wirePath(chatPort, botL)} draw={move(f, T.ask + 16, 16)} pulse={(f - T.read + 4) / 18} />
      {DOCS.map((d, i) => (
        <Wire key={i} uid={`ai-d${i}`} d={wirePath(botR, { x: DOC.x - DOC.w / 2 + 10, y: d.y })} draw={move(f, T.fan + 8 + i * 4, 16)} pulse={(f - T.scan - i * 8) / 18} />
      ))}
      <div style={{ opacity: 1 - sendT }}>
        <Wire uid="ai-dr" d={wirePath(botB, { x: DRAFT.x, y: DRAFT.y - 6 }, 'v')} draw={move(f, T.draft, 12)} pulse={(f - T.draft - 2) / 16} />
      </div>

      {/* the client's chat */}
      <Glass rim="right" style={{ left: CHAT.x, top: CHAT.y, width: CHAT.w, height: CHAT.h, opacity: cl(chatIn * 1.5), transform: `translateY(${((1 - chatIn) * 80).toFixed(2)}px)`, overflow: 'hidden' }}>
        <Bar title="New client" label="WhatsApp" icon="user" />
        <div style={{ position: 'absolute', left: 30, top: 104, opacity: cl(arrive(f, T.ask) * 1.5), transform: `translateY(${((1 - arrive(f, T.ask)) * 30).toFixed(2)}px)` }}>
          <Bubble text="Do you have evening slots this week?" time="8:15 pm" width={380} />
        </div>
        <div style={{ position: 'absolute', right: 30, top: 300, opacity: cl(arrive(f, T.send + 8) * 1.5), transform: `translateY(${((1 - arrive(f, T.send + 8)) * 50).toFixed(2)}px)` }}>
          <Bubble side="out" text={REPLY} time="8:16 pm" tag="Approved" width={420} />
        </div>
      </Glass>

      {/* the assistant */}
      <Glass rim="top" lit={botLit} style={{ left: BOT.x - BOT.w / 2, top: BOT.y - BOT.h / 2, width: BOT.w, height: BOT.h, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', opacity: cl(botIn * 1.5), transform: `scale(${(0.9 + 0.1 * botIn).toFixed(4)})` }}>
        <div style={{ width: 68, height: 68, borderRadius: 16, display: 'grid', placeItems: 'center', background: botLit > 0.5 ? S.saffron : 'rgba(245,135,30,0.14)', color: botLit > 0.5 ? S.onSaffron : S.peach, flex: 'none' }}>
          <Icon name="spark" size={36} stroke={2} />
        </div>
        <div>
          <div style={{ fontSize: 34, letterSpacing: '-0.025em' }}>AI assistant</div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
            {reading && <Dots f={f} />}
            <Mono size={21} color={botLit > 0.5 ? S.peach : S.muted} style={{ whiteSpace: 'nowrap' }}>{botSub}</Mono>
          </div>
        </div>
      </Glass>

      {/* the business's own documents, fanned out in depth */}
      {DOCS.map((d, i) => (
        <DocCard key={d.title} d={d} i={i} f={f} />
      ))}

      </div>
      <DraftCard f={f} sendT={sendT} />
      <ApproveHand f={f} />

      <Chip label="Sent" sub="8:16 pm" style={{ left: CHAT.x + CHAT.w - 150, top: CHAT.y + CHAT.h + 26, opacity: cl(arrive(f, T.send + 22) * 1.5), transform: `translateY(${((1 - arrive(f, T.send + 22)) * 20).toFixed(2)}px)` }} lit={1} />
    </>
  )
}

function Dots({ f }) {
  return (
    <span style={{ display: 'inline-flex', gap: 5 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: S.saffron, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - i * 4) * 0.3)) }} />
      ))}
    </span>
  )
}

function DocCard({ d, i, f }) {
  const a = arrive(f, T.fan + i * 5, 120)
  const scan = move(f, T.scan + i * 8 + 6, 16)
  const read = scan > 0.95
  const x = lerp(BOT.x + 120, DOC.x, a)
  const y = lerp(BOT.y, d.y, a)
  return (
    <Glass
      rim={i === 1 ? 'left' : null}
      lit={read ? 0.6 : 0}
      style={{
        left: x - DOC.w / 2,
        top: y - DOC.h / 2,
        width: DOC.w,
        height: DOC.h,
        padding: '22px 26px',
        opacity: cl(a * 1.6) * (d.z < 0 ? 0.88 : 1),
        transform: `translateZ(${(d.z * a).toFixed(1)}px) rotateY(${(d.r * a).toFixed(2)}deg) scale(${(0.6 + 0.4 * a).toFixed(4)})`,
        filter: d.z < 0 ? 'blur(0.8px)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Icon name={d.icon} size={28} color={S.peach} />
        <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{d.title}</span>
        {read && <Icon name="check" size={26} color={S.saffron} stroke={2.6} style={{ marginLeft: 'auto' }} />}
      </div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative', padding: '4px 10px', margin: '0 -10px', borderRadius: 8, fontSize: 25, letterSpacing: '-0.01em', whiteSpace: 'nowrap', color: S.inkSoft }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${scan * 100}%`, borderRadius: 8, background: 'rgba(245,135,30,0.2)', borderRight: scan > 0.02 && scan < 0.98 ? `2px solid ${S.saffron}` : 'none' }} />
          <span style={{ position: 'relative', color: read ? S.ink : S.inkSoft }}>{d.line}</span>
        </div>
        <div style={{ height: 9, borderRadius: 9, background: 'rgba(255,255,255,0.08)', width: '72%' }} />
      </div>
    </Glass>
  )
}

function DraftCard({ f, sendT }) {
  const a = arrive(f, T.draft + 6, 130)
  if (a < 0.001) return null
  const n = Math.round(cl((f - T.type[0]) / (T.type[1] - T.type[0])) * REPLY.length)
  const approved = f >= T.tap
  const press = cl(1 - Math.abs(f - T.tap) / 5)
  // on send it flies into the chat, shrinking as it goes
  const fx = lerp(0, CHAT.x + CHAT.w / 2 - DRAFT.x, sendT)
  const fy = lerp(0, -40, sendT)
  return (
    <Glass
      rim="left"
      lit={approved ? 1 - sendT : 0}
      style={{
        left: DRAFT.x - DRAFT.w / 2,
        top: DRAFT.y,
        width: DRAFT.w,
        padding: '24px 30px 26px',
        opacity: cl(a * 1.5) * (1 - cl(sendT * 1.4)),
        transform: `translate(${fx.toFixed(2)}px, ${((1 - a) * 40 + fy).toFixed(2)}px) scale(${(1 - sendT * 0.45).toFixed(4)})`,
        filter: sendT > 0.01 ? `blur(${(sendT * 8).toFixed(2)}px)` : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
        <Icon name="spark" size={26} color={S.saffron} />
        <span style={{ fontSize: 26, color: S.peach }}>Draft reply</span>
        <span style={{ marginLeft: 'auto', opacity: fadeIn(f, T.type[1] + 2) }}>
          <Mono size={19}>From: Booking SOP, Opening hours</Mono>
        </span>
      </div>
      <div style={{ marginTop: 16, fontSize: 30, lineHeight: 1.32, letterSpacing: '-0.02em', minHeight: 120, color: S.ink }}>
        {REPLY.slice(0, n)}
        {n < REPLY.length && <span style={{ display: 'inline-block', width: 2.5, height: 30, background: S.saffron, marginLeft: 3, verticalAlign: '-4px' }} />}
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 14, opacity: fadeIn(f, T.type[1] + 6, 12) }}>
        <span style={{ fontSize: 26, padding: '12px 24px', borderRadius: 999, border: `1px solid ${S.line}`, color: S.muted }}>Edit</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 26,
            fontWeight: 600,
            padding: '12px 26px',
            borderRadius: 999,
            background: approved ? 'rgba(245,135,30,0.16)' : S.saffron,
            color: approved ? S.peach : S.onSaffron,
            border: `1px solid ${approved ? 'rgba(245,135,30,0.5)' : S.saffron}`,
            boxShadow: approved ? 'none' : '0 10px 30px rgba(245,135,30,0.35)',
            transform: `scale(${(1 - press * 0.06).toFixed(4)})`,
          }}
        >
          {approved && <Icon name="check" size={24} stroke={2.6} />}
          {approved ? 'Approved' : 'Approve'}
        </span>
      </div>
    </Glass>
  )
}

/* The approving hand: glides in to Approve and taps once. */
function ApproveHand({ f }) {
  const o = fadeIn(f, T.approve + 6, 8) * (1 - fadeIn(f, T.send, 8))
  if (o <= 0) return null
  const m = move(f, T.approve + 6, T.tap - 4 - T.approve - 6)
  const to = { x: DRAFT.x + DRAFT.w / 2 - 100, y: DRAFT.y + 232 }
  const from = { x: to.x + 200, y: to.y + 170 }
  const x = lerp(from.x, to.x, m)
  const y = lerp(from.y, to.y, m) - Math.sin(m * Math.PI) * 24
  const press = cl(1 - Math.abs(f - T.tap) / 5)
  return <Pointer x={x} y={y} press={press} ring={(f - T.tap) / 20} opacity={o} />
}

