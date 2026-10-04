import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, SANS, SERIF, MONO, cl, move, useStageFonts, Ground, Tag, Line, Glass, Bar, Chip, Wire, wirePath, Pointer, Bubble, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, arrive, fadeIn } from './stageLook.jsx'
import { Soundtrack, cue } from '../sound.jsx'
import { tween, settle, easeOut, easeInOut, lerp } from '../cinematic/motion.js'
import { SignalField, Point, Rings, Sparkle, SparkleField, Burst, Flash } from '../cinematic/Signals.jsx'

/*
  The AI assistant explainer, cinematic cut, 30 s. Same story as
  ExplainerAiAssistant: a client asks "Do you have evening slots this
  week?"; the assistant reads the business's own documents, drafts a reply,
  a person approves it with one tap, and it is sent. Every document and
  message is illustrative. The voice (voice/ai-assistant.mp3) starts a line
  at 0.2, 3.1, 13.4, 17.9 and 23.5 s; the picture keeps in step.

    hook      questions pile up as lines, "The same questions. Every single day."
    question  the lines pull into a chat window; it reads the documents; it drafts
    headfake  dark: "But it never sends alone."
    rehook    the draft, one tap; a paper moment: "Sent. Your words, your say-so."
*/

/* ---- beat sheet (frames at 30 fps) ---- */
const T = {
  hookHead: 8,
  hookOut: 78,
  pull: 56, // question lines start to pull toward the chat
  pulled: 90,
  chat: 90, // chat window arrives (3.0 s)
  askCap: 93, // "A question comes in."
  ask: 100, // the client's bubble
  askCapOut: 116,
  readCap: 126, // "It reads your own documents." (3.7 s)
  fan: 134, // documents fan out
  readCapOut: 180,
  draftCap: 184, // "It drafts the answer." (6.1 s)
  scan: 190, // scan progress over the documents
  scanEnd: 290,
  draft: 292, // the draft card arrives
  type: [312, 366],
  calm: 372, // a calm beat, the draft glows (12.4 s)
  draftCapOut: 394,
  fake: 402, // "But it never sends alone." (13.4 s)
  fakeEnd: 446,
  approve: 452, // the draft close up, "You approve with one tap."
  tap: 500,
  approveCapOut: 524,
  wipe: 516, // soft paper wipe starts from the draft
  sentHead: 540, // "Sent. Your words, your say-so." (18.0 s)
  sentBubble: 566,
  sentChip: 592,
  paperOut: 672,
  end: 700, // same as ExplainerAiAssistant: heading +4, button +34 (about 24.5 s)
}
export const AI_CINEMATIC_LEN = 900

const W = 1920
const CX = W / 2

const CHAT = { x: 150, y: 250, w: 520, h: 600 }
const BOT = { x: 990, y: 430, w: 530, h: 128 }
const DOCS = [
  { title: 'Booking SOP', icon: 'doc', line: 'Evenings: Tue, Thu, 6 to 8 pm', y: 320, z: -60, r: -16 },
  { title: 'Price list', icon: 'tag', line: 'Evening sessions: usual fee', y: 520, z: 30, r: -16 },
  { title: 'Opening hours', icon: 'clock', line: 'Open late on Tue and Thu', y: 720, z: -60, r: -16 },
]
const DOC = { x: 1560, w: 450, h: 168 }
const DRAFT = { x: 1000, y: 640, w: 640 }
const REPLY = 'Yes! We have evening slots on Tuesday and Thursday from 6 pm. Shall I hold one for you?'
const ASKS = ['Do you have evening slots?', 'What are your fees?', 'Are you open on Thursday?', 'Can I book for Tuesday?', 'Is there parking?', 'Do you have evening slots?']
const SPOTS = [
  { x: 250, y: 230, z: 0.5 },
  { x: 1350, y: 190, z: 0.8 },
  { x: 170, y: 760, z: 0.9 },
  { x: 1420, y: 800, z: 0.4 },
  { x: 760, y: 900, z: 1 },
  { x: 860, y: 100, z: 1 },
]
const HOOK_LINES = [6, 12, 18, 24, 30, 36, 42, 48, 54]
const CHAT_POINT = { x: CHAT.x + CHAT.w / 2, y: CHAT.y + CHAT.h / 2 }
const WIPE_AT = { x: 1010, y: 800 }
const CAP_TOP = 78
const CAP_SIZE = 84

