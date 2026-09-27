import { AbsoluteFill } from 'remotion'
import { C, SANS, rise, pop, tween, lerp, easeInOut } from '../shared.jsx'
import { Icon } from '../icons.jsx'
import { Shell, StepHeadline } from './Shell.jsx'
import { cardShadow } from './illustrative.jsx'

/*
  Internal Tool / Dashboard, ~30s. A messy shared spreadsheet
  ("FINAL_v7.xlsx": clashing colours, a #REF!, someone else editing) comes
  apart cell by cell and the cells fly into place as a clean dashboard: KPI
  tiles, today's bookings and role permissions. All data is illustrative
  and the dashboard says so.
*/

const PAPER_AT = 104
const PAPER_END = 604
export const TOOL_LEN = PAPER_AT + PAPER_END + 196

const T = { sheet: 14, morph: 188, cards: 274, count: 294, roles: 440 }
const LINES = [
  { at: 20, text: 'Everyone edits it. {Nobody trusts it.}' },
  { at: 176, text: 'Now turn it into {one clean tool.}' },
  { at: 318, text: 'One source of {truth.}' },
  { at: T.roles, text: 'Everyone sees {exactly what they need.}', exit: PAPER_END - 10 },
]

/* ---------- the spreadsheet ---------- */
const SHEET = { x: 180, y: 236, w: 1560, h: 700, bar: 64, head: 52 }
const COLS = 8
const ROWS = 8
const CW = SHEET.w / COLS
const RH = (SHEET.h - SHEET.bar - SHEET.head) / ROWS

const TONE = { w: '#ffffff', red: '#fbe3e1', amber: '#fcecc9', green: '#e3f1e0', blue: '#e2ebf8', head: '#f3efe9' }
const INK = { red: C.alert, amber: '#8a5a00', green: '#2f6b2a', blue: '#2d5a9a' }

// [text, tone]
const DATA = [
  [['Date', 'head'], ['Client', 'head'], ['Time', 'head'], ['Room', 'head'], ['Paid', 'head'], ['Staff', 'head'], ['Notes', 'head'], ['??', 'head']],
  [['Tue'], ['Client 014'], ['5pm', 'red'], ['Rm 2'], ['yes?', 'amber'], ['AS'], ['call back'], ['']],
  [['Tue'], ['Client 027'], ['5pm', 'red'], ['#REF!', 'red'], ['no'], ['AS'], [''], ['dup?', 'amber']],
  [['tue'], ['Client 014'], ['17:00', 'amber'], ['Room 2'], ['paid', 'green'], ['R'], ['moved?'], ['']],
  [['Wed'], ['Client 031'], ['11'], ['Rm1'], ['', 'blue'], ['AS'], ['see email'], ['old']],
  [['Wed'], [''], ['2pm', 'green'], ['Rm 3'], ['yes'], ['MK'], ['CHECK', 'red'], ['']],
  [['Thu'], ['Client 009'], ['6.30', 'amber'], ['Rm 2'], ['?', 'amber'], [''], ['VIP'], ['x']],
  [['Fri'], ['Client 014'], ['10am'], ['Rm 1', 'blue'], ['yes'], ['R'], [''], ['']],
]
const DROP = new Set(['0-7', '1-7', '2-7', '3-7', '4-7', '5-7', '6-7', '7-7', '2-3', '5-6'])

/* ---------- the dashboard it becomes ---------- */
const D = { x: 96, w: 1728, top: 214 }
function dashboardSlots() {
  const slots = []
  // header bar: 8 cells
  for (let i = 0; i < 8; i++) slots.push({ block: 'header', x: D.x + i * 216, y: 214, w: 216, h: 70 })
  // KPI tiles: 4 tiles, 2x2 cells each
  const tileW = (D.w - 3 * 24) / 4
  for (let r = 0; r < 2; r++)
    for (let t = 0; t < 4; t++)
      for (let c = 0; c < 2; c++) slots.push({ block: `kpi${t}`, x: D.x + t * (tileW + 24) + c * (tileW / 2), y: 304 + r * 80, w: tileW / 2, h: 80 })
  // bookings (3 cols) and roles (2 cols), 6 rows, interleaved by row
  const rowH = 500 / 6
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) slots.push({ block: 'bookings', x: 96 + c * (1040 / 3), y: 484 + r * rowH, w: 1040 / 3, h: rowH })
    for (let c = 0; c < 2; c++) slots.push({ block: 'roles', x: 1160 + c * 332, y: 484 + r * rowH, w: 332, h: rowH })
  }
  return slots
}
const SLOTS = dashboardSlots()

