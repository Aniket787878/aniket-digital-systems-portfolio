import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, SANS, SERIF, cl, move, fadeIn, arrive, useStageFonts, Ground, Tag, Line, Glass, EndCard, END_HEADING_AT, END_BUTTON_AT, Mono, World, camAt } from './stageLook.jsx'
import { Soundtrack, cue } from '../sound.jsx'
import { tween, settle, easeOut, easeInOut, lerp } from '../cinematic/motion.js'
import { SignalField, Point, Rings, Aurora, Sparkle, SparkleField, Burst, Flash } from '../cinematic/Signals.jsx'

/*
  Internal tool, cinematic cut, 30.1 s. Glowing lines tangle behind the
  hook, a messy shared spreadsheet (FINAL_v7.xlsx) floats in, "Who changed
  this?" lands, then every cell streams into one point, the point blooms
  into rings and a soft circle of paper opens on the clean dashboard. The
  dashboard wipes back to dark for the roles panel, then the end card.
  Voice (voice/internal-tool.mp3) starts a line at 0.3, 3.2, 9.9, 12.2,
  18.4 and 24.0 s; the picture keeps in step. All data is illustrative.
*/

/* ---- beat sheet (frames at 30 fps) ---- */
const B = {
  // 1. hook
  hookHead: 6,
  hookOut: 80,
  // 2. the messy sheet
  sheetIn: 82,
  finalHead: 98, // "Final, version seven."
  finalOut: 140,
  edit: 150, // someone else's cursor starts hopping
  editHop: 30,
  trustHead: 148, // "Everyone edits it. Nobody trusts it."
  trustOut: 284,
  note: 258, // the little comment lands
  // 3. who changed this
  whoHead: 297,
  whoOut: 342,
  // 4. the pull, the point, the bloom
  pull: 351, // cells + lines stream to one point
  pulled: 405,
  bloom: 396,
  ringsWord: 404,
  nowHead: 364, // "Now turn it into one clean tool."
  nowOut: 420,
  ringsOut: 436,
  // 5. paper: the clean dashboard
  paperIn: 414,
  paperInDone: 448,
  dash: 434,
  truthHead: 462,
  frontLit: 500,
  truthOut: 530,
  paperOut: 538,
  paperOutDone: 568,
  // 6. roles
  rolesHead: 552,
  rolesPanel: 566,
  picks: [
    { role: 0, at: 586 }, // Owner
    { role: 2, at: 616 }, // Practitioner
    { role: 3, at: 646 }, // Accounts
    { role: 1, at: 676 }, // Front desk
  ],
  rolesOut: 696,
  // 7. the card
  end: 708, // 23.6 s, as ExplainerInternalTool
}
export const TOOL_CINEMATIC_LEN = 904 // 30.1 s

const W = 1920
const H = 1080
const CX = W / 2
const CY = 540
const POINT = { x: CX, y: CY }

const INK_DARK = '#161412'
const DEEP = '#b8560a'
const TINT = '#fbe6d2'
const MUTED_P = 'rgba(22,20,18,0.62)'
const HAIR_P = 'rgba(22,20,18,0.12)'

const LINE_APPEARS = [3, 7, 11, 15, 19, 23, 27, 31, 35, 40, 45, 50, 55, 60]

/* The sound (remotion/sound.jsx), from the beats above. */
const CUES = [
  cue('thump', B.hookHead + 1, 0.8),
  cue('tick', B.sheetIn + 10, 0.5),
  cue('thump', B.finalHead + 1, 0.7),
  cue('thump', B.trustHead + 1, 0.8),
  ...[1, 2, 3].map((j) => cue('click', B.edit + j * B.editHop, 0.4)),
  cue('tick', B.note + 1, 0.8),
  cue('thump', B.whoHead + 1, 0.9),
  cue('whoosh', B.pull, 0.9),
  cue('whoosh', B.bloom, 0.8),
  cue('thump', B.nowHead + 1, 0.8),
  cue('whoosh', B.paperIn, 0.8),
  ...[0, 1, 2, 3].map((i) => cue('tick', B.dash + 12 + i * 5 + 1, 0.5)),
  cue('thump', B.truthHead + 1, 0.8),
  cue('tick', B.frontLit, 0.6),
  cue('whooshDown', B.paperOut, 0.7),
  cue('thump', B.rolesHead + 1, 0.8),
  ...B.picks.map((p) => cue('click', p.at, 0.7)),
  cue('thump', B.end + END_HEADING_AT + 1, 0.7),
  cue('end', B.end + END_BUTTON_AT),
]

