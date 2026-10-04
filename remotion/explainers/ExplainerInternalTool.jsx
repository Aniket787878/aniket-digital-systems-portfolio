import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, useStageFonts, Ground, Tag, Beat, Captions, World, camAt, Glass, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, arrive, move, fadeIn, lerp, cl } from './stageLook.jsx'
import { Soundtrack, cue } from '../sound.jsx'

/*
  Internal Tool / Dashboard, 30 s, in the Stage look. Same story as before:
  a messy shared spreadsheet ("FINAL_v7.xlsx": clashing colours, a #REF!,
  someone else editing) comes apart cell by cell, and the cells fly into
  place as a clean dashboard: today's numbers, today's bookings and role
  permissions. All data is illustrative and the dashboard says so; its
  numbers do not count up, because they are not real counts.
*/

export const TOOL_LEN = 904

const T = { hookEnd: 92, sheet: 0, edit: 150, note: 200, morph: 292, cards: 352, roles: 548, end: 708 }
const CAPS = [
  { at: 112, text: 'Everyone edits it. Nobody {trusts} it.', exit: T.morph - 18 },
  { at: T.morph - 8, text: 'Now turn it into one clean {tool.}' },
  { at: 426, text: 'One source of {truth.}' },
  { at: T.roles, text: 'Everyone sees exactly what they {need.}', exit: T.end - 12 },
]
const KPIS = [
  { label: 'Bookings this week', n: 48, icon: 'calendar' },
  { label: 'Open enquiries', n: 12, icon: 'chat' },
  { label: 'Awaiting payment', n: 3, icon: 'tag' },
  { label: 'Rooms free today', n: 2, icon: 'grid' },
]
const EDIT_HOP = 30 // the other person's cursor jumps cell every second
const CAM = [
  { x: 960, y: 620, s: 0.86, rx: 16 },
  { at: T.hookEnd - 4, dur: 22, x: 960, y: 590, s: 0.98, rx: 0 },
  { at: T.morph, dur: 30, x: 960, y: 600, s: 1 },
  { at: T.roles - 6, dur: 18, x: 1440, y: 720, s: 1.22 },
]

/* The sound (remotion/sound.jsx), from the beats above: the hook line,
   every camera move, someone else's cursor hopping, the comment landing,
   the morph, the tiles landing, the role switch and the end card. */
const CUES = [
  cue('thump', 6 + 1),
  ...CAM.slice(1).map((k) => cue('whoosh', k.at, k.at === T.morph ? 1 : 0.7)),
  ...[1, 2, 3].map((j) => cue('click', T.edit + j * EDIT_HOP, 0.4)),
  cue('tick', T.note + 1, 0.8),
  ...KPIS.map((_, i) => cue('tick', T.cards + 10 + i * 5 + 1, 0.5)),
  cue('tick', T.roles + 16), // "Front desk" lights
  cue('thump', T.end + END_HEADING_AT + 1, 0.7),
  cue('end', T.end + END_BUTTON_AT),
]

/* ---------- the spreadsheet ---------- */
const SHEET = { x: 180, y: 250, w: 1560, h: 690, bar: 64, head: 50 }
const COLS = 8
const ROWS = 8
const CW = SHEET.w / COLS
const RH = (SHEET.h - SHEET.bar - SHEET.head) / ROWS

const TONE = { w: 'rgba(255,255,255,0.025)', red: S.redTint, amber: S.amberTint, green: S.greenTint, blue: S.blueTint, head: 'rgba(255,255,255,0.06)' }
const INK = { red: S.red, amber: S.amber, green: S.green, blue: S.blue, head: S.muted }

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
const D = { x: 96, w: 1728, head: 250, kpi: 330, body: 500, bodyH: 470 }
const TILE_W = (D.w - 3 * 24) / 4
const ROW_H = D.bodyH / 6

function dashboardSlots() {
  const slots = []
  for (let i = 0; i < 8; i++) slots.push({ x: D.x + i * 216, y: D.head, w: 216, h: 64 })
  for (let r = 0; r < 2; r++)
    for (let t = 0; t < 4; t++)
      for (let c = 0; c < 2; c++) slots.push({ x: D.x + t * (TILE_W + 24) + c * (TILE_W / 2), y: D.kpi + r * 75, w: TILE_W / 2, h: 75 })
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) slots.push({ x: 96 + c * (1040 / 3), y: D.body + r * ROW_H, w: 1040 / 3, h: ROW_H })
    for (let c = 0; c < 2; c++) slots.push({ x: 1160 + c * 332, y: D.body + r * ROW_H, w: 332, h: ROW_H })
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