const CUES = [
  cue('thump', T.hookHead + 1, 0.8),
  ...ASKS.map((_, i) => cue('tick', 5 + i * 7, 0.35)),
  cue('whoosh', T.pull, 0.7),
  cue('tick', T.ask + 1),
  cue('thump', T.readCap + 1, 0.55),
  ...DOCS.map((_, i) => cue('tick', T.fan + i * 5 + 1, 0.55)),
  cue('whoosh', T.draftCap, 0.5),
  ...DOCS.map((_, i) => cue('tick', T.scan + i * 30 + 6, 0.4)),
  cue('tick', T.draft + 6, 0.6),
  cue('whooshDown', T.fake - 4, 0.8),
  cue('thump', T.fake + 1),
  cue('whoosh', T.approve, 0.8),
  cue('click', T.tap),
  cue('whoosh', T.wipe, 0.8),
  cue('thump', T.sentHead + 1, 0.7),
  cue('tick', T.sentChip + 1, 0.7),
  cue('thump', T.end + END_HEADING_AT + 1, 0.7),
  cue('end', T.end + END_BUTTON_AT),
]

const REPLY_SHORT = REPLY

export function ExplainerAiAssistantCinematic() {
  useStageFonts()
  const f = useCurrentFrame()
  const inPaper = f >= T.wipe + 10 && f < T.end
  const glow =
    f < T.chat ? { x: CX, y: 540 } : f < T.fan ? { x: 560, y: 540 } : f < T.draft ? { x: 1260, y: 520 } : f < T.approve ? { x: 1060, y: 640 } : f < T.end ? { x: 1000, y: 700 } : { x: CX, y: 500 }
  return (
    <Ground f={f} glow={glow} glowSize={f >= T.approve && f < T.end ? 0.7 : 1}>
      {f < T.chat + 6 && <Hook f={f} />}
      {f >= T.chat - 2 && f < T.wipe + 50 && <Dark f={f} />}
      <Paper f={f} />
      {inPaper && <PaperScene f={f} />}
      <Flash f={f} />
      {f >= T.end && <EndCard f={f - T.end} />}
      <Tag />
      <Soundtrack cues={CUES} voice="ai-assistant" />
    </Ground>
  )
}

/* ---------------- shared pieces ---------------- */

/* A headline up top with a warm bloom behind it. */
function Cap({ text, f, start, exit, size = CAP_SIZE, top = CAP_TOP }) {
  return (
    <>
      <Burst f={f} at={start + 6} x={CX} y={top + size * 0.55} size={560} peak={0.6} out={exit - 6} />
      <div style={{ position: 'absolute', left: 120, right: 120, top, display: 'flex', justifyContent: 'center' }}>
        <Line text={text} f={f} start={start} exit={exit} size={size} />
      </div>
    </>
  )
}

/* ---------------- 1. hook: questions pile up as lines ---------------- */