export function ExplainerInternalToolCinematic() {
  useStageFonts()
  const f = useCurrentFrame()
  const dark = f < B.paperInDone || f >= B.paperOut
  return (
    <AbsoluteFill>
      <Ground f={f} glow={f < B.pull ? { x: CX, y: 560 } : { x: CX, y: 540 }} glowSize={f >= B.rolesHead ? 0.8 : 1}>
        {f < B.ringsOut + 20 && <Opening f={f} />}
        {f < B.pull + 80 && <SheetScene f={f} />}
        {f >= B.pull - 4 && f < B.ringsOut + 20 && <Bloom f={f} />}
        {f >= B.rolesHead - 6 && f < B.end + 6 && <Roles f={f} />}
      </Ground>
      {f >= B.paperIn - 4 && f < B.paperOutDone + 4 && <PaperScene f={f} />}
      <Flash f={f} />
      {f >= B.end && <EndCard f={f - B.end} />}
      <Tag />
      <Soundtrack cues={CUES} voice="internal-tool" />
    </AbsoluteFill>
  )
}

/* ---------------- 1. hook + the lines that run behind everything dark ---------------- */

function Opening({ f }) {
  const pull = tween(f, B.pull, B.pulled, (x) => x)
  const calm = 1 - 0.65 * tween(f, B.hookOut - 6, B.sheetIn + 24)
  const lines = Math.max(0, (1 - tween(f, B.pulled - 6, B.pulled + 8)) * calm)
  return (
    <>
      <Aurora f={f} opacity={0.55 * (1 - tween(f, B.hookOut, B.sheetIn + 30))} />
      <SignalField f={f} appear={LINE_APPEARS} converge={pull} point={POINT} opacity={lines} seed={7} bright={f < B.sheetIn + 20} />
      <Burst f={f} at={B.hookHead + 6} x={CX} y={540} size={640} peak={0.75} out={B.hookOut - 14} />
      <SparkleField f={f} count={9} seed={11} at={B.hookHead + 16} size={24} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 330, display: 'flex', justifyContent: 'center' }}>
        <Line text={'Still running your business\nout of a {spreadsheet?}'} f={f} start={B.hookHead} exit={B.hookOut} size={112} />
      </div>
    </>
  )
}

/* ---------------- 2 + 3. the messy sheet, "Who changed this?" ---------------- */

const SHEET = { x: 180, y: 250, w: 1560, h: 690, bar: 64, head: 50 }
const COLS = 8
const ROWS = 8
const CW = SHEET.w / COLS
const RH = (SHEET.h - SHEET.bar - SHEET.head) / ROWS
const CELL_TOP = SHEET.y + SHEET.bar + SHEET.head
const CAM = [
  { x: 960, y: 595, s: 0.86, rx: 14 },
  { at: B.sheetIn, dur: 40, x: 960, y: 595, s: 0.98, rx: 0 },
]

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

const CELLS = (() => {
  const out = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const [t, tone = 'w'] = DATA[r][c]
      const x = SHEET.x + c * CW
      const y = CELL_TOP + r * RH
      // the cells nearest the point leave first
      const d = Math.hypot(x + CW / 2 - CX, y + RH / 2 - 595) / 900
      out.push({ r, c, t, tone, x, y, d })
    }
  return out
})()

