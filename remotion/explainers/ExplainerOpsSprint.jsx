import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Icon } from '../icons.jsx'
import { S, useStageFonts, Ground, Tag, Line, Beat, Captions, World, camAt, Glass, Bar, Chip, Wire, wirePath, Bubble, EndCard, Mono, arrive, move, fadeIn, lerp, cl } from './stageLook.jsx'

/*
  Ops Automation Sprint, 30 s, in the Stage look. Same story as before: one
  enquiry at 11:04 pm, followed through the automation: an instant WhatsApp
  reply, a row in the client list, a heads-up for the team, a reminder next
  morning, then the Day 3 and Day 7 follow-ups, which stop the moment they
  book. The flow runs along the bottom on a saffron wire; the glass panel
  above shows what each step did. Everything on screen is illustrative.
*/

export const OPS_LEN = 912

const HOOK_END = 98
const STEP = [176, 254, 332, 410, 488, 570]
// the form panel arrives early, so it is typed in while the first caption reads
const FORM_IN = 116
const STOP = [696, 746]
const END = 752

const X = [230, 522, 814, 1106, 1398, 1690]
const NODE_Y = 838
const NODES = [
  { label: 'Web form', icon: 'form', time: '11:04 pm' },
  { label: 'Auto-reply', icon: 'chat', time: '11:04 pm' },
  { label: 'Client list', icon: 'database', time: '11:04 pm' },
  { label: 'Team', icon: 'bell', time: '11:05 pm' },
  { label: 'Reminder', icon: 'sun', time: '9:00 am' },
  { label: 'Follow-up', icon: 'repeat', time: 'Day 3 · Day 7' },
]
const CAPS = [
  { at: FORM_IN, text: 'At 11:04 pm, a lead fills in your {form.}' },
  { at: STEP[1] - 4, text: 'A WhatsApp reply goes out {instantly.}' },
  { at: STEP[2] - 4, text: 'The lead lands in your client {list.}' },
  { at: STEP[3] - 4, text: 'Your team gets a {heads-up.}' },
  { at: STEP[4] - 4, text: 'Next morning, a gentle {reminder.}' },
  { at: STEP[5] - 4, text: 'Then follow-ups on {Day 3 and Day 7.}', exit: STOP[0] - 10 },
]

export function ExplainerOpsSprint() {
  useStageFonts()
  const f = useCurrentFrame()
  const cam = camAt(f, [
    { x: 960, y: 620, s: 0.88, rx: 18 },
    { at: HOOK_END + 4, dur: 22, x: 960, y: 560, s: 1, rx: 0 },
    { at: STEP[5], dur: 90, s: 1.03 },
  ])
  const reached = STEP.reduce((acc, s, i) => (f >= s ? i : acc), -1)
  const glow = f < HOOK_END ? { x: 960, y: 520 } : f < STOP[0] ? { x: lerp(X[Math.max(0, reached)], 960, 0.5), y: 560 } : { x: 960, y: 520 }
  const fake = cl(fadeIn(f, STOP[0] - 4, 8) - fadeIn(f, STOP[1], 8))
  const toEnd = fadeIn(f, END, 10)
  return (
    <Ground f={f} glow={glow}>
      {f < HOOK_END + 10 && <Hook f={f} />}
      {f >= HOOK_END && f < END + 10 && (
        <AbsoluteFill style={{ opacity: 1 - toEnd, filter: fake > 0.01 ? `blur(${(fake * 14).toFixed(2)}px)` : undefined }}>
          <World cam={cam}>
            <Timeline f={f} />
            {STAGES.map((Stage, k) => {
              const from = k === 0 ? FORM_IN : STEP[k]
              const inT = arrive(f, from + 2, 130)
              const outT = k < STAGES.length - 1 ? move(f, STEP[k + 1] - 6, 10) : 0
              if (f < from || outT >= 1) return null
              return (
                <div
                  key={k}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 240,
                    height: 470,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: cl(inT * 1.6) * (1 - outT),
                    transform: `translateY(${((1 - inT) * 50 - outT * 30).toFixed(2)}px) rotateX(${((1 - inT) * 18).toFixed(2)}deg) scale(${(1.2 - outT * 0.04).toFixed(4)})`,
                    filter: (1 - inT) * 12 + outT * 10 > 0.1 ? `blur(${((1 - inT) * 12 + outT * 10).toFixed(2)}px)` : undefined,
                  }}
                >
                  <Stage f={f - from} />
                </div>
              )
            })}
          </World>
          <AbsoluteFill style={{ opacity: 1 - fake }}>
            <Captions f={f} items={CAPS} top={92} size={66} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {fake > 0.01 && <AbsoluteFill style={{ background: `rgba(11,11,12,${(0.55 * fake).toFixed(3)})` }} />}
      <Beat f={f} text={'Stops the moment\nthey {book.}'} start={STOP[0]} end={STOP[1]} size={140} />
      {f >= END && <EndCard f={f - END} />}
      <Tag />
    </Ground>
  )
}

