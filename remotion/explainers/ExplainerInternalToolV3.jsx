import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { S, SANS, Glass, Bar } from './stageLook.jsx'
import { Icon } from '../icons.jsx'
import { arriveT, leaveT, ramp, live, glideT, lerp, rand, EASE, BEAT } from '../cinematic/motion3.js'
import { Words, Headline, Caption, Tag3, Label, PAPER, wordStarts } from '../cinematic/Kinetic3.jsx'
import { MorphPill, COL } from '../cinematic/Morph3.jsx'
import { floodState, dotState, contract } from '../cinematic/Transitions3.jsx'
import { LightSweep } from '../cinematic/Light3.jsx'
import { World3 } from '../cinematic/Camera3.jsx'
import { Shell, EndCard3, buttonState, useFonts3 } from '../cinematic/Film3.jsx'
import { Soundtrack3, cue3 } from '../cinematic/Sound3.jsx'

/*
  Internal Tool / Dashboard v3, 36.0 s, voiceless (shot list 4.5). A
  spreadsheet nobody trusts comes apart cell by cell and rebuilds itself
  into one clean tool on paper; then a role switcher's indicator (the one
  pill) shows each person sees only what they need, and becomes the button.
*/

const T = {
  hook: 6,
  sheet: 90,
  edits: 165,
  fake1: 270,
  fake1Line: 280,
  question: 330,
  rebuild: 420,
  paper: 510,
  sweep: 540,
  push: 615,
  fake2: 690,
  fake2Line: 695,
  roles: 735,
  switches: [750, 780, 810, 840],
  payoff: 870,
  cta: 945,
  fade: 1065,
}
export const TOOL_V3_LEN = 1080

const W = 1920
const H = 1080
const CX = 960
const SHEET = { left: 260, top: 300, w: 1400, bar: 64, head: 56, rowH: 70 }
const COLS = [
  { name: 'Date', w: 180 },
  { name: 'Client', w: 260 },
  { name: 'Booking', w: 240 },
  { name: 'Room', w: 200 },
  { name: 'Paid', w: 160 },
  { name: 'Notes', w: 360 },
]
// messy on purpose: blanks, question marks, a duplicate and a broken formula
const ROWS = [
  ['Mon 7', 'Asha K', 'Workshop', 'Studio A', 'Yes', 'call back?'],
  ['Mon 7', 'Asha K', 'Workshop', 'Studio A', '?', 'dup?'],
  ['Tue 8', 'Rohan M', 'Consult', 'Studio B', 'No', ''],
  ['Tue 8', 'Meher S', 'Workshop', '??', '#REF!', 'moved?'],
  ['Wed 9', 'Kabir D', 'Consult', 'Studio A', 'Yes', 'TBC'],
  ['Thu 10', 'Isha P', 'Workshop', 'Studio A', '', 'clash?'],
  ['Thu 10', 'Dev R', 'Consult', 'Studio A', 'No', ''],
  ['Fri 11', 'Zara N', 'Workshop', 'Studio B', 'Yes', 'see chat'],
]
const BAD = { '?': 'amber', '??': 'amber', 'dup?': 'red', '#REF!': 'red', 'clash?': 'red', TBC: 'amber', 'moved?': 'amber', '': 'amber' }
const REF = { r: 3, c: 4 }

const colX = (c) => SHEET.left + COLS.slice(0, c).reduce((a, k) => a + k.w, 0)
const cellRect = (r, c) => ({ x: colX(c), y: SHEET.top + SHEET.bar + SHEET.head + r * SHEET.rowH, w: COLS[c].w, h: SHEET.rowH })

