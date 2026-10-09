import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion'
import { S, SANS, MONO, Glass, Bar } from './stageLook.jsx'
import { SignalField } from '../cinematic/Signals.jsx'
import { arriveT, leaveT, glideT, ramp, live, spr, cl, lerp, textWidth, EASE, BEAT } from '../cinematic/motion3.js'
import { Words, Headline, Caption, Tag3, Odometer, Label, wordStarts } from '../cinematic/Kinetic3.jsx'
import { MorphPill, COL } from '../cinematic/Morph3.jsx'
import { floodState, dotState, contract } from '../cinematic/Transitions3.jsx'
import { LightSweep } from '../cinematic/Light3.jsx'
import { World3 } from '../cinematic/Camera3.jsx'
import { Shell, EndCard3, buttonState, useFonts3 } from '../cinematic/Film3.jsx'
import { Soundtrack3, cue3 } from '../cinematic/Sound3.jsx'

/*
  Brand film v3, 58.0 s, voiceless (films-2026-10-09/shot-list.md 4.1 and
  4.2). One component serves both cuts: `layout` 'wide' (1920x1080) or
  'tall' (1080x1920). The beat sheet is shared; only the layout table L
  changes. Story: stakes stack -> "What if it ran itself?" -> the "?" dot
  floods saffron and contracts into the one pill that becomes the message,
  the chip, the reply and the booked slot -> headfake -> real screens ->
  honest numbers -> the pill becomes "Book a free call".
*/

/* ---- beat sheet (frames, 30 fps; 15 = one beat at 120 BPM) ---- */
const B3 = {
  caret: [0, 15],
  openAt: 15, // one word per beat
  stakes: [90, 135, 180, 225],
  stackLast: 252, // "Memory." shrinks into the stack so all four sit there by 270
  cost: [270, 330],
  question: 390,
  converge: 435,
  dotOn: 468,
  drop: 480,
  floodHold: 495,
  pill: 510,
  msgCap: 525,
  sorted: 630,
  sortedSub: 645,
  sortedSweep: 660,
  answer: 750,
  answerTick: 780,
  booked: 870,
  reminder: 900,
  recap: 945,
  fake: 990,
  fakeLine: 1000,
  rehook: 1050,
  proof: [1095, 1210, 1310],
  proofOut: 1395,
  numbers: 1410,
  statAt: [1410, 1460, 1510],
  caveat: 1425,
  cta: 1560,
  fade: 1725,
}
export const BRAND_V3_LEN = 1740