function Hook({ f }) {
  const out = tween(f, T.hookOut, T.hookOut + 10, easeInOut)
  const pull = tween(f, T.pull, T.pulled, easeInOut)
  const pt = tween(f, T.pulled - 14, T.pulled) * (1 - tween(f, T.chat + 4, T.chat + 22, easeInOut))
  return (
    <AbsoluteFill>
      <SignalField f={f} appear={HOOK_LINES} converge={pull} point={CHAT_POINT} opacity={1 - tween(f, T.pulled - 4, T.pulled + 10)} seed={7} bright />
      <Point x={CHAT_POINT.x} y={CHAT_POINT.y} size={20 * (0.5 + 0.5 * easeOut(pt))} opacity={pt} />
      <AbsoluteFill style={{ opacity: 1 - pull }}>
        {ASKS.map((q, i) => {
          const s = SPOTS[i]
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
                transform: `scale(${(0.82 + (1 - s.z) * 0.2 - (1 - a) * 0.1).toFixed(3)})`,
                filter: `blur(${(s.z * 5 + (1 - a) * 8).toFixed(2)}px)`,
              }}
            >
              <Bubble text={q} width={420} size={28} time={`8:1${i} pm`} />
            </div>
          )
        })}
      </AbsoluteFill>
      <Burst f={f} at={T.hookHead + 6} x={CX} y={560} size={640} peak={0.7} out={T.hookOut - 10} />
      <SparkleField f={f} count={8} seed={11} at={T.hookHead + 24} size={24} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center' }}>
        <Line text={'The same questions.\nEvery single {day.}'} f={f} start={T.hookHead} exit={T.hookOut - 4} size={140} />
      </div>
    </AbsoluteFill>
  )
}

/* ---------------- 2. the dark story: chat, documents, scan, draft ---------------- */

