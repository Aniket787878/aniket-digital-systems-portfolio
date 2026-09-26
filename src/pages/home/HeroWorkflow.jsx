import { m } from 'motion/react'

/*
  HeroWorkflow — an n8n-style spider graph, drawn as HTML nodes on an
  SVG wire canvas so each node can carry a real brand-coloured icon and
  motion-in one by one after the hero settles.

  Layout: three triggers on the left, one AI Agent brain in the middle,
  four channels on the right. Wires curve from every trigger into the
  agent, then fan out from the agent to every channel — the classic
  spider that a workflow buyer already recognises.

  All icons are inline SVG paths, coloured to match the tool. No image
  assets, no logo files to license.
*/

// n8n canvas dot grid, and the wire colour scheme.
const C = {
  wire: '#4b4b4b',
  wireHot: '#f5871e',
  glow: 'rgba(245, 135, 30, 0.4)'
}

/* ------- Icons. Each returns an <svg> sized to fit the 32px well. */
function IconWebhook() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#ff6d5a" d="M8.5 15.5a3.5 3.5 0 1 1 5.4-2.9l3.6 6.2a2 2 0 1 1-1.7 1L12 12.5a1.5 1.5 0 1 0-2.6 1.5l-1.2 2.1a3.5 3.5 0 0 1 .3-.6zM6 10.5a5 5 0 1 1 8.6-3.4l-1.7 1a3 3 0 1 0-4.9 2 3 3 0 0 0 2.6 1.5l-1.2 2.1A5 5 0 0 1 6 10.5zm12 6a3 3 0 1 1-4-2.8l-3.5-6a5 5 0 1 1 1.7-1l3.6 6.2a3 3 0 0 1 2.2 3.6z" />
    </svg>
  )
}

function IconForm() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" fill="#3b82f6" />
      <path d="M7 7h10M7 11h10M7 15h6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconMic() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="9" y="3" width="6" height="12" rx="3" fill="#a855f7" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function IconAgent() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <defs>
        <linearGradient id="agent-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5871e" />
          <stop offset="100%" stopColor="#d94500" />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L4 7 L4 17 L12 22 L20 17 L20 7 Z"
        fill="url(#agent-g)"
        stroke="#fff2e4"
        strokeWidth="0.6"
      />
      <circle cx="9" cy="11" r="1.4" fill="#fff" />
      <circle cx="15" cy="11" r="1.4" fill="#fff" />
      <path d="M9 15c1 1 5 1 6 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#25d366" d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2z" />
      <path fill="#fff" d="M8.9 7.6c-.3 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.3 3.2.2.2 2.1 3.4 5.2 4.6 2.6 1 3.1.8 3.7.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.1-.3-.2-.7-.4-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.4-.8 1.1-1 1.3-.2.2-.4.2-.7 0-.4-.2-1.5-.6-2.8-1.8-1-.9-1.7-2-1.9-2.4-.2-.4 0-.5.2-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.5-.1-.7l-.9-2.3c-.2-.6-.5-.5-.7-.5h-.6z" />
    </svg>
  )
}

function IconSlack() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#e01e5a" d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5z" />
      <path fill="#36c5f0" d="M9 6a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5z" />
      <path fill="#2eb67d" d="M18 9a2 2 0 1 1 2 2h-2V9zm-1 0a2 2 0 1 1-4 0V4a2 2 0 1 1 4 0v5z" />
      <path fill="#ecb22e" d="M15 18a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z" />
    </svg>
  )
}

function IconGmail() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff" />
      <path d="M2 7l10 7 10-7" stroke="#ea4335" strokeWidth="2" fill="none" />
      <path d="M2 7v12h4V10z" fill="#4285f4" />
      <path d="M22 7v12h-4V10z" fill="#34a853" />
    </svg>
  )
}

function IconDatabase() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="2.5" fill="#f5871e" />
      <path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5" fill="#d94500" />
      <path d="M4 11v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6" fill="#a03500" />
      <path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5M4 11v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6" stroke="#fff2e4" strokeWidth="0.6" fill="none" />
    </svg>
  )
}

