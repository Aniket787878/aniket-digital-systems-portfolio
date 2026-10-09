import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { S, SANS, Glass } from './stageLook.jsx'
import { Icon } from '../icons.jsx'
import { arriveT, leaveT, ramp, live, spr, glideT, lerp, textWidth, EASE } from '../cinematic/motion3.js'
import { Words, Headline, Caption, Tag3, Odometer, Label, Strike, PAPER, wordStarts } from '../cinematic/Kinetic3.jsx'
import { MorphPill, COL, Spinner, Check, Pointer3 } from '../cinematic/Morph3.jsx'
import { floodState, dotState, contract } from '../cinematic/Transitions3.jsx'
import { LightSweep } from '../cinematic/Light3.jsx'
import { World3 } from '../cinematic/Camera3.jsx'
import { Shell, EndCard3, buttonState, useFonts3 } from '../cinematic/Film3.jsx'
import { Soundtrack3, cue3 } from '../cinematic/Sound3.jsx'

/*
  Ops Automation Sprint v3, 38.0 s, voiceless (shot list 4.3). One saffron
  pill follows a single 11:04 pm enquiry through the night: the "?" dot
  becomes the form's button, then a reply, a row's "New" chip, floods into
  the morning, becomes the reminder and the follow-up trail; the headfake
  strikes Day 7, the rehook shows it stopped because they booked.
*/

const T = {
  clock: 0,
  sub: 45,
  moon: 60,
  question: 120,
  qDot: 168,
  form: 180,
  formCap: 186,
  pointer: 200,
  click: 225,
  sent: 255,
  reply: 300,
  replySweep: 330,
  list: 405,
  toast: 465,
  morning: 525,
  paperOn: 534,
  contract: 540,
  morningLine: 545,
  clockRoll: 545,
  reminder: 585,
  reminderSweep: 615,
  follow: 690,
  day3: 705,
  day7: 735,
  fake: 795,
  fakeLine: 798,
  strike: 810,
  rehook: 840,
  rehookB: 870,
  flip: 848,
  payoff: 900,
  shrink: 915,
  cta: 990,
  fade: 1125,
}
export const OPS_V3_LEN = 1140

const W = 1920
const H = 1080
const CX = 960
const Q = { text: 'Who {answers?}', top: 400, size: 120 }
const BTN = { x: 960, y: 712, w: 360, h: 92 }
const FORM = { left: 560, top: 290, w: 800, h: 520 }
const REPLY = { x: 960, y: 590, w: 1140, h: 250 }
const TABLE = { left: 300, top: 330, w: 1320, rowH: 96 }
const NEW_CHIP = { x: TABLE.left + 1130, y: TABLE.top + 96 + 48, w: 150, h: 60 }
const REMIND = { x: 960, y: 600, w: 1160, h: 250 }
const LINE_Y = 640
const NODE = { x: 316, y: LINE_Y, w: 420, h: 76 }
const DAY3 = { x: 830, y: 470, w: 780, h: 160 }
const DAY7 = { x: 1430, y: 820, w: 780, h: 160 }
const FAKE_CARD = { x: 960, y: 640, w: 840, h: 190 }
const BOOKED = { x: 960, y: 640, w: 620, h: 116 }
const UNDER = { x: 960, y: 640, w: 180, h: 18 }

const card = { fill: COL.card, line: COL.linePaper, glow: 0 }

function qDot() {
  const s = Q.size
  const w = textWidth('Who', s) + s * 0.25 + textWidth('answers?', s * 1.1, { serif: true })
  const q = textWidth('?', s * 1.1, { serif: true })
  return { x: CX + w / 2 - q * 0.55, y: Q.top + s * 0.86 }
}

const txt = (size, color = S.ink) => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: '-0.015em', lineHeight: 1.3, color })

