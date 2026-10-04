import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, SANS, SERIF, useStageFonts, Ground, Tag, Line, Beat, Captions, World, camAt, Glass, Bar, Chip, Wire, wirePath, Bubble, FlowNode, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, arrive, move, fadeIn, lerp, cl } from './stageLook.jsx'
import { Soundtrack, cue } from '../sound.jsx'

/*
  The brand explainer, 57.5 s, in the Stage look. One component, two
  layouts (16:9 and 9:16): every position lives in WIDE or TALL, so the
  vertical cut is composed for the phone, not cropped. Same story as
  before:

    stakes    "Your business runs on…" WhatsApp threads, spreadsheets,
              sticky notes, memory; the pile: "Every enquiry, re-typed by hand."
    question  "What if it ran itself?" the pile snaps into a flow that runs
    headfake  "Every enquiry, answered in seconds." then: is it real?
    rehook    real captures of three running apps, the true counts, the card
*/

const F = {
  tickEnd: 226,
  chaos: 236,
  chaosLine: 326,
  chaosLineOut: 424,
  fake: 438,
  fakeEnd: 494,
  snap: 504,
  wires: 560,
  formLit: 590,
  swap: 790,
  flowOut: 866,
  proof: 880,
}
F.proofEnd = F.proof + 372
F.count = F.proofEnd + 12
F.end = F.count + 156
export const BRAND_LEN = F.end + 306 // 1726 frames, 57.5 s

const WIDE = {
  intro: { head: 96, tick: 170, top: 330 },
  chaos: {
    email: { x: 610, y: 330, r: -4, z: -220 },
    chatA: { x: 1330, y: 280, r: 3, z: 0 },
    toast: { x: 1040, y: 440, r: -2, z: 90 },
    sticky: { x: 330, y: 580, r: -7, z: 60 },
    sheet: { x: 790, y: 660, r: -3, z: -120 },
    calendar: { x: 1360, y: 650, r: 4, z: -260 },
    chatB: { x: 420, y: 860, r: -5, z: -160 },
    chatC: { x: 1580, y: 890, r: -3, z: 40 },
  },
  chaosLine: 128,
  node: { w: 440, h: 124 },
  nodes: {
    form: { x: 420, y: 450 },
    ai: { x: 960, y: 450 },
    crm: { x: 1500, y: 450 },
    wa: { x: 1500, y: 730 },
    cal: { x: 960, y: 730 },
    follow: { x: 420, y: 730 },
  },
  ports: ['h', 'h', 'v', 'h', 'h'],
  clock: { x: 200, y: 300 },
  reply: { x: 1210, y: 840, w: 580 },
  cap: { top: 110, size: 72 },
  proof: {
    win: 1000,
    fan: {
      'consent-signer': { x: 470, y: 590, s: 0.66, ry: 26, z: -140 },
      'lead-research': { x: 1450, y: 590, s: 0.66, ry: -26, z: -140 },
      'shared-inbox': { x: 960, y: 610, s: 0.84, ry: 0, z: 0 },
    },
    order: ['consent-signer', 'lead-research', 'shared-inbox'],
    target: { x: 960, y: 500 },
    maxS: 1.8,
    fit: 980,
    title: 110,
    note: 990,
  },
  counters: { label: 330, top: 430, dir: 'row', num: 150, caveat: 790 },
}

const TALL = {
  intro: { head: 600, tick: 150, top: 820 },
  chaos: {
    email: { x: 420, y: 360, r: -4, z: -200 },
    chatA: { x: 690, y: 580, r: 3, z: 0 },
    toast: { x: 410, y: 790, r: -2, z: 90 },
    sheet: { x: 560, y: 1030, r: -3, z: -120 },
    calendar: { x: 740, y: 1350, r: 4, z: -240 },
    sticky: { x: 270, y: 1360, r: -7, z: 60 },
    chatB: { x: 340, y: 1620, r: -5, z: -150 },
    chatC: { x: 740, y: 1700, r: -3, z: 40 },
  },
  chaosLine: 112,
  node: { w: 640, h: 132 },
  nodes: {
    form: { x: 470, y: 560 },
    ai: { x: 610, y: 776 },
    crm: { x: 470, y: 992 },
    wa: { x: 610, y: 1208 },
    cal: { x: 470, y: 1424 },
    follow: { x: 610, y: 1640 },
  },
  ports: ['v', 'v', 'v', 'v', 'v'],
  clock: { x: 540, y: 1770, centre: true },
  reply: null,
  cap: { top: 220, size: 84 },
  proof: {
    win: 960,
    fan: {
      'lead-research': { x: 540, y: 700, s: 0.86, rx: 14, z: -220 },
      'consent-signer': { x: 540, y: 1040, s: 0.92, rx: 14, z: -110 },
      'shared-inbox': { x: 540, y: 1390, s: 0.98, rx: 14, z: 0 },
    },
    order: ['lead-research', 'consent-signer', 'shared-inbox'],
    target: { x: 540, y: 860 },
    maxS: 1.7,
    fit: 900,
    title: 230,
    note: 1730,
  },
  counters: { label: 400, top: 500, dir: 'column', num: 168, caveat: 1600 },
}

