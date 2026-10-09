import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { S, SANS, Glass, Bar } from './stageLook.jsx'
import { arriveT, leaveT, ramp, live, glideT, lerp, EASE } from '../cinematic/motion3.js'
import { Words, Headline, Caption, Tag3, Label, PAPER, wordStarts } from '../cinematic/Kinetic3.jsx'
import { MorphPill, COL, Spinner, Check, Pointer3 } from '../cinematic/Morph3.jsx'
import { floodState, contract } from '../cinematic/Transitions3.jsx'
import { LightSweep } from '../cinematic/Light3.jsx'
import { World3, cam3 } from '../cinematic/Camera3.jsx'
import { Shell, EndCard3, buttonState, useFonts3 } from '../cinematic/Film3.jsx'
import { Soundtrack3, cue3 } from '../cinematic/Sound3.jsx'

/*
  AI Assistant Build v3, 36.0 s, voiceless (shot list 4.4). The same
  questions every day; the assistant reads the business's own documents,
  drafts the answer from the highlighted lines, and nothing leaves without
  the owner's tap. The Approve pill floods to paper for the sent reply, and
  the paper contracts back into the pill that becomes "Book a free call".
*/

const T = {
  bubbles: [0, 15, 30, 45],
  head1: 30,
  head2: 75,
  question: 120,
  qLine: 130,
  converge: 122,
  chat: 195,
  docs: 300,
  sweeps: [330, 375, 420],
  draft: 480,
  draftText: 505,
  sources: 540,
  fake: 600,
  fakeLine: 610,
  back: 660,
  tap: 690,
  loader: 693,
  check: 720,
  paper: 750,
  sent: 780,
  sentParts: [780, 800, 820],
  sentSweep: 795,
  payoff: 870,
  cta: 945,
  fade: 1065,
}
export const AI_V3_LEN = 1080

const CX = 960
const W = 1920
const H = 1080
const CHAT = { left: 110, top: 300, w: 640, h: 560 }
const QBUB = { x: CHAT.left + 330, y: 520 }
const DOCS_X = [1340, 1900, 2460]
const DOC = { w: 520, h: 560, top: 330 }
const DRAFT = { left: 830, top: 290, w: 980, h: 590 }
const APPROVE = { x: DRAFT.left + DRAFT.w - 190, y: DRAFT.top + DRAFT.h - 80, w: 260, h: 84 }
const UNDER = { x: CX, y: 640, w: 180, h: 18 }

const BG_BUBBLES = [
  { text: 'Do you have evening slots?', x: 110, y: 120 },
  { text: 'How much is a first visit?', x: 1250, y: 170 },
  { text: 'Can I book for Tuesday?', x: 180, y: 860 },
  { text: 'Are you open on Sunday?', x: 1230, y: 880 },
]
const DOCS = [
  { title: 'Booking guide', lines: ['Book online or on WhatsApp.', 'Evenings: Tue and Thu, 6 to 8 pm', 'Pick any open time that suits.'], hl: 1 },
  { title: 'Price list', lines: ['Packages are listed below.', 'Evening sessions: usual fee', 'Pay by UPI or card.'], hl: 1 },
  { title: 'Opening hours', lines: ['Monday to Saturday', 'Open late on Tue and Thu', 'Closed on Sundays'], hl: 1 },
]
const DRAFT_TEXT = 'Yes! We have evening slots on Tuesday and Thursday from 6 pm. Shall I hold one for you?'

const txt = (size, color = S.ink) => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: '-0.015em', lineHeight: 1.3, color })

/* the camera: home, push past the chat to the documents, pull back to chat and draft */
const CAM = [
  { x: CX, y: 540, s: 1 },
  { at: T.docs, dur: 60, x: 1900, y: 600, s: 1 },
  { at: T.draft, dur: 45, x: CX, y: 540, s: 1 },
]

function pillStates() {
  return [
    { at: 0, ...APPROVE, r: 999, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.5, o: 0, content: <Btn text="Approve" /> },
    { at: T.draft + 30, ...APPROVE, o: 1, ease: { dur: 14, curve: EASE.arrive } },
    { at: T.fake, ...APPROVE, o: 0, ease: { dur: 1 } },
    { at: T.back, ...APPROVE, o: 1, ease: { dur: 1 } },
    { at: T.loader, x: APPROVE.x, y: APPROVE.y, w: APPROVE.h, h: APPROVE.h, r: 999, content: <Center><SpinnerLive /></Center> },
    { at: T.check, x: APPROVE.x, y: APPROVE.y, w: APPROVE.h, h: APPROVE.h, r: 999, content: <Center><CheckLive /></Center> },
    { ...floodState(T.paper, W, H, COL.paper, 12), content: null },
    contract({ at: T.payoff, ...UNDER, r: 999, fill: COL.saffron, line: [0, 0, 0, 0], glow: 0.4 }, 15),
    buttonState(T.cta + 4, false),
  ]
}
function Center({ children }) {
  return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
}
function Btn({ text }) {
  return <Center><span style={{ ...txt(36, S.onSaffron), whiteSpace: 'nowrap' }}>{text}</span></Center>
}
function SpinnerLive() {
  const f = useCurrentFrame()
  return <Spinner f={f} size={44} />
}
function CheckLive() {
  const f = useCurrentFrame()
  return <Check f={f} at={T.check + 2} size={46} />
}