/* Stakes: the hour, and nobody there. */
function Hook({ f }) {
  const out = move(f, HOOK_END - 6, 10)
  const c = arrive(f, 4, 120)
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined }}>
      <div style={{ width: 84, height: 84, borderRadius: 22, display: 'grid', placeItems: 'center', background: 'rgba(245,135,30,0.12)', border: '1px solid rgba(245,135,30,0.3)', color: S.peach, opacity: cl(c * 1.5), transform: `translateY(${((1 - c) * 20).toFixed(2)}px)`, marginBottom: 34 }}>
        <Icon name="moon" size={42} stroke={2} />
      </div>
      <Line text="11:04 pm." f={f} start={8} size={190} />
      <div style={{ marginTop: 26 }}>
        <Line text={'A new enquiry. Your team is {asleep.}'} f={f} start={28} size={64} color={S.inkSoft} weight={500} stagger={2} />
      </div>
    </AbsoluteFill>
  )
}

function Timeline({ f }) {
  const W = 236
  const H = 112
  const reached = STEP.reduce((acc, s, i) => (f >= s + 6 ? i : acc), -1)
  return (
    <>
      {X.slice(1).map((x, i) => (
        <Wire key={i} uid={`ops${i}`} d={wirePath({ x: X[i] + W / 2, y: NODE_Y }, { x: x - W / 2, y: NODE_Y })} draw={move(f, HOOK_END + 20 + i * 4, 14)} pulse={(f - STEP[i + 1] + 14) / 16} />
      ))}
      {NODES.map((n, i) => {
        const a = arrive(f, HOOK_END + 12 + i * 4, 140)
        const lit = fadeIn(f, STEP[i] + 6, 8)
        const on = i <= reached
        return (
          <div key={i}>
            <Glass
              rim={null}
              lit={lit}
              style={{ left: X[i] - W / 2, top: NODE_Y - H / 2, width: W, height: H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px', opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * 30).toFixed(2)}px)` }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 14, flex: 'none', display: 'grid', placeItems: 'center', background: on ? S.saffron : 'rgba(245,135,30,0.12)', color: on ? S.onSaffron : S.peach, boxShadow: on ? '0 0 26px rgba(245,135,30,0.45)' : 'none' }}>
                <Icon name={n.icon} size={28} stroke={2} />
              </div>
              <span style={{ fontSize: 26, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: on ? S.ink : S.inkSoft }}>{n.label}</span>
            </Glass>
            <div style={{ position: 'absolute', left: X[i] - 150, width: 300, top: NODE_Y + H / 2 + 22, textAlign: 'center', opacity: cl(a * 1.5) }}>
              <Mono size={21} color={on ? S.peach : S.muted}>{n.time}</Mono>
            </div>
          </div>
        )
      })}
    </>
  )
}

/* ---------- the six panels; f is local to the step ---------- */

function Field({ label, children }) {
  return (
    <div style={{ marginTop: 18 }}>
      <Mono size={19}>{label}</Mono>
      <div style={{ marginTop: 8, height: 58, borderRadius: 12, border: `1px solid ${S.line}`, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 27, letterSpacing: '-0.015em' }}>{children}</div>
    </div>
  )
}

function typed(text, f, a, b) {
  return text.slice(0, Math.round(cl((f - a) / (b - a)) * text.length))
}

function StageForm({ f }) {
  const g = f
  const sent = g > 62
  const press = cl(1 - Math.abs(g - 60) / 4)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
      <Glass rim="left" style={{ position: 'relative', width: 640, padding: '28px 34px 32px' }}>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>Book a consultation</div>
        <Field label="Name">
          <div style={{ width: `${cl((g - 6) / 14) * 46}%`, height: 12, borderRadius: 12, background: 'rgba(255,255,255,0.16)' }} />
        </Field>
        <Field label="What do you need?">
          {typed('An evening slot, first visit', g, 18, 48)}
          <span style={{ width: 2.5, height: 28, background: S.saffron, marginLeft: 3, opacity: g < 52 && Math.floor(g / 8) % 2 === 0 ? 1 : 0 }} />
        </Field>
        <div style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', borderRadius: 999, fontSize: 26, fontWeight: 600, background: sent ? 'rgba(245,135,30,0.16)' : S.saffron, color: sent ? S.peach : S.onSaffron, border: `1px solid ${sent ? 'rgba(245,135,30,0.5)' : S.saffron}`, transform: `scale(${(1 - press * 0.05).toFixed(4)})` }}>
          {sent && <Icon name="check" size={24} stroke={2.6} />}
          {sent ? 'Sent' : 'Send enquiry'}
        </div>
      </Glass>
      <div style={{ width: 330 }}>
        <Chip icon="moon" label="11:04 pm" lit={1} size={30} style={{ position: 'relative', opacity: fadeIn(g, 10, 10) }} />
        <div style={{ marginTop: 20, fontSize: 28, color: S.muted, lineHeight: 1.3, opacity: fadeIn(g, 64, 10) }}>Nobody is at the desk.</div>
      </div>
    </div>
  )
}

function StageReply({ f }) {
  const a = arrive(f, 12)
  return (
    <Glass rim="right" style={{ position: 'relative', width: 720, overflow: 'hidden' }}>
      <Bar title="New enquiry" label="WhatsApp" icon="user" />
      <div style={{ padding: '26px 30px 30px', display: 'flex', justifyContent: 'flex-end', opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * 26).toFixed(2)}px)` }}>
        <Bubble side="out" width={580} text="Hi! Thanks for getting in touch. Here’s a link to pick a time that suits you." time="11:04 pm" tag="Sent instantly" />
      </div>
    </Glass>
  )
}

function StageList({ f }) {
  const row = arrive(f, 12, 120)
  const cols = '1.2fr 1fr 1fr'
  const bar = (w) => <div style={{ width: w, height: 12, borderRadius: 12, background: 'rgba(255,255,255,0.08)' }} />
  return (
    <Glass rim="top" style={{ position: 'relative', width: 1000, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 30px', borderBottom: `1px solid ${S.hair}` }}>
        <Icon name="database" size={28} color={S.peach} />
        <span style={{ fontSize: 30, letterSpacing: '-0.025em' }}>Leads</span>
        <span style={{ marginLeft: 'auto' }}>
          <Mono size={20}>Every enquiry, one record</Mono>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, padding: '14px 30px', borderBottom: `1px solid ${S.hair}` }}>
        {['Source', 'Received', 'Stage'].map((c) => (
          <Mono key={c} size={20}>{c}</Mono>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '0 30px', height: row * 74, overflow: 'hidden', background: 'rgba(245,135,30,0.1)', borderLeft: `3px solid ${S.saffron}`, fontSize: 27, borderBottom: `1px solid ${S.hair}`, opacity: cl(row * 1.4) }}>
        <div>Web form</div>
        <div>11:04 pm</div>
        <div>
          <span style={{ padding: '6px 16px', borderRadius: 999, background: S.saffron, color: S.onSaffron, fontSize: 23, fontWeight: 600 }}>New</span>
        </div>
      </div>
      {[0, 1].map((r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', padding: '0 30px', height: 70, borderBottom: r === 0 ? `1px solid ${S.hair}` : 'none' }}>
          {bar('60%')}
          {bar('50%')}
          {bar('40%')}
        </div>
      ))}
    </Glass>
  )
}

function StageTeam({ f }) {
  const a = arrive(f, 6, 140)
  const b = arrive(f, 24)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <Glass rim="left" lit={0.5} style={{ position: 'relative', width: 660, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 20, opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * -30).toFixed(2)}px)` }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, display: 'grid', placeItems: 'center', background: S.saffron, color: S.onSaffron, flex: 'none' }}>
          <Icon name="bell" size={30} stroke={2.1} />
        </div>
        <div>
          <div style={{ fontSize: 30, letterSpacing: '-0.02em' }}>New lead from the web form</div>
          <div style={{ marginTop: 6, fontSize: 24, color: S.muted }}>Assigned to the front desk</div>
        </div>
      </Glass>
      <Glass rim={null} style={{ position: 'relative', width: 660, padding: '22px 26px', display: 'flex', alignItems: 'center', gap: 18, opacity: cl(b * 1.5), transform: `translateY(${((1 - b) * 20).toFixed(2)}px)` }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${S.saffron}`, flex: 'none' }} />
        <div style={{ fontSize: 29, letterSpacing: '-0.02em' }}>Call back before 10 am</div>
        <span style={{ marginLeft: 'auto' }}>
          <Mono size={20} color={S.peach}>Task</Mono>
        </span>
      </Glass>
    </div>
  )
}

function StageRemind({ f }) {
  const a = arrive(f, 14)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
      <div style={{ opacity: fadeIn(f, 4, 10) }}>
        <Chip icon="sun" label="9:00 am" lit={1} size={30} style={{ position: 'relative' }} />
        <div style={{ marginTop: 18, fontSize: 28, color: S.muted }}>Next morning</div>
      </div>
      <div style={{ opacity: cl(a * 1.5), transform: `translateY(${((1 - a) * 24).toFixed(2)}px)` }}>
        <Bubble side="out" width={640} text="Good morning! A quick reminder: your booking link is here whenever you’re ready." time="9:00 am" />
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
    <Glass rim="left" style={{ position: 'relative', width: 1040, padding: '10px 32px 24px' }}>
      {rows.map((r, i) => {
        const a = arrive(f, r.at)
        return (
          <div key={r.day} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0', borderBottom: i === 0 ? `1px solid ${S.hair}` : 'none', opacity: cl(a * 1.5), transform: `translateX(${((1 - a) * 30).toFixed(2)}px)` }}>
            <span style={{ flex: 'none', padding: '8px 18px', borderRadius: 999, background: 'rgba(245,135,30,0.14)', border: '1px solid rgba(245,135,30,0.35)', color: S.peach, fontSize: 25 }}>{r.day}</span>
            <span style={{ fontSize: 29, letterSpacing: '-0.02em' }}>{r.text}</span>
            <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              <Mono size={20} color={i === 0 ? S.peach : S.muted}>{r.state}</Mono>
            </span>
          </div>
        )
      })}
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 12, fontSize: 27, color: S.muted, opacity: fadeIn(f, 40, 10) }}>
        <Icon name="check" size={26} color={S.saffron} stroke={2.6} />
        Stops the moment they book.
      </div>
    </Glass>
  )
}

const STAGES = [StageForm, StageReply, StageList, StageTeam, StageRemind, StageFollow]