export function ExplainerInternalTool() {
  useStageFonts()
  const f = useCurrentFrame()
  const cam = camAt(f, CAM)
  // the sheet sits out of focus behind the opening line, then snaps sharp
  const focus = move(f, T.hookEnd - 6, 14)
  const dof = move(f, T.roles - 6, 18)
  const toEnd = fadeIn(f, T.end, 10)
  const glow = f < T.morph ? { x: 960, y: 560 } : f < T.roles ? { x: 760, y: 640 } : { x: 1300, y: 700 }
  return (
    <Ground f={f} glow={glow}>
      {f < T.end + 10 && (
        <AbsoluteFill style={{ opacity: (0.4 + 0.6 * focus) * (1 - toEnd), filter: focus < 0.99 ? `blur(${((1 - focus) * 12).toFixed(2)}px)` : undefined }}>
          <World cam={cam}>
            <SheetFrame f={f} />
            {CELLS.map((cell, i) => (
              <Cell key={i} cell={cell} f={f} />
            ))}
            <Editing f={f} />
            <Dashboard f={f} dof={dof} />
          </World>
          <Captions f={f} items={CAPS} top={92} size={66} />
        </AbsoluteFill>
      )}
      <Beat f={f} text={'Still running the business\nout of a {spreadsheet?}'} start={6} end={T.hookEnd - 8} size={120} />
      {f >= T.end && <EndCard f={f - T.end} />}
      <Tag />
      <Soundtrack cues={CUES} voice="internal-tool" />
    </Ground>
  )
}

function SheetFrame({ f }) {
  const out = fadeIn(f, T.morph - 6, 22)
  if (out >= 1) return null
  return (
    <Glass rim="top" style={{ left: SHEET.x, top: SHEET.y, width: SHEET.w, height: SHEET.h, overflow: 'hidden', opacity: 1 - out, transform: `scale(${(1 + out * 0.03).toFixed(4)})` }}>
      <div style={{ height: SHEET.bar, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', borderBottom: `1px solid ${S.hair}` }}>
        <Icon name="grid" size={28} color={S.green} />
        <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>FINAL_v7.xlsx</span>
        <Mono size={20}>(copy)</Mono>
        <div style={{ marginLeft: 'auto', display: 'flex' }}>
          {['#c98a63', '#7f9fd1', '#86b27c'].map((c, i) => (
            <div key={c} style={{ width: 38, height: 38, borderRadius: '50%', background: c, border: '3px solid #161617', marginLeft: i ? -12 : 0 }} />
          ))}
        </div>
      </div>
      <div style={{ height: SHEET.head, display: 'flex', borderBottom: `1px solid ${S.hair}` }}>
        {'ABCDEFGH'.split('').map((l, i) => (
          <div key={l} style={{ width: CW, textAlign: 'center', lineHeight: `${SHEET.head}px`, borderLeft: i ? `1px solid ${S.hair}` : 'none' }}>
            <Mono size={19} color={S.dim}>{l}</Mono>
          </div>
        ))}
      </div>
    </Glass>
  )
}

function Cell({ cell, f }) {
  const { r, c } = cell
  const at = T.morph + (r + c) * 2.4
  const t = arrive(f, at, 110)
  // cells someone keeps changing
  let tone = cell.tone
  if (r === 3 && c === 2 && f > 120 && f < T.morph) tone = Math.floor(f / 18) % 2 ? 'red' : 'amber'
  if (r === 6 && c === 4 && f > 150 && f < T.morph) tone = Math.floor((f + 9) / 22) % 2 ? 'green' : 'amber'
  const bg = TONE[tone] || TONE.w
  const ink = INK[tone] || S.inkSoft
  if (cell.drop) {
    if (t > 0.995) return null
    return (
      <div
        style={{
          position: 'absolute',
          left: cell.src.x,
          top: cell.src.y,
          width: cell.src.w,
          height: cell.src.h,
          boxSizing: 'border-box',
          background: bg,
          borderLeft: `1px solid ${S.hair}`,
          borderBottom: `1px solid ${S.hair}`,
          fontSize: 25,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          color: ink,
          opacity: 1 - t,
          transform: `translateY(${(t * 60).toFixed(2)}px) scale(${1 - t * 0.5}) rotate(${(t * (c % 2 ? 8 : -8)).toFixed(2)}deg)`,
          filter: t > 0.02 ? `blur(${(t * 8).toFixed(2)}px)` : undefined,
        }}
      >
        {cell.t}
      </div>
    )
  }
  const covered = fadeIn(f, T.cards, 18)
  if (covered >= 1) return null
  const x = lerp(cell.src.x, cell.dst.x, t)
  const y = lerp(cell.src.y, cell.dst.y, t)
  const w = lerp(cell.src.w, cell.dst.w, t)
  const h = lerp(cell.src.h, cell.dst.h, t)
  const lift = Math.sin(cl(t) * Math.PI)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        boxSizing: 'border-box',
        background: 'rgba(22,22,24,0.96)',
        border: `1px solid ${t > 0.05 ? `rgba(245,135,30,${(0.12 + lift * 0.4).toFixed(3)})` : S.hair}`,
        borderRadius: 8 * cl(t),
        boxShadow: lift > 0.05 ? `0 ${(lift * 18).toFixed(1)}px ${(lift * 40).toFixed(1)}px rgba(0,0,0,${(lift * 0.6).toFixed(3)})` : 'none',
        fontSize: 25,
        fontWeight: r === 0 ? 600 : 500,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: ink,
        opacity: 1 - covered,
        transform: `translateZ(${(lift * 60).toFixed(1)}px)`,
        zIndex: lift > 0.05 ? 5 : 1,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: bg, opacity: 1 - cl(t * 1.4) }} />
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', padding: '0 16px', opacity: 1 - cl(t / 0.35) }}>{cell.t}</span>
    </div>
  )
}