const CUES = [
  ...T.bubbles.map((t) => cue3('tick', t + 6, 0.45)),
  ...wordStarts('The same questions.', T.head1).map((t) => cue3('key', t + 6, 1.2)),
  ...wordStarts('Every single {day}.', T.head2).map((t) => cue3('key', t + 6, 1.2)),
  cue3('pop', T.chat + 6),
  ...T.sweeps.map((t) => cue3('glass', t + 12)),
  cue3('whoosh', T.draft + 12, 0.8),
  cue3('tick', T.sources + 6),
  cue3('thump', T.fakeLine + 4),
  cue3('click', T.tap),
  cue3('pop', T.check),
  cue3('paper', T.paper + 8),
  cue3('tick', T.sent + 6),
  cue3('glass', T.sentSweep + 10),
  cue3('end', T.cta + 30),
]

export function ExplainerAiAssistantV3() {
  const ready = useFonts3()
  const f = useCurrentFrame()
  if (!ready) return <AbsoluteFill style={{ background: S.bg }} />
  const demo = (f >= T.chat - 4 && f < T.fake) || (f >= T.back && f < T.paper + 12)
  const c = cam3(f, CAM)
  // the approve pill lives in world space; project it to the screen
  const proj = (p) => ({ x: (p.x - c.x) * c.s + W / 2, y: (p.y - c.y) * c.s + H / 2 })
  const ap = proj(APPROVE)
  return (
    <Shell f={f} fadeAt={T.fade} glow={{ x: CX, y: 540 }} glowSize={0.7}>
      {f < T.chat + 20 && <Opening f={f} />}
      {demo && (
        <World3 f={f} keys={CAM}>
          <Chat f={f} />
          {f >= T.docs - 2 && f < T.draft + 50 && <Docs f={f} />}
          {f >= T.draft - 2 && <Draft f={f} />}
        </World3>
      )}
      <MorphPill f={f} states={pillStates().map((s) => (s.ease && s.w > 2000) || s.at >= T.payoff ? s : { ...s, x: s.x - c.x + W / 2, y: s.y - c.y + H / 2 })} z={40} />
      {f >= T.back && f < T.paper && <Pointer3 f={f} from={{ x: 1500, y: 1000 }} to={{ x: ap.x + 40, y: ap.y + 14 }} moveAt={T.tap - 24} moveDur={22} clickAt={T.tap} inAt={T.tap - 30} outAt={T.check} />}
      {f >= T.sent - 2 && f < T.payoff + 4 && <Sent f={f} />}
      {/* titles */}
      <Caption f={f} text="A question comes {in}." at={T.chat + 4} exit={T.docs - 8} />
      <Caption f={f} text="It reads your own {documents}." at={T.docs + 4} exit={T.draft - 8} />
      <Caption f={f} text="Then drafts the {answer}." at={T.draft + 4} exit={T.fake - 1} />
      <Headline f={f} text="But it never sends {alone}." at={T.fakeLine} exit={T.back - 10} size={120} />
      <Caption f={f} text="You approve with one {tap}." at={T.back + 2} exit={T.paper - 4} />
      <Headline f={f} text="AI that helps. Never takes {over}." at={T.payoff + 4} exit={T.cta - 6} size={110} top={420} />
      {f >= T.cta && <EndCard3 f={f} at={T.cta} tall={false} kicker="AI Assistant Build" />}
      <Tag3 f={f} text="Illustration" at={T.chat} out={T.fake - 2} />
      <Tag3 f={f} text="Illustration" at={T.back} out={T.paper} />
      <Tag3 f={f} text="Illustration" at={T.sent} out={T.payoff - 4} t="paper" />
      <Soundtrack3 cues={CUES} score="ai-assistant-v3" />
    </Shell>
  )
}

/* ---- 1-2. the same questions, converging into one ---- */

