import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { C, SANS, TRACK, useFonts, rise, pop, tween, lerp, easeInOut } from '../shared.jsx'
import { DuskScene, PaperGround, sheetClip, rng } from '../DuskScene.jsx'
import { KineticText, PillLabel } from '../KineticText.jsx'
import { FlowGraph } from '../FlowGraph.jsx'
import { ProofBeat, proofLength } from './ProofBeat.jsx'
import { EndCard } from '../EndCard.jsx'
import { ChatBubble, Toast, EmailCard, SheetCard, CalendarCard, StickyNote, Chip } from './illustrative.jsx'

/*
  The brand explainer, ~55s. One component, two layouts (16:9 and 9:16):
  every position lives in LAYOUT so the vertical cut is recomposed, not
  cropped.

    1  dusk   "Your business runs on…" WhatsApp threads, spreadsheets, sticky notes, memory
    2  paper  the chaos piles up: "Every enquiry, re-typed by hand."
    3  paper  "What if it ran itself?" the fragments snap into a flow that runs
    4  paper  proof: real captures of three running apps, then the counts
    5  dusk   "Enquiries answered… Without anyone typing." and the contact card
*/

/* Paper-world beats (frames local to the paper world). */
const B = {
  chaosIn: 8,
  chaosLine: 120,
  chaosLineOut: 250,
  flowLine: 262,
  snap: 292,
  wires: 348,
  formLit: 368,
  swapLine: 562,
  flowOut: 636,
  proofIn: 640,
}
B.proofOut = B.proofIn + proofLength
B.countIn = B.proofOut + 12
B.exit = B.countIn + 156

const PAPER_IN = 240 // global frame the paper sheet starts to rise
const PAPER_LEN = B.exit + 42 // paper world length, including its exit
const OUTRO = PAPER_IN + B.exit // end card starts as the sheet slides away
export const BRAND_LEN = OUTRO + 306

const WIDE = {
  intro: { head: { top: 262, size: 100, text: 'Your business runs on…' }, ticker: { top: 398, size: 140, max: 1728 } },
  chaos: {
    // x, y are centres; r is rotation in degrees
    email: { x: 610, y: 320, r: -4 },
    chatA: { x: 1330, y: 270, r: 3 },
    toast: { x: 1040, y: 420, r: -2 },
    sticky: { x: 330, y: 560, r: -8 },
    sheet: { x: 770, y: 650, r: -3 },
    calendar: { x: 1330, y: 640, r: 4 },
    chatB: { x: 420, y: 850, r: -5 },
    chatC: { x: 1580, y: 880, r: -3 },
  },
  chaosLine: { size: 112 },
  flowLine: { top: 100, size: 88, size2: 88 },
  node: { w: 440, h: 144 },
  nodes: {
    form: { x: 420, y: 420 },
    ai: { x: 960, y: 420 },
    crm: { x: 1500, y: 420 },
    wa: { x: 420, y: 710 },
    cal: { x: 960, y: 710 },
    follow: { x: 1500, y: 710 },
  },
  ports: [
    ['r', 'l'],
    ['r', 'l'],
    ['b', 't', 150],
    ['r', 'l'],
    ['r', 'l'],
  ],
  clock: { x: 200, y: 268 },
  reply: { x: 120, y: 812, w: 600 },
  counters: { pill: 300, top: 400, dir: 'row', num: 136, caveatTop: 740 },
}

const TALL = {
  intro: { head: { top: 520, size: 100, text: 'Your business\nruns on…' }, ticker: { top: 800, size: 124, max: 888 } },
  chaos: {
    email: { x: 420, y: 330, r: -4 },
    chatA: { x: 680, y: 560, r: 3 },
    toast: { x: 400, y: 760, r: -2 },
    sheet: { x: 560, y: 1010, r: -3 },
    calendar: { x: 740, y: 1330, r: 4 },
    sticky: { x: 270, y: 1340, r: -8 },
    chatB: { x: 340, y: 1610, r: -5 },
    chatC: { x: 740, y: 1690, r: -3 },
  },
  chaosLine: { size: 104 },
  flowLine: { top: 150, size: 100, size2: 84 },
  node: { w: 620, h: 140 },
  nodes: {
    form: { x: 470, y: 530 },
    ai: { x: 610, y: 752 },
    crm: { x: 470, y: 974 },
    wa: { x: 610, y: 1196 },
    cal: { x: 470, y: 1418 },
    follow: { x: 610, y: 1640 },
  },
  ports: [
    ['b', 't'],
    ['b', 't'],
    ['b', 't'],
    ['b', 't'],
    ['b', 't'],
  ],
  clock: { x: 540, y: 1754, centre: true },
  reply: null,
  counters: { pill: 330, top: 520, dir: 'column', num: 160, caveatTop: 1580 },
}