function Editing({ f }) {
  if (f < T.edit || f > T.morph + 6) return null
  const spots = [
    [3, 2],
    [5, 6],
    [1, 4],
    [6, 2],
  ]
  const k = Math.min(spots.length - 1, Math.floor((f - T.edit) / EDIT_HOP))
  const [r, c] = spots[k]
  const o = fadeIn(f, T.edit, 8) * (1 - fadeIn(f, T.morph - 8, 10))
  const x = SHEET.x + c * CW
  const y = SHEET.y + SHEET.bar + SHEET.head + r * RH
  const note = arrive(f, T.note, 130)
  return (
    <>
      <div style={{ position: 'absolute', left: x - 1, top: y - 1, width: CW + 2, height: RH + 2, border: `2.5px solid ${S.blue}`, boxSizing: 'border-box', opacity: o, zIndex: 6, borderRadius: 3 }}>
        <div style={{ position: 'absolute', left: -3, top: -34, padding: '3px 10px', background: S.blue, color: '#0b0b0c', borderRadius: '6px 6px 6px 0', whiteSpace: 'nowrap' }}>
          <Mono size={18} color="#0b0b0c">Editing</Mono>
        </div>
      </div>
      <Glass
        rim={null}
        radius={20}
        style={{ left: SHEET.x + 6 * CW - 270, top: SHEET.y + SHEET.bar + SHEET.head + 6 * RH + 14, padding: '16px 24px', fontSize: 30, letterSpacing: '-0.02em', whiteSpace: 'nowrap', borderRadius: '20px 20px 20px 6px', opacity: cl(note * 1.5) * (1 - fadeIn(f, T.morph - 10, 10)), transform: `translateY(${((1 - note) * 20).toFixed(2)}px)`, zIndex: 7 }}
      >
        Who changed this?
      </Glass>
    </>
  )
}

/* ---------- dashboard blocks ---------- */