function Opening({ f }) {
  const conv = glideT(f, T.converge, 40)
  const settleT = glideT(f, T.chat, 20)
  return (
    <>
      {BG_BUBBLES.map((b, i) => {
        const a = arriveT(f, T.bubbles[i], 18)
        if (a <= 0) return null
        const tx = lerp(b.x, CX - 300, conv)
        const ty = lerp(b.y, 640, conv)
        const o = (i === 0 ? lerp(0.3, 1, conv) : 0.3 * Math.max(0, 1 - conv * 2.2)) * a
        const last = i === 0
        const x = last ? lerp(tx, CHAT.left + 40, settleT) : tx
        const y = last ? lerp(ty, QBUB.y - 50, settleT) : ty
        if (!last && conv >= 1) return null
        if (last && f >= T.chat + 18) return null
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, padding: '20px 30px', borderRadius: '30px 30px 30px 8px', background: 'rgba(255,255,255,0.07)', boxShadow: `inset 0 0 0 1.5px ${S.line}`, opacity: o, transform: `translateY(${((1 - a) * 20).toFixed(1)}px)`, ...txt(34), whiteSpace: 'nowrap', zIndex: 10 }}>
            {last && conv > 0.5 ? 'Do you have evening slots this week?' : b.text}
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: 120, right: 120, top: 380 }}>
        <Words text="The same questions." f={f} at={T.head1} exit={T.question - 4} size={110} />
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 510 }}>
        <Words text="Every single {day}." f={f} at={T.head2} exit={T.question} size={110} />
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 250 }}>
        <Words text={"What if the answer\nwas already {written}?"} f={f} at={T.qLine} exit={T.chat - 6} size={100} />
      </div>
    </>
  )
}

/* ---- 3. the chat window ---- */

function Chat({ f }) {
  const a = arriveT(f, T.chat - 4, 20)
  const dim = 1 - 0.5 * ramp(f, T.docs, 30) + 0.5 * ramp(f, T.draft, 30)
  return (
    <Glass rim="left" style={{ left: CHAT.left, top: CHAT.top, width: CHAT.w, height: CHAT.h, opacity: a * dim }}>
      <Bar title="New client" label="WhatsApp" size={30} />
      <div style={{ position: 'absolute', left: 40, top: 130, width: 520, padding: '22px 30px', borderRadius: '30px 30px 30px 8px', background: 'rgba(255,255,255,0.07)', boxShadow: `inset 0 0 0 1.5px ${S.line}`, boxSizing: 'border-box' }}>
        <div style={txt(34)}>Do you have evening slots this week?</div>
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          <Label>8:15 pm</Label>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 40, bottom: 40, opacity: arriveT(f, T.draft + 20, 20) }}>
        <Label color={S.peach}>Drafting a reply…</Label>
      </div>
    </Glass>
  )
}

/* ---- 4. the documents, read one by one ---- */

function docLineY(li) {
  return DOC.top + 150 + li * 110
}
function Docs({ f }) {
  const out = ramp(f, T.draft, 14, EASE.glide)
  return (
    <>
      {DOCS.map((d, i) => {
        const a = arriveT(f, T.docs + 20 + i * 6, 22)
        const sw = T.sweeps[i]
        const hl = ramp(f, sw + 10, 12, EASE.arrive)
        return (
          <div key={d.title} style={{ position: 'absolute', left: DOCS_X[i] - DOC.w / 2, top: DOC.top, width: DOC.w, height: DOC.h, opacity: a * (1 - out), transform: `translateY(${((1 - a) * 40).toFixed(1)}px)` }}>
            <Glass rim="top" style={{ left: 0, top: 0, width: DOC.w, height: DOC.h, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 40, top: 40 }}>
                <Label color={S.peach}>Your document</Label>
                <div style={{ ...txt(40), marginTop: 10 }}>{d.title}</div>
              </div>
              {d.lines.map((ln, li) => {
                const on = li === d.hl
                return (
                  <div key={li} style={{ position: 'absolute', left: 26, right: 26, top: docLineY(li) - DOC.top, padding: '14px 16px', borderRadius: 14, background: on ? `rgba(245,135,30,${(0.2 * hl).toFixed(3)})` : 'none', boxShadow: on && hl > 0.01 ? `inset 0 0 0 1.5px rgba(245,135,30,${(0.5 * hl).toFixed(3)})` : 'none', ...txt(30, on && hl > 0.5 ? S.peach : S.inkSoft) }}>
                    {ln}
                  </div>
                )
              })}
              <LightSweep f={f} at={sw} dur={24} strength={1.4} />
            </Glass>
          </div>
        )
      })}
      {/* the three highlighted lines lift off and fly into the draft */}
      {DOCS.map((d, i) => {
        const t = ramp(f, T.draft + i * 6, 26, EASE.glide)
        if (t <= 0 || f > T.draftText + 10) return null
        const x0 = DOCS_X[i] - DOC.w / 2 + 26
        const y0 = docLineY(d.hl)
        const x = lerp(x0, DRAFT.left + 50, t)
        const y = lerp(y0, DRAFT.top + 150 + i * 20, t)
        const o = 1 - ramp(f, T.draftText - 2, 10)
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, padding: '14px 16px', borderRadius: 14, background: 'rgba(245,135,30,0.2)', boxShadow: 'inset 0 0 0 1.5px rgba(245,135,30,0.5)', ...txt(30, S.peach), whiteSpace: 'nowrap', opacity: o, zIndex: 30 }}>
            {d.lines[d.hl]}
          </div>
        )
      })}
    </>
  )
}