function pillStates() {
  const d = qDot()
  return [
    dotState(0, d.x, d.y, 16, COL.saffron, { o: 0 }),
    dotState(T.qDot, d.x, d.y, 16, COL.saffron, { o: 1, glow: 0.6 }),
    { at: T.form, ...BTN, r: 999, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.6, content: <BtnText text="Send enquiry" /> },
    { at: T.click + 3, x: BTN.x, y: BTN.y, w: BTN.h, h: BTN.h, r: 999, content: <Center><SpinnerLive /></Center> },
    { at: T.sent, x: BTN.x, y: BTN.y, w: 230, h: BTN.h, r: 999, content: <Center><CheckSent /></Center> },
    { at: T.reply, ...REPLY, r: 44, fill: COL.out, line: COL.lineSaff, glow: 0.2, content: <ReplyContent /> },
    { at: T.list, ...NEW_CHIP, r: 999, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.5, content: <BtnText text="New" size={30} /> },
    floodState(T.morning, W, H, COL.saffron),
    contract({ at: T.contract, x: CX, y: 760, w: 120, h: 40, r: 999, fill: COL.saffron, line: [0, 0, 0, 0], glow: 0 }, 15),
    { at: T.reminder, ...REMIND, r: 44, ...card, content: <RemindContent /> },
    { at: T.follow, ...NODE, r: 999, fill: COL.tint, line: [184, 86, 10, 0.35], content: <NodeContent /> },
    { at: T.fake, ...NODE, o: 0, ease: { dur: 1 } },
    { at: T.flip, ...BOOKED, r: 999, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.7, o: 1, ease: { dur: 12, curve: EASE.arrive }, content: <BookedContent /> },
    { at: T.shrink, ...UNDER, r: 999, content: null },
    buttonState(T.cta + 4, false),
  ]
}