export function ExplainerBrand() {
  useFonts()
  const frame = useCurrentFrame()
  const { width: W, height: H } = useVideoConfig()
  const L = H > W ? TALL : WIDE
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS }}>
      <Sequence durationInFrames={PAPER_IN + 60}>
        <IntroDusk L={L} />
      </Sequence>
      <Sequence from={OUTRO}>
        {/* The card's own main line is the promise, so no headline runs before it. */}
        <EndCard frame={frame - OUTRO} />
      </Sequence>
      <Sequence from={PAPER_IN} durationInFrames={PAPER_LEN}>
        <PaperWorld L={L} W={W} H={H} />
      </Sequence>
    </AbsoluteFill>
  )
}

/* ---------------- Beat 1: dusk ---------------- */

const TICKER = ['WhatsApp threads.', 'Spreadsheets.', 'Sticky notes.', 'Memory.']
const TICK_AT = [50, 86, 122, 158]

function IntroDusk({ L }) {
  const f = useCurrentFrame()
  const fade = tween(f, 0, 26)
  const ridges = interpolate(rise(f, 0, { stiffness: 40 }), [0, 1], [0.35, 1])
  return (
    <DuskScene frame={f} push={tween(f, 0, PAPER_IN + 60, easeInOut)} rise={ridges} fade={fade}>
      <div style={{ position: 'absolute', left: 96, right: 96, top: L.intro.head.top }}>
        <KineticText text={L.intro.head.text} start={14} stagger={5} size={L.intro.head.size} align="center" color={C.inkSoft} exit={PAPER_IN - 4} />
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, top: L.intro.ticker.top, display: 'flex', justifyContent: 'center' }}>
        {TICKER.map((t, i) => {
          if (f < TICK_AT[i] - 2 || (i < TICKER.length - 1 && f > TICK_AT[i + 1] + 20)) return null
          const last = i === TICKER.length - 1
          return (
            <div key={t} style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              {last ? (
                <Forgetting text={t} f={f} start={TICK_AT[i]} size={L.intro.ticker.size} />
              ) : (
                <KineticText text={t} start={TICK_AT[i]} stagger={5} exit={TICK_AT[i + 1] - 6} exitStagger={2} size={L.intro.ticker.size} color={C.peach} align="center" maxWidth={L.intro.ticker.max} />
              )}
            </div>
          )
        })}
      </div>
    </DuskScene>
  )
}

/* "Memory." arrives like the others, then its letters fade out of step with
   each other, as if being forgotten, just before the paper covers it. */
function Forgetting({ text, f, start, size }) {
  const r = rng(99)
  const letters = text.split('')
  const s = rise(f, start, { stiffness: 80 })
  return (
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: TRACK, color: C.accent, lineHeight: 1.04, opacity: Math.min(1, s * 1.5), transform: `translateY(${((1 - s) * 0.5).toFixed(3)}em)`, filter: s < 0.98 ? `blur(${((1 - s) * 16).toFixed(2)}px)` : undefined }}>
      {letters.map((ch, i) => {
        const at = start + 44 + r() * 30
        const o = 1 - 0.82 * tween(f, at, at + 22)
        const b = tween(f, at, at + 22) * 6
        return (
          <span key={i} style={{ display: 'inline-block', opacity: o, filter: b > 0.1 ? `blur(${b.toFixed(2)}px)` : undefined }}>
            {ch}
          </span>
        )
      })}
    </div>
  )
}

/* ---------------- Beats 2 to 4: the paper world ---------------- */