const TILES = [
  { label: 'Bookings this week', value: '48' },
  { label: 'Open enquiries', value: '12' },
  { label: 'Awaiting payment', value: '3' },
  { label: 'Rooms free today', value: '2' },
]
const DASH = { left: 160, top: 250, w: 1600, h: 740 }
const tileRect = (i) => ({ x: DASH.left + 50 + i * 380, y: DASH.top + 110, w: 350, h: 190 })
const LIST = { left: DASH.left + 50, top: DASH.top + 340, w: DASH.w - 100, h: 350 }
const CLASH = { x: LIST.left + LIST.w - 150, y: LIST.top + 52 }

const ROLES = ['Owner', 'Front desk', 'Practitioner', 'Accounts']
const SW = { y: 360, h: 88, left: 300, segW: 330 }
const PANELS = ['Schedule', 'Clients', 'Invoices', 'Client notes']
// who can open what (illustrative): rows are roles, columns panels
const ACCESS = [
  [1, 1, 1, 1],
  [1, 1, 0, 0],
  [1, 1, 0, 1],
  [0, 1, 1, 0],
]
const UNDER = { x: CX, y: 640, w: 180, h: 18 }

const txt = (size, color = S.ink) => ({ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: '-0.015em', lineHeight: 1.25, color })

const segX = (i) => SW.left + i * SW.segW + SW.segW / 2

function indicatorStates() {
  const seg = (i) => ({ x: segX(i), y: SW.y, w: SW.segW - 16, h: SW.h - 16, r: 999 })
  return [
    { at: 0, ...seg(0), fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.4, o: 0, content: null },
    { at: T.switches[0] - 6, ...seg(0), o: 1, ease: { dur: 12, curve: EASE.arrive } },
    ...T.switches.slice(1).map((at, k) => ({ at, ...seg(k + 1) })),
    { at: T.payoff, ...UNDER, glow: 0.4 },
    buttonState(T.cta + 4, false),
  ]
}
function paperStates() {
  return [
    dotState(0, CX, 620, 20, COL.paper, { o: 0 }),
    dotState(T.paper - 1, CX, 620, 20, COL.paper, { o: 1 }),
    floodState(T.paper, W, H, COL.paper, 10),
    contract(dotState(T.fake2, CX, 540, 10, COL.paper, { o: 0 }), 10),
  ]
}

const CUES = [
  ...wordStarts('Still running your business on a {spreadsheet}?', T.hook).map((t) => cue3('key', t + 6, 1.2)),
  cue3('whoosh', T.sheet + 8, 0.8),
  ...Array.from({ length: 7 }, (_, k) => cue3('click', T.edits + k * BEAT + 8, 0.45)),
  cue3('thump', T.fake1Line + 4),
  cue3('whooshDown', T.question + 20, 0.6),
  cue3('whoosh', T.rebuild + 12),
  ...[0, 1, 2, 3].map((i) => cue3('tick', T.rebuild + 50 + i * 6, 0.5)),
  cue3('paper', T.paper + 6),
  cue3('glass', T.sweep + 10),
  cue3('thump', T.fake2Line + 4),
  ...T.switches.map((t) => cue3('pop', t + 4)),
  cue3('end', T.cta + 30),
]

