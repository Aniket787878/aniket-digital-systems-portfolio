/*
  HeroWorkflow — an n8n-shaped picture of the three flows a service
  business asks for most, sat beside the portrait in the hero showcase.

  Not a screenshot of a workflow tool: a schematic in the same visual
  vocabulary as SystemDiagram, so it stays honest — a drawing understood
  as a drawing, not a claim about software the reader cannot open. The
  three chains are the ones the buyer already recognises:

    Lead      → AI agent      → WhatsApp / email to the client
    Consent   → Form submitted → Slack / email to the team
    Session   → Transcribed    → Note filed to the app

  Colours resolved rather than var()-linked — this paints inside <svg>,
  where an unresolved token fails silently. Tracks index.css tokens.
*/

const C = {
  panel: '#1e1e1e',
  panelHi: '#272727',
  stroke: '#343434',
  strokeSoft: '#2a2a2a',
  ink: '#ededed',
  muted: '#9a9a9a',
  accent: '#f5871e',
  accentDim: 'rgba(245, 135, 30, 0.18)',
  wire: '#4a4a4a',
  wireHot: '#f5871e'
}

const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif'

/* One node in a chain. `tone` picks trigger (dim), agent (accent), or
   default panel — trigger and terminal endpoints read as ports. */
function Node({ x, y, w = 168, h = 56, title, sub, icon, tone = 'default' }) {
  const fill = tone === 'agent' ? C.accentDim : C.panelHi
  const stroke = tone === 'agent' ? C.accent : C.stroke
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Icon well */}
      <rect x={x + 10} y={y + 10} width={36} height={36} rx={8} fill={C.panel} stroke={C.strokeSoft} strokeWidth="1" />
      <g transform={`translate(${x + 28}, ${y + 28})`} stroke={tone === 'agent' ? C.accent : C.ink} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </g>
      <text x={x + 56} y={y + 25} fontFamily={FONT} fontSize="12.5" fontWeight="600" fill={C.ink}>
        {title}
      </text>
      {sub && (
        <text x={x + 56} y={y + 41} fontFamily={FONT} fontSize="10.5" fontWeight="400" fill={C.muted}>
          {sub}
        </text>
      )}
    </g>
  )
}

/* A curved wire between two nodes, with the small join dots n8n draws. */
function Wire({ from, to, hot = false }) {
  const dx = Math.max(28, (to.x - from.x) * 0.45)
  const d = `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`
  const color = hot ? C.wireHot : C.wire
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" opacity={hot ? 0.9 : 0.7} />
      <circle cx={from.x} cy={from.y} r="3" fill={color} />
      <circle cx={to.x} cy={to.y} r="3" fill={color} />
    </g>
  )
}

/* Icons kept tiny — 20x20 viewbox centred on 0,0, so nodes stay legible
   at the sizes the showcase actually renders. */
const I = {
  lead: <><circle cx="0" cy="-3" r="4" /><path d="M-7 8c1-4 4-5 7-5s6 1 7 5" /></>,
  agent: <><path d="M-7 -6h14v10h-4l-3 4-3-4h-4z" /><circle cx="-3" cy="-1" r="0.8" fill="currentColor" /><circle cx="3" cy="-1" r="0.8" fill="currentColor" /></>,
  chat: <><path d="M-8 -5h16v10h-11l-5 4z" /></>,
  form: <><rect x="-6" y="-7" width="12" height="14" rx="1.5" /><path d="M-3 -3h6M-3 0h6M-3 3h4" /></>,
  check: <><circle cx="0" cy="0" r="7" /><path d="M-3 0l2 2 4-4" /></>,
  team: <><circle cx="-3" cy="-2" r="2.5" /><circle cx="3" cy="-2" r="2.5" /><path d="M-7 6c0-3 2-4 4-4M7 6c0-3-2-4-4-4" /></>,
  mic: <><rect x="-2.5" y="-7" width="5" height="10" rx="2.5" /><path d="M-5 0c0 3 2 5 5 5s5-2 5-5M0 5v3" /></>,
  transcribe: <><path d="M-7 -6h14v12h-14z" /><path d="M-4 -2h8M-4 1h8M-4 4h5" /></>,
  file: <><path d="M-5 -7h7l4 4v10h-11z" /><path d="M2 -7v4h4" /></>
}

/*
  Layout, 460x420. Three chains, each three nodes across, stacked with
  breathing room. Node width 168 leaves 20-24px between adjacent nodes,
  which is where the wires do their work.
*/
const NW = 168
const NH = 56
const COL_X = [16, 208, 400]
const ROW_Y = [72, 200, 328]

const chains = [
  {
    label: 'Lead capture',
    nodes: [
      { title: 'New lead', sub: 'form / DM / call', icon: I.lead, tone: 'default' },
      { title: 'AI agent', sub: 'qualifies & routes', icon: I.agent, tone: 'agent' },
      { title: 'Notify client', sub: 'WhatsApp & email', icon: I.chat, tone: 'default' }
    ]
  },
  {
    label: 'Consent',
    nodes: [
      { title: 'Consent form', sub: 'sent to phone', icon: I.form, tone: 'default' },
      { title: 'Submitted', sub: 'signed & timestamped', icon: I.check, tone: 'agent' },
      { title: 'Notify team', sub: 'Slack & email', icon: I.team, tone: 'default' }
    ]
  },
  {
    label: 'Session note',
    nodes: [
      { title: 'Session recorded', sub: 'on the device', icon: I.mic, tone: 'default' },
      { title: 'Transcribed', sub: 'AI + human review', icon: I.transcribe, tone: 'agent' },
      { title: 'Filed to app', sub: 'in the client record', icon: I.file, tone: 'default' }
    ]
  }
]

export default function HeroWorkflow() {
  return (
    <svg
      className="hero-workflow-svg"
      viewBox="0 0 584 420"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Three automated flows: a new lead qualified by an AI agent and answered on WhatsApp; a consent form signed on the client's phone and routed to the team on Slack; and a recorded session transcribed and filed to the client's app record."
    >
      {/* Faint dotted ground, in the manner of an n8n canvas. */}
      <defs>
        <pattern id="hw-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={C.strokeSoft} />
        </pattern>
      </defs>
      <rect x="0" y="0" width="584" height="420" fill="url(#hw-dots)" opacity="0.55" />

      {chains.map((chain, row) => {
        const y = ROW_Y[row]
        return (
          <g key={chain.label}>
            <text x={COL_X[0]} y={y - 12} fontFamily={FONT} fontSize="10.5" fontWeight="600" fill={C.muted} letterSpacing="1.1">
              {chain.label.toUpperCase()}
            </text>
            {chain.nodes.map((n, i) => (
              <Node key={i} x={COL_X[i]} y={y} w={NW} h={NH} title={n.title} sub={n.sub} icon={n.icon} tone={n.tone} />
            ))}
            {chain.nodes.slice(0, -1).map((_, i) => (
              <Wire
                key={i}
                from={{ x: COL_X[i] + NW, y: y + NH / 2 }}
                to={{ x: COL_X[i + 1], y: y + NH / 2 }}
                hot={i === 0}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