function Dashboard({ f, dof }) {
  const a = fadeIn(f, T.cards, 18)
  if (a <= 0) return null
  const kpis = KPIS
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
  const roleOn = fadeIn(f, T.roles + 14, 10)
  const pill = (s) =>
    s === 'Confirmed'
      ? { background: 'rgba(245,135,30,0.12)', color: S.peach, border: '1px solid rgba(245,135,30,0.3)' }
      : s === 'New'
        ? { background: S.saffron, color: S.onSaffron, border: `1px solid ${S.saffron}`, fontWeight: 600 }
        : { background: 'rgba(255,255,255,0.05)', color: S.muted, border: `1px solid ${S.line}` }
  const soft = dof > 0.01 ? { filter: `blur(${(dof * 5).toFixed(2)}px)`, opacity: 1 - dof * 0.4 } : null
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <div style={{ position: 'absolute', inset: 0, ...soft }}>
        <Glass rim={null} style={{ left: D.x, top: D.head, width: D.w, height: 64, display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px' }}>
          <Icon name="chart" size={28} color={S.peach} />
          <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em' }}>Studio operations</span>
          <span style={{ padding: '4px 14px', borderRadius: 999, border: `1px solid ${S.line}` }}>
            <Mono size={18}>Illustrative data</Mono>
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 24, color: S.muted }}>Viewing as</span>
          <span style={{ fontSize: 24, fontWeight: 600, padding: '6px 16px', borderRadius: 999, background: roleOn > 0.5 ? S.saffron : 'rgba(245,135,30,0.12)', color: roleOn > 0.5 ? S.onSaffron : S.peach }}>Front desk</span>
        </Glass>
        {kpis.map((k, i) => {
          const t = arrive(f, T.cards + 10 + i * 5, 130)
          return (
            <Glass key={k.label} rim={i === 0 ? 'top' : null} style={{ left: D.x + i * (TILE_W + 24), top: D.kpi, width: TILE_W, height: 150, padding: '22px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: S.muted }}>
                <Icon name={k.icon} size={24} color={S.peach} />
                {k.label}
              </div>
              <div style={{ marginTop: 12, fontSize: 62, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1, opacity: cl(t * 1.5), transform: `translateY(${((1 - t) * 16).toFixed(2)}px)` }}>{k.n}</div>
            </Glass>
          )
        })}
        <Glass rim="left" style={{ left: 96, top: D.body, width: 1040, height: D.bodyH, overflow: 'hidden' }}>
          <div style={{ height: ROW_H, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1px solid ${S.hair}` }}>
            <Icon name="calendar" size={26} color={S.peach} />
            <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Today’s bookings</span>
            <span style={{ marginLeft: 'auto' }}>
              <Mono size={19}>No clashes</Mono>
            </span>
            <Icon name="check" size={24} color={S.saffron} stroke={2.6} />
          </div>
          {bookings.map((b, i) => {
            const t = arrive(f, T.cards + 12 + i * 5)
            return (
              <div key={b[0]} style={{ height: ROW_H, display: 'grid', gridTemplateColumns: '200px 240px 1fr', alignItems: 'center', padding: '0 26px', borderBottom: i < bookings.length - 1 ? `1px solid ${S.hair}` : 'none', fontSize: 27, letterSpacing: '-0.015em', opacity: cl(t * 1.5), transform: `translateX(${((1 - t) * 24).toFixed(2)}px)` }}>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{b[0]}</span>
                <span style={{ color: S.muted }}>{b[1]}</span>
                <span>
                  <span style={{ fontSize: 22, padding: '6px 16px', borderRadius: 999, ...pill(b[2]) }}>{b[2]}</span>
                </span>
              </div>
            )
          })}
        </Glass>
      </div>
      <Glass rim="right" lit={roleOn * 0.6} style={{ left: 1160, top: D.body, width: 664, height: D.bodyH, overflow: 'hidden' }}>
        <div style={{ height: ROW_H, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1px solid ${S.hair}` }}>
          <Icon name="shield" size={26} color={S.peach} />
          <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Roles and access</span>
        </div>
        {roles.map((rr, i) => {
          const t = arrive(f, T.cards + 18 + i * 5)
          const hot = i === 1 ? roleOn : 0
          return (
            <div key={rr[0]} style={{ position: 'relative', height: ROW_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: i < roles.length - 1 ? `1px solid ${S.hair}` : 'none', opacity: cl(t * 1.5), transform: `translateX(${((1 - t) * 24).toFixed(2)}px)` }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,135,30,0.12)', borderLeft: `3px solid ${S.saffron}`, opacity: hot }} />
              <Icon name={i === 4 ? 'lock' : 'user'} size={24} color={hot > 0.5 ? S.saffron : S.muted} style={{ position: 'relative' }} />
              <span style={{ position: 'relative', fontSize: 27, letterSpacing: '-0.015em' }}>{rr[0]}</span>
              <span style={{ position: 'relative', marginLeft: 'auto' }}>
                <Mono size={19} color={hot > 0.5 ? S.peach : S.muted}>{rr[1]}</Mono>
              </span>
            </div>
          )
        })}
      </Glass>
    </div>
  )
}