export function ExplainerInternalToolV3() {
  const ready = useFonts3()
  const f = useCurrentFrame()
  if (!ready) return <AbsoluteFill style={{ background: S.bg }} />
  return (
    <Shell f={f} fadeAt={T.fade} glow={{ x: CX, y: 560 }} glowSize={0.7}>
      <MorphPill f={f} states={paperStates()} z={0} shadow={false} />
      <Headline f={f} text={'Still running your business\non a {spreadsheet}?'} at={T.hook} exit={T.sheet - 8} size={110} />
      {f >= T.sheet - 2 && f < T.rebuild + 60 && <Sheet f={f} />}
      {f >= T.rebuild && f < T.fake2 && <Dashboard f={f} />}
      {f >= T.roles - 2 && f < T.payoff + 10 && <Roles f={f} />}
      <MorphPill f={f} states={indicatorStates()} z={40} />
      {/* titles */}
      <Caption f={f} text="Final. Version {seven}." at={T.sheet + 8} exit={T.edits - 8} />
      <Caption f={f} text="Everyone edits it. Nobody {trusts} it." at={T.edits + 2} exit={T.fake1 - 1} />
      <Headline f={f} text="Who changed {this?}" at={T.fake1Line} exit={T.question - 8} size={120} top={130} />
      <Headline f={f} text="What if there was only one {version}?" at={T.question + 6} exit={T.rebuild - 6} size={96} top={150} />
      <Caption f={f} text="Turn the mess into one clean {tool}." at={T.rebuild + 2} exit={T.paper - 6} />
      <Caption f={f} text="One source of {truth}." at={T.paper + 8} exit={T.push} t="paper" />
      <Headline f={f} text="But not everyone should see {everything}." at={T.fake2Line} exit={T.roles - 6} size={96} />
      <Caption f={f} text="Everyone sees exactly what they {need}." at={T.roles + 2} exit={T.payoff - 6} />
      <Headline f={f} text="No more {guessing}." at={T.payoff + 4} exit={T.cta - 6} size={130} top={430} />
      {f >= T.cta && <EndCard3 f={f} at={T.cta} tall={false} kicker="Internal Tool / Dashboard" />}
      <Tag3 f={f} text="Illustration" at={T.sheet} out={T.fake1} />
      <Tag3 f={f} text="Illustration" at={T.question} out={T.paper} />
      <Tag3 f={f} text="Illustrative data" at={T.paper + 8} out={T.fake2 - 1} t="paper" />
      <Tag3 f={f} text="Illustration" at={T.roles} out={T.payoff} />
      <Soundtrack3 cues={CUES} score="internal-tool-v3" />
    </Shell>
  )
}

/* ---- 2-6. the sheet: edited by everyone, a broken cell, then it comes apart ---- */

const CURSORS = [
  { color: '#8fb3ff', name: 'Front desk' },
  { color: '#8fd19e', name: 'Owner' },
  { color: '#ff9e8f', name: 'Accounts' },
]
// each beat one cursor hops to a cell: [cursor, row, col]
const HOPS = [
  [0, 1, 4], [1, 4, 5], [2, 6, 4], [0, 5, 3], [1, 2, 5], [2, 0, 4], [0, 7, 5],
]
const START = [
  [2, 1],
  [6, 2],
  [5, 5],
]

function cursorAt(f, k) {
  let pos = { r: START[k][0], c: START[k][1] }
  let from = pos
  let t = 1
  HOPS.forEach(([ci, r, c], i) => {
    if (ci !== k) return
    const at = T.edits + i * BEAT
    if (f >= at) {
      from = pos
      pos = { r, c }
      t = ramp(f, at, 10, EASE.glide)
    }
  })
  const a = cellRect(from.r, from.c)
  const b = cellRect(pos.r, pos.c)
  return { x: lerp(a.x + 30, b.x + 30, t), y: lerp(a.y + 40, b.y + 40, t), cell: pos, landed: t >= 1 }
}

/* a cell's value flips the moment someone lands on it */
function cellValue(f, r, c) {
  const v = ROWS[r][c]
  let flips = 0
  HOPS.forEach(([, hr, hc], i) => {
    if (hr === r && hc === c && f >= T.edits + i * BEAT + 8) flips++
  })
  if (!flips) return v
  const alt = c === 4 ? ['No', 'Yes', '?'] : ['see chat', 'TBC', 'dup?']
  return alt[(flips + r) % alt.length]
}