const LAYOUT = {
  wide: {
    W: 1920, H: 1080, CX: 960,
    opener: { text: 'Your business runs on…', top: 110, size: 120 },
    big: { y: 700, size: 150 },
    stack: { top: 290, gap: 74, size: 56, centred: false },
    cost: { left: 1010, right: 96, ys: [380, 500], size: 96, align: 'left', lines: ['Enquiries wait.', 'Leads go {cold}.'] },
    q: { text: 'What if it ran {itself?}', top: 630, size: 120 },
    dropPill: { x: 960, y: 580, w: 200, h: 72 },
    msg: { x: 960, y: 590, w: 980, h: 230, text: 44 },
    chip: { x: 960, y: 590, w: 820, h: 112 },
    sub: { top: 222 },
    ghost: { left: 140, top: 330, w: 780 },
    reply: { x: 1130, y: 660, w: 1060, h: 250 },
    week: { kind: 'row', left: 190, top: 450, colW: 220, h: 290 },
    slot: { x: 190 + 3 * 220 + 110, y: 450 + 90 + 90, w: 196, h: 140 },
    reminder: { x: 960, y: 830 },
    recap: { kind: 'row', y: 600, xs: [330, 750, 1170, 1590], w: 380, h: 200 },
    fakeSize: 120,
    rehookTop: 120,
    win: { w: 1400, y: 660 },
    stats: { bigY: 690, stackYs: [236, 330], stackSize: 56, caveatY: 970, numSize: 160, labelSize: 52 },
    caps: {
      msg: 'A message {lands}.',
      sorted: '{Sorted.}',
      answer: '{Answered} in seconds.',
      booked: 'On your {calendar}. While you sleep.',
      inbox: 'Every enquiry, in one inbox.',
      consent: 'Forms signed online, then {sealed}.',
      leads: 'Leads {scored} and ready to email.',
    },
    fake: 'Too good to be {true?}',
    rehook: 'Here it is, {running}.',
  },
  tall: {
    W: 1080, H: 1920, CX: 540,
    opener: { text: 'Your business\nruns on…', top: 330, size: 130 },
    big: { y: 1250, size: 150 },
    stack: { top: 680, gap: 84, size: 64, centred: true },
    cost: { left: 72, right: 72, ys: [1200, 1330], size: 100, align: 'center', lines: ['Enquiries wait.', 'Leads go {cold}.'] },
    q: { text: 'What if it\nran {itself?}', top: 1150, size: 130 },
    dropPill: { x: 540, y: 960, w: 200, h: 72 },
    msg: { x: 540, y: 960, w: 920, h: 300, text: 46 },
    chip: { x: 540, y: 960, w: 900, h: 124 },
    sub: { top: 450 },
    ghost: { left: 72, top: 600, w: 760 },
    reply: { x: 556, y: 1080, w: 900, h: 320 },
    week: { kind: 'col', left: 140, top: 600, rowH: 104, w: 800 },
    slot: { x: 140 + 150 + 325, y: 600 + 3 * 104 + 52, w: 630, h: 88 },
    reminder: { x: 540, y: 1430 },
    recap: { kind: 'col', x: 540, ys: [560, 800, 1040, 1280], w: 820, h: 200 },
    fakeSize: 130,
    rehookTop: 300,
    win: { w: 1000, y: 1080 },
    stats: { bigY: 1130, stackYs: [430, 640], stackSize: 56, caveatY: 1520, numSize: 180, labelSize: 52 },
    caps: {
      msg: 'A message {lands}.',
      sorted: '{Sorted.}',
      answer: '{Answered}\nin seconds.',
      booked: 'On your {calendar}.\nWhile you sleep.',
      inbox: 'Every enquiry,\nin one inbox.',
      consent: 'Forms signed online,\nthen {sealed}.',
      leads: 'Leads {scored} and\nready to email.',
    },
    fake: 'Too good\nto be {true?}',
    rehook: 'Here it is,\n{running}.',
  },
}

const STAKES = ['WhatsApp threads.', 'Spreadsheets.', 'Sticky notes.', 'Memory.']

/* real captures, cropped so no client or clinic detail shows: x0..x1 and
   y0 are fractions of the 2880x1800 capture, body is the window's height */
const SHOTS = [
  { file: 'shared-inbox/01.png', title: 'Shared inbox', wide: { x0: 0.355, x1: 0.885, y0: 0.045, body: 620, focus: [0.42, 0.45] }, tall: { x0: 0.358, x1: 0.69, y0: 0.045, body: 1000, focus: [0.5, 0.4] } },
  { file: 'consent-signer/07.png', title: 'Consent and contract signer', wide: { x0: 0.31, x1: 0.69, y0: 0.64, body: 620, focus: [0.5, 0.6] }, tall: { x0: 0.31, x1: 0.69, y0: 0.33, body: 1000, focus: [0.5, 0.8] } },
  { file: 'lead-research/05.png', title: 'Lead research', wide: { x0: 0.12, x1: 0.83, y0: 0.45, body: 620, focus: [0.6, 0.6] }, tall: { x0: 0.36, x1: 0.85, y0: 0.38, body: 800, focus: [0.4, 0.5] } },
]

const STATS = [
  { value: '1,200+', label: 'client records, managed every day', stack: '1,200+ client records, managed every day', stackTall: '1,200+ client records,\nmanaged every day' },
  { value: '11', label: 'an 11-person team on one system', stack: 'An 11-person team on one system', stackTall: 'An 11-person team\non one system' },
  { value: '5', label: 'systems shipped', stack: '5 systems shipped', stackTall: '5 systems shipped' },
]