function SheetScene({ f }) {
  const inT = move(f, B.sheetIn, 26)
  const who = move(f, B.whoHead - 2, 12) * (1 - move(f, B.whoOut + 2, 10))
  const dim = 1 - 0.62 * who
  const cam = camAt(f, CAM)
  const wrapOp = inT * dim * (1 - tween(f, B.pull + 40, B.pull + 66, easeInOut))
  const blur = who * 5
  return (
    <>
      {f >= B.sheetIn && (
        <AbsoluteFill style={{ opacity: wrapOp, filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
          <World cam={cam}>
            <SheetFrame f={f} />
            {CELLS.map((cell) => (
              <Cell key={`${cell.r}-${cell.c}`} cell={cell} f={f} />
            ))}
            <Editing f={f} />
          </World>
        </AbsoluteFill>
      )}

      {/* "Final, version seven." */}
      <Burst f={f} at={B.finalHead + 8} x={CX} y={130} size={520} peak={0.7} out={B.finalOut - 8} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 92, display: 'flex', justifyContent: 'center' }}>
        <Line text="Final, version {seven.}" f={f} start={B.finalHead} exit={B.finalOut} size={92} />
      </div>

      {/* "Everyone edits it. Nobody trusts it." */}
      <Burst f={f} at={B.trustHead + 24} x={1130} y={130} size={560} peak={0.8} out={B.trustOut - 10} />
      <Sparkle f={f} x={1620} y={150} size={32} at={B.trustHead + 30} period={80} />
      <Sparkle f={f} x={250} y={170} size={26} at={B.trustHead + 50} period={96} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 92, display: 'flex', justifyContent: 'center' }}>
        <Line text="Everyone edits it. Nobody {trusts} it." f={f} start={B.trustHead} exit={B.trustOut} size={84} stagger={5} />
      </div>

      {/* "Who changed this?" */}
      <Burst f={f} at={B.whoHead + 6} x={CX} y={540} size={760} peak={0.95} out={B.whoOut - 8} />
      <SparkleField f={f} count={6} seed={21} at={B.whoHead + 14} size={26} area={{ x0: 200, x1: 1720, y0: 200, y1: 880 }} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 420, display: 'flex', justifyContent: 'center', zIndex: 30 }}>
        <Line text="Who changed {this?}" f={f} start={B.whoHead} exit={B.whoOut} size={150} />
      </div>
    </>
  )
}

function SheetFrame({ f }) {
  const out = tween(f, B.pull + 6, B.pull + 24, easeInOut)
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
  const t = tween(f, B.pull + cell.d * 16, B.pull + cell.d * 16 + 36, (x) => Math.pow(x, 2.2))
  if (t >= 0.999) return null
  let tone = cell.tone
  if (r === 3 && c === 2 && f > 120 && f < B.pull) tone = Math.floor(f / 18) % 2 ? 'red' : 'amber'
  if (r === 6 && c === 4 && f > 150 && f < B.pull) tone = Math.floor((f + 9) / 22) % 2 ? 'green' : 'amber'
  const bg = TONE[tone] || TONE.w
  const ink = INK[tone] || S.inkSoft
  const dx = CX - (cell.x + CW / 2)
  const dy = 595 - (cell.y + RH / 2)
  return (
    <div
      style={{
        position: 'absolute',
        left: cell.x,
        top: cell.y,
        width: CW,
        height: RH,
        boxSizing: 'border-box',
        background: t > 0.02 ? `linear-gradient(0deg, ${bg}, ${bg}), #161618` : bg,
        borderLeft: `1px solid ${S.hair}`,
        borderBottom: `1px solid ${S.hair}`,
        borderRadius: 8 * cl(t * 3),
        border: t > 0.02 ? `1px solid rgba(245,135,30,${(0.15 + 0.5 * Math.sin(Math.PI * t)).toFixed(3)})` : undefined,
        fontSize: 25,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        color: ink,
        opacity: 1 - cl((t - 0.7) / 0.3),
        transform: `translate(${(dx * t).toFixed(2)}px, ${(dy * t).toFixed(2)}px) scale(${(1 - 0.78 * t).toFixed(4)}) rotate(${(t * (c % 2 ? 40 : -40)).toFixed(2)}deg)`,
        zIndex: t > 0.02 ? 5 : 1,
      }}
    >
      {cell.t}
    </div>
  )
}