function Sheet({ f }) {
  const a = arriveT(f, T.sheet, 24)
  const ref = cellRect(REF.r, REF.c)
  const refC = { x: ref.x + ref.w / 2, y: ref.y + ref.h / 2 }
  // camera: ease in, snap onto #REF! at the headfake (a hard cut), pull back for the question
  const cam = [
    { x: CX, y: 640, s: 0.96 },
    { at: T.sheet, dur: 75, x: CX, y: 640, s: 1.0 },
    { at: T.fake1, dur: 1, x: refC.x, y: refC.y + 40, s: 2.4 },
    { at: T.question, dur: 45, x: CX, y: 640, s: 1.0 },
  ]
  const dim = f >= T.fake1 && f < T.question + 45 ? 1 - ramp(f, T.question, 40, EASE.glide) : 0
  const frameOut = ramp(f, T.rebuild, 16, EASE.glide)
  const lifting = f >= T.rebuild
  return (
    <World3 f={f} keys={cam.map((k) => ({ ...k, y: k.y - 100 }))}>
      <div style={{ position: 'absolute', inset: 0, opacity: a, transform: `translateY(${((1 - a) * 60).toFixed(1)}px)` }}>
        <div style={{ opacity: (1 - frameOut) * (1 - 0.94 * dim) }}>
          <Glass rim="left" style={{ left: SHEET.left, top: SHEET.top, width: SHEET.w, height: SHEET.bar + SHEET.head + SHEET.rowH * ROWS.length }}>
            <Bar title="bookings_FINAL_v7.xlsx" label="edited by 6 people" size={30} />
            <div style={{ display: 'flex', height: SHEET.head, borderBottom: `1px solid ${S.line}` }}>
              {COLS.map((c) => (
                <div key={c.name} style={{ width: c.w, padding: '0 18px', display: 'flex', alignItems: 'center', borderLeft: `1px solid ${S.hair}`, boxSizing: 'border-box' }}>
                  <Label color={S.muted}>{c.name}</Label>
                </div>
              ))}
            </div>
          </Glass>
          {/* grid lines */}
          {ROWS.map((_, r) => (
            <div key={r} style={{ position: 'absolute', left: SHEET.left, top: cellRect(r, 0).y + SHEET.rowH - 1, width: SHEET.w, height: 1, background: S.hair }} />
          ))}
        </div>
        {ROWS.map((row, r) => row.map((_, c) => <Cell key={`${r}-${c}`} f={f} r={r} c={c} lifting={lifting} dim={dim} />))}
        {f >= T.edits - 10 && f < T.fake1 && [0, 1, 2].map((k) => <SheetCursor key={k} f={f} k={k} />)}
      </div>
    </World3>
  )
}

function Cell({ f, r, c, lifting, dim, z = 2 }) {
  const rect = cellRect(r, c)
  const v = cellValue(f, r, c)
  const bad = BAD[v]
  const tint = bad === 'red' ? S.redTint : bad === 'amber' ? S.amberTint : 'transparent'
  const color = bad === 'red' ? S.red : bad === 'amber' ? S.amber : S.inkSoft
  let x = rect.x
  let y = rect.y
  let s = 1
  let o = 1
  if (lifting) {
    // each cell becomes part of a tile: columns leave 2 frames apart, on an arc
    const tile = tileRect(c % 4)
    const t = ramp(f, T.rebuild + 6 + c * 2 + r, 32, EASE.glide)
    const tx = tile.x + 30 + (r % 4) * 70
    const ty = tile.y + 30 + Math.floor(r / 4) * 60
    x = lerp(rect.x, tx, t)
    y = lerp(rect.y, ty, t) - Math.sin(Math.PI * t) * (120 + 60 * rand(r * 7 + c))
    s = lerp(1, 0.35, t)
    o = 1 - ramp(f, T.rebuild + 30 + c * 2 + r, 10)
    if (o <= 0) return null
  }
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: rect.w, height: rect.h, transform: `scale(${s.toFixed(4)})`, transformOrigin: '0 0', opacity: o * (r === REF.r && c === REF.c ? 1 : 1 - 0.94 * dim), boxSizing: 'border-box', padding: '0 18px', display: 'flex', alignItems: 'center', background: tint, borderLeft: `1px solid ${S.hair}`, zIndex: z, ...txt(28, color), whiteSpace: 'nowrap', overflow: 'hidden', borderRadius: lifting ? 10 : 0 }}>
      {v}
    </div>
  )
}