function Center({ children }) {
  return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
}
function BtnText({ text, size = 36 }) {
  return <Center><span style={{ ...txt(size, S.onSaffron), whiteSpace: 'nowrap' }}>{text}</span></Center>
}
function SpinnerLive() {
  const f = useCurrentFrame()
  return <Spinner f={f} size={44} />
}
function CheckSent() {
  const f = useCurrentFrame()
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...txt(36, S.onSaffron) }}>
      <Check f={f} at={T.sent + 2} size={40} /> Sent
    </span>
  )
}
function ReplyContent() {
  return (
    <div style={{ padding: '34px 46px', boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={txt(42)}>Hi! Thanks for getting in touch. Here are this week's evening slots.</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label color={S.peach}>WhatsApp</Label>
        <span style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
          <Label>11:04 pm</Label>
          <svg width={34} height={26} viewBox="0 0 30 24" fill="none" stroke={S.saffron} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 13l5 5L18 6" />
            <path d="M12 16l2 2L25 6" />
          </svg>
        </span>
      </div>
    </div>
  )
}
function RemindContent() {
  return (
    <div style={{ padding: '34px 46px', boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={txt(40, PAPER.ink)}>Good morning! A quick reminder: your booking link is here whenever you're ready.</div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Label color={PAPER.accent}>WhatsApp</Label>
        <Label color={PAPER.muted}>9:00 am</Label>
      </div>
    </div>
  )
}
function NodeContent() {
  return (
    <Center>
      <span style={{ display: 'inline-flex', gap: 14, alignItems: 'center', ...txt(30, PAPER.ink), whiteSpace: 'nowrap' }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: PAPER.accent }} />
        9:00 am · Reminder sent
      </span>
    </Center>
  )
}
function BookedContent() {
  const f = useCurrentFrame()
  return (
    <Center>
      <span style={{ display: 'inline-flex', gap: 14, alignItems: 'center', ...txt(40, S.onSaffron), whiteSpace: 'nowrap' }}>
        <Check f={f} at={T.flip + 6} size={44} />
        Booked · Thu 6:00 pm
      </span>
    </Center>
  )
}

const CUES = [
  cue3('roll', T.clock + 24),
  ...wordStarts('A new enquiry. Your team is {asleep}.', T.sub).map((t) => cue3('key', t + 6, 1.2)),
  cue3('pop', T.form + 6),
  cue3('click', T.click),
  cue3('pop', T.sent + 4),
  cue3('pop', T.reply + 4),
  cue3('glass', T.replySweep + 10),
  cue3('tick', T.list + 8),
  cue3('pop', T.toast + 6),
  cue3('flood', T.morning + 8),
  cue3('paper', T.contract + 6),
  cue3('roll', T.clockRoll + 24, 0.8),
  cue3('pop', T.reminder + 4),
  cue3('glass', T.reminderSweep + 10),
  cue3('tick', T.day3 + 8),
  cue3('tick', T.day7 + 8),
  cue3('strike', T.strike + 4),
  cue3('pop', T.flip + 4),
  cue3('end', T.cta + 30),
]

export function ExplainerOpsSprintV3() {
  const ready = useFonts3()
  const f = useCurrentFrame()
  if (!ready) return <AbsoluteFill style={{ background: S.bg }} />
  const paper = f >= T.paperOn && f < T.fake
  // one camera: a gentle push toward the new row, back before the morning flood
  const cam = [
    { x: CX, y: 540, s: 1 },
    { at: T.list + 15, dur: 80, x: 1010, y: 540, s: 1.06 },
    { at: T.morning + 4, dur: 10, x: CX, y: 540, s: 1 },
  ]
  return (
    <Shell f={f} fadeAt={T.fade} glow={{ x: CX, y: 520 }} glowSize={0.7}>
      {paper && <AbsoluteFill style={{ background: `radial-gradient(90% 80% at 50% 30%, ${PAPER.bg} 0%, #efebe5 60%, ${PAPER.tint} 130%)` }} />}
      <World3 f={f} keys={cam}>
        {f < T.form + 10 && <Night f={f} />}
        {f >= T.form - 2 && f < T.reply + 14 && <Form f={f} />}
        {f >= T.list - 2 && f < T.morning + 9 && <Leads f={f} />}
        {f >= T.follow - 2 && f < T.fake && <Followups f={f} />}
        {f >= T.fake && f < T.rehook + 14 && <FakeCard f={f} />}
        <MorphPill f={f} states={pillStates()} z={40} />
        {f >= T.reply + 20 && f < T.reply + 60 && (
          <div style={{ position: 'absolute', left: REPLY.x - REPLY.w / 2, top: REPLY.y - REPLY.h / 2, width: REPLY.w, height: REPLY.h, borderRadius: 44, overflow: 'hidden', zIndex: 45 }}>
            <LightSweep f={f} at={T.replySweep} strength={1.5} />
          </div>
        )}
        {f >= T.reminder + 20 && f < T.reminder + 70 && (
          <div style={{ position: 'absolute', left: REMIND.x - REMIND.w / 2, top: REMIND.y - REMIND.h / 2, width: REMIND.w, height: REMIND.h, borderRadius: 44, overflow: 'hidden', zIndex: 45 }}>
            <LightSweep f={f} at={T.reminderSweep} paper />
          </div>
        )}
      </World3>
      <Pointer3 f={f} from={{ x: 1460, y: 960 }} to={{ x: BTN.x + 50, y: BTN.y + 10 }} moveAt={T.pointer} moveDur={22} clickAt={T.click} inAt={T.pointer - 8} outAt={T.sent + 10} />
      <Clock f={f} />
      {/* scene titles */}
      <Caption f={f} text="A lead fills in your {form}." at={T.formCap} exit={T.reply - 8} />
      <Caption f={f} text="A WhatsApp reply goes out. {Instantly}." at={T.reply + 2} exit={T.list - 8} />
      <Caption f={f} text="Into your client {list}." at={T.list + 2} exit={T.morning - 16} />
      <div style={{ position: 'absolute', left: 96, top: 214, zIndex: 32 }}>
        <Words text="Your team gets a heads-up." f={f} at={T.list + 20} exit={T.morning - 16} size={40} align="left" color={S.inkSoft} stagger={2} tracking={-0.02} />
      </div>
      <Toast f={f} />
      <Headline f={f} text="Next {morning}." at={T.morningLine} exit={T.reminder - 10} size={120} t="paper" />
      <Caption f={f} text="A gentle {reminder}." at={T.reminder + 2} exit={T.follow - 8} t="paper" />
      <Caption f={f} text="Then Day 3. Then Day 7." at={T.follow + 2} exit={T.fake - 1} t="paper" />
      <Headline f={f} text="Day 7 never {sends}." at={T.fakeLine} exit={T.rehook - 10} size={110} top={250} />
      <Headline f={f} text="They booked on Day 3." at={T.rehook + 2} exit={T.payoff - 8} size={96} top={250} />
      <Headline f={f} text="It {stops} by itself." at={T.rehookB} exit={T.payoff - 8} size={96} top={800} />
      <Headline f={f} text="Zero {chasing}." at={T.payoff + 4} exit={T.cta - 6} size={160} top={400} />
      {f >= T.cta && <EndCard3 f={f} at={T.cta} tall={false} kicker="Ops Automation Sprint" />}
      <Tag3 f={f} text="Illustration" at={T.form} out={T.morning} />
      <Tag3 f={f} text="Illustration" at={T.reminder} out={T.fake - 2} t="paper" />
      <Soundtrack3 cues={CUES} score="ops-sprint-v3" />
    </Shell>
  )
}

/* ---- 1-2. the clock, the stakes, the question ---- */

function Night({ f }) {
  return (
    <>
      <div style={{ position: 'absolute', left: 120, right: 120, top: 600 }}>
        <Words text="A new enquiry. Your team is {asleep}." f={f} at={T.sub} exit={T.question - 10} size={64} />
      </div>
      <div style={{ position: 'absolute', left: 120, right: 120, top: Q.top }}>
        <Words text={Q.text} f={f} at={T.question + 6} exit={T.form - 6} size={Q.size} />
      </div>
    </>
  )
}

/* The clock: big at the start, then a stamp top-right for the whole night,
   rolling to 9:00 am in the morning. Off at the headfake. */
function Clock({ f }) {
  if (f >= T.fake) return null
  const m = spr(f, T.question)
  const big = { x: CX, y: 380, s: 1 }
  const stamp = { x: 1824 - 130, y: 84, s: 48 / 160 }
  const x = lerp(big.x, stamp.x, m)
  const y = lerp(big.y, stamp.y, m)
  const s = lerp(1, stamp.s, m)
  const paper = f >= T.paperOn
  const color = paper ? PAPER.ink : S.ink
  const moon = live(f, T.moon, T.morning, 18, 10)
  const sun = live(f, T.clockRoll + 10, null, 18)
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s.toFixed(4)})`, zIndex: 50, display: 'flex', alignItems: 'center', gap: 40 }}>
      <Odometer f={f} at={f >= T.clockRoll ? T.clockRoll : T.clock} from={f >= T.clockRoll ? '11:04 pm' : ' 0:00 pm'} to={f >= T.clockRoll ? ' 9:00 am' : '11:04 pm'} size={160} color={color} turns={0} />
      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 160, color, marginLeft: -40, opacity: 1 - ramp(f, T.question, 10) }}>.</span>
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {moon > 0 && <div style={{ position: 'absolute', inset: 0, opacity: moon, transform: `translateY(${((1 - moon) * 20).toFixed(1)}px)` }}><Icon name="moon" size={120} color={S.peach} stroke={1.6} /></div>}
        {sun > 0 && <div style={{ position: 'absolute', inset: 0, opacity: sun }}><Icon name="sun" size={120} color={PAPER.accent} stroke={1.8} /></div>}
      </div>
    </div>
  )
}

/* ---- 3. the form builds around the pill ---- */

function Form({ f }) {
  const o = 1 - leaveT(f, T.reply - 4, 10)
  const a = (k) => arriveT(f, T.form + k * 6, 20)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <Glass rim="top" style={{ left: FORM.left, top: FORM.top, width: FORM.w, height: FORM.h, opacity: a(0), transform: `translateY(${((1 - a(0)) * 30).toFixed(1)}px)` }}>
        <div style={{ position: 'absolute', left: 60, top: 54, opacity: a(1) }}>
          <Label color={S.peach}>Your website</Label>
          <div style={{ ...txt(52), marginTop: 12 }}>Book a consultation</div>
        </div>
        <div style={{ position: 'absolute', left: 60, right: 60, top: 220, opacity: a(2) }}>
          <Label>What are you looking for?</Label>
          <div style={{ marginTop: 14, height: 84, borderRadius: 18, boxShadow: `inset 0 0 0 1.5px ${S.line}`, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', padding: '0 28px', ...txt(36) }}>An evening slot, first visit</div>
        </div>
      </Glass>
    </div>
  )
}

/* ---- 5. the client list and the team's heads-up ---- */

const ROWS = [
  { src: 'Web form', time: '11:04 pm', status: null },
  { src: 'Instagram', time: '6:12 pm', status: 'Replied' },
  { src: 'Web form', time: '2:40 pm', status: 'Booked' },
]
function Leads({ f }) {
  const a = arriveT(f, T.list, 22)
  return (
    <Glass rim="left" style={{ left: TABLE.left, top: TABLE.top - 20, width: TABLE.w, height: TABLE.rowH * 4 + 40, opacity: a, transform: `translateY(${((1 - a) * 30).toFixed(1)}px)` }}>
      <div style={{ height: TABLE.rowH, display: 'flex', alignItems: 'center', padding: '0 50px', borderBottom: `1px solid ${S.hair}`, marginTop: 20 }}>
        <span style={txt(40)}>Leads</span>
      </div>
      {ROWS.map((r, i) => {
        const ra = i === 0 ? arriveT(f, T.list + 6, 18) : arriveT(f, T.list + 10 + i * 6, 18) * 0.55
        return (
          <div key={i} style={{ height: TABLE.rowH, display: 'flex', alignItems: 'center', padding: '0 50px', borderBottom: i < 2 ? `1px solid ${S.hair}` : 'none', opacity: ra, background: i === 0 ? 'rgba(245,135,30,0.06)' : 'none' }}>
            <span style={{ ...txt(36), width: 420 }}>{r.src}</span>
            <span style={{ width: 400 }}><Label size={30} color={i === 0 ? S.peach : S.muted}>{r.time}</Label></span>
            {r.status && <span style={{ marginLeft: 260, ...txt(30, S.muted) }}>{r.status}</span>}
          </div>
        )
      })}
    </Glass>
  )
}

function Toast({ f }) {
  const o = live(f, T.toast, T.morning - 4, 18, 8)
  if (o <= 0) return null
  return (
    <div style={{ position: 'absolute', right: 96, top: 150, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 30px', borderRadius: 22, background: 'rgba(28,27,29,0.97)', boxShadow: `inset 0 0 0 1.5px rgba(245,135,30,0.45), 0 20px 60px rgba(0,0,0,0.6)`, opacity: o, transform: `translateX(${((1 - o) * 60).toFixed(1)}px)`, zIndex: 52, ...txt(32) }}>
      <Icon name="bell" size={34} color={S.saffron} stroke={2} />
      New enquiry. Reply already sent.
    </div>
  )
}

/* ---- 8. the follow-up trail ---- */

function Followups({ f }) {
  const draw = glideT(f, T.follow, 45)
  return (
    <>
      <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
        <line x1={NODE.x + NODE.w / 2} y1={LINE_Y} x2={1700} y2={LINE_Y} stroke={PAPER.accent} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw.toFixed(3)} 1`} />
        {[DAY3, DAY7].map((d, i) => (
          <line key={i} x1={d.x} y1={LINE_Y} x2={d.x} y2={i ? d.y - d.h / 2 : d.y + d.h / 2} stroke={PAPER.accent} strokeOpacity={0.4 * arriveT(f, i ? T.day7 : T.day3, 14)} strokeWidth="2" />
        ))}
      </svg>
      <DayCard f={f} d={DAY3} at={T.day3} day="Day 3" state="Sent" text="Checking in: any questions I can answer?" />
      <DayCard f={f} d={DAY7} at={T.day7} day="Day 7" state="Scheduled" text="Still keen? Here are this week's open slots." />
    </>
  )
}