export function ExplainerBrand() {
  useStageFonts()
  const f = useCurrentFrame()
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  const L = tall ? TALL : WIDE
  const inProof = f >= F.proof && f < F.proofEnd + 4
  const glow = glowAt(f, L, W, H)
  return (
    <Ground f={f} glow={glow} glowSize={tall ? 0.8 : 1}>
      {f < F.chaos + 4 && <Intro f={f} L={L} tall={tall} />}
      {f >= F.chaos - 2 && f < F.flowOut + 16 && <ChaosAndFlow f={f} L={L} W={W} H={H} tall={tall} />}
      {f >= F.proof - 2 && f < F.proofEnd + 14 && <Proof f={f - F.proof} L={L} tall={tall} />}
      {f >= F.count - 2 && f < F.end + 12 && <Counters f={f - F.count} L={L} tall={tall} />}
      {f >= F.end && <EndCard f={f - F.end} />}
      <Tag text={inProof ? 'Working demo · real screens' : 'Illustration'} />
      <Soundtrack cues={CUES} voice="brand" />
    </Ground>
  )
}

function glowAt(f, L, W, H) {
  const c = { x: W / 2, y: H / 2 }
  if (f < F.snap) return c
  if (f < F.flowOut) {
    // the light walks along the flow with the step that is running
    const order = ['form', 'ai', 'crm', 'wa', 'cal', 'follow']
    const k = cl(Math.floor((f - F.formLit + 10) / 30), 0, 5)
    const n = L.nodes[order[k]]
    const p = order[Math.max(0, k - 1)]
    const t = move(f, F.formLit - 10 + k * 30, 20)
    return { x: lerp(L.nodes[p].x, n.x, t), y: lerp(L.nodes[p].y, n.y, t) }
  }
  return c
}

/* ---------------- 1. stakes: what the business runs on ---------------- */

const TICKER = ['WhatsApp threads.', 'Spreadsheets.', 'Sticky notes.', 'Memory.']
const TICK_AT = [50, 86, 122, 158]

function Intro({ f, L, tall }) {
  const out = move(f, F.tickEnd, 9)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: tall ? 80 : 20, opacity: 1 - out, filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined }}>
      <Line text={tall ? 'Your business\nruns on…' : 'Your business runs on…'} f={f} start={14} size={L.intro.head > 100 ? 104 : 96} color={S.inkSoft} weight={600} />
      <div style={{ position: 'relative', width: '100%', height: L.intro.tick * 1.3, marginTop: tall ? 40 : 24 }}>
        {TICKER.map((t, i) => {
          const last = i === TICKER.length - 1
          const next = TICK_AT[i + 1]
          if (f < TICK_AT[i] - 1 || (!last && f > next + 4)) return null
          return (
            <div key={t} style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center' }}>
              <Ticker text={t} f={f} start={TICK_AT[i]} exit={last ? null : next - 6} size={L.intro.tick} forget={last} />
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/* One ticker word in the serif. "Memory." arrives like the others, then its
   letters fade out of step with each other, as if being forgotten. */
function Ticker({ text, f, start, exit, size, forget }) {
  const a = arrive(f, start, 150)
  const o = exit == null ? 0 : move(f, exit, 8)
  return (
    <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: size, lineHeight: 1.1, letterSpacing: '-0.01em', color: S.peach, whiteSpace: 'nowrap', opacity: cl(a * 1.6) * (1 - o), transform: `translateY(${((1 - a) * 0.3 - o * 0.2).toFixed(3)}em)`, filter: (1 - a) * 12 + o * 10 > 0.1 ? `blur(${((1 - a) * 12 + o * 10).toFixed(2)}px)` : undefined }}>
      {text.split('').map((ch, i) => {
        const r = ((i * 9301 + 49297) % 233280) / 233280
        const at = start + 34 + r * 26
        const gone = forget ? move(f, at, 20) : 0
        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: 1 - 0.85 * gone, filter: gone > 0.02 ? `blur(${(gone * 7).toFixed(2)}px)` : undefined, transform: `translateY(${(-gone * 10).toFixed(2)}px)` }}>
            {ch}
          </span>
        )
      })}
    </div>
  )
}