function cuesFor(L) {
  return [
    ...wordStarts(L.opener.text, B3.openAt, BEAT).map((t) => cue3('key', t + 6, 1.4)),
    ...B3.stakes.map((t) => cue3('thump', t + 4, 0.8)),
    cue3('tick', B3.cost[1] + 6, 0.6),
    cue3('flood', B3.drop + 8),
    cue3('pop', B3.pill + 4),
    cue3('pop', B3.sorted + 4),
    cue3('glass', B3.sortedSweep + 10),
    cue3('pop', B3.answer + 4),
    cue3('tick', B3.answerTick),
    cue3('click', B3.booked + 4),
    cue3('tick', B3.reminder + 4),
    cue3('whooshDown', B3.recap + 18, 0.8),
    cue3('thump', B3.fakeLine + 4),
    cue3('whoosh', B3.proof[0], 0.8),
    cue3('glass', B3.proof[0] + 25),
    cue3('whoosh', B3.proof[1] + 5),
    cue3('glass', B3.proof[1] + 25),
    cue3('whoosh', B3.proof[2] + 5),
    cue3('glass', B3.proof[2] + 25),
    cue3('whooshDown', B3.proofOut + 6, 0.8),
    ...B3.statAt.map((t) => cue3('roll', t + 24, 0.9)),
    ...B3.statAt.map((t) => cue3('tick', t + 30, 0.6)),
    cue3('end', B3.cta + 30),
  ]
}

export function ExplainerBrandV3({ layout = 'wide' }) {
  const ready = useFonts3()
  const f = useCurrentFrame()
  const L = LAYOUT[layout]
  if (!ready) return <AbsoluteFill style={{ background: S.bg }} />
  const tall = layout === 'tall'
  const inDemo = f >= B3.pill && f < B3.fake
  const inProof = f >= B3.rehook && f < B3.numbers
  return (
    <Shell f={f} fadeAt={B3.fade} glow={{ x: L.CX, y: tall ? 900 : 560 }} glowSize={0.7}>
      {f < B3.drop + 9 && <Opening f={f} L={L} tall={tall} />}
      {inDemo && <Demo f={f} L={L} tall={tall} />}
      {f >= B3.fake && f < B3.rehook + 60 && <Headline f={f} text={L.fake} at={B3.fakeLine} exit={B3.rehook - 12} size={L.fakeSize} />}
      {inProof && <Proof f={f} L={L} tall={tall} />}
      {f >= B3.numbers - 5 && f < B3.cta + 30 && <Numbers f={f} L={L} tall={tall} />}
      <MorphPill f={f} states={dropStates(L)} z={40} />
      {f >= B3.cta - 2 && <Cta f={f} L={L} tall={tall} />}
      <Tag3 f={f} text="Illustration" at={B3.pill + 10} out={B3.fake - 10} />
      <Tag3 f={f} text="Working demo · real screens" at={B3.rehook + 6} out={B3.proofOut} />
      <Soundtrack3 cues={cuesFor(L)} score="brand-v3" />
    </Shell>
  )
}

/* ---------------- 1-4. cold open, stakes stack, cost, question ---------------- */

function openerBox(L) {
  const lines = L.opener.text.split('\n')
  const w = Math.max(...lines.map((ln) => textWidth(ln, L.opener.size)))
  return { left: L.CX - w / 2, w }
}

/* where the "?" dot sits: the end of the question's last line */
function qDot(L) {
  const lines = L.q.text.split('\n')
  const last = lines[lines.length - 1]
  const s = L.q.size
  const parts = last.split(' ')
  let w = 0
  parts.forEach((p, i) => {
    const serif = p.includes('{') || p.includes('}')
    w += textWidth(p.replace(/[{}]/g, ''), serif ? s * 1.1 : s, { serif }) + (i ? s * 0.25 : 0)
  })
  const q = textWidth('?', s * 1.1, { serif: true })
  const right = L.CX + w / 2
  const lineTop = L.q.top + (lines.length - 1) * s * 1.06
  return { x: right - q * 0.55, y: lineTop + s * 0.86 }
}