function PaperWorld({ L, W, H }) {
  const f = useCurrentFrame()
  const inP = rise(f, 0, { stiffness: 55 })
  const outP = rise(f, B.exit, { stiffness: 55 })
  const p = f < B.exit ? inP : 1 - outP
  return (
    <AbsoluteFill style={{ clipPath: sheetClip(p, H), boxShadow: '0 -30px 80px rgba(0,0,0,0.4)' }}>
      <PaperGround>
        <AbsoluteFill style={{ transform: `translateY(${((1 - inP) * 140 + outP * 160).toFixed(2)}px)` }}>
          {f < B.flowOut + 40 && <ChaosAndFlow L={L} W={W} H={H} f={f} />}
          {f > B.proofIn - 10 && f < B.proofOut + 40 && <ProofBeat f={f - B.proofIn} W={W} H={H} />}
          {f > B.countIn - 10 && <Counters L={L} f={f} tall={H > W} />}
        </AbsoluteFill>
      </PaperGround>
    </AbsoluteFill>
  )
}

/* The chaos items, each bound to the flow node it becomes. */
const ITEMS = [
  { id: 'email', node: 'ai', w: 540, h: 150, at: 0, from: [-1, -0.6] },
  { id: 'chatA', node: 'wa', w: 470, h: 140, at: 8, from: [1, -0.5] },
  { id: 'toast', node: 'form', w: 480, h: 110, at: 16, from: [0.3, -1] },
  { id: 'sheet', node: 'crm', w: 620, h: 330, at: 26, from: [-0.7, 1] },
  { id: 'calendar', node: 'cal', w: 420, h: 370, at: 36, from: [1, 0.6] },
  { id: 'sticky', node: 'follow', w: 270, h: 240, at: 46, from: [-1, 0.2] },
  { id: 'chatB', node: 'wa', w: 400, h: 110, at: 56, from: [-0.6, 1] },
  { id: 'chatC', node: 'wa', w: 420, h: 110, at: 64, from: [1, 1] },
]

function renderItem(id) {
  switch (id) {
    case 'email':
      return <EmailCard subject="Re: Fwd: Re: booking change" width={540} />
    case 'chatA':
      return <ChatBubble text="Hi, is Tuesday evening free?" time="11:02 pm" width={470} />
    case 'chatB':
      return <ChatBubble text="What are your fees?" width={400} />
    case 'chatC':
      return <ChatBubble text="Can I move to 5 pm?" width={420} />
    case 'toast':
      return <Toast icon="phone" title="3 missed calls" sub="While you were with a client" width={480} />
    case 'sheet':
      return (
        <SheetCard
          title="bookings_final_v3.xlsx"
          width={620}
          cols={['Client', 'Slot', 'Status']}
          colW={['34%', '33%', '33%']}
          rows={[
            ['Client 014', 'Tue 5 pm', { t: 'Paid?', tone: 'amber' }],
            ['Client 014', { t: 'Tue 5 pm', tone: 'red' }, 'Booked'],
            ['Client 027', { t: 'Tue 5 pm', tone: 'red' }, 'Booked'],
            [{ t: '#REF!', tone: 'red' }, '', { t: 'Call back', tone: 'dim' }],
          ]}
        />
      )
    case 'calendar':
      return <CalendarCard day="Tuesday" width={420} />
    case 'sticky':
      return <StickyNote text="Call back re: fees??" width={270} />
    default:
      return null
  }
}

const NODE_DEFS = [
  { id: 'form', label: 'Web form', icon: 'form', sub: 'Any time of day', subLit: 'Enquiry, 11:04 pm' },
  { id: 'ai', label: 'AI agent', icon: 'spark', sub: 'Reads every message', subLit: 'Sorted and drafted' },
  { id: 'crm', label: 'CRM', icon: 'database', sub: 'One record', subLit: 'Lead saved' },
  { id: 'wa', label: 'WhatsApp reply', icon: 'chat', sub: 'Instant', subLit: 'Sent in seconds' },
  { id: 'cal', label: 'Calendar', icon: 'calendar', sub: 'Live availability', subLit: 'Slot offered' },
  { id: 'follow', label: 'Follow-up', icon: 'repeat', sub: 'Automatic', subLit: 'Day 3 and Day 7' },
]
const RUN = [
  { run: 378, dur: 22 },
  { run: 408, dur: 22 },
  { run: 438, dur: 34 },
  { run: 488, dur: 22 },
  { run: 518, dur: 22 },
]

