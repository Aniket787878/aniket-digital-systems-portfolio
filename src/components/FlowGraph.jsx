import { useRef } from 'react'
import { m, useInView, useReducedMotion } from 'motion/react'
import Icon from './icons.jsx'

/*
  FlowGraph — the n8n-style picture of what a build does: the tools a
  business already uses on the left, one system in the middle, the work
  it now does by itself on the right.

  The wires draw in when the graph enters view, then saffron pulses run
  along them (native SVG <animateMotion>, so no JS per frame). Nodes are
  HTML over an SVG underlay sharing one 1100x520 coordinate space. Under
  reduced motion everything is drawn and still. Below 640px the CSS lays
  the nodes out as a stack and hides the wires.
*/

const W = 1100
const H = 520
const ROWS = [80, 200, 320, 440]

const INPUTS = [
  { icon: 'form', label: 'Web form', sub: 'enquiries' },
  { icon: 'whatsapp', label: 'WhatsApp', sub: 'messages' },
  { icon: 'mail', label: 'Email', sub: 'inbox' },
  { icon: 'calendar', label: 'Calendar', sub: 'bookings' }
]

const OUTPUTS = [
  { icon: 'database', label: 'Client record', sub: 'created' },
  { icon: 'whatsapp', label: 'Auto-reply', sub: 'in seconds' },
  { icon: 'bell', label: 'Team alert', sub: 'right person' },
  { icon: 'chart', label: 'Weekly report', sub: 'on its own' }
]

const IN_X = 250
const HUB_L = 470
const HUB_R = 630
const OUT_X = 850
const HUB_Y = 260

const inWire = (y) => `M${IN_X} ${y} C${IN_X + 120} ${y}, ${HUB_L - 110} ${HUB_Y}, ${HUB_L} ${HUB_Y}`
const outWire = (y) => `M${HUB_R} ${HUB_Y} C${HUB_R + 110} ${HUB_Y}, ${OUT_X - 120} ${y}, ${OUT_X} ${y}`

export default function FlowGraph({ className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  const reduce = useReducedMotion()
  const show = inView || reduce

  const wires = [
    ...ROWS.map((y, i) => ({ id: `in-${i}`, d: inWire(y), delay: 0.15 + i * 0.08 })),
    ...ROWS.map((y, i) => ({ id: `out-${i}`, d: outWire(y), delay: 0.75 + i * 0.08 }))
  ]

  return (
    <div ref={ref} className={`flow-graph ${className}`.trim()}>
      <svg className="flow-wires" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <defs>
          <radialGradient id="pulse-glow">
            <stop offset="0" stopColor="#ffd2a6" />
            <stop offset="0.45" stopColor="#f5871e" />
            <stop offset="1" stopColor="#f5871e" stopOpacity="0" />
          </radialGradient>
        </defs>
        {wires.map((w) => (
          <m.path
            key={w.id}
            id={w.id}
            d={w.d}
            className="flow-wire"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={show ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, delay: reduce ? 0 : w.delay, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        {inView && !reduce &&
          wires.map((w, i) => (
            <circle key={`p-${w.id}`} r="7" fill="url(#pulse-glow)">
              <animateMotion
                dur="2.4s"
                repeatCount="indefinite"
                begin={`${1.6 + (i % 4) * 0.55 + (w.id.startsWith('out') ? 1.2 : 0)}s`}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              >
                <mpath href={`#${w.id}`} />
              </animateMotion>
            </circle>
          ))}
      </svg>

      <div className="flow-col flow-col-in">
        {INPUTS.map((n, i) => (
          <Node key={n.label} node={n} y={ROWS[i]} side="in" show={show} delay={i * 0.06} />
        ))}
      </div>

      <m.div
        className="flow-hub"
        style={{ top: `${(HUB_Y / H) * 100}%` }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={show ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.7, delay: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="flow-hub-mark" aria-hidden="true">
          <Icon name="spark" size={22} />
        </span>
        <strong>Your system</strong>
        <span>On your own accounts</span>
      </m.div>

      <div className="flow-col flow-col-out">
        {OUTPUTS.map((n, i) => (
          <Node key={n.label} node={n} y={ROWS[i]} side="out" show={show} delay={0.9 + i * 0.08} />
        ))}
      </div>
    </div>
  )
}

function Node({ node, y, side, show, delay }) {
  const reduce = useReducedMotion()
  return (
    <m.div
      className={`flow-node flow-node-${side}`}
      style={{ top: `${(y / H) * 100}%` }}
      initial={{ opacity: 0, x: side === 'in' ? -16 : 16 }}
      animate={show ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.6, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="flow-node-icon" aria-hidden="true">
        <Icon name={node.icon} size={17} />
      </span>
      <span className="flow-node-text">
        <strong>{node.label}</strong>
        <span>{node.sub}</span>
      </span>
    </m.div>
  )
}