function Opening({ f, L, tall }) {
  const ob = openerBox(L)
  const caretOn = (f >= 0 && f < 8) || (f >= 15 && f < 23)
  const conv = glideT(f, B3.converge, 34)
  const dot = qDot(L)
  const dim = 1 - 0.6 * ramp(f, B3.cost[0], 20, EASE.glide)
  const gone = f >= B3.drop + 9
  if (gone) return null
  return (
    <AbsoluteFill>
      <SignalField f={f} appear={[270, 276, 282, 288, 294, 300, 306, 312]} converge={conv} point={dot} opacity={0.35 * (1 - ramp(f, B3.converge + 26, 10))} seed={7} width={1.6} />
      {caretOn && <div style={{ position: 'absolute', left: ob.left - 30, top: L.opener.top + 10, width: 8, height: L.opener.size * 0.95, background: S.saffron, borderRadius: 3 }} />}
      <div style={{ position: 'absolute', left: 0, right: 0, top: L.opener.top, opacity: dim * (1 - ramp(f, B3.converge, 30)) }}>
        <Words text={L.opener.text} f={f} at={B3.openAt} stagger={BEAT} size={L.opener.size} exit={B3.converge + 6} />
      </div>
      {STAKES.map((t, i) => (
        <StakeWord key={t} f={f} L={L} i={i} text={t} ob={ob} dim={dim} conv={conv} dot={dot} />
      ))}
      {L.cost.lines.map((t, i) => (
        <div key={t} style={{ position: 'absolute', left: L.cost.left, right: L.cost.right, top: L.cost.ys[i] }}>
          <Words text={t} f={f} at={B3.cost[i]} exit={B3.question - 6} size={L.cost.size} align={L.cost.align} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: tall ? 60 : 96, right: tall ? 60 : 96, top: L.q.top }}>
        <Words text={L.q.text} f={f} at={B3.question} size={L.q.size} />
      </div>
    </AbsoluteFill>
  )
}

/* A stake noun: rises big in the centre, then shrinks into the stack
   under the opener as the next one rises; at the question it converges
   into the "?" dot. */
function StakeWord({ f, L, i, text, ob, dim, conv, dot }) {
  const at = B3.stakes[i]
  if (f < at - 1) return null
  const full = textWidth(text, L.big.size)
  const avail = L.W - (L.W > L.H ? 192 : 144)
  const size = Math.min(L.big.size, (L.big.size * avail) / full)
  const wBig = textWidth(text, size)
  const k = L.stack.size / size
  const moveAt = i < 3 ? B3.stakes[i + 1] : B3.stackLast
  const m = spr(f, moveAt)
  const big = { x: L.CX - wBig / 2, y: L.big.y - size * 0.55, s: 1 }
  const sx = L.stack.centred ? L.CX - (wBig * k) / 2 : ob.left
  const st = { x: sx, y: L.stack.top + i * L.stack.gap, s: k }
  let x = lerp(big.x, st.x, m)
  let y = lerp(big.y, st.y, m)
  let s = lerp(1, k, m)
  // converge: into the "?" dot
  x = lerp(x, dot.x, conv)
  y = lerp(y, dot.y, conv)
  s = s * (1 - 0.92 * conv)
  const o = (i === 3 && f < moveAt ? 1 : lerp(1, dim, m)) * (1 - ramp(f, B3.converge + 18, 14))
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`, opacity: o, whiteSpace: 'nowrap', color: m > 0.5 ? S.inkSoft : S.ink }}>
      <Words text={text} f={f} at={at} size={size} align="left" color={m > 0.5 ? S.inkSoft : S.ink} />
    </div>
  )
}

/* The one shape: the "?" dot floods the frame, contracts into a night
   pill, and becomes the message, the chip, the reply and the slot. */
function dropStates(L) {
  const d = qDot(L)
  const { W, H } = L
  const tall = H > W
  const night = { fill: COL.glass, line: COL.lineDim, glow: 0 }
  return [
    dotState(0, d.x, d.y, 16, COL.saffron, { o: 0 }),
    dotState(B3.dotOn, d.x, d.y, 16, COL.saffron, { o: 1, glow: 0.6 }),
    floodState(B3.drop, W, H, COL.saffron),
    contract({ at: B3.floodHold, ...L.dropPill, r: 999, ...night, line: COL.lineSaff }, 15),
    { at: B3.pill, ...L.msg, r: 44, ...night, content: <MsgContent L={L} /> },
    { at: B3.sorted, ...L.chip, r: 999, fill: COL.glass, line: COL.lineSaff, glow: 0.35, content: <ChipContent tall={tall} /> },
    { at: B3.answer, ...L.reply, r: 44, fill: COL.out, line: COL.lineSaff, glow: 0.2, content: <ReplyContent L={L} /> },
    { at: B3.booked, ...L.slot, r: 22, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.7, content: <SlotContent tall={tall} /> },
    { at: B3.recap, ...recapSlot(L), r: 26, content: <SlotContent tall={tall} recap /> },
    { at: B3.fake, ...recapSlot(L), r: 26, o: 0, ease: { dur: 1 } },
  ]
}

function recapSlot(L) {
  const r = L.recap
  return r.kind === 'row' ? { x: r.xs[3], y: r.y, w: r.w, h: r.h } : { x: r.x, y: r.ys[3], w: r.w, h: 150 }
}

const bubbleText = (size) => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: '-0.015em', lineHeight: 1.3, color: S.ink })

function MsgContent({ L }) {
  return (
    <div style={{ padding: '36px 46px', boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={bubbleText(L.msg.text)}>Hi! Do you have a slot this week?</div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Label color={S.peach}>WhatsApp</Label>
        <Label>11:04 pm</Label>
      </div>
    </div>
  )
}
function ChipContent({ tall }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, ...bubbleText(tall ? 38 : 40) }}>
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: S.saffron, boxShadow: '0 0 14px rgba(245,135,30,0.8)' }} />
      New enquiry <span style={{ color: S.muted }}>·</span> Booking request
    </div>
  )
}
function ReplyContent({ L }) {
  return (
    <div style={{ padding: '34px 46px', boxSizing: 'border-box', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={bubbleText(L.msg.text - 4)}>Yes! Thursday at 6 pm is free. Shall I hold it for you?</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
        <Label>11:04 pm</Label>
        <svg width={34} height={26} viewBox="0 0 30 24" fill="none" stroke={S.saffron} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 13l5 5L18 6" />
          <path d="M12 16l2 2L25 6" />
        </svg>
      </div>
    </div>
  )
}
function SlotContent({ tall, recap }) {
  const dark = { fontFamily: SANS, fontWeight: 500, letterSpacing: '-0.02em', color: S.onSaffron }
  if (tall || recap)
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, ...dark, fontSize: recap && !tall ? 34 : 38, whiteSpace: 'nowrap' }}>
        {recap && !tall ? (
          <div style={{ textAlign: 'center', lineHeight: 1.25 }}>
            Thu 6:00 pm
            <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: '0.08em' }}>Booked</div>
          </div>
        ) : (
          <>
            Thu 6:00 pm <span style={{ opacity: 0.6 }}>·</span> Booked
          </>
        )}
      </div>
    )
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, ...dark }}>
      <div style={{ fontSize: 34 }}>6:00 pm</div>
      <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: '0.08em' }}>Booked</div>
    </div>
  )
}

/* ---------------- 6-9. the demo around the pill ---------------- */

function Demo({ f, L, tall }) {
  const c = L.caps
  return (
    <AbsoluteFill>
      <Caption f={f} text={c.msg} at={B3.msgCap} exit={B3.sorted - 8} />
      <Caption f={f} text={c.sorted} at={B3.sorted + 2} exit={B3.answer - 8} />
      <div style={{ position: 'absolute', left: tall ? 72 : 96, right: tall ? 72 : 96, top: L.sub.top + (tall ? 0 : 0), zIndex: 32 }}>
        <Words text={tall ? 'Your AI assistant reads it\nand files it.' : 'Your AI assistant reads it and files it.'} f={f} at={B3.sortedSub} exit={B3.answer - 8} size={tall ? 44 : 38} align="left" color={S.inkSoft} stagger={2} tracking={-0.02} />
      </div>
      {/* the light sweep across the chip */}
      {f >= B3.sortedSweep && f < B3.sortedSweep + 26 && (
        <div style={{ position: 'absolute', left: L.chip.x - L.chip.w / 2, top: L.chip.y - L.chip.h / 2, width: L.chip.w, height: L.chip.h, borderRadius: 999, overflow: 'hidden', zIndex: 45 }}>
          <LightSweep f={f} at={B3.sortedSweep} strength={1.6} />
        </div>
      )}
      <Caption f={f} text={c.answer} at={B3.answer + 2} exit={B3.booked - 8} />
      <Ghost f={f} L={L} />
      <Caption f={f} text={c.booked} at={B3.booked + 2} exit={B3.fake - 1} />
      <Week f={f} L={L} tall={tall} />
      <Recap f={f} L={L} tall={tall} />
    </AbsoluteFill>
  )
}

/* the original message, back faint on the left so the reply reads as a chat */
function Ghost({ f, L }) {
  const o = live(f, B3.answer + 10, B3.booked - 6)
  if (o <= 0) return null
  return (
    <div style={{ position: 'absolute', left: L.ghost.left, top: L.ghost.top, width: L.ghost.w, boxSizing: 'border-box', padding: '26px 36px', borderRadius: '36px 36px 36px 10px', background: 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 1.5px ${S.line}`, opacity: o * 0.7, transform: `translateY(${((1 - o) * 16).toFixed(1)}px)`, zIndex: 18 }}>
      <div style={bubbleText(34)}>Hi! Do you have a slot this week?</div>
      <div style={{ marginTop: 8, textAlign: 'right' }}>
        <Label>11:04 pm</Label>
      </div>
    </div>
  )
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function Week({ f, L, tall }) {
  const o = live(f, B3.booked + 4, B3.recap, 20, 12)
  const rem = live(f, B3.reminder, B3.recap, 16, 10)
  if (o <= 0) return null
  const wk = L.week
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, opacity: o, transform: `translateY(${((1 - o) * 30).toFixed(1)}px)`, zIndex: 15 }}>
        {wk.kind === 'row' ? (
          <Glass rim="top" style={{ left: wk.left - 20, top: wk.top - 20, width: wk.colW * 7 + 40, height: wk.h + 40 }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{ position: 'absolute', left: 20 + i * wk.colW, top: 20, width: wk.colW, height: wk.h, borderLeft: i ? `1px solid ${S.hair}` : 'none', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginTop: 22 }}>
                  <Label size={30} color={i === 3 ? S.peach : S.muted}>{d}</Label>
                </div>
              </div>
            ))}
          </Glass>
        ) : (
          <Glass rim="left" style={{ left: wk.left - 30, top: wk.top - 20, width: wk.w + 60, height: wk.rowH * 7 + 40 }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{ position: 'absolute', left: 30, top: 20 + i * wk.rowH, width: wk.w, height: wk.rowH, borderTop: i ? `1px solid ${S.hair}` : 'none', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                <Label size={32} color={i === 3 ? S.peach : S.muted}>{d}</Label>
              </div>
            ))}
          </Glass>
        )}
      </div>
      {rem > 0 && (
        <div style={{ position: 'absolute', left: L.reminder.x - 200, width: 400, top: L.reminder.y - 36, height: 72, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, background: 'rgba(28,27,29,0.96)', boxShadow: `inset 0 0 0 1.5px ${S.line}`, opacity: rem, transform: `translateY(${((1 - rem) * 20).toFixed(1)}px)`, zIndex: 16, ...bubbleText(32) }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: S.green }} />
          Reminder set
        </div>
      )}
    </>
  )
}