function ChaosAndFlow({ L, W, H, f }) {
  // Focus pull: the pile softens while the line reads, then sharpens again
  // just before it snaps into the flow.
  const focus = tween(f, B.chaosLine - 6, B.chaosLine + 20) * (1 - tween(f, B.chaosLineOut - 6, B.snap - 6))
  const out = rise(f, B.flowOut)
  const snapAt = (i) => B.snap + i * 5

  const nodeAppear = {}
  ITEMS.forEach((it, i) => {
    if (nodeAppear[it.node] == null) nodeAppear[it.node] = snapAt(i) + 14
  })
  const nodes = NODE_DEFS.map((n, i) => ({
    ...n,
    ...L.nodes[n.id],
    w: L.node.w,
    h: L.node.h,
    labelSize: 34,
    subSize: 28,
    appear: nodeAppear[n.id],
    lit: i === 0 ? B.formLit : RUN[i - 1].run + RUN[i - 1].dur,
  }))
  const edges = RUN.map((r, i) => ({
    from: NODE_DEFS[i].id,
    to: NODE_DEFS[i + 1].id,
    fp: L.ports[i][0],
    tp: L.ports[i][1],
    bend: L.ports[i][2],
    show: B.wires + i * 4,
    run: r.run,
    dur: r.dur,
  }))
  const waLit = RUN[2].run + RUN[2].dur

  return (
    <AbsoluteFill>
      {/* the pile */}
      <AbsoluteFill style={{ filter: focus > 0.01 ? `blur(${(focus * 5).toFixed(2)}px)` : undefined }}>
        {ITEMS.map((it, i) => {
          const pos = L.chaos[it.id]
          const target = L.nodes[it.node]
          const a = rise(f, B.chaosIn + it.at, { stiffness: 55, damping: 18 })
          const s = rise(f, snapAt(i), { stiffness: 70 })
          if (s > 0.995) return null
          const ph = i * 1.7
          const driftX = Math.sin(f * 0.021 + ph) * 10
          const driftY = Math.cos(f * 0.017 + ph) * 8
          const x0 = pos.x + it.from[0] * 900 * (1 - a) + driftX
          const y0 = pos.y + it.from[1] * 700 * (1 - a) + driftY
          const x = lerp(x0, target.x, s)
          const y = lerp(y0, target.y, s)
          const rot = lerp(pos.r + Math.sin(f * 0.015 + ph) * 1.2 + (1 - a) * it.from[0] * 14, 0, s)
          const sc = lerp(1, Math.min(L.node.w / it.w, L.node.h / it.h), s)
          return (
            <div
              key={it.id}
              style={{
                position: 'absolute',
                left: x - it.w / 2,
                top: y - it.h / 2,
                width: it.w,
                transform: `rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`,
                opacity: Math.min(1, a * 2) * (1 - tween(s, 0.45, 0.8, (t) => t)),
                zIndex: i,
              }}
            >
              {renderItem(it.id)}
            </div>
          )
        })}
      </AbsoluteFill>
      {/* paper scrim behind the line */}
      <AbsoluteFill style={{ background: `radial-gradient(60% 45% at 50% 50%, rgba(245,243,239,${(0.9 * focus).toFixed(3)}), rgba(245,243,239,${(0.55 * focus).toFixed(3)}) 100%)` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 96px' }}>
        {f < B.chaosLineOut + 40 && (
          <KineticText text={'Every enquiry,\n{re-typed by hand.}'} frame={f} start={B.chaosLine} stagger={5} exit={B.chaosLineOut} size={L.chaosLine.size} color={C.inkDark} accent={C.accentDeep} align="center" />
        )}
      </AbsoluteFill>

      {/* the flow */}
      <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined, transform: `scale(${(1 - out * 0.06).toFixed(4)})` }}>
        <div style={{ position: 'absolute', left: 96, right: 96, top: L.flowLine.top }}>
          <KineticText text={H > W ? 'What if it\n{ran itself?}' : 'What if it {ran itself?}'} frame={f} start={B.flowLine} stagger={5} exit={B.swapLine} size={L.flowLine.size} color={C.inkDark} accent={C.accentDeep} align="center" />
        </div>
        <div style={{ position: 'absolute', left: 96, right: 96, top: L.flowLine.top }}>
          <KineticText text={H > W ? 'Every enquiry,\n{answered in seconds.}' : 'Every enquiry, {answered in seconds.}'} frame={f} start={B.swapLine + 10} stagger={4} size={L.flowLine.size2} color={C.inkDark} accent={C.accentDeep} align="center" />
        </div>
        <FlowGraph nodes={nodes} edges={edges} frame={f} width={W} height={H} uid="brand" />
        {L.clock && (
          <div style={{ position: 'absolute', left: L.clock.centre ? 0 : L.clock.x, right: L.clock.centre ? 0 : undefined, top: L.clock.y, display: 'flex', justifyContent: L.clock.centre ? 'center' : 'flex-start', opacity: rise(f, B.formLit - 6), transform: `translateY(${(1 - pop(f, B.formLit - 6)) * 20}px)` }}>
            <Chip icon="moon" dark size={30}>{L.clock.centre ? '11:04 pm · replied in seconds' : '11:04 pm'}</Chip>
          </div>
        )}
        {L.reply && (
          <div style={{ position: 'absolute', left: L.reply.x, top: L.reply.y, opacity: rise(f, waLit + 4), transform: `translateY(${(1 - pop(f, waLit + 4)) * 30}px) scale(${0.94 + 0.06 * pop(f, waLit + 4)})`, transformOrigin: '20% 0' }}>
            <ChatBubble side="out" width={L.reply.w} text="Hi! Thanks for getting in touch. Here are this week’s open slots." time="11:04 pm" tag="Replied in seconds" />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

const COUNTS = [
  { n: 1200, fmt: (v) => v.toLocaleString('en-IN'), suffix: '+', label: 'client records', caveat: true },
  { n: 11, fmt: (v) => String(v), suffix: '', label: 'therapists on one system', caveat: true },
  { n: 5, fmt: (v) => String(v), suffix: '', label: 'systems shipped', caveat: false },
]

function Counters({ L, f, tall }) {
  const c = L.counters
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, top: c.pill, display: 'flex', justifyContent: 'center', opacity: rise(f, B.countIn), transform: `translateY(${(1 - rise(f, B.countIn)) * 20}px)` }}>
        <PillLabel size={28}>The work so far</PillLabel>
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, top: c.top, display: 'flex', flexDirection: c.dir, justifyContent: 'center', alignItems: 'center', gap: tall ? 70 : 0 }}>
        {COUNTS.map((k, i) => {
          const a = rise(f, B.countIn + 8 + i * 10, { stiffness: 70 })
          const p = tween(f, B.countIn + 8 + i * 10, B.countIn + 58 + i * 10, easeInOut)
          const v = Math.round(k.n * p)
          return (
            <div key={k.label} style={{ display: 'flex', alignItems: 'center' }}>
              {!tall && i > 0 && <div style={{ width: 1.5, height: 220, background: C.cardLine, opacity: a }} />}
              <div style={{ width: tall ? 880 : 560, textAlign: 'center', opacity: Math.min(1, a * 1.5), transform: `translateY(${((1 - a) * 40).toFixed(2)}px)`, filter: a < 0.98 ? `blur(${((1 - a) * 10).toFixed(2)}px)` : undefined }}>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: c.num, letterSpacing: TRACK, lineHeight: 1, color: C.inkDark, fontVariantNumeric: 'tabular-nums' }}>
                  {k.fmt(v)}
                  <span style={{ color: C.accent, opacity: p > 0.995 ? 1 : 0 }}>{k.suffix}</span>
                </div>
                <div style={{ marginTop: 18, fontSize: tall ? 36 : 34, fontWeight: 500, letterSpacing: '-0.02em', color: C.mutedDark, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                  {k.label}
                  {k.caveat && <span style={{ color: C.accent, fontSize: tall ? 36 : 34 }}>*</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, top: c.caveatTop, textAlign: 'center', fontSize: 26, fontWeight: 500, color: C.mutedDark, opacity: rise(f, B.countIn + 50) }}>
        <span style={{ color: C.accent }}>*</span> Row counts from a live clinic system.
      </div>
    </AbsoluteFill>
  )
}