/* ---- 5. the draft ---- */

function Draft({ f }) {
  const a = arriveT(f, T.draft + 14, 22)
  return (
    <Glass rim="right" style={{ left: DRAFT.left, top: DRAFT.top, width: DRAFT.w, height: DRAFT.h, opacity: a, transform: `translateX(${((1 - a) * 40).toFixed(1)}px)` }}>
      <div style={{ position: 'absolute', left: 50, top: 46 }}>
        <Label color={S.peach}>Draft reply · waiting for you</Label>
      </div>
      <div style={{ position: 'absolute', left: 50, right: 50, top: 110 }}>
        <DraftWords f={f} />
      </div>
      <div style={{ position: 'absolute', left: 50, top: 370, padding: '12px 22px', borderRadius: 999, boxShadow: `inset 0 0 0 1.5px ${S.line}`, opacity: arriveT(f, T.sources, 16) }}>
        <Label size={28} color={S.inkSoft}>From: Booking guide, Opening hours</Label>
      </div>
      <div style={{ position: 'absolute', left: DRAFT.w - 190 - 130 - 250, top: DRAFT.h - 80 - 42, width: 200, height: 84, borderRadius: 999, boxShadow: `inset 0 0 0 1.5px ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...txt(34, S.inkSoft), opacity: arriveT(f, T.draft + 30, 14) }}>Edit</div>
    </Glass>
  )
}
function DraftWords({ f }) {
  return (
    <div style={{ ...txt(40), display: 'flex', flexWrap: 'wrap', columnGap: '0.25em' }}>
      {DRAFT_TEXT.split(' ').map((w, i) => {
        const a = arriveT(f, T.draftText + i, 14)
        return (
          <span key={i} style={{ display: 'inline-block', opacity: a, transform: `translateY(${((1 - a) * 12).toFixed(1)}px)`, filter: a < 0.98 ? `blur(${((1 - a) * 5).toFixed(2)}px)` : undefined }}>
            {w}
          </span>
        )
      })}
    </div>
  )
}

/* ---- 8. sent, on paper ---- */

function Sent({ f }) {
  const a = arriveT(f, T.sent, 22)
  const out = leaveT(f, T.payoff - 4, 8)
  const box = { left: 460, top: 330, w: 1000, h: 560 }
  const parts = ['Sent.', 'Your words.', 'Your {say-so}.']
  return (
    <AbsoluteFill style={{ zIndex: 45, opacity: 1 - out }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', gap: '0.3em' }}>
        {parts.map((p, i) => (
          <Words key={p} text={p} f={f} at={T.sentParts[i]} size={88} t="paper" stagger={3} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: box.left, top: box.top, width: box.w, height: box.h, borderRadius: 30, background: '#ffffff', boxShadow: `inset 0 0 0 1.5px ${PAPER.line}, 0 40px 90px -30px rgba(22,20,18,0.25)`, overflow: 'hidden', opacity: a, transform: `translateY(${((1 - a) * 30).toFixed(1)}px)` }}>
        <div style={{ height: 76, display: 'flex', alignItems: 'center', padding: '0 34px', borderBottom: `1px solid ${PAPER.line}`, ...txt(32, PAPER.ink) }}>
          New client
          <span style={{ marginLeft: 'auto' }}><Label color={PAPER.muted}>WhatsApp</Label></span>
        </div>
        <div style={{ position: 'absolute', left: 34, top: 110, width: 560, padding: '20px 28px', borderRadius: '28px 28px 28px 8px', background: '#f1eeea', boxSizing: 'border-box', ...txt(32, PAPER.ink) }}>
          Do you have evening slots this week?
          <div style={{ textAlign: 'right', marginTop: 4 }}><Label color={PAPER.muted}>8:15 pm</Label></div>
        </div>
        <div style={{ position: 'absolute', right: 34, top: 280, width: 720, padding: '20px 28px', borderRadius: '28px 28px 8px 28px', background: '#fbe6d2', boxShadow: 'inset 0 0 0 1.5px rgba(184,86,10,0.3)', boxSizing: 'border-box', ...txt(32, PAPER.ink) }}>
          {DRAFT_TEXT}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Label color={PAPER.accent}>Approved</Label>
            <Label color={PAPER.muted}>8:16 pm</Label>
          </div>
        </div>
        <LightSweep f={f} at={T.sentSweep} paper dur={26} />
      </div>
    </AbsoluteFill>
  )
}