function Dark({ f }) {
  const fake = tween(f, T.fake - 4, T.fake + 6, easeInOut) - tween(f, T.fakeEnd, T.fakeEnd + 8, easeInOut)
  const ap = tween(f, T.approve, T.approve + 24, easeInOut)
  const drift = tween(f, T.chat, T.fake, (x) => x)
  // slow push, then the close up on the draft
  const s0 = 0.96 + 0.06 * drift
  const sA = 1.25
  const s = lerp(s0, sA, ap)
  const tx = lerp(960 - 960 * s0, 960 - DRAFT.x * sA, ap)
  const ty = lerp(540 - 540 * s0, 640 - (DRAFT.y + 165) * sA, ap)
  const dof = ap
  const wrapOut = tween(f, T.wipe + 14, T.wipe + 34, easeInOut)
  return (
    <AbsoluteFill style={{ opacity: 1 - wrapOut }}>
      <AbsoluteFill style={{ filter: fake > 0.01 ? `blur(${(fake * 14).toFixed(2)}px)` : undefined, opacity: 1 - fake * 0.55 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: 1080, transformOrigin: '0 0', transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})` }}>
          <Scene f={f} dof={dof} />
        </div>
        {f < T.approve - 4 && <SparkleField f={f} count={7} seed={21} at={T.chat + 30} size={22} />}
      </AbsoluteFill>
      {fake > 0.01 && <AbsoluteFill style={{ background: `rgba(11,11,12,${(0.5 * fake).toFixed(3)})` }} />}

      <Cap text="A question comes in." f={f} start={T.askCap} exit={T.askCapOut} />
      <Cap text="It reads your own {documents.}" f={f} start={T.readCap} exit={T.readCapOut} />
      <Cap text="It drafts the {answer.}" f={f} start={T.draftCap} exit={T.draftCapOut} />

      {/* the headfake */}
      <Burst f={f} at={T.fake + 6} x={CX} y={500} size={780} out={T.fakeEnd - 6} />
      <Sparkle f={f} x={1560} y={250} size={40} at={T.fake + 14} period={70} />
      <Sparkle f={f} x={400} y={760} size={30} at={T.fake + 24} period={80} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center' }}>
        <Line text={'But it never\nsends {alone.}'} f={f} start={T.fake} exit={T.fakeEnd - 2} size={156} />
      </div>

      <Cap text="You approve with one {tap.}" f={f} start={T.approve + 4} exit={T.approveCapOut} />
      <Sparkle f={f} x={1560} y={190} size={34} at={T.approve + 18} period={80} />
    </AbsoluteFill>
  )
}

function Scene({ f, dof }) {
  const back = dof > 0.01 ? { filter: `blur(${(dof * 8).toFixed(2)}px)`, opacity: 1 - dof * 0.72 } : null
  const chatIn = arrive(f, T.chat, 110)
  const botIn = arrive(f, T.ask + 14, 140)
  const reading = f >= T.fan + 10 && f < T.draft + 14
  const botLit = cl(fadeIn(f, T.fan + 6, 10))
  const botSub = f < T.fan + 10 ? 'Waiting' : f < T.draft + 14 ? 'Reading your documents' : f < T.tap ? 'Draft ready' : 'Approved'
  const prog = tween(f, T.scan, T.scanEnd, easeInOut)
  const chatPort = { x: CHAT.x + CHAT.w, y: 380 }
  const botL = { x: BOT.x - BOT.w / 2, y: BOT.y }
  const botR = { x: BOT.x + BOT.w / 2, y: BOT.y }
  const botB = { x: BOT.x, y: BOT.y + BOT.h / 2 }
  const ringsOut = T.calm
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, ...back }}>
        <Rings f={f} start={T.fan - 4} x={BOT.x} y={BOT.y} radius={330} count={3} inner={0.45} out={ringsOut} opacity={0.55} />
        <Wire uid="aic-in" d={wirePath(chatPort, botL)} draw={move(f, T.ask + 10, 16)} pulse={(f - T.fan + 6) / 18} />
        {DOCS.map((d, i) => (
          <Wire key={i} uid={`aic-d${i}`} d={wirePath(botR, { x: DOC.x - DOC.w / 2 + 10, y: d.y })} draw={move(f, T.fan + 8 + i * 4, 16)} pulse={(f - T.scan - i * 30) / 18} />
        ))}
        <Wire uid="aic-dr" d={wirePath(botB, { x: DRAFT.x, y: DRAFT.y - 6 }, 'v')} draw={move(f, T.draft, 12)} pulse={(f - T.draft - 2) / 16} />

        <Glass rim="right" style={{ left: CHAT.x, top: CHAT.y, width: CHAT.w, height: CHAT.h, opacity: cl(chatIn * 1.5), transform: `translateY(${((1 - chatIn) * 70).toFixed(2)}px) scale(${(0.94 + 0.06 * chatIn).toFixed(4)})`, overflow: 'hidden' }}>
          <Bar title="New client" label="WhatsApp" icon="user" />
          <div style={{ position: 'absolute', left: 30, top: 104, opacity: cl(arrive(f, T.ask) * 1.5), transform: `translateY(${((1 - arrive(f, T.ask)) * 30).toFixed(2)}px)` }}>
            <Bubble text="Do you have evening slots this week?" time="8:15 pm" width={380} />
          </div>
        </Glass>

        <Glass rim="top" lit={botLit} style={{ left: BOT.x - BOT.w / 2, top: BOT.y - BOT.h / 2, width: BOT.w, height: BOT.h, display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px', opacity: cl(botIn * 1.5), transform: `scale(${(0.9 + 0.1 * botIn).toFixed(4)})`, overflow: 'hidden' }}>
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
          <div style={{ position: 'absolute', left: 0, bottom: 0, height: 5, width: `${prog * 100}%`, background: `linear-gradient(90deg, ${S.saffron}, ${S.peach})`, boxShadow: '0 0 14px rgba(245,135,30,0.8)', opacity: prog > 0 && f < T.draft + 20 ? 1 : 0 }} />
        </Glass>

        {DOCS.map((d, i) => (
          <DocCard key={d.title} d={d} i={i} f={f} />
        ))}
      </div>
      <DraftCard f={f} />
      <ApproveHand f={f} />
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
  const scan = move(f, T.scan + i * 30 + 6, 22)
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
        transform: `rotateY(${(d.r * a).toFixed(2)}deg) scale(${(0.6 + 0.4 * a + (d.z / 600) * a).toFixed(4)})`,
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

function DraftCard({ f }) {
  const a = arrive(f, T.draft + 6, 130)
  if (a < 0.001) return null
  const n = Math.round(cl((f - T.type[0]) / (T.type[1] - T.type[0])) * REPLY_SHORT.length)
  const approved = f >= T.tap
  const press = cl(1 - Math.abs(f - T.tap) / 5)
  const calm = tween(f, T.calm, T.calm + 20) * (1 - tween(f, T.fake - 6, T.fake + 6))
  return (
    <Glass
      rim="left"
      lit={approved ? 1 : calm * 0.6}
      style={{
        left: DRAFT.x - DRAFT.w / 2,
        top: DRAFT.y,
        width: DRAFT.w,
        padding: '24px 30px 26px',
        opacity: cl(a * 1.5),
        transform: `translateY(${((1 - a) * 40).toFixed(2)}px)`,
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
        {REPLY_SHORT.slice(0, n)}
        {n < REPLY_SHORT.length && <span style={{ display: 'inline-block', width: 2.5, height: 30, background: S.saffron, marginLeft: 3, verticalAlign: '-4px' }} />}
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
  const o = fadeIn(f, T.approve + 8, 8) * (1 - fadeIn(f, T.wipe + 4, 8))
  if (o <= 0) return null
  const m = move(f, T.approve + 8, T.tap - 4 - T.approve - 8)
  const to = { x: DRAFT.x + DRAFT.w / 2 - 100, y: DRAFT.y + 232 }
  const from = { x: to.x + 200, y: to.y + 170 }
  const x = lerp(from.x, to.x, m)
  const y = lerp(from.y, to.y, m) - Math.sin(m * Math.PI) * 24
  const press = cl(1 - Math.abs(f - T.tap) / 5)
  return <Pointer x={x} y={y} press={press} ring={(f - T.tap) / 20} opacity={o} />
}

/* ---------------- 3. the one light moment: paper, wiped in from the tap ---------------- */

const PAPER_R = 1500
function Paper({ f }) {
  const inT = tween(f, T.wipe, T.wipe + 34, easeOut)
  const outT = tween(f, T.paperOut, T.end - 2, easeInOut)
  const R = PAPER_R * Math.max(0, inT - outT)
  if (R < 2) return null
  const m = `radial-gradient(circle at ${WIPE_AT.x}px ${WIPE_AT.y}px, #000 ${Math.max(0, R - 170)}px, transparent ${R}px)`
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(90% 80% at 50% 38%, #f5f3ef 0%, #ebe7e1 52%, #fbe6d2 100%)', WebkitMaskImage: m, maskImage: m }}>
      <div style={{ position: 'absolute', left: CX - 700, top: 560 - 450, width: 1400, height: 900, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,200,154,0.55), rgba(255,200,154,0))' }} />
    </AbsoluteFill>
  )
}

function PaperLine({ text, f, start, exit, size }) {
  const out = move(f, exit, 9)
  if (out >= 1 || f < start - 1) return null
  let inSerif = false
  let n = 0
  return (
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1.02, color: '#161412', opacity: 1 - out, transform: `translateY(${(-out * 0.18 * size).toFixed(2)}px)`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em' }}>
      {text.split(' ').map((raw, wi) => {
        if (raw.includes('{')) inSerif = true
        const serif = inSerif
        if (raw.includes('}')) inSerif = false
        const s = arrive(f, start + n++ * 3, 150)
        return (
          <span key={wi} style={{ display: 'inline-block', whiteSpace: 'pre', fontFamily: serif ? SERIF : undefined, fontStyle: serif ? 'italic' : undefined, fontWeight: serif ? 400 : undefined, fontSize: serif ? '1.12em' : undefined, lineHeight: serif ? 0.9 : undefined, color: serif ? '#b8560a' : undefined, opacity: cl(s * 1.6), transform: `translateY(${((1 - s) * 0.42).toFixed(3)}em)` }}>
            {raw.replace(/[{}]/g, '')}
          </span>
        )
      })}
    </div>
  )
}

function PBubble({ text, time, tag, out, width, delay = 0, f, at }) {
  const a = arrive(f, at + delay)
  return (
    <div
      style={{
        position: 'absolute',
        [out ? 'right' : 'left']: 36,
        top: out ? 262 : 108,
        width,
        boxSizing: 'border-box',
        padding: '20px 26px 16px',
        borderRadius: out ? '28px 28px 8px 28px' : '28px 28px 28px 8px',
        background: out ? '#fbe6d2' : '#ebe7e1',
        border: out ? '1px solid rgba(184,86,10,0.45)' : '1px solid rgba(22,20,18,0.1)',
        color: '#161412',
        fontFamily: SANS,
        fontSize: 30,
        lineHeight: 1.3,
        letterSpacing: '-0.015em',
        opacity: cl(a * 1.5),
        transform: `translateY(${((1 - a) * 40).toFixed(2)}px)`,
      }}
    >
      {text}
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 16, fontFamily: MONO, fontSize: 21, letterSpacing: '0.08em', color: 'rgba(22,20,18,0.6)' }}>
        <span>{time}</span>
        {tag && <span style={{ color: '#b8560a' }}>{tag}</span>}
      </div>
    </div>
  )
}