const CELLS = (() => {
  const out = []
  let k = 0
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const [t, tone = 'w'] = DATA[r][c]
      const src = { x: SHEET.x + c * CW, y: SHEET.y + SHEET.bar + SHEET.head + r * RH, w: CW, h: RH }
      const drop = DROP.has(`${r}-${c}`)
      out.push({ r, c, t, tone, src, drop, dst: drop ? null : SLOTS[k++] })
    }
  return out
})()

function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const x = p(a)
  const y = p(b)
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`
}

export function ExplainerInternalTool() {
  return (
    <Shell hook={'Still running the business\n{out of a spreadsheet?}'} hookIcon="grid" paperAt={PAPER_AT} paperEnd={PAPER_END} offerKey="tool">
      {(f) => <Paper f={f} />}
    </Shell>
  )
}

function Paper({ f }) {
  const sheetIn = rise(f, T.sheet, { stiffness: 70 })
  const frameOut = tween(f, T.morph - 6, T.morph + 20)
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <StepHeadline f={f} items={LINES} size={76} />
      {/* spreadsheet chrome (title bar and column letters) */}
      <div
        style={{
          position: 'absolute',
          left: SHEET.x,
          top: SHEET.y,
          width: SHEET.w,
          height: SHEET.h,
          borderRadius: 20,
          background: C.card,
          border: `1.5px solid ${C.cardLine}`,
          boxShadow: cardShadow,
          opacity: sheetIn * (1 - frameOut),
          transform: `translateY(${(1 - sheetIn) * 40}px) scale(${1 + frameOut * 0.03})`,
          overflow: 'hidden',
        }}
      >
        <div style={{ height: SHEET.bar, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', background: '#f3efe9', borderBottom: `1.5px solid ${C.cardLine}` }}>
          <Icon name="grid" size={30} color="#2f6b2a" />
          <span style={{ fontSize: 30, letterSpacing: '-0.02em', color: C.inkDark }}>FINAL_v7.xlsx</span>
          <span style={{ fontSize: 26, color: C.mutedDark, marginLeft: 8 }}>(copy)</span>
          <div style={{ marginLeft: 'auto', display: 'flex' }}>
            {['#d98b5f', '#7f9fd1', '#9bc28f'].map((c, i) => (
              <div key={c} style={{ width: 40, height: 40, borderRadius: '50%', background: c, border: '3px solid #f3efe9', marginLeft: i ? -12 : 0 }} />
            ))}
          </div>
        </div>
        <div style={{ height: SHEET.head, display: 'flex', background: '#faf8f5', borderBottom: `1.5px solid ${C.cardLine}` }}>
          {'ABCDEFGH'.split('').map((l, i) => (
            <div key={l} style={{ width: CW, textAlign: 'center', lineHeight: `${SHEET.head}px`, fontSize: 26, color: '#a59d93', borderLeft: i ? `1.5px solid ${C.cardLine}` : 'none' }}>{l}</div>
          ))}
        </div>
      </div>

      {/* the cells, which become the dashboard */}
      {CELLS.map((cell, i) => (
        <Cell key={i} cell={cell} f={f} sheetIn={sheetIn} />
      ))}

      {/* someone else editing, and a comment nobody answers */}
      <Editing f={f} />

      {/* dashboard content, over the landed cells */}
      <Dashboard f={f} />
    </AbsoluteFill>
  )
}

function Cell({ cell, f, sheetIn }) {
  const { r, c } = cell
  const at = T.morph + (r + c) * 2.4
  const t = rise(f, at, { stiffness: 65 })
  // a cell someone keeps changing
  let tone = cell.tone
  if (r === 3 && c === 2 && f > 60 && f < T.morph) tone = Math.floor(f / 18) % 2 ? 'red' : 'amber'
  if (r === 6 && c === 4 && f > 90 && f < T.morph) tone = Math.floor((f + 9) / 22) % 2 ? 'green' : 'amber'
  const baseBg = TONE[tone] || TONE.w
  if (cell.drop) {
    return (
      <div
        style={{
          position: 'absolute',
          left: cell.src.x,
          top: cell.src.y,
          width: cell.src.w,
          height: cell.src.h,
          boxSizing: 'border-box',
          background: baseBg,
          borderLeft: `1.5px solid ${C.cardLine}`,
          borderBottom: `1.5px solid ${C.cardLine}`,
          fontSize: 26,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          color: INK[tone] || C.inkDark,
          opacity: sheetIn * (1 - t),
          transform: `translateY(${(t * 60).toFixed(2)}px) scale(${1 - t * 0.5}) rotate(${(t * (c % 2 ? 8 : -8)).toFixed(2)}deg)`,
          filter: t > 0.02 ? `blur(${(t * 8).toFixed(2)}px)` : undefined,
        }}
      >
        {cell.t}
      </div>
    )
  }
  const x = lerp(cell.src.x, cell.dst.x, t)
  const y = lerp(cell.src.y, cell.dst.y, t)
  const w = lerp(cell.src.w, cell.dst.w, t)
  const h = lerp(cell.src.h, cell.dst.h, t)
  const lift = Math.sin(Math.min(1, t) * Math.PI)
  const covered = tween(f, T.cards, T.cards + 20)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: 'border-box',
        background: mix(baseBg === TONE.head ? TONE.head : baseBg, '#ffffff', Math.min(1, t * 1.3)),
        border: `1.5px solid ${mix('#e7e1d9', '#efe9e1', t)}`,
        borderRadius: 8 * Math.min(1, t),
        boxShadow: lift > 0.05 ? `0 ${(lift * 18).toFixed(1)}px ${(lift * 34).toFixed(1)}px rgba(22,20,18,${(lift * 0.14).toFixed(3)})` : 'none',
        fontSize: 26,
        fontWeight: r === 0 ? 500 : 400,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: INK[tone] || C.inkDark,
        opacity: sheetIn * (1 - covered),
        transform: `scale(${(1 + lift * 0.04).toFixed(4)})`,
        zIndex: lift > 0.05 ? 5 : 1,
      }}
    >
      <span style={{ opacity: 1 - tween(t, 0, 0.35, (v) => v) }}>{cell.t}</span>
    </div>
  )
}

function Editing({ f }) {
  if (f > T.morph + 6) return null
  const spots = [
    [3, 2],
    [5, 6],
    [1, 4],
    [6, 2],
  ]
  const k = Math.min(spots.length - 1, Math.floor(Math.max(0, f - 50) / 30))
  const [r, c] = spots[k]
  const o = tween(f, 50, 60) * (1 - tween(f, T.morph - 8, T.morph + 4))
  const x = SHEET.x + c * CW
  const y = SHEET.y + SHEET.bar + SHEET.head + r * RH
  const note = pop(f, 96)
  return (
    <>
      <div style={{ position: 'absolute', left: x - 1, top: y - 1, width: CW + 2, height: RH + 2, border: '3px solid #5b82c6', boxSizing: 'border-box', opacity: o, zIndex: 6 }}>
        <div style={{ position: 'absolute', left: -3, top: -38, padding: '2px 10px', background: '#5b82c6', color: '#fff', fontSize: 26, borderRadius: '6px 6px 6px 0', whiteSpace: 'nowrap' }}>Editing</div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: SHEET.x + 6 * CW - 250,
          top: SHEET.y + SHEET.bar + SHEET.head + 5 * RH + RH + 14,
          padding: '16px 22px',
          borderRadius: '18px 18px 18px 6px',
          background: C.inkDark,
          color: C.ink,
          fontSize: 28,
          letterSpacing: '-0.02em',
          boxShadow: '0 18px 40px rgba(22,20,18,0.25)',
          opacity: Math.min(1, note * 1.4) * (1 - tween(f, T.morph - 10, T.morph)),
          transform: `translateY(${(1 - note) * 20}px)`,
          zIndex: 7,
          whiteSpace: 'nowrap',
        }}
      >
        Who changed this?
      </div>
    </>
  )
}

/* ---------- dashboard blocks ---------- */

const block = (x, y, w, h, extra) => ({ position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box', borderRadius: 18, background: C.card, border: `1.5px solid ${C.cardLine}`, boxShadow: cardShadow, ...extra })

function Dashboard({ f }) {
  const a = tween(f, T.cards, T.cards + 20)
  if (a <= 0) return null
  const tileW = (D.w - 3 * 24) / 4
  const kpis = [
    { label: 'Bookings this week', n: 48, icon: 'calendar' },
    { label: 'Open enquiries', n: 12, icon: 'chat' },
    { label: 'Awaiting payment', n: 3, icon: 'tag' },
    { label: 'Rooms free today', n: 2, icon: 'grid' },
  ]
  const bookings = [
    ['10:00', 'Room 2', 'Confirmed'],
    ['11:30', 'Room 1', 'Confirmed'],
    ['14:00', 'Room 3', 'Awaiting payment'],
    ['16:30', 'Room 2', 'Confirmed'],
    ['18:00', 'Room 1', 'New'],
  ]
  const roles = [
    ['Owner', 'Everything'],
    ['Front desk', 'Bookings, clients'],
    ['Practitioner', 'Own schedule'],
    ['Accounts', 'Invoices only'],
    ['Client notes', 'Practitioner only'],
  ]
  const roleOn = rise(f, T.roles + 10)
  const rowH = 500 / 6
  const pill = (s) =>
    s === 'Confirmed'
      ? { background: C.tint, color: C.accentDeep }
      : s === 'New'
        ? { background: C.accent, color: C.onAccent }
        : { background: C.paper2, color: C.mutedDark }
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a, color: C.inkDark }}>
      {/* header */}
      <div style={block(D.x, 214, D.w, 70, { display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px' })}>
        <Icon name="chart" size={30} color={C.accentDeep} />
        <span style={{ fontSize: 32, letterSpacing: '-0.025em' }}>Studio operations</span>
        <span style={{ fontSize: 26, padding: '4px 14px', borderRadius: 999, background: C.paper2, color: C.mutedDark }}>Illustrative data</span>
        <span style={{ marginLeft: 'auto', fontSize: 26, color: C.mutedDark }}>Viewing as</span>
        <span style={{ fontSize: 26, padding: '6px 16px', borderRadius: 999, background: roleOn > 0.5 ? C.accent : C.tint, color: roleOn > 0.5 ? C.onAccent : C.accentDeep }}>Front desk</span>
      </div>
      {/* KPI tiles */}
      {kpis.map((k, i) => {
        const t = tween(f, T.count + i * 6, T.count + 40 + i * 6, easeInOut)
        return (
          <div key={k.label} style={block(D.x + i * (tileW + 24), 304, tileW, 160, { padding: '22px 26px' })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 26, color: C.mutedDark }}>
              <Icon name={k.icon} size={26} color={C.accentDeep} />
              {k.label}
            </div>
            <div style={{ marginTop: 12, fontSize: 64, letterSpacing: '-0.045em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{Math.round(k.n * t)}</div>
          </div>
        )
      })}
      {/* bookings */}
      <div style={block(96, 484, 1040, 500, { overflow: 'hidden' })}>
        <div style={{ height: rowH, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1.5px solid ${C.cardLine}` }}>
          <Icon name="calendar" size={28} color={C.accentDeep} />
          <span style={{ fontSize: 30, letterSpacing: '-0.02em' }}>Today’s bookings</span>
          <span style={{ marginLeft: 'auto', fontSize: 26, color: C.mutedDark }}>No clashes</span>
          <Icon name="check" size={26} color={C.accent} stroke={2.6} />
        </div>
        {bookings.map((b, i) => {
          const t = rise(f, T.cards + 12 + i * 5)
          return (
            <div key={b[0]} style={{ height: rowH, display: 'grid', gridTemplateColumns: '200px 240px 1fr', alignItems: 'center', padding: '0 26px', borderBottom: i < bookings.length - 1 ? `1.5px solid ${C.cardLine}` : 'none', fontSize: 28, letterSpacing: '-0.015em', opacity: t, transform: `translateX(${(1 - t) * 24}px)` }}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{b[0]}</span>
              <span style={{ color: C.mutedDark }}>{b[1]}</span>
              <span>
                <span style={{ fontSize: 26, padding: '6px 16px', borderRadius: 999, ...pill(b[2]) }}>{b[2]}</span>
              </span>
            </div>
          )
        })}
      </div>
      {/* roles */}
      <div style={block(1160, 484, 664, 500, { overflow: 'hidden' })}>
        <div style={{ height: rowH, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1.5px solid ${C.cardLine}` }}>
          <Icon name="shield" size={28} color={C.accentDeep} />
          <span style={{ fontSize: 30, letterSpacing: '-0.02em' }}>Roles and access</span>
        </div>
        {roles.map((rr, i) => {
          const t = rise(f, T.cards + 18 + i * 5)
          const hot = i === 1 ? roleOn : 0
          return (
            <div key={rr[0]} style={{ position: 'relative', height: rowH, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: i < roles.length - 1 ? `1.5px solid ${C.cardLine}` : 'none', opacity: t, transform: `translateX(${(1 - t) * 24}px)` }}>
              <div style={{ position: 'absolute', inset: 0, background: C.tint, opacity: hot }} />
              <Icon name={i === 4 ? 'lock' : 'user'} size={26} color={hot > 0.5 ? C.accentDeep : C.mutedDark} style={{ position: 'relative' }} />
              <span style={{ position: 'relative', fontSize: 28, letterSpacing: '-0.015em' }}>{rr[0]}</span>
              <span style={{ position: 'relative', marginLeft: 'auto', fontSize: 26, color: hot > 0.5 ? C.accentDeep : C.mutedDark }}>{rr[1]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