function Editing({ f }) {
  if (f < B.edit || f > B.pull + 6) return null
  const spots = [
    [3, 2],
    [5, 6],
    [1, 4],
    [6, 2],
  ]
  const k = Math.min(spots.length - 1, Math.floor((f - B.edit) / B.editHop))
  const [r, c] = spots[k]
  const o = fadeIn(f, B.edit, 8) * (1 - fadeIn(f, B.pull - 6, 8))
  const x = SHEET.x + c * CW
  const y = CELL_TOP + r * RH
  const note = arrive(f, B.note, 130)
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
        style={{ left: SHEET.x + 6 * CW - 270, top: CELL_TOP + 6 * RH + 14, padding: '16px 24px', fontSize: 30, letterSpacing: '-0.02em', whiteSpace: 'nowrap', borderRadius: '20px 20px 20px 6px', opacity: cl(note * 1.5) * (1 - fadeIn(f, B.pull - 6, 8)), transform: `translateY(${((1 - note) * 20).toFixed(2)}px)`, zIndex: 7 }}
      >
        Who changed this?
      </Glass>
    </>
  )
}

/* ---------------- 4. the pull: one point blooms into rings, "Now turn it into one clean tool" ---------------- */

function Bloom({ f }) {
  const pt = tween(f, B.pulled - 14, B.pulled) * (1 - tween(f, B.bloom + 6, B.bloom + 22, easeInOut))
  return (
    <>
      <Point x={POINT.x} y={POINT.y} size={20 * (0.5 + 0.5 * easeOut(pt))} opacity={pt} />
      <Rings f={f} start={B.bloom} x={POINT.x} y={POINT.y} radius={330} inner={0.5} word="one" wordSize={104} wordAt={B.ringsWord} out={B.ringsOut} />
      <Burst f={f} at={B.nowHead + 8} x={CX} y={190} size={620} peak={0.85} out={B.nowOut - 4} />
      <Sparkle f={f} x={1560} y={150} size={34} at={B.nowHead + 16} period={80} />
      <Sparkle f={f} x={340} y={220} size={26} at={B.nowHead + 30} period={96} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 120, display: 'flex', justifyContent: 'center' }}>
        <Line text="Now turn it into one clean {tool.}" f={f} start={B.nowHead} exit={B.nowOut} size={96} stagger={3} />
      </div>
    </>
  )
}

/* ---------------- 5. paper: the clean dashboard ---------------- */

const D = { x: 96, w: 1728, head: 256, kpi: 336, body: 508, bodyH: 440 }
const TILE_W = (D.w - 3 * 24) / 4
const ROW_H = D.bodyH / 6
const KPIS = [
  { label: 'Bookings this week', n: 48, icon: 'calendar' },
  { label: 'Open enquiries', n: 12, icon: 'chat' },
  { label: 'Awaiting payment', n: 3, icon: 'tag' },
  { label: 'Rooms free today', n: 2, icon: 'grid' },
]
const BOOKINGS = [
  ['10:00', 'Room 2', 'Confirmed'],
  ['11:30', 'Room 1', 'Confirmed'],
  ['14:00', 'Room 3', 'Awaiting payment'],
  ['16:30', 'Room 2', 'Confirmed'],
  ['18:00', 'Room 1', 'New'],
]
const ROLES = [
  ['Owner', 'Everything'],
  ['Front desk', 'Bookings, clients'],
  ['Practitioner', 'Own schedule'],
  ['Accounts', 'Invoices only'],
  ['Client notes', 'Practitioner only'],
]

