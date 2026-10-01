import { useRef } from 'react'
import Glyph from '../showcase/ai/icons.jsx'
import { MOMENTS } from '../showcase/ai/day.js'
import Window from './Window.jsx'
import useLoop from './useLoop.js'

/*
  /ai: "one desk, all your tools". A glowing core, the AI front desk,
  with the clinic's five tools on an orbit round it. Each step a real
  recorded message (verbatim from showcase/ai/day.js, which cites the
  test run) drops into the core, a beam fires to the tool that run used,
  and the tool shows that run's one-line result. Only passing, positive
  moments: no refusals, nothing clinical, no emergencies. Gmail is on
  the orbit because the desk is connected to it, but none of the four
  moments used it, so it never lights.

  Two layouts in scene units (100 = the window body's width): wide puts
  the message lane to the left of the core, narrow (phones) above it.
  Reduced motion: the booking moment, finished.
*/

const STEP_MS = 5600

const NODES = [
  { key: 'cal', name: 'Calendar' },
  { key: 'sheet', name: 'Sheets' },
  { key: 'gmail', name: 'Gmail' },
  { key: 'wa', name: 'WhatsApp' },
  { key: 'docs', name: 'Clinic documents' }
]

const pick = (id, turn = 0) => {
  const mo = MOMENTS.find((x) => x.id === id)
  const t = mo.turns[turn]
  return { id: `${id}${turn}`, time: mo.time, header: mo.header, label: mo.label, user: t.user, tools: t.tools }
}
const STEPS = [pick('saturday'), pick('fees'), pick('pack'), pick('booking', 1)]
const STILL = STEPS.length - 1

// Points on an ellipse round the core: [angle in degrees, label anchor].
function layout({ w, h, core, r, rx, ry, angles, bubble }) {
  const nodes = {}
  for (const [key, [deg, anchor]] of Object.entries(angles)) {
    const a = (deg * Math.PI) / 180
    nodes[key] = { x: core[0] + rx * Math.cos(a), y: core[1] + ry * Math.sin(a), anchor }
  }
  return { w, h, core, r, rx, ry, nodes, bubble }
}

const WIDE = layout({
  w: 100,
  h: 54,
  core: [63, 27],
  r: 7,
  rx: 26,
  ry: 19.5,
  angles: { cal: [-90, 'r'], sheet: [-25, 'c'], gmail: [30, 'c'], wa: [90, 'c'], docs: [140, 'c'] },
  bubble: { x: 4, y: 15, w: 29 }
})

const NARROW = layout({
  w: 100,
  h: 92,
  core: [50, 55],
  r: 9,
  rx: 32,
  ry: 22,
  angles: { cal: [-90, 'c'], sheet: [-20, 'c'], gmail: [35, 'c'], wa: [90, 'c'], docs: [200, 'l'] },
  bubble: { x: 6, y: 4, w: 88 }
})

export default function DeskScene({ live, wide }) {
  const ref = useRef(null)
  const { step, index, running } = useLoop(ref, { count: STEPS.length, ms: STEP_MS, enabled: live })
  const mo = STEPS[live ? index : STILL]
  const L = wide ? WIDE : NARROW
  const used = mo.tools.map((t) => t.node)
  const [cx, cy] = L.core
  const b = L.bubble
  // Where the bubble flies to: from its own centre to the core.
  const fly = { '--dx': cx - (b.x + b.w / 2), '--dy': cy - (b.y + 5) }

  return (
    <Window
      ref={ref}
      className={`sv-desk ${wide ? 'is-wide' : 'is-narrow'} ${live ? 'is-live' : 'is-still'}`}
      hold={live && !running}
      tag="Recorded test runs · made-up physio clinic"
      bar={<span className="stage-mono sv-title-bar">Front desk · 5 tools</span>}
      status={
        <span className="stage-mono sv-desk-status" key={`s${step}`}>
          <b>{mo.time}</b> {mo.label}
        </span>
      }
    >
      <div className="sv-desk-body" style={{ '--h': L.h }} aria-hidden="true">
        <svg className="sv-desk-svg" viewBox={`0 0 ${L.w} ${L.h}`}>
          <ellipse className="sv-orbit" cx={cx} cy={cy} rx={L.rx} ry={L.ry} />
          <ellipse className="sv-orbit sv-orbit-run" cx={cx} cy={cy} rx={L.rx} ry={L.ry} pathLength="100" />
          <g key={`g${step}`}>
          {mo.tools.map((t, k) => {
            const n = L.nodes[t.node]
            const d = `M${cx} ${cy} L${n.x} ${n.y}`
            return (
              <g key={t.node} style={{ '--k': k }}>
                <path className="sv-beam" d={d} pathLength="100" />
                {live && <path className="sv-beam-pulse" d={d} pathLength="100" />}
              </g>
            )
          })}
          </g>
        </svg>

        <div className="sv-core" style={{ left: `${cx}%`, top: `${(cy / L.h) * 100}%`, '--r': L.r }}>
          <i className="sv-core-halo" />
          <i className="sv-core-ring" />
          <i className="sv-core-orb" />
          <i className="sv-core-swirl" />
          <i className="sv-core-shine" />
          {live && <i className="sv-core-hit" key={`h${step}`} />}
          <span className="sv-core-label stage-mono">AI front desk</span>
        </div>

        {NODES.map((node) => {
          const n = L.nodes[node.key]
          const k = used.indexOf(node.key)
          const tool = mo.tools[k]
          return (
            <div
              key={`${node.key}${step}`}
              className={`sv-node ${k >= 0 ? 'is-hit' : ''} anchor-${n.anchor}`}
              style={{ left: `${n.x}%`, top: `${(n.y / L.h) * 100}%`, '--k': Math.max(k, 0) }}
            >
              <span className="sv-node-chip">
                <Glyph name={node.key} />
                {node.name}
              </span>
              {tool && <span className="sv-node-result stage-mono">{tool.result}</span>}
            </div>
          )
        })}

        {mo.user && (
          <div
            key={`m${step}`}
            className="sv-bubble"
            style={{ left: `${b.x}%`, top: `${(b.y / L.h) * 100}%`, width: `${b.w}%`, ...fly }}
          >
            <span className="sv-bubble-head stage-mono">
              {mo.header} · {mo.time}
            </span>
            <span className="sv-bubble-text">{mo.user}</span>
          </div>
        )}
      </div>
      <p className="sr-only">
        A short loop replaying recorded test runs from a made-up physio clinic: a message reaches the AI front desk,
        and it uses the calendar, a sheet or the clinic documents to answer or book.
      </p>
    </Window>
  )
}