/* the camera pulls back: message, chip and reply return beside the slot */
function Recap({ f, L, tall }) {
  if (f < B3.recap) return null
  const r = L.recap
  const items = [
    <div key="m" style={{ ...bubbleText(30), padding: '0 30px' }}>Hi! Do you have a slot this week?</div>,
    <div key="c" style={{ display: 'flex', alignItems: 'center', gap: 14, ...bubbleText(30) }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: S.saffron }} />
      Booking request
    </div>,
    <div key="r" style={{ ...bubbleText(30), padding: '0 30px' }}>Thursday at 6 pm is free.</div>,
  ]
  const fills = ['rgba(255,255,255,0.06)', 'rgba(28,27,29,0.96)', 'rgba(58,38,22,0.98)']
  return (
    <>
      {items.map((it, i) => {
        const a = arriveT(f, B3.recap + 6 + i * 6, 20)
        const x = r.kind === 'row' ? r.xs[i] : r.x
        const y = r.kind === 'row' ? r.y : r.ys[i]
        const h = r.kind === 'row' ? r.h : 150
        return (
          <div key={i} style={{ position: 'absolute', left: x - r.w / 2, top: y - h / 2, width: r.w, height: h, borderRadius: i === 1 ? 999 : 30, background: fills[i], boxShadow: `inset 0 0 0 1.5px ${i ? 'rgba(245,135,30,0.4)' : S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: a, transform: `translate(${r.kind === 'row' ? ((1 - a) * -40).toFixed(1) : 0}px, ${r.kind === 'row' ? 0 : ((1 - a) * -40).toFixed(1)}px) scale(${(0.94 + 0.06 * a).toFixed(4)})`, zIndex: 19 }}>
            {it}
          </div>
        )
      })}
    </>
  )
}

/* ---------------- 11-14. rehook and the real screens ---------------- */

function Proof({ f, L, tall }) {
  const c = L.caps
  const cw = L.win.w
  const gap = cw + 600
  const wx = (i) => L.CX + i * gap
  const fx = (i, k) => {
    const s = SHOTS[i][tall ? 'tall' : 'wide']
    return { x: wx(i) - cw / 2 + cw * s.focus[0], y: L.win.y - s.body / 2 + 32 + s.body * s.focus[1] }
  }
  // one camera: rise in, slow push on each window, a fast push-through to the next
  // tall frames are narrow: a gentler push, straight in
  const pz = tall ? [1.04, 1.04, 1.06] : [1.08, 1.08, 1.15]
  const pf = tall ? [0, 0, 0] : [0.35, 0.35, 0.5]
  const home = (i) => ({ x: wx(i), y: L.win.y })
  const raw = [
    { x: L.CX, y: L.win.y, s: 1 },
    { at: B3.proof[0] + 10, dur: 90, ...lerpPt(home(0), fx(0), pf[0]), s: pz[0] },
    { at: B3.proof[1] - 4, dur: 14, ...home(1), s: 1, ease: EASE.glide },
    { at: B3.proof[1] + 14, dur: 80, ...lerpPt(home(1), fx(1), pf[1]), s: pz[1] },
    { at: B3.proof[2] - 4, dur: 14, ...home(2), s: 1, ease: EASE.glide },
    { at: B3.proof[2] + 14, dur: 70, ...lerpPt(home(2), fx(2), pf[2]), s: pz[2] },
  ]
  // World3 centres the camera point in frame; the windows sit at L.win.y, so offset every key
  const keys = raw.map((k) => ({ ...k, y: k.y - (L.win.y - L.H / 2) }))
  // during the rehook line the window waits low, then settles as the line leaves
  const rise = arriveT(f, B3.rehook + 8, 30)
  const settleUp = arriveT(f, B3.proof[0] - 4, 24)
  const shrink = ramp(f, B3.proofOut, 14, EASE.glide)
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', inset: 0, opacity: 1 - shrink, transform: `translateY(${((1 - rise) * 500 + (1 - settleUp) * (tall ? 380 : 200)).toFixed(1)}px) scale(${(1 - 0.9 * shrink).toFixed(4)})`, transformOrigin: `${L.CX}px ${L.win.y}px` }}>
        <World3 f={f} keys={keys} blur blurAbove={20} id="brand-push">
          {SHOTS.map((s, i) => (
            <ShotWindow key={s.file} f={f} s={s} crop={s[tall ? 'tall' : 'wide']} x={wx(i)} y={L.win.y} w={cw} landAt={i === 0 ? B3.proof[0] : B3.proof[i] + 10} />
          ))}
        </World3>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: tall ? 560 : 230, background: 'linear-gradient(180deg, rgba(11,11,12,0.92) 55%, rgba(11,11,12,0))', opacity: ramp(f, B3.proof[0] - 10, 12), zIndex: 28 }} />
      <Headline f={f} text={L.rehook} at={B3.rehook} exit={B3.proof[0] + 6} size={tall ? 120 : 110} top={L.rehookTop} />
      <Caption f={f} text={c.inbox} at={B3.proof[0] + 14} exit={B3.proof[1] - 8} />
      <Caption f={f} text={c.consent} at={B3.proof[1] + 6} exit={B3.proof[2] - 8} />
      <Caption f={f} text={c.leads} at={B3.proof[2] + 6} exit={B3.proofOut - 4} />
    </AbsoluteFill>
  )
}
const lerpPt = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) })

const CAP_W = 2880
const CAP_H = 1800
function ShotWindow({ f, s, crop, x, y, w, landAt }) {
  const body = crop.body
  const bar = 64
  const imgW = w / (crop.x1 - crop.x0)
  const imgH = (imgW * CAP_H) / CAP_W
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - (body + bar) / 2, width: w, height: body + bar }}>
      <Glass rim="left" style={{ left: 0, top: 0, width: w, height: body + bar, overflow: 'hidden' }}>
        <Bar title={s.title} label="working demo" size={30} />
        <div style={{ position: 'relative', width: w, height: body, overflow: 'hidden' }}>
          <Img src={staticFile(`walkthroughs/${s.file}`)} style={{ position: 'absolute', left: -crop.x0 * imgW, top: -crop.y0 * imgH, width: imgW, height: imgH, maxWidth: 'none' }} />
          <LightSweep f={f} at={landAt + 6} dur={26} />
        </div>
      </Glass>
    </div>
  )
}

/* ---------------- 15. the numbers ---------------- */

function Numbers({ f, L, tall }) {
  const st = L.stats
  const out = leaveT(f, B3.cta + 2, 10)
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {STATS.map((s, i) => {
        const at = B3.statAt[i]
        const next = B3.statAt[i + 1]
        const leave = next == null ? 0 : ramp(f, next - 2, 16, EASE.glide)
        if (f < at - 1) return null
        const a = arriveT(f, at, 20)
        const isLast = i === STATS.length - 1
        // the last number hands over to the pill at the CTA
        const handOff = isLast ? ramp(f, B3.cta, 4) : 0
        return (
          <div key={i}>
            {leave < 1 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: st.bigY - 210, height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: a * (1 - leave), transform: `translateY(${(-leave * 160).toFixed(1)}px) scale(${(1 - 0.5 * leave).toFixed(4)})` }}>
                <div style={{ position: 'absolute', left: L.CX - 230, top: 210 - 230 - 30, width: 460, height: 460, borderRadius: '50%', boxShadow: '0 0 0 1.5px rgba(255,200,154,0.35), 0 0 60px rgba(245,135,30,0.18), inset 0 0 60px rgba(245,135,30,0.10)', opacity: arriveT(f, at - 4, 24) }} />
                <div style={{ position: 'relative', opacity: 1 - handOff }}>
                  <Odometer f={f} at={at} to={s.value} size={st.numSize} color={S.ink} />
                </div>
                <div style={{ position: 'relative', marginTop: 18, fontFamily: SANS, fontWeight: 500, fontSize: st.labelSize, letterSpacing: '-0.03em', color: S.inkSoft, opacity: arriveT(f, at + 12, 18) * (1 - (isLast ? leaveT(f, B3.cta, 8) : 0)) }}>{s.label}</div>
              </div>
            )}
            {next != null && (
              <div style={{ position: 'absolute', left: tall ? 72 : 96, right: tall ? 72 : 96, top: st.stackYs[i] }}>
                <Words text={tall ? s.stackTall : s.stack} f={f} at={next + 6} size={st.stackSize} stagger={2} color={S.inkSoft} tracking={-0.03} />
              </div>
            )}
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: st.caveatY, textAlign: 'center', opacity: arriveT(f, B3.caveat, 20) }}>
        <Label size={28}>{tall ? 'From live client work.' : 'From live client work. Names kept private.'}</Label>
        {tall && (
          <div style={{ marginTop: 10 }}>
            <Label size={28}>Names kept private.</Label>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

/* ---------------- 16. the "5" becomes the button ---------------- */

function Cta({ f, L, tall }) {
  const st = L.stats
  const five = { x: L.CX, y: st.bigY - 30, w: st.numSize * 0.7, h: st.numSize * 0.95 }
  const states = [
    { at: 0, ...five, r: 40, fill: [245, 135, 30, 0], line: [245, 135, 30, 0], glow: 0, o: 0 },
    { at: B3.cta, ...five, r: 40, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.6, o: 1, ease: { dur: 6, curve: EASE.arrive } },
    buttonState(B3.cta + 8, tall),
  ]
  return (
    <>
      <EndCard3 f={f} at={B3.cta + 4} tall={tall} />
      <MorphPill f={f} states={states} z={41} />
    </>
  )
}

export const ExplainerBrandV3Tall = () => <ExplainerBrandV3 layout="tall" />