/* Node model: id, x/y (percent of the frame), title, sub, icon, tag colour. */
const AGENT = { id: 'agent', x: 50, y: 50, title: 'AI Agent', sub: 'reasons · plans · routes' }

const TRIGGERS = [
  { id: 'lead',    x: 8,  y: 15, title: 'New lead',      sub: 'Webhook trigger',    tag: 'Trigger', icon: <IconWebhook /> },
  { id: 'consent', x: 8,  y: 50, title: 'Consent form',  sub: 'Form submission',    tag: 'Trigger', icon: <IconForm /> },
  { id: 'session', x: 8,  y: 85, title: 'Session note',  sub: 'Voice recording',    tag: 'Trigger', icon: <IconMic /> }
]

const CHANNELS = [
  { id: 'wa',    x: 92, y: 12, title: 'WhatsApp',    sub: 'Send message',    tag: 'Action', icon: <IconWhatsApp /> },
  { id: 'slack', x: 92, y: 38, title: 'Slack',       sub: 'Notify channel',  tag: 'Action', icon: <IconSlack /> },
  { id: 'gmail', x: 92, y: 62, title: 'Gmail',       sub: 'Send email',      tag: 'Action', icon: <IconGmail /> },
  { id: 'db',    x: 92, y: 88, title: 'App record',  sub: 'Write to database', tag: 'Action', icon: <IconDatabase /> }
]

const ALL_NODES = [...TRIGGERS, AGENT, ...CHANNELS]

/* Bezier wire between two node centres, given in percent. */
function wirePath(from, to) {
  const dx = (to.x - from.x) * 0.5
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`
}

/* Motion variants — staggered arrival, driven from the parent container. */
const graphContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.35 }
  }
}

const nodeVariant = {
  hidden: { opacity: 0, scale: 0.85, y: 6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }
}

const wireVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 0.75,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
  }
}

export default function HeroWorkflow() {
  const wiresIn = TRIGGERS.map((t) => ({ id: `w-${t.id}`, from: t, to: AGENT }))
  const wiresOut = CHANNELS.map((c) => ({ id: `w-${c.id}`, from: AGENT, to: c }))
  const wires = [...wiresIn, ...wiresOut]

  return (
    <m.div
      className="hero-workflow"
      variants={graphContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {/* Wire canvas underneath the HTML nodes. viewBox uses 0..100 in
          both axes so node coordinates work in the same units. */}
      <svg
        className="hero-workflow-wires"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="hw-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={C.wireHot} stopOpacity="0.35" />
            <stop offset="100%" stopColor={C.wireHot} stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Soft glow behind the agent. */}
        <circle cx={AGENT.x} cy={AGENT.y} r="22" fill="url(#hw-glow)" />
        {wires.map((w, i) => (
          <m.path
            key={w.id}
            d={wirePath(w.from, w.to)}
            fill="none"
            stroke={i < wiresIn.length ? C.wire : C.wireHot}
            strokeOpacity={i < wiresIn.length ? 0.6 : 0.85}
            strokeWidth="0.35"
            vectorEffect="non-scaling-stroke"
            variants={wireVariant}
          />
        ))}
      </svg>

      {ALL_NODES.map((node) => (
        <m.div
          key={node.id}
          className={`hero-node hero-node-${node.id === 'agent' ? 'agent' : node.x < 50 ? 'trigger' : 'action'}`}
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
          variants={nodeVariant}
        >
          <span className="hero-node-icon">
            {node.id === 'agent' ? <IconAgent /> : node.icon}
          </span>
          <span className="hero-node-body">
            {node.tag && <span className="hero-node-tag">{node.tag}</span>}
            <span className="hero-node-title">{node.title}</span>
            <span className="hero-node-sub">{node.sub}</span>
          </span>
        </m.div>
      ))}
    </m.div>
  )
}