/* ---------------- 2 and 3. the pile, and the flow it becomes ---------------- */

const ITEMS = [
  { id: 'email', node: 'ai', w: 540, h: 150, at: 0, from: [-1, -0.6] },
  { id: 'chatA', node: 'wa', w: 470, h: 140, at: 8, from: [1, -0.5] },
  { id: 'toast', node: 'form', w: 480, h: 110, at: 16, from: [0.3, -1] },
  { id: 'sheet', node: 'crm', w: 620, h: 300, at: 26, from: [-0.7, 1] },
  { id: 'calendar', node: 'cal', w: 420, h: 330, at: 36, from: [1, 0.6] },
  { id: 'sticky', node: 'follow', w: 270, h: 240, at: 46, from: [-1, 0.2] },
  { id: 'chatB', node: 'wa', w: 400, h: 110, at: 56, from: [-0.6, 1] },
  { id: 'chatC', node: 'wa', w: 420, h: 110, at: 64, from: [1, 1] },
]

const NODE_DEFS = [
  { id: 'form', label: 'Web form', icon: 'form', sub: 'Any time of day', subLit: 'Enquiry, 11:04 pm' },
  { id: 'ai', label: 'AI assistant', icon: 'spark', sub: 'Reads every message', subLit: 'Sorted and drafted' },
  { id: 'crm', label: 'Client list', icon: 'database', sub: 'One record', subLit: 'Lead saved' },
  { id: 'wa', label: 'WhatsApp reply', icon: 'chat', sub: 'Instant', subLit: 'Sent in seconds' },
  { id: 'cal', label: 'Calendar', icon: 'calendar', sub: 'Live availability', subLit: 'Slot offered' },
  { id: 'follow', label: 'Follow-up', icon: 'repeat', sub: 'Automatic', subLit: 'Day 3 and Day 7' },
]
const RUN = [600, 630, 660, 712, 742] // the pulse leaves each wire's start here
const RUN_DUR = [22, 22, 34, 22, 22]

function port(n, side, L) {
  const { w, h } = L.node
  if (side === 'r') return { x: n.x + w / 2, y: n.y }
  if (side === 'l') return { x: n.x - w / 2, y: n.y }
  if (side === 'b') return { x: n.x, y: n.y + h / 2 }
  return { x: n.x, y: n.y - h / 2 }
}