function PaperScene({ f }) {
  const inT = tween(f, B.paperIn, B.paperInDone, easeOut)
  const outT = tween(f, B.paperOut, B.paperOutDone, easeInOut)
  const R = 1700 * Math.max(0, inT - outT)
  if (R < 2) return null
  // soft edge; the circle opens from the point the cells collapsed into
  const m = `radial-gradient(circle at ${CX}px ${CY}px, #000 ${Math.max(0, R - 180)}px, transparent ${R}px)`
  const push = 1 + 0.025 * tween(f, B.dash, B.paperOut, (x) => x)
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(90% 80% at 30% 20%, #f5f3ef 0%, #ebe7e1 45%, #fbe6d2 100%)', WebkitMaskImage: m, maskImage: m, fontFamily: SANS }}>
      <div style={{ position: 'absolute', left: 1100 - 700, top: 700 - 500, width: 1400, height: 1000, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,200,154,0.55), rgba(255,200,154,0))' }} />
      <Burst f={f} at={B.truthHead + 10} x={1000} y={140} size={560} mode="paper" out={B.truthOut - 6} />
      <Sparkle f={f} x={1560} y={120} size={32} at={B.truthHead + 18} period={84} color={S.saffron} />
      <Sparkle f={f} x={300} y={150} size={28} at={B.truthHead + 40} period={100} color={S.saffron} />
      <Sparkle f={f} x={1730} y={900} size={26} at={B.dash + 50} period={110} color={S.saffron} />
      <div style={{ position: 'absolute', left: 120, right: 120, top: 84, display: 'flex', justifyContent: 'center' }}>
        <PaperLine text="One source of {truth.}" f={f} start={B.truthHead} exit={B.truthOut} size={96} />
      </div>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push.toFixed(4)})`, transformOrigin: '50% 60%' }}>
        <PaperDash f={f} />
      </div>
    </AbsoluteFill>
  )
}

/* Headline for the paper scene: ink-dark with a deep-saffron serif word. */
function PaperLine({ text, f, start, exit, size }) {
  const out = move(f, exit, 9)
  if (out >= 1 || f < start - 1) return null
  let inSerif = false
  let n = 0
  return (
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.03em', lineHeight: 1.02, color: INK_DARK, opacity: 1 - out, transform: `translateY(${(-out * 0.18 * size).toFixed(2)}px)`, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.24em' }}>
      {text.split(' ').map((raw, wi) => {
        if (raw.includes('{')) inSerif = true
        const serif = inSerif
        if (raw.includes('}')) inSerif = false
        const s = arrive(f, start + n++ * 3, 150)
        return (
          <span key={wi} style={{ display: 'inline-block', whiteSpace: 'pre', fontFamily: serif ? SERIF : undefined, fontStyle: serif ? 'italic' : undefined, fontWeight: serif ? 400 : undefined, fontSize: serif ? '1.12em' : undefined, lineHeight: serif ? 0.9 : undefined, color: serif ? DEEP : undefined, opacity: cl(s * 1.6), transform: `translateY(${((1 - s) * 0.42).toFixed(3)}em)` }}>
            {raw.replace(/[{}]/g, '')}
          </span>
        )
      })}
    </div>
  )
}

const card = (extra) => ({
  position: 'absolute',
  boxSizing: 'border-box',
  borderRadius: 18,
  background: 'rgba(255,255,255,0.62)',
  border: `1px solid ${HAIR_P}`,
  boxShadow: '0 30px 60px -28px rgba(120,60,10,0.35), 0 8px 20px -10px rgba(22,20,18,0.18)',
  color: INK_DARK,
  fontWeight: 500,
  ...extra,
})

function PaperDash({ f }) {
  const head = arrive(f, B.dash, 120)
  const pill = (s) =>
    s === 'Confirmed'
      ? { background: TINT, color: DEEP, border: '1px solid rgba(184,86,10,0.3)' }
      : s === 'New'
        ? { background: S.saffron, color: S.onSaffron, border: `1px solid ${S.saffron}`, fontWeight: 600 }
        : { background: 'rgba(22,20,18,0.05)', color: MUTED_P, border: `1px solid ${HAIR_P}` }
  const frontOn = fadeIn(f, B.frontLit, 10)
  const body = arrive(f, B.dash + 22, 120)
  const roleCard = arrive(f, B.dash + 28, 120)
  return (
    <>
      <div style={card({ left: D.x, top: D.head, width: D.w, height: 64, display: 'flex', alignItems: 'center', gap: 18, padding: '0 26px', opacity: cl(head * 1.5), transform: `translateY(${((1 - head) * 30).toFixed(2)}px)` })}>
        <Icon name="chart" size={28} color={DEEP} />
        <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-0.025em' }}>Studio operations</span>
        <span style={{ padding: '4px 14px', borderRadius: 999, border: `1px solid ${HAIR_P}` }}>
          <Mono size={18} color={MUTED_P}>Illustrative data</Mono>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 24, color: MUTED_P }}>Viewing as</span>
        <span style={{ fontSize: 24, fontWeight: 600, padding: '6px 16px', borderRadius: 999, background: frontOn > 0.5 ? S.saffron : TINT, color: frontOn > 0.5 ? S.onSaffron : DEEP }}>Front desk</span>
      </div>
      {KPIS.map((k, i) => {
        const t = arrive(f, B.dash + 12 + i * 5, 130)
        return (
          <div key={k.label} style={card({ left: D.x + i * (TILE_W + 24), top: D.kpi, width: TILE_W, height: 150, padding: '22px 26px', opacity: cl(t * 1.5), transform: `translateY(${((1 - t) * 40).toFixed(2)}px)` })}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, color: MUTED_P }}>
              <Icon name={k.icon} size={24} color={DEEP} />
              {k.label}
            </div>
            <div style={{ marginTop: 12, fontSize: 62, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1 }}>{k.n}</div>
          </div>
        )
      })}
      <div style={card({ left: D.x, top: D.body, width: 1040, height: D.bodyH, overflow: 'hidden', opacity: cl(body * 1.5), transform: `translateY(${((1 - body) * 40).toFixed(2)}px)` })}>
        <div style={{ height: ROW_H, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1px solid ${HAIR_P}` }}>
          <Icon name="calendar" size={26} color={DEEP} />
          <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Today’s bookings</span>
          <span style={{ marginLeft: 'auto' }}>
            <Mono size={19} color={MUTED_P}>No clashes</Mono>
          </span>
          <Icon name="check" size={24} color={DEEP} stroke={2.6} />
        </div>
        {BOOKINGS.map((b, i) => {
          const t = arrive(f, B.dash + 30 + i * 5)
          return (
            <div key={b[0]} style={{ height: ROW_H, display: 'grid', gridTemplateColumns: '200px 240px 1fr', alignItems: 'center', padding: '0 26px', borderBottom: i < BOOKINGS.length - 1 ? `1px solid ${HAIR_P}` : 'none', fontSize: 27, letterSpacing: '-0.015em', opacity: cl(t * 1.5), transform: `translateX(${((1 - t) * 24).toFixed(2)}px)` }}>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{b[0]}</span>
              <span style={{ color: MUTED_P }}>{b[1]}</span>
              <span>
                <span style={{ fontSize: 22, padding: '6px 16px', borderRadius: 999, ...pill(b[2]) }}>{b[2]}</span>
              </span>
            </div>
          )
        })}
      </div>
      <div style={card({ left: 1160, top: D.body, width: 664, height: D.bodyH, overflow: 'hidden', opacity: cl(roleCard * 1.5), transform: `translateY(${((1 - roleCard) * 40).toFixed(2)}px)` })}>
        <div style={{ height: ROW_H, display: 'flex', alignItems: 'center', gap: 12, padding: '0 26px', borderBottom: `1px solid ${HAIR_P}` }}>
          <Icon name="shield" size={26} color={DEEP} />
          <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>Roles and access</span>
        </div>
        {ROLES.map((rr, i) => {
          const t = arrive(f, B.dash + 38 + i * 5)
          const hot = i === 1 ? frontOn : 0
          return (
            <div key={rr[0]} style={{ position: 'relative', height: ROW_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', borderBottom: i < ROLES.length - 1 ? `1px solid ${HAIR_P}` : 'none', opacity: cl(t * 1.5), transform: `translateX(${((1 - t) * 24).toFixed(2)}px)` }}>
              <div style={{ position: 'absolute', inset: 0, background: TINT, borderLeft: `3px solid ${S.saffron}`, opacity: hot }} />
              <Icon name={i === 4 ? 'lock' : 'user'} size={24} color={hot > 0.5 ? DEEP : MUTED_P} style={{ position: 'relative' }} />
              <span style={{ position: 'relative', fontSize: 27, letterSpacing: '-0.015em' }}>{rr[0]}</span>
              <span style={{ position: 'relative', marginLeft: 'auto' }}>
                <Mono size={19} color={hot > 0.5 ? DEEP : MUTED_P}>{rr[1]}</Mono>
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

/* ---------------- 6. roles: pick a person, see only what they need ---------------- */

const RP = { x: 120, y: 340, w: 680, head: 96, row: 104 }
const VP = { x: 860, y: 340, w: 940, h: 96 + 5 * 104 }
const VIEW_ITEMS = [
  { label: 'Schedule', icon: 'calendar' },
  { label: 'Clients', icon: 'user' },
  { label: 'Invoices', icon: 'tag' },
  { label: 'Client notes', icon: 'shield' },
]
// which items each role (by ROLES index) can open; 1 = yes
const ACCESS = [
  [1, 1, 1, 1], // Owner
  [1, 1, 0, 0], // Front desk
  [1, 0, 0, 1], // Practitioner
  [0, 0, 1, 0], // Accounts
]
const ROLE_SUB = ['Sees everything', 'Bookings and clients', 'Own schedule and notes', 'Invoices only']
const rowY = (i) => RP.y + RP.head + i * RP.row + RP.row / 2

function Roles({ f }) {
  const out = tween(f, B.rolesOut, B.rolesOut + 12, easeInOut)
  const inT = move(f, B.rolesHead - 6, 14)
  if (out >= 1 || f < B.rolesHead - 6) return null
  const panel = arrive(f, B.rolesPanel, 120)
  const view = arrive(f, B.rolesPanel + 8, 120)

  // running state across the picks: highlighted row, cursor, access, label
  let rowPos = 1
  let cur = { x: 1000, y: 880 }
  let acc = [0.3, 0.3, 0.3, 0.3]
  let label = 0
  let ripple = null
  B.picks.forEach((p, k) => {
    const mv = move(f, p.at - 14, 14)
    const tgt = { x: RP.x + 330, y: rowY(p.role) }
    if (f >= p.at - 14) cur = { x: lerp(cur.x, tgt.x, mv), y: lerp(cur.y, tgt.y, mv) }
    if (f >= p.at) {
      const m = move(f, p.at, 10)
      rowPos = lerp(k ? rowPos : p.role, p.role, k ? m : 1)
      acc = acc.map((v, i) => lerp(v, ACCESS[p.role][i], m))
      label = p.role
      if (f - p.at < 20) ripple = { t: (f - p.at) / 20, y: tgt.y, x: tgt.x }
    }
  })
  const hotRow = B.picks.reduce((a, p) => (f >= p.at ? p.role : a), -1)
  return (
    <AbsoluteFill style={{ opacity: (1 - out) * inT }}>
      <Aurora f={f} opacity={0.45} shift={2} />
      <Burst f={f} at={B.rolesHead + 20} x={1460} y={150} size={600} peak={0.85} out={B.rolesOut - 8} />
      <Sparkle f={f} x={1780} y={120} size={34} at={B.rolesHead + 24} period={80} />
      <Sparkle f={f} x={170} y={250} size={26} at={B.rolesHead + 44} period={100} />
      <Sparkle f={f} x={1700} y={990} size={26} at={B.rolesPanel + 30} period={110} />
      <div style={{ position: 'absolute', left: 96, right: 96, top: 108, display: 'flex', justifyContent: 'center' }}>
        <Line text="Everyone sees exactly what they {need.}" f={f} start={B.rolesHead} exit={B.rolesOut - 4} size={84} stagger={4} />
      </div>

      {/* the roles list */}
      <Glass rim="left" style={{ left: RP.x, top: RP.y, width: RP.w, height: RP.head + 5 * RP.row, overflow: 'hidden', opacity: cl(panel * 1.5), transform: `translateY(${((1 - panel) * 50).toFixed(2)}px)` }}>
        <div style={{ height: RP.head, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px', borderBottom: `1px solid ${S.hair}` }}>
          <Icon name="shield" size={30} color={S.peach} />
          <span style={{ fontSize: 34, letterSpacing: '-0.02em' }}>Roles and access</span>
        </div>
        {hotRow >= 0 && <div style={{ position: 'absolute', left: 0, right: 0, top: RP.head + rowPos * RP.row, height: RP.row, background: 'rgba(245,135,30,0.14)', borderLeft: `4px solid ${S.saffron}` }} />}
        {ROLES.map((rr, i) => {
          const hot = hotRow === i
          return (
            <div key={rr[0]} style={{ position: 'relative', height: RP.row, display: 'flex', alignItems: 'center', gap: 16, padding: '0 30px', borderBottom: i < 4 ? `1px solid ${S.hair}` : 'none' }}>
              <Icon name={i === 4 ? 'lock' : 'user'} size={30} color={hot ? S.saffron : S.muted} />
              <span style={{ fontSize: 36, letterSpacing: '-0.02em', color: hot ? S.ink : S.inkSoft }}>{rr[0]}</span>
              <span style={{ marginLeft: 'auto', fontSize: 26, color: hot ? S.peach : S.muted }}>{rr[1]}</span>
            </div>
          )
        })}
      </Glass>

      {/* what that person sees */}
      <Glass rim="right" lit={0.35} style={{ left: VP.x, top: VP.y, width: VP.w, height: VP.h, opacity: cl(view * 1.5), transform: `translateY(${((1 - view) * 50).toFixed(2)}px)` }}>
        <div style={{ height: RP.head, display: 'flex', alignItems: 'center', gap: 16, padding: '0 36px', borderBottom: `1px solid ${S.hair}` }}>
          <span style={{ fontSize: 30, color: S.muted }}>Viewing as</span>
          <span style={{ fontSize: 34, fontWeight: 600, padding: '4px 20px', borderRadius: 999, background: hotRow >= 0 ? S.saffron : 'rgba(245,135,30,0.12)', color: hotRow >= 0 ? S.onSaffron : S.peach }}>{hotRow >= 0 ? ROLES[label][0] : 'Pick a role'}</span>
          <span style={{ marginLeft: 'auto', fontSize: 26, color: S.peach }}>{hotRow >= 0 ? ROLE_SUB[label] : ''}</span>
        </div>
        {VIEW_ITEMS.map((it, i) => {
          const a = acc[i]
          const col = i % 2
          const row = Math.floor(i / 2)
          const t = arrive(f, B.rolesPanel + 16 + i * 4, 130)
          return (
            <div
              key={it.label}
              style={{
                position: 'absolute',
                left: 36 + col * (404 + 32),
                top: RP.head + 36 + row * (176 + 28),
                width: 404,
                height: 176,
                boxSizing: 'border-box',
                borderRadius: 16,
                padding: '26px 28px',
                background: `rgba(245,135,30,${(0.04 + 0.14 * a).toFixed(3)})`,
                border: `1px solid rgba(245,135,30,${(0.1 + 0.55 * a).toFixed(3)})`,
                boxShadow: a > 0.05 ? `0 0 ${(40 * a).toFixed(0)}px -10px rgba(245,135,30,${(0.55 * a).toFixed(3)})` : 'none',
                opacity: cl(t * 1.5) * (0.45 + 0.55 * a),
                transform: `translateY(${((1 - t) * 30).toFixed(2)}px) scale(${(0.97 + 0.03 * a).toFixed(4)})`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Icon name={it.icon} size={34} color={a > 0.5 ? S.saffron : S.muted} />
                <span style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.025em', color: a > 0.5 ? S.ink : S.muted }}>{it.label}</span>
              </div>
              <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, color: a > 0.5 ? S.peach : S.dim }}>
                <Icon name={a > 0.5 ? 'check' : 'lock'} size={26} color={a > 0.5 ? S.peach : S.dim} stroke={2.4} />
                {a > 0.5 ? 'Can open' : 'Hidden'}
              </div>
            </div>
          )
        })}
      </Glass>

      {/* the pointer picking a role */}
      {f >= B.picks[0].at - 14 && (
        <>
          {ripple && <div style={{ position: 'absolute', left: ripple.x - 14 - 60 * ripple.t, top: ripple.y - 14 - 60 * ripple.t, width: 28 + 120 * ripple.t, height: 28 + 120 * ripple.t, borderRadius: '50%', border: `2px solid ${S.peach}`, opacity: 1 - ripple.t }} />}
          <div style={{ position: 'absolute', left: cur.x - 14, top: cur.y - 14, width: 28, height: 28, borderRadius: '50%', background: '#fff3e4', boxShadow: '0 0 22px 6px rgba(245,135,30,0.85)', opacity: fadeIn(f, B.picks[0].at - 14, 6) }} />
        </>
      )}
    </AbsoluteFill>
  )
}