function SheetCursor({ f, k }) {
  const p = cursorAt(f, k)
  const cur = CURSORS[k]
  const o = arriveT(f, T.edits - 10 + k * 4, 12)
  return (
    <div style={{ position: 'absolute', left: p.x, top: p.y, zIndex: 10, opacity: o }}>
      <svg width={40} height={40} viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' }}>
        <path d="M5 3l14 8.2-6.1 1.5 3.6 6.9-2.7 1.4-3.6-6.9L5 18.7z" fill={cur.color} stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <div style={{ position: 'absolute', left: 30, top: 30, padding: '4px 12px', borderRadius: 8, background: cur.color, fontFamily: SANS, fontWeight: 500, fontSize: 28, color: '#111', whiteSpace: 'nowrap' }}>{cur.name}</div>
    </div>
  )
}

/* ---- 6-7. the dashboard, on paper ---- */

function Dashboard({ f }) {
  const paperT = ramp(f, T.paper, 10, EASE.flood)
  const out = f >= T.fake2 ? 1 : 0
  if (out) return null
  const cam = [
    { x: CX, y: 540, s: 1 },
    { at: T.push, dur: 60, x: lerp(CX, CLASH.x, 0.3), y: lerp(540, CLASH.y, 0.3), s: 1.1 },
  ]
  const frameA = arriveT(f, T.paper + 4, 20)
  return (
    <World3 f={f} keys={cam}>
      {/* the window builds on paper around the tiles */}
      <div style={{ position: 'absolute', left: DASH.left, top: DASH.top, width: DASH.w, height: DASH.h, borderRadius: 26, background: '#ffffff', boxShadow: `inset 0 0 0 1.5px ${PAPER.line}, 0 40px 90px -30px rgba(22,20,18,0.25)`, opacity: frameA, overflow: 'hidden' }}>
        <div style={{ height: 76, display: 'flex', alignItems: 'center', padding: '0 34px', borderBottom: `1px solid ${PAPER.line}`, ...txt(34, PAPER.ink) }}>
          Studio operations
          <span style={{ marginLeft: 'auto' }}><Label color={PAPER.muted}>Today</Label></span>
        </div>
        <LightSweep f={f} at={T.sweep} paper dur={28} />
      </div>
      {TILES.map((t, i) => {
        const r = tileRect(i)
        const a = arriveT(f, T.rebuild + 40 + i * 6, 20)
        return (
          <div key={t.label} style={{ position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: 'border-box', padding: '28px 30px', borderRadius: 20, background: paperT > 0.5 ? '#f7f4f0' : 'rgba(28,27,29,0.97)', boxShadow: `inset 0 0 0 1.5px ${paperT > 0.5 ? PAPER.line : 'rgba(245,135,30,0.35)'}`, opacity: a, transform: `scale(${(0.94 + 0.06 * a).toFixed(4)})`, zIndex: 3 }}>
            <div style={txt(30, paperT > 0.5 ? PAPER.muted : S.muted)}>{t.label}</div>
            <div style={{ ...txt(76, paperT > 0.5 ? PAPER.ink : S.ink), marginTop: 18, letterSpacing: '-0.04em' }}>{t.value}</div>
          </div>
        )
      })}
      {f >= T.paper && (
        <div style={{ position: 'absolute', left: LIST.left, top: LIST.top, width: LIST.w, height: LIST.h, borderRadius: 20, background: '#f7f4f0', boxShadow: `inset 0 0 0 1.5px ${PAPER.line}`, opacity: arriveT(f, T.paper + 14, 20), zIndex: 3 }}>
          <div style={{ position: 'absolute', left: 30, top: 28, ...txt(36, PAPER.ink) }}>Today's bookings</div>
          <div style={{ position: 'absolute', left: CLASH.x - LIST.left - 120, top: 22, width: 240, height: 60, borderRadius: 999, background: 'rgba(143,209,158,0.25)', boxShadow: 'inset 0 0 0 1.5px rgba(60,140,80,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...txt(30, '#2f6b3d') }}>
            <Icon name="check" size={28} color="#2f6b3d" stroke={2.6} /> No clashes
          </div>
          {[
            ['10:00 am', 'Studio A', 'Workshop'],
            ['1:30 pm', 'Studio B', 'Consult'],
            ['6:00 pm', 'Studio A', 'Workshop'],
          ].map((row, i) => (
            <div key={i} style={{ position: 'absolute', left: 30, right: 30, top: 110 + i * 76, height: 66, display: 'flex', alignItems: 'center', borderTop: `1px solid ${PAPER.line}`, ...txt(32, PAPER.ink) }}>
              <span style={{ width: 260 }}><Label size={30} color={PAPER.accent}>{row[0]}</Label></span>
              <span style={{ width: 360 }}>{row[1]}</span>
              <span style={{ color: PAPER.soft }}>{row[2]}</span>
            </div>
          ))}
        </div>
      )}
    </World3>
  )
}

/* ---- 9. roles: the indicator slides, panels lock and unlock ---- */

function roleAt(f) {
  let k = 0
  T.switches.forEach((t, i) => {
    if (f >= t) k = i
  })
  return k
}

function Roles({ f }) {
  const a = arriveT(f, T.roles, 20)
  const out = leaveT(f, T.payoff - 4, 10)
  const k = roleAt(f)
  const since = f - T.switches[k]
  return (
    <AbsoluteFill style={{ opacity: a * (1 - out) }}>
      <div style={{ position: 'absolute', left: SW.left - 8, top: SW.y - SW.h / 2, width: SW.segW * 4 + 16, height: SW.h, borderRadius: 999, background: 'rgba(28,27,29,0.96)', boxShadow: `inset 0 0 0 1.5px ${S.line}` }} />
      {ROLES.map((r, i) => (
        <div key={r} style={{ position: 'absolute', left: SW.left + i * SW.segW, top: SW.y - SW.h / 2, width: SW.segW, height: SW.h, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 45, ...txt(34, f >= T.switches[0] - 4 && i === k ? S.onSaffron : S.inkSoft) }}>{r}</div>
      ))}
      {PANELS.map((p, i) => {
        const open = ACCESS[k][i]
        const wasOpen = k > 0 ? ACCESS[k - 1][i] : 1
        const t = f < T.switches[0] ? 1 : open === wasOpen ? 1 : ramp(since, 0, 12, EASE.arrive)
        const shownOpen = t > 0.5 ? open : wasOpen
        const pop = open !== wasOpen ? 1 - Math.abs(t - 0.5) * 2 : 0
        const x = 300 + i * 336
        return (
          <div key={p} style={{ position: 'absolute', left: x, top: 520, width: 312, height: 300, boxSizing: 'border-box', padding: 30, borderRadius: 24, background: 'rgba(28,27,29,0.96)', boxShadow: `inset 0 0 0 1.5px ${shownOpen ? 'rgba(143,209,158,0.45)' : S.line}`, opacity: arriveT(f, T.roles + 6 + i * 6, 20), transform: `scale(${(1 - 0.03 * pop).toFixed(4)})` }}>
            <div style={txt(36)}>{p}</div>
            <div style={{ position: 'absolute', left: 30, bottom: 30, display: 'flex', alignItems: 'center', gap: 12, opacity: 1 - pop * 0.8 }}>
              <Icon name={shownOpen ? 'check' : 'lock'} size={34} color={shownOpen ? S.green : S.muted} stroke={2.2} />
              <Label size={28} color={shownOpen ? S.green : S.muted}>{shownOpen ? 'Can open' : 'Hidden'}</Label>
            </div>
            {!shownOpen && <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'rgba(11,11,12,0.45)' }} />}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}