function ChaosAndFlow({ f, L, W, H, tall }) {
  const pull = cl(move(f, F.chaosLine - 6, 14) - move(f, F.fakeEnd - 14, 16))
  const out = move(f, F.flowOut, 14)
  const cam = camAt(f, [
    { x: W / 2, y: H / 2 + 40, s: 0.9, rx: 10 },
    { at: F.chaos, dur: 40, x: W / 2, y: H / 2, s: 1.04, rx: 0 },
    { at: F.chaosLine, dur: 90, s: 1.1 },
    { at: F.snap - 4, dur: 20, s: 1, x: W / 2, y: H / 2 + (tall ? 60 : 30) },
  ])
  const snapAt = (i) => F.snap + i * 5
  const nodeAppear = {}
  ITEMS.forEach((it, i) => {
    if (nodeAppear[it.node] == null) nodeAppear[it.node] = snapAt(i) + 12
  })
  const lits = NODE_DEFS.map((n, i) => (i === 0 ? F.formLit : RUN[i - 1] + RUN_DUR[i - 1]))
  const order = NODE_DEFS.map((n) => n.id)
  const edges = order.slice(1).map((id, i) => {
    const a = L.nodes[order[i]]
    const b = L.nodes[id]
    const kind = L.ports[i]
    let pa, pb
    if (kind === 'v') {
      pa = port(a, 'b', L)
      pb = port(b, 't', L)
    } else if (b.x > a.x) {
      pa = port(a, 'r', L)
      pb = port(b, 'l', L)
    } else {
      pa = port(a, 'l', L)
      pb = port(b, 'r', L)
    }
    return { d: wirePath(pa, pb, kind), draw: move(f, F.wires + i * 5, 16), pulse: (f - RUN[i]) / RUN_DUR[i] }
  })
  const waLit = lits[3]
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined }}>
      <AbsoluteFill style={{ filter: pull > 0.01 ? `blur(${(pull * 7).toFixed(2)}px)` : undefined, opacity: 1 - pull * 0.45 }}>
        <World cam={cam}>
          {edges.map((e, i) => (
            <Wire key={i} uid={`br${i}`} d={e.d} draw={e.draw} pulse={e.pulse} W={W} H={H} />
          ))}
          {NODE_DEFS.map((n, i) => (
            <FlowNode key={n.id} {...n} {...L.nodes[n.id]} w={L.node.w} h={L.node.h} appear={arrive(f, nodeAppear[n.id], 140)} lit={fadeIn(f, lits[i], 8)} size={tall ? 34 : 32} />
          ))}
          {ITEMS.map((it, i) => (
            <PileItem key={it.id} it={it} i={i} f={f} L={L} s={arrive(f, snapAt(i), 120)} />
          ))}
          {L.reply && (
            <div style={{ position: 'absolute', left: L.reply.x, top: L.reply.y, opacity: cl(arrive(f, waLit + 4) * 1.5), transform: `translateY(${((1 - arrive(f, waLit + 4)) * 30).toFixed(2)}px)` }}>
              <Bubble side="out" width={L.reply.w} text="Hi! Thanks for getting in touch. Here are this week’s open slots." time="11:04 pm" tag="Replied in seconds" />
            </div>
          )}
          <Chip
            icon="moon"
            label={L.clock.centre ? '11:04 pm' : '11:04 pm'}
            sub={L.clock.centre ? 'replied in seconds' : null}
            lit={1}
            size={30}
            style={{ left: L.clock.x, top: L.clock.y, transform: `translate(${L.clock.centre ? '-50%' : '0'}, ${((1 - arrive(f, F.formLit - 6)) * 20).toFixed(2)}px)`, opacity: cl(arrive(f, F.formLit - 6) * 1.5) }}
          />
        </World>
      </AbsoluteFill>
      {f < F.chaosLineOut + 12 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: '0 90px' }}>
          <Line text={'Every enquiry,\nre-typed by {hand.}'} f={f} start={F.chaosLine} exit={F.chaosLineOut} size={L.chaosLine} />
        </AbsoluteFill>
      )}
      {pull > 0.01 && f > F.chaosLineOut && <AbsoluteFill style={{ background: `rgba(11,11,12,${(0.4 * pull).toFixed(3)})` }} />}
      <Beat f={f} text={tall ? 'What if it\nran {itself?}' : 'What if it ran {itself?}'} start={F.fake} end={F.fakeEnd} size={tall ? 132 : 150} />
      <Captions
        f={f}
        top={L.cap.top}
        size={L.cap.size}
        items={[
          { at: F.snap + 6, text: tall ? 'What if it\nran {itself?}' : 'What if it ran {itself?}' },
          { at: F.swap, text: tall ? 'Every enquiry,\nanswered in {seconds.}' : 'Every enquiry, answered in {seconds.}', exit: F.flowOut - 4 },
        ]}
      />
    </AbsoluteFill>
  )
}

