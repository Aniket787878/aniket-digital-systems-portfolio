import { AbsoluteFill } from 'remotion'
import { C, SANS, rise, pop, tween, easeInOut } from '../shared.jsx'
import { FlowGraph } from '../FlowGraph.jsx'
import { Icon } from '../icons.jsx'
import { Shell, StepHeadline } from './Shell.jsx'
import { ChatBubble, Toast, Chip, cardShadow } from './illustrative.jsx'

/*
  Ops Automation Sprint, ~30s. One enquiry at 11:04 pm, followed through
  the automation: instant WhatsApp reply, CRM row, team heads-up, a
  reminder next morning, then the Day 3 / Day 7 follow-ups. The flow runs
  along the bottom on a timeline; the card above shows what each step does.
*/

const PAPER_AT = 104
const PAPER_END = 612
export const OPS_LEN = PAPER_AT + PAPER_END + 196

const S = [56, 146, 236, 326, 416, 506]
const X = [206, 508, 809, 1111, 1412, 1714]
const NODES = [
  { id: 'form', label: 'Web form', icon: 'form', time: '11:04 pm' },
  { id: 'reply', label: 'Auto-reply', icon: 'chat', time: '11:04 pm' },
  { id: 'crm', label: 'CRM', icon: 'database', time: '11:04 pm' },
  { id: 'team', label: 'Team', icon: 'bell', time: '11:05 pm' },
  { id: 'remind', label: 'Reminder', icon: 'sun', time: '9:00 am' },
  { id: 'follow', label: 'Follow-up', icon: 'repeat', time: 'Day 3 · Day 7' },
]
const LINES = [
  { at: S[0], text: 'A lead fills in your form at {11:04 pm.}' },
  { at: S[1], text: 'A WhatsApp reply goes out {instantly.}' },
  { at: S[2], text: 'The lead is {saved in your CRM.}' },
  { at: S[3], text: 'Your team {gets a heads-up.}' },
  { at: S[4], text: 'Next morning, {a gentle reminder.}' },
  { at: S[5], text: 'Then {Day 3 and Day 7} follow-ups.', exit: PAPER_END - 10 },
]

export function ExplainerOpsSprint() {
  return (
    <Shell hook="11:04 pm." hookSub="A new enquiry. Your team is asleep." hookIcon="moon" paperAt={PAPER_AT} paperEnd={PAPER_END}>
      {(f) => <Paper f={f} />}
    </Shell>
  )
}

