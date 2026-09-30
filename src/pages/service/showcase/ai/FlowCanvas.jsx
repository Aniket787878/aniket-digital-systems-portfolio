import Glyph from './icons.jsx'
import { EDGES, H, NH, NODES, W } from './graph.js'

/*
  The system as glass nodes on one fixed 760x440 board: the channels on
  the left, the AI front desk in the middle, the tools on the right.
  HTML nodes and SVG wires share the same coordinates (the board keeps
  its aspect ratio), so the wires always meet the nodes.
  Pulse positions are worked out here from the bezier itself rather than
  getPointAtLength, so nothing has to be measured from the DOM.
*/

const desk = NODES.desk
function curve(key) {
  const n = NODES[key]
  if (n.input) {
    const ax = n.x + n.w / 2
    const bx = desk.x - desk.w / 2
    const mx = (ax + bx) / 2
    return [ax, n.y, mx, n.y, mx, desk.y, bx, desk.y]
  }
  const ax = desk.x + desk.w / 2
  const bx = n.x - n.w / 2
  const mx = (ax + bx) / 2
  return [ax, desk.y, mx, desk.y, mx, n.y, bx, n.y]
}

function bez([x0, y0, x1, y1, x2, y2, x3, y3], t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * x0 + b * x1 + c * x2 + d * x3, a * y0 + b * y1 + c * y2 + d * y3]
}

/* Arc-length table per wire, so a pulse moves at an even speed. */
const WIRES = Object.fromEntries(
  EDGES.map((key) => {
    const c = curve(key)
    const pts = [bez(c, 0)]
    const lens = [0]
    for (let i = 1; i <= 48; i++) {
      const p = bez(c, i / 48)
      const q = pts[i - 1]
      pts.push(p)
      lens.push(lens[i - 1] + Math.hypot(p[0] - q[0], p[1] - q[1]))
    }
    const d = `M${c[0]} ${c[1]}C${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} ${c[7]}`
    return [key, { d, pts, lens, len: lens[48] }]
  })
)

function pointAt(wire, s) {
  const { pts, lens } = wire
  let i = 1
  while (i < 48 && lens[i] < s) i++
  const span = lens[i] - lens[i - 1] || 1
  const k = Math.min(1, Math.max(0, (s - lens[i - 1]) / span))
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]
}

const TRAIL = 46
const ease = (x) => 1 - Math.pow(1 - x, 3)

function Pulse({ pulse, t }) {
  const wire = WIRES[pulse.edge]
  const forward = NODES[pulse.edge].input ? pulse.toDesk : !pulse.toDesk
  const p = ease((t - pulse.start) / (pulse.end - pulse.start))
  const s = (forward ? p : 1 - p) * wire.len
  const [cx, cy] = pointAt(wire, s)
  const from = forward ? s - TRAIL : s
  const fade = p > 0.85 ? (1 - p) / 0.15 : 1
  return (
    <g opacity={fade}>
      <path
        d={wire.d}
        className="ai-flow-trail"
        strokeDasharray={`${TRAIL} ${wire.len + TRAIL * 2}`}
        strokeDashoffset={-from}
      />
      <circle cx={cx} cy={cy} r="7" className="ai-flow-halo" />
      <circle cx={cx} cy={cy} r="2.6" className="ai-flow-tip" />
    </g>
  )
}

const pct = (v, of) => `${(v / of) * 100}%`

/* state: { lit: Set, pulses: [], results: {node: text}, flash: Set,
   channel, active } derived by the parent from (moment, t). */
export default function FlowCanvas({ state }) {
  return (
    <div className="ai-flow-board">
      <svg className="ai-flow-svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {EDGES.map((key) => (
          <path key={key} d={WIRES[key].d} className={`ai-flow-wire${state.lit.has(key) ? ' is-lit' : ''}`} />
        ))}
        {EDGES.map((key) => {
          const n = NODES[key]
          const [x, y] = n.input ? [n.x + n.w / 2, n.y] : [n.x - n.w / 2, n.y]
          return <circle key={key} cx={x} cy={y} r="2.5" className={`ai-flow-port${state.lit.has(key) ? ' is-lit' : ''}`} />
        })}
        {state.pulses.map((pulse) => (
          <Pulse key={`${pulse.edge}-${pulse.start}`} pulse={pulse} t={state.t} />
        ))}
      </svg>

      {Object.entries(NODES).map(([key, n]) => {
        const used = key === 'desk' ? state.active : state.lit.has(key)
        const result = state.results[key]
        const cls = [
          'ai-node',
          key === 'desk' && 'ai-node-desk',
          used && 'is-used',
          state.flash.has(key) && 'is-flash',
          key === state.channel && 'is-channel',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <div
            key={key}
            className={cls}
            style={{
              left: pct(n.x - n.w / 2, W),
              top: pct(n.y - NH / 2, H),
              width: pct(n.w, W),
              height: pct(NH, H),
            }}
          >
            <span className="ai-node-top">
              <Glyph name={key} className="ai-node-icon" />
              <span className="ai-node-label">{n.label}</span>
              {used && key !== 'desk' && <span className="ai-node-dot" />}
            </span>
            <span className={`ai-node-sub${result ? ' is-result' : ''}`}>{result || n.sub}</span>
          </div>
        )
      })}
    </div>
  )
}