/* One fragment of the pile; s (0..1) is its snap into the flow node. */
function PileItem({ it, i, f, L, s }) {
  if (s > 0.995) return null
  const pos = L.chaos[it.id]
  const target = L.nodes[it.node]
  const a = arrive(f, F.chaos + it.at, 70)
  const ph = i * 1.7
  const x0 = pos.x + it.from[0] * 900 * (1 - a) + Math.sin(f * 0.021 + ph) * 10
  const y0 = pos.y + it.from[1] * 700 * (1 - a) + Math.cos(f * 0.017 + ph) * 8
  const x = lerp(x0, target.x, s)
  const y = lerp(y0, target.y, s)
  const z = lerp(pos.z, 0, s)
  const rot = lerp(pos.r + Math.sin(f * 0.015 + ph) * 1.2 + (1 - a) * it.from[0] * 14, 0, s)
  const sc = lerp(1, Math.min(L.node.w / it.w, L.node.h / it.h), s)
  const blur = Math.max(0, -z) / 70
  return (
    <div
      style={{
        position: 'absolute',
        left: x - it.w / 2,
        top: y - it.h / 2,
        width: it.w,
        transform: `translateZ(${z.toFixed(1)}px) rotate(${rot.toFixed(3)}deg) scale(${sc.toFixed(4)})`,
        opacity: cl(a * 2) * (1 - cl((s - 0.4) / 0.4)),
        filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : undefined,
      }}
    >
      <Piece id={it.id} />
    </div>
  )
}