function Paper({ f }) {
  const nodes = NODES.map((n, i) => ({
    ...n,
    x: X[i],
    y: 752,
    w: 236,
    h: 152,
    layout: 'stack',
    labelSize: 30,
    appear: 16 + i * 5,
    lit: S[i] + 8,
  }))
  const edges = NODES.slice(1).map((n, i) => ({ from: NODES[i].id, to: n.id, fp: 'r', tp: 'l', show: 34 + i * 4, run: S[i + 1] - 14, dur: 22 }))
  return (
    <AbsoluteFill>
      <StepHeadline f={f} items={LINES} size={76} />
      <FlowGraph nodes={nodes} edges={edges} frame={f} width={1920} height={1080} uid="ops" />
      <Timeline f={f} />
      {STAGES.map((Stage, k) => {
        const inT = rise(f, S[k] + 4, { stiffness: 80 })
        const outT = k < STAGES.length - 1 ? rise(f, S[k + 1] - 6, { stiffness: 110 }) : 0
        if (inT < 0.001 || outT > 0.999) return null
        return (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 200,
              height: 474,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: Math.min(1, inT * 1.5) * (1 - outT),
              transform: `translateY(${((1 - inT) * 40 - outT * 30).toFixed(2)}px) scale(1.1)`,
              filter: inT < 0.98 || outT > 0.01 ? `blur(${((1 - inT) * 12 + outT * 10).toFixed(2)}px)` : undefined,
            }}
          >
            <Stage f={f - S[k]} />
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

function Timeline({ f }) {
  const y = 872
  const a = rise(f, 30)
  const reached = S.reduce((acc, s, i) => (f >= s + 8 ? i : acc), -1)
  const next = reached + 1 < S.length ? tween(f, S[reached + 1] - 14, S[reached + 1] + 8, easeInOut) : 0
  const fillTo = reached < 0 ? X[0] : X[reached] + (reached + 1 < X.length ? (X[reached + 1] - X[reached]) * next : 0)
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: a }}>
      <div style={{ position: 'absolute', left: X[0], width: X[5] - X[0], top: y, height: 3, borderRadius: 3, background: '#e1d9ce' }} />
      <div style={{ position: 'absolute', left: X[0], width: Math.max(0, fillTo - X[0]), top: y, height: 3, borderRadius: 3, background: C.accent }} />
      {X.map((x, i) => {
        const on = i <= reached
        return (
          <div key={i}>
            <div style={{ position: 'absolute', left: x - 8, top: y - 6.5, width: 16, height: 16, borderRadius: '50%', background: on ? C.accent : C.paper, border: `3px solid ${on ? C.accent : '#cfc5b8'}`, boxSizing: 'border-box' }} />
            <div style={{ position: 'absolute', left: x - 150, width: 300, top: y + 24, textAlign: 'center', fontFamily: SANS, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: on ? C.accentDeep : C.mutedDark }}>{NODES[i].time}</div>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- the six stage cards; f is local to the step ---------- */

const card = { background: C.card, border: `1.5px solid ${C.cardLine}`, borderRadius: 24, boxShadow: cardShadow, fontFamily: SANS, color: C.inkDark, boxSizing: 'border-box' }

function Field({ label, children, h = 60 }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 26, color: C.mutedDark, marginBottom: 8 }}>{label}</div>
      <div style={{ height: h, borderRadius: 14, border: `1.5px solid ${C.cardLine}`, background: '#fbfaf8', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 28, letterSpacing: '-0.015em' }}>{children}</div>
    </div>
  )
}

function typed(text, f, a, b) {
  const n = Math.round(tween(f, a, b, (t) => t) * text.length)
  return text.slice(0, n)
}

function StageForm({ f }) {
  const pressed = f > 58
  const p = pop(f, 58)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <div style={{ ...card, width: 640, padding: '30px 34px' }}>
        <div style={{ fontSize: 34, letterSpacing: '-0.03em' }}>Book a consultation</div>
        <Field label="Name">
          <div style={{ width: `${tween(f, 8, 22) * 46}%`, height: 14, borderRadius: 14, background: '#d9d2c8' }} />
        </Field>
        <Field label="What do you need?">
          {typed('An evening slot, first visit', f, 20, 50)}
          <span style={{ width: 2, height: 30, background: C.accent, marginLeft: 3, opacity: f < 52 && Math.floor(f / 8) % 2 === 0 ? 1 : 0 }} />
        </Field>
        <div style={{ marginTop: 26, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 30px', borderRadius: 999, background: pressed ? C.tint : C.accent, color: pressed ? C.accentDeep : C.onAccent, fontSize: 28, transform: `scale(${1 - (f > 54 && f < 62 ? 0.05 : 0)})` }}>
          {pressed ? <Icon name="check" size={26} stroke={2.6} /> : null}
          {pressed ? 'Sent' : 'Send enquiry'}
        </div>
      </div>
      <div style={{ opacity: rise(f, 10), transform: `translateY(${(1 - rise(f, 10)) * 20}px)` }}>
        <Chip icon="moon" dark size={32}>11:04 pm</Chip>
        <div style={{ marginTop: 18, fontSize: 28, color: C.mutedDark, maxWidth: 300, lineHeight: 1.3, opacity: p }}>Nobody is at the desk.</div>
      </div>
    </div>
  )
}

function StageReply({ f }) {
  return (
    <div style={{ ...card, width: 700, padding: '26px 30px 30px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 18, borderBottom: `1.5px solid ${C.cardLine}` }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: C.paper2, display: 'grid', placeItems: 'center', color: C.mutedDark }}>
          <Icon name="user" size={28} />
        </div>
        <div style={{ fontSize: 30, letterSpacing: '-0.02em' }}>New enquiry</div>
        <div style={{ marginLeft: 'auto', fontSize: 26, color: C.mutedDark }}>WhatsApp</div>
      </div>
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'flex-end', opacity: rise(f, 10), transform: `translateY(${(1 - pop(f, 10)) * 24}px)` }}>
        <ChatBubble side="out" width={560} text="Hi! Thanks for getting in touch. Here’s a link to pick a time that suits you." time="11:04 pm" tag="Sent instantly" />
      </div>
    </div>
  )
}

function StageCrm({ f }) {
  const row = pop(f, 12)
  const cols = ['Source', 'Received', 'Stage']
  const bar = (w) => <div style={{ width: w, height: 14, borderRadius: 14, background: '#e4ddd3' }} />
  return (
    <div style={{ ...card, width: 980, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 30px', borderBottom: `1.5px solid ${C.cardLine}` }}>
        <Icon name="database" size={30} color={C.accentDeep} />
        <span style={{ fontSize: 32, letterSpacing: '-0.025em' }}>Leads</span>
        <span style={{ marginLeft: 'auto', fontSize: 26, color: C.mutedDark }}>Every enquiry, one record</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', padding: '14px 30px', fontSize: 26, color: C.mutedDark, borderBottom: `1.5px solid ${C.cardLine}` }}>
        {cols.map((c) => (
          <div key={c}>{c}</div>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          alignItems: 'center',
          padding: '0 30px',
          height: row * 76,
          overflow: 'hidden',
          background: C.tint,
          fontSize: 28,
          borderBottom: `1.5px solid ${C.cardLine}`,
          opacity: Math.min(1, row * 1.4),
        }}
      >
        <div>Web form</div>
        <div>11:04 pm</div>
        <div>
          <span style={{ padding: '6px 16px', borderRadius: 999, background: C.accent, color: C.onAccent, fontSize: 26 }}>New</span>
        </div>
      </div>
      {[0, 1].map((r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', alignItems: 'center', padding: '0 30px', height: 72, borderBottom: r === 0 ? `1.5px solid ${C.cardLine}` : 'none' }}>
          {bar('60%')}
          {bar('50%')}
          {bar('40%')}
        </div>
      ))}
    </div>
  )
}

function StageTeam({ f }) {
  const a = pop(f, 8)
  const b = rise(f, 26)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <div style={{ opacity: Math.min(1, a * 1.4), transform: `translateY(${(1 - a) * -30}px)` }}>
        <Toast icon="bell" tone="accent" title="New lead from the web form" sub="Assigned to the front desk" width={640} />
      </div>
      <div style={{ ...card, width: 640, padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 18, opacity: b, transform: `translateY(${(1 - b) * 20}px)` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, border: `2.5px solid ${C.accent}`, flex: 'none' }} />
        <div style={{ fontSize: 30, letterSpacing: '-0.02em' }}>Call back before 10 am</div>
        <div style={{ marginLeft: 'auto', fontSize: 26, color: C.accentDeep }}>Task</div>
      </div>
    </div>
  )
}

function StageRemind({ f }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <div style={{ opacity: rise(f, 4), transform: `translateY(${(1 - rise(f, 4)) * 20}px)` }}>
        <Chip icon="sun" dark size={32}>9:00 am</Chip>
        <div style={{ marginTop: 18, fontSize: 28, color: C.mutedDark }}>Next morning</div>
      </div>
      <div style={{ opacity: rise(f, 14), transform: `translateY(${(1 - pop(f, 14)) * 24}px)` }}>
        <ChatBubble side="out" width={620} text="Good morning! A quick reminder: your booking link is here whenever you’re ready." time="9:00 am" />
      </div>
    </div>
  )
}

function StageFollow({ f }) {
  const rows = [
    { day: 'Day 3', text: 'Checking in: any questions I can answer?', state: 'Sent', at: 8 },
    { day: 'Day 7', text: 'Still keen? Here are this week’s open slots.', state: 'Scheduled', at: 22 },
  ]
  return (
    <div style={{ ...card, width: 1000, padding: '12px 30px 24px' }}>
      {rows.map((r, i) => {
        const a = rise(f, r.at)
        return (
          <div key={r.day} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0', borderBottom: i === 0 ? `1.5px solid ${C.cardLine}` : 'none', opacity: a, transform: `translateX(${(1 - a) * 30}px)` }}>
            <span style={{ flex: 'none', padding: '8px 18px', borderRadius: 999, background: C.tint, color: C.accentDeep, fontSize: 28 }}>{r.day}</span>
            <span style={{ fontSize: 30, letterSpacing: '-0.02em' }}>{r.text}</span>
            <span style={{ marginLeft: 'auto', fontSize: 26, color: i === 0 ? C.accentDeep : C.mutedDark, whiteSpace: 'nowrap' }}>{r.state}</span>
          </div>
        )
      })}
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, color: C.mutedDark, opacity: rise(f, 40) }}>
        <Icon name="check" size={28} color={C.accent} stroke={2.6} />
        Stops the moment they book.
      </div>
    </div>
  )
}

const STAGES = [StageForm, StageReply, StageCrm, StageTeam, StageRemind, StageFollow]