function DayCard({ f, d, at, day, state, text, tone = 'paper', strikeAt }) {
  const a = arriveT(f, at, 20)
  if (a <= 0) return null
  const paper = tone === 'paper'
  return (
    <div style={{ position: 'absolute', left: d.x - d.w / 2, top: d.y - d.h / 2, width: d.w, height: d.h, boxSizing: 'border-box', padding: '26px 36px', borderRadius: 30, background: paper ? '#ffffff' : 'rgba(28,27,29,0.97)', boxShadow: `inset 0 0 0 1.5px ${paper ? PAPER.line : S.line}, 0 24px 60px -20px rgba(0,0,0,${paper ? 0.18 : 0.6})`, opacity: a, transform: `translateY(${((1 - a) * 24).toFixed(1)}px)`, zIndex: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Label color={paper ? PAPER.accent : S.peach}>{day}</Label>
        <Label color={paper ? PAPER.muted : S.muted}>{state}</Label>
      </div>
      <div style={{ position: 'relative', marginTop: 16, ...txt(34, paper ? PAPER.ink : S.ink), whiteSpace: 'nowrap' }}>
        {text}
        {strikeAt != null && <Strike f={f} at={strikeAt} dur={12} />}
      </div>
    </div>
  )
}

/* ---- 9. the headfake: Day 7 alone, struck; it flips into the booking ---- */

function FakeCard({ f }) {
  const flip = ramp(f, T.rehook, 8, EASE.leave)
  if (flip >= 1) return null
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scaleY(${(1 - flip).toFixed(4)})`, transformOrigin: `${FAKE_CARD.x}px ${FAKE_CARD.y}px` }}>
      <DayCard f={f} d={FAKE_CARD} at={T.fake - 20} day="Day 7" state="Scheduled" text="Still keen? Here are this week's open slots." tone="night" strikeAt={T.strike} />
    </div>
  )
}