function PaperScene({ f }) {
  const cardIn = arrive(f, T.wipe + 18, 100)
  const out = tween(f, T.paperOut - 2, T.paperOut + 18, easeInOut)
  const chip = arrive(f, T.sentChip, 130)
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Burst f={f} at={T.sentHead + 8} x={CX} y={130} size={560} mode="paper" peak={0.9} out={T.paperOut - 8} />
      <Sparkle f={f} x={1500} y={150} size={34} at={T.sentHead + 22} period={84} color={S.saffron} />
      <Sparkle f={f} x={330} y={300} size={30} at={T.sentHead + 40} period={96} color={S.saffron} />
      <Sparkle f={f} x={1620} y={760} size={28} at={T.sentBubble + 14} period={110} color={S.saffron} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 70, display: 'flex', justifyContent: 'center' }}>
        <PaperLine text={'Sent. Your words, your {say-so.}'} f={f} start={T.sentHead} exit={T.paperOut - 4} size={92} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: CX - 420,
          top: 250,
          width: 840,
          height: 570,
          boxSizing: 'border-box',
          borderRadius: 22,
          background: '#f5f3ef',
          border: '1px solid rgba(22,20,18,0.12)',
          boxShadow: '0 60px 90px -30px rgba(120,60,10,0.4), 0 18px 40px -12px rgba(22,20,18,0.35)',
          opacity: cl(cardIn * 1.5),
          transform: `translateY(${((1 - cardIn) * 60).toFixed(2)}px) scale(${(0.94 + 0.06 * cardIn).toFixed(4)})`,
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 68, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: '1px solid rgba(22,20,18,0.1)', fontFamily: SANS, color: '#161412' }}>
          <div style={{ display: 'flex', gap: 7, marginRight: 6 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: 'rgba(22,20,18,0.18)' }} />
            ))}
          </div>
          <Icon name="user" size={28} color="#b8560a" />
          <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>New client</span>
          <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 21, letterSpacing: '0.08em', color: 'rgba(22,20,18,0.6)' }}>WhatsApp</span>
        </div>
        <PBubble f={f} at={T.wipe + 24} text="Do you have evening slots this week?" time="8:15 pm" width={460} />
        <PBubble f={f} at={T.sentBubble} out text={REPLY} time="8:16 pm" tag="Approved" width={560} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: CX - 150,
          top: 856,
          width: 300,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          padding: '16px 0',
          borderRadius: 999,
          background: '#161412',
          color: '#f2f0ed',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: '-0.02em',
          boxShadow: '0 20px 40px -14px rgba(184,86,10,0.55)',
          opacity: cl(chip * 1.5),
          transform: `translateY(${((1 - chip) * 24).toFixed(2)}px) scale(${(0.9 + 0.1 * chip).toFixed(4)})`,
        }}
      >
        <Icon name="check" size={30} color={S.saffron} stroke={2.8} />
        Sent
        <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 400, color: S.muted }}>8:16 pm</span>
      </div>
    </AbsoluteFill>
  )
}