function Piece({ id }) {
  switch (id) {
    case 'email':
      return (
        <Glass rim={null} style={{ position: 'relative', width: 540, padding: '22px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', color: S.muted }}>
              <Icon name="mail" size={26} />
            </div>
            <span style={{ fontSize: 28, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Re: Fwd: Re: booking change</span>
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.08)', width: '94%' }} />
            <div style={{ height: 10, borderRadius: 10, background: 'rgba(255,255,255,0.08)', width: '62%' }} />
          </div>
        </Glass>
      )
    case 'chatA':
      return <Bubble text="Hi, is Tuesday evening free?" time="11:02 pm" width={470} />
    case 'chatB':
      return <Bubble text="What are your fees?" width={400} />
    case 'chatC':
      return <Bubble text="Can I move to 5 pm?" width={420} />
    case 'toast':
      return (
        <Glass rim={null} style={{ position: 'relative', width: 480, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, display: 'grid', placeItems: 'center', background: S.redTint, color: S.red, border: '1px solid rgba(255,122,107,0.3)' }}>
            <Icon name="phone" size={28} stroke={2.1} />
          </div>
          <div>
            <div style={{ fontSize: 30, letterSpacing: '-0.02em' }}>3 missed calls</div>
            <div style={{ marginTop: 4, fontSize: 24, color: S.muted }}>While you were with a client</div>
          </div>
        </Glass>
      )
    case 'sheet':
      return <SheetPiece />
    case 'calendar':
      return <CalendarPiece />
    case 'sticky':
      return (
        <div style={{ width: 270, minHeight: 230, boxSizing: 'border-box', padding: '28px 26px', borderRadius: 10, background: 'linear-gradient(180deg, rgba(242,196,107,0.16), rgba(242,196,107,0.08))', border: '1px solid rgba(242,196,107,0.32)', boxShadow: '0 30px 70px -20px rgba(0,0,0,0.7)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 44, lineHeight: 1.05, color: S.amber }}>
          Call back re: fees??
        </div>
      )
    default:
      return null
  }
}

function SheetPiece() {
  const rows = [
    ['Client 014', 'Tue 5 pm', ['Paid?', 'amber']],
    ['Client 014', ['Tue 5 pm', 'red'], 'Booked'],
    ['Client 027', ['Tue 5 pm', 'red'], 'Booked'],
    [['#REF!', 'red'], '', ['Call back', 'dim']],
  ]
  const tone = { red: { background: S.redTint, color: S.red }, amber: { background: S.amberTint, color: S.amber }, dim: { color: S.dim } }
  return (
    <Glass rim={null} style={{ position: 'relative', width: 620, overflow: 'hidden' }}>
      <Bar title="bookings_final_v3.xlsx" icon="grid" h={58} size={24} />
      {[['Client', 'Slot', 'Status'], ...rows].map((r, ri) => (
        <div key={ri} style={{ display: 'flex', borderTop: ri ? `1px solid ${S.hair}` : 'none' }}>
          {r.map((c, ci) => {
            const [t, k] = Array.isArray(c) ? c : [c]
            return (
              <div key={ci} style={{ width: '33.33%', padding: '11px 18px', fontSize: 24, whiteSpace: 'nowrap', borderLeft: ci ? `1px solid ${S.hair}` : 'none', color: ri === 0 ? S.muted : S.inkSoft, ...(k ? tone[k] : null) }}>
                {t}
              </div>
            )
          })}
        </div>
      ))}
    </Glass>
  )
}

function CalendarPiece() {
  return (
    <Glass rim={null} style={{ position: 'relative', width: 420, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: `1px solid ${S.hair}` }}>
        <span style={{ fontSize: 28 }}>Tuesday</span>
        <Icon name="calendar" size={26} color={S.muted} />
      </div>
      <div style={{ position: 'relative', height: 190 }}>
        {['4 pm', '5 pm', '6 pm'].map((h, i) => (
          <div key={h} style={{ position: 'absolute', left: 0, right: 0, top: 6 + i * 60, borderTop: i ? `1px dashed ${S.hair}` : 'none', padding: '8px 0 0 20px' }}>
            <Mono size={20}>{h}</Mono>
          </div>
        ))}
        {[0, 1].map((k) => (
          <div key={k} style={{ position: 'absolute', left: 104 + k * 60, right: 20 + (1 - k) * 36, top: 72 + k * 20, height: 56, borderRadius: 10, background: k ? 'rgba(255,92,72,0.22)' : S.redTint, borderLeft: `4px solid ${S.red}`, padding: '8px 14px', boxSizing: 'border-box', fontSize: 24, color: S.red }}>
            Session
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 22px', background: S.redTint, color: S.red, fontSize: 24 }}>
        <Icon name="alert" size={24} stroke={2.1} />
        Double booked
      </div>
    </Glass>
  )
}

/* ---------------- 4. rehook: the real screens ---------------- */

const APPS = [
  { key: 'shared-inbox', src: 'walkthroughs/shared-inbox/02.png', title: 'Shared Inbox CRM', rect: { x: 528, y: 222, w: 400, h: 100 }, label: 'Shared inbox', text: 'Every enquiry lands in one shared inbox.' },
  { key: 'consent-signer', src: 'walkthroughs/consent-signer/06.png', title: 'Consent & Contract Signer', rect: { x: 876, y: 413, w: 388, h: 268 }, label: 'Consent signer', text: 'Signed, sealed and verifiable by anyone.' },
  { key: 'lead-research', src: 'walkthroughs/lead-research/05.png', title: 'Lead Research Tool', rect: { x: 945, y: 578, w: 262, h: 290 }, label: 'Lead research', text: 'Every lead scored, shortlisted, tracked.' },
]
const P = { first: 76, every: 100, push: 18, hold: 60, back: 18 }
const BAR = 56

function Proof({ f, L, tall }) {
  const pr = L.proof
  const k = pr.win / 1440
  const winH = 900 * k + BAR
  const out = move(f, 372, 14)
  const foci = APPS.map((_, i) => {
    const at = P.first + i * P.every
    return { at, z: cl(move(f, at, P.push) - move(f, at + P.push + P.hold, P.back)) }
  })
  const anyZ = Math.max(...foci.map((x) => x.z))
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined }}>
      <AbsoluteFill style={{ perspective: 2200 }}>
        {pr.order.map((key, paint) => {
          const i = APPS.findIndex((a) => a.key === key)
          const app = APPS[i]
          const fan = pr.fan[key]
          const a = arrive(f, paint * 10, 70)
          const fz = foci[i].z
          // the focused pose: flat, near, the region centred on the target
          const rc = { x: (app.rect.x + app.rect.w / 2) * k - pr.win / 2, y: BAR + (app.rect.y + app.rect.h / 2) * k - winH / 2 }
          const fs = Math.min(pr.maxS, pr.fit / (app.rect.w * k), (tall ? 760 : 520) / (app.rect.h * k))
          const focus = { x: pr.target.x - rc.x * fs, y: pr.target.y - rc.y * fs, s: fs, rx: 0, ry: 0, z: 0 }
          const drift = { x: Math.sin(f * 0.02 + i * 2) * 5, y: Math.cos(f * 0.018 + i * 2) * 6 }
          const base = { x: fan.x + drift.x, y: fan.y + drift.y + (1 - a) * 420, s: fan.s * (0.88 + 0.12 * a), rx: (fan.rx || 0) + (1 - a) * 18, ry: fan.ry || 0, z: fan.z }
          const p = {}
          for (const q of ['x', 'y', 's', 'rx', 'ry', 'z']) p[q] = lerp(base[q], focus[q], fz)
          const back = Math.max(0, anyZ - fz)
          const ring = cl(fadeIn(f, foci[i].at + P.push - 2, 8) - fadeIn(f, foci[i].at + P.push + P.hold - 6, 8))
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: pr.win,
                height: winH,
                transformOrigin: '50% 50%',
                transform: `translate3d(${(p.x - pr.win / 2).toFixed(2)}px, ${(p.y - winH / 2).toFixed(2)}px, ${p.z.toFixed(1)}px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) scale(${p.s.toFixed(4)})`,
                opacity: cl(a * 1.6) * (1 - back * 0.9),
                filter: (1 - a) * 12 + back * 8 > 0.1 ? `blur(${((1 - a) * 12 + back * 8).toFixed(2)}px)` : undefined,
                zIndex: fz > 0.001 ? 10 : paint,
              }}
            >
              <Glass rim={paint === 2 ? 'top' : null} style={{ left: 0, top: 0, width: pr.win, height: winH, overflow: 'hidden' }}>
                <Bar title={app.title} h={BAR} size={22} label="Real capture" />
                <Img src={staticFile(app.src)} style={{ position: 'absolute', left: 0, top: BAR, width: pr.win, height: 900 * k, display: 'block' }} />
                {ring > 0.01 && (
                  <>
                    <div style={{ position: 'absolute', left: 0, top: BAR, width: pr.win, height: 900 * k, background: `rgba(8,8,9,${(0.5 * ring).toFixed(3)})`, clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 ${(app.rect.y * k - 8).toFixed(1)}px, ${(app.rect.x * k - 8).toFixed(1)}px ${(app.rect.y * k - 8).toFixed(1)}px, ${(app.rect.x * k - 8).toFixed(1)}px ${((app.rect.y + app.rect.h) * k + 8).toFixed(1)}px, ${((app.rect.x + app.rect.w) * k + 8).toFixed(1)}px ${((app.rect.y + app.rect.h) * k + 8).toFixed(1)}px, ${((app.rect.x + app.rect.w) * k + 8).toFixed(1)}px ${(app.rect.y * k - 8).toFixed(1)}px, 0 ${(app.rect.y * k - 8).toFixed(1)}px)` }} />
                    <div style={{ position: 'absolute', left: app.rect.x * k - 8, top: BAR + app.rect.y * k - 8, width: app.rect.w * k + 16, height: app.rect.h * k + 16, borderRadius: 10, border: `${(2 / p.s).toFixed(2)}px solid ${S.saffron}`, boxShadow: `0 0 ${(24 / p.s).toFixed(1)}px rgba(245,135,30,0.55)`, opacity: ring, boxSizing: 'border-box' }} />
                  </>
                )}
              </Glass>
            </div>
          )
        })}
      </AbsoluteFill>
      {APPS.map((app, i) => {
        const at = foci[i].at
        const t = cl(arrive(f, at + P.push + 4, 140) - fadeIn(f, at + P.push + P.hold - 6, 8))
        if (t <= 0.01) return null
        const fs = Math.min(pr.maxS, pr.fit / (app.rect.w * k), (tall ? 760 : 520) / (app.rect.h * k))
        const y = pr.target.y + (app.rect.h * k * fs) / 2 + 44
        return (
          <div key={app.key} style={{ position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: cl(t * 1.5), transform: `translateY(${((1 - t) * 24).toFixed(2)}px)`, zIndex: 20 }}>
            <Glass rim="left" style={{ position: 'relative', padding: tall ? '24px 32px' : '22px 30px', maxWidth: tall ? 900 : 1100 }}>
              <Mono size={tall ? 24 : 21} color={S.peach}>{app.label}</Mono>
              <div style={{ marginTop: 8, fontSize: tall ? 40 : 36, fontWeight: 600, letterSpacing: '-0.03em' }}>{app.text}</div>
            </Glass>
          </div>
        )
      })}
      <div style={{ position: 'absolute', left: 80, right: 80, top: pr.title, zIndex: 25 }}>
        <Line text={tall ? 'Real screens.\nRunning {apps.}' : 'Real screens. Running {apps.}'} f={f} start={4} exit={P.first - 8} size={tall ? 100 : 92} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: pr.note, textAlign: 'center', fontSize: tall ? 30 : 26, color: S.muted, opacity: fadeIn(f, 40, 14) * (1 - anyZ) * (1 - out) }}>
        Captured from the running apps, not mocked up.
      </div>
    </AbsoluteFill>
  )
}

/* ---------------- the true counts ---------------- */

const COUNTS = [
  { n: 1200, fmt: (v) => v.toLocaleString('en-IN'), suffix: '+', label: 'client records', caveat: true },
  { n: 11, fmt: (v) => String(v), suffix: '', label: 'therapists on one system', caveat: true },
  { n: 5, fmt: (v) => String(v), suffix: '', label: 'systems shipped', caveat: false },
]

function Counters({ f, L, tall }) {
  const c = L.counters
  const out = move(f, 156, 10)
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: c.label, display: 'flex', justifyContent: 'center', opacity: fadeIn(f, 0, 12) }}>
        <Mono size={tall ? 28 : 24} color={S.peach}>The work so far</Mono>
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: c.top, display: 'flex', flexDirection: c.dir, justifyContent: 'center', alignItems: 'center', gap: tall ? 70 : 0 }}>
        {COUNTS.map((k, i) => {
          const a = arrive(f, 8 + i * 8, 120)
          const p = move(f, 8 + i * 8, 48)
          return (
            <div key={k.label} style={{ display: 'flex', alignItems: 'center' }}>
              {!tall && i > 0 && <div style={{ width: 1, height: 200, background: S.line, opacity: a }} />}
              <div style={{ width: tall ? 900 : 560, textAlign: 'center', opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * 40).toFixed(2)}px)`, filter: a < 0.98 ? `blur(${((1 - a) * 10).toFixed(2)}px)` : undefined }}>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: c.num, letterSpacing: '-0.045em', lineHeight: 1, color: S.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {k.fmt(Math.round(k.n * p))}
                  <span style={{ color: S.saffron, opacity: p > 0.995 ? 1 : 0 }}>{k.suffix}</span>
                </div>
                <div style={{ marginTop: 18, fontSize: tall ? 38 : 32, fontWeight: 500, letterSpacing: '-0.02em', color: S.muted }}>
                  {k.label}
                  {k.caveat && <span style={{ color: S.saffron }}> *</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, top: c.caveat, textAlign: 'center', opacity: fadeIn(f, 50, 14) }}>
        <Mono size={tall ? 24 : 21}>
          <span style={{ color: S.saffron }}>*</span> Row counts from a live clinic system.
        </Mono>
      </div>
    </AbsoluteFill>
  )
}

/*
  The sound (remotion/sound.jsx), from the beats above. Defined last, since
  it reads constants declared all through the file. The opening line and
  each ticker word; the pile's fragments landing like notifications; the
  question; the camera pulling the pile into the flow; each node lighting
  as the run reaches it; the flow leaving; the real screens arriving, each
  push in, its highlight and the pull back; the counts; the end card.
*/
const CUES = [
  cue('thump', 14 + 1, 0.8),
  ...TICK_AT.map((t) => cue('thump', t + 1, 0.55)),
  cue('whoosh', F.chaos, 0.7),
  ...ITEMS.map((it) => cue('tick', F.chaos + it.at + 6, 0.3)),
  cue('thump', F.chaosLine + 1, 0.8),
  cue('thump', F.fake + 1),
  cue('whoosh', F.snap - 4),
  ...[F.formLit, ...RUN.map((r, i) => r + RUN_DUR[i])].map((t) => cue('tick', t + 1, 0.7)),
  cue('whooshDown', F.flowOut, 0.7),
  cue('whoosh', F.proof, 0.8),
  cue('thump', F.proof + 4 + 1, 0.7),
  ...APPS.flatMap((_, i) => {
    const at = F.proof + P.first + i * P.every
    return [cue('whoosh', at, 0.65), cue('tick', at + P.push - 2 + 1, 0.6), cue('whooshDown', at + P.push + P.hold, 0.45)]
  }),
  cue('whooshDown', F.proofEnd, 0.6),
  cue('thump', F.count + 8 + 1, 0.8),
  ...COUNTS.slice(1).map((_, i) => cue('tick', F.count + 8 + (i + 1) * 8 + 1, 0.5)),
  cue('thump', F.end + END_HEADING_AT + 1, 0.7),
  cue('end', F.end + END_BUTTON_AT),
]
