import { interpolate } from 'remotion'
import { S, SANS, MONO, tween, clamp, easeInOut } from './kit.jsx'

/*
  The two client platforms, as schematics in the Stage look. Their real
  screens hold client records, so these are wireframes of the real flow:
  grey bars stand in for anything a client would have typed, and every
  frame of the film says "Schematic · client data never shown". The flow,
  stages and mechanics are the real ones (data.js); no names, no records.

  Each screen is drawn at 1120x700 and scaled into the glass window. `f`
  runs 0..96 across a step.
*/

const PANEL = { background: 'rgba(255,255,255,0.025)', border: `1px solid ${S.line}`, borderRadius: 16 }
const SOFT = 'rgba(245,135,30,0.10)'

const Bar = ({ w = '100%', h = 11, c = 'rgba(255,255,255,0.09)', style }) => (
  <div style={{ width: w, height: h, borderRadius: h, background: c, ...style }} />
)
const Panel = ({ children, style }) => <div style={{ ...PANEL, padding: 26, ...style }}>{children}</div>
const Label = ({ children, color = S.muted, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: '0.08em', color, textTransform: 'lowercase', ...style }}>{children}</div>
)
const Title = ({ children, size = 30, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color: S.ink, ...style }}>{children}</div>
)
const Pad = ({ children, style }) => <div style={{ position: 'absolute', inset: 0, padding: 40, ...style }}>{children}</div>
const press = (f, at) => interpolate(f, [at - 3, at, at + 6], [0, 1, 0], clamp)
/* The frame (in a screen's 0..96 clock) each button press peaks, shared
   with the step below (`tap`) so the film's click sound lands on it. */
const TAP = { enquire: 52, book: 34, discover: 54, triage: 52, pay: 40 }

function Field({ label, fill, lines = 1 }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 15, color: S.muted, marginBottom: 8, fontWeight: 500, fontFamily: SANS }}>{label}</div>
      <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', background: 'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Bar key={i} w={`${Math.max(0, Math.min(1, fill * lines - i)) * (i === lines - 1 ? 60 : 92)}%`} h={10} c="rgba(255,255,255,0.2)" />
        ))}
      </div>
    </div>
  )
}

function Btn({ children, p = 0, done = false, style }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 24px',
        borderRadius: 999,
        background: done ? SOFT : S.accent,
        color: done ? S.peach : S.onAccent,
        border: done ? '1px solid rgba(255,200,154,0.5)' : '1px solid transparent',
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: 16,
        transform: `scale(${1 - p * 0.06})`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* A row in a "then, automatically" list: a saffron node on a thin wire. */
function Tick({ on = 1, label, last = false }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, opacity: on, transform: `translateX(${(1 - on) * 14}px)`, paddingBottom: last ? 0 : 18 }}>
      {!last && <div style={{ position: 'absolute', left: 6, top: 18, bottom: 0, width: 1.5, background: 'rgba(245,135,30,0.45)' }} />}
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: S.accent, boxShadow: '0 0 12px rgba(245,135,30,0.8)', flex: 'none' }} />
      <div style={{ fontFamily: SANS, fontSize: 17, color: S.inkSoft, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function Ticks({ f, at, items, title = 'then, automatically' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Label style={{ marginBottom: 18 }}>{title}</Label>
      {items.map((t, i) => (
        <Tick key={t} on={tween(f, at + i * 7, at + 10 + i * 7)} label={t} last={i === items.length - 1} />
      ))}
    </div>
  )
}

function Toast({ f, at, children }) {
  const t = tween(f, at, at + 14)
  return (
    <div
      style={{
        position: 'absolute',
        right: 30,
        top: 26,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '13px 18px',
        borderRadius: 14,
        background: 'rgba(28,26,24,0.95)',
        border: '1px solid rgba(245,135,30,0.4)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
        opacity: t,
        transform: `translateY(${(1 - t) * -20}px)`,
        fontFamily: SANS,
        fontSize: 16,
        fontWeight: 500,
        color: S.ink,
        zIndex: 5,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: S.accent, boxShadow: '0 0 10px rgba(245,135,30,0.9)' }} />
      {children}
    </div>
  )
}

/* ---------- Clinic Staff App ---------- */

function PwaEnquire({ f }) {
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 34 }}>
      <Panel>
        <Label>public form</Label>
        <Title style={{ margin: '10px 0 24px' }}>Book a first conversation</Title>
        <Field label="Name" fill={tween(f, 6, 18)} />
        <Field label="Phone" fill={tween(f, 16, 28)} />
        <Field label="What would you like help with?" fill={tween(f, 26, 44)} lines={2} />
        <Btn p={press(f, TAP.enquire)} done={f > 56}>{f > 56 ? 'Sent' : 'Send enquiry'}</Btn>
      </Panel>
      <div style={{ paddingTop: 80 }}>
        <Ticks f={f} at={58} items={['Lead saved', 'Front desk told', 'Screening form sent']} />
      </div>
      <Toast f={f} at={56}>New enquiry · assigned to the desk</Toast>
    </Pad>
  )
}

function PwaBook({ f }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const busy = new Set(['0-1', '0-4', '1-0', '1-3', '2-2', '2-5', '3-1', '3-4', '4-0', '4-3', '4-5'])
  const pick = f > 34
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 30 }}>
      <Panel style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Title size={26}>Booking desk</Title>
          <Label>therapist availability</Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {days.map((d) => (
            <div key={d} style={{ fontFamily: MONO, fontSize: 13, color: S.muted, textAlign: 'center', letterSpacing: '0.08em' }}>{d.toLowerCase()}</div>
          ))}
          {Array.from({ length: 6 }).flatMap((_, r) =>
            days.map((d, c) => {
              const key = `${c}-${r}`
              const on = c === 1 && r === 4 && pick
              const b = busy.has(key)
              return (
                <div
                  key={key}
                  style={{
                    height: 62,
                    borderRadius: 10,
                    background: on ? S.accent : b ? 'rgba(255,255,255,0.025)' : 'rgba(245,135,30,0.07)',
                    border: `1px solid ${on ? S.accent : b ? S.line : 'rgba(245,135,30,0.28)'}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontFamily: SANS,
                    fontSize: 14,
                    fontWeight: 500,
                    color: on ? S.onAccent : b ? 'rgba(255,255,255,0.2)' : S.accent,
                    boxShadow: on ? '0 0 30px rgba(245,135,30,0.5)' : 'none',
                    transform: on ? `scale(${1 + press(f, TAP.book) * 0.06})` : 'none',
                  }}
                >
                  {b ? 'Booked' : `${11 + r}:00`}
                </div>
              )
            })
          )}
        </div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Panel style={{ padding: 22 }}>
          <Label>session</Label>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['In person', 'Phone', 'Online'].map((m, i) => (
              <span key={m} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, padding: '7px 13px', borderRadius: 999, border: `1px solid ${i === 0 ? S.accent : 'rgba(255,255,255,0.12)'}`, color: i === 0 ? S.peach : S.muted, background: i === 0 ? SOFT : 'transparent' }}>{m}</span>
            ))}
          </div>
          <div style={{ marginTop: 18, fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: '-0.02em', color: pick ? S.ink : S.muted }}>{pick ? 'Tue · 15:00' : 'Pick a slot'}</div>
        </Panel>
        <Ticks f={f} at={46} items={['Calendar updated', 'WhatsApp confirmation', 'Reminder set']} />
      </div>
    </Pad>
  )
}

function PwaSee({ f }) {
  const secs = 760 + Math.floor(f / 3)
  const chunks = [18, 34, 50, 66]
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 30 }}>
      <Panel style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: S.accent, opacity: 0.55 + 0.45 * Math.sin(f / 4), boxShadow: '0 0 14px rgba(245,135,30,0.9)' }} />
          <Label color={S.peach}>recording on this device</Label>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 104, letterSpacing: '-0.05em', color: S.ink, fontVariantNumeric: 'tabular-nums' }}>
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 90 }}>
          {Array.from({ length: 48 }).map((_, i) => {
            const h = 8 + Math.abs(Math.sin(i * 0.7 + f / 3.2) * Math.cos(i * 0.23 + f / 7)) * 78
            return <div key={i} style={{ width: 6, height: h, borderRadius: 4, background: i % 6 === 0 ? S.accent : 'rgba(245,135,30,0.45)' }} />
          })}
        </div>
      </Panel>
      <Panel style={{ padding: 22 }}>
        <Label>one-minute pieces</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {chunks.map((at, i) => {
            const t = tween(f, at, at + 10)
            const done = f > at + 18
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: `1px solid ${S.line}`, background: 'rgba(0,0,0,0.25)', opacity: t, transform: `translateX(${(1 - t) * 20}px)` }}>
                <span style={{ fontFamily: SANS, fontSize: 15, color: S.inkSoft, fontWeight: 500 }}>Piece {String(i + 9).padStart(2, '0')}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: done ? S.peach : S.accent }}>{done ? 'written up' : 'queued'}</span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 14, color: S.muted, lineHeight: 1.5 }}>Saved even offline. The audio is deleted once it is written up.</div>
      </Panel>
    </Pad>
  )
}

function PwaNote({ f }) {
  const sections = ['Presenting concerns', 'Session content', 'Interventions', 'Plan']
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 30 }}>
      <Panel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title size={28}>Session note</Title>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: S.peach, border: '1px solid rgba(245,135,30,0.5)', background: SOFT, padding: '7px 12px', borderRadius: 999 }}>ai draft · therapist reviews</span>
        </div>
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((s, i) => {
            const t = tween(f, 8 + i * 12, 22 + i * 12)
            return (
              <div key={s} style={{ opacity: Math.min(1, t * 3) }}>
                <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: S.inkSoft, marginBottom: 10 }}>{s}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Bar w={`${t * 96}%`} h={9} c="rgba(255,255,255,0.15)" />
                  <Bar w={`${Math.max(0, t * 2 - 1) * 72}%`} h={9} c="rgba(255,255,255,0.15)" />
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
      <div style={{ paddingTop: 10 }}>
        <Ticks f={f} at={50} title="checks before it is shown" items={['Whole recording heard', 'No repeated lines', 'Every section filled']} />
        <div style={{ fontFamily: SANS, fontSize: 14, color: S.muted, lineHeight: 1.5, marginTop: 22, opacity: tween(f, 70, 80) }}>A bad draft is flagged, never trusted.</div>
      </div>
    </Pad>
  )
}

function Signature({ t }) {
  const len = 900
  return (
    <svg width="320" height="90" viewBox="0 0 320 90" fill="none">
      <path
        d="M10 62c18-30 30-44 36-38 8 8-14 44-6 44 10 0 20-40 30-40s-2 34 8 34 16-26 24-26-4 22 6 22c14 0 18-30 30-30 8 0-2 24 8 24 12 0 22-18 34-18s0 14 12 14c14 0 30-10 50-16s40-6 60-4"
        stroke={S.ink}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - t)}
      />
    </svg>
  )
}

function PwaConsent({ f }) {
  const sealed = tween(f, 50, 62)
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 30 }}>
      <Panel style={{ position: 'relative' }}>
        <Label>consent form</Label>
        <Title size={28} style={{ margin: '10px 0 22px' }}>Informed consent for therapy</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[96, 88, 92, 70, 94, 82, 60].map((w, i) => (
            <Bar key={i} w={`${w}%`} h={9} />
          ))}
        </div>
        <div style={{ marginTop: 26, borderTop: '1px dashed rgba(255,255,255,0.14)', paddingTop: 12 }}>
          <Signature t={tween(f, 10, 44, easeInOut)} />
          <Label>client signature</Label>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 28,
            bottom: 34,
            transform: `rotate(-8deg) scale(${interpolate(sealed, [0, 1], [1.5, 1])})`,
            opacity: sealed,
            border: `2px solid ${S.accent}`,
            color: S.accent,
            borderRadius: 12,
            padding: '10px 18px',
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: '0.12em',
            boxShadow: '0 0 30px rgba(245,135,30,0.3)',
          }}
        >
          SEALED
        </div>
      </Panel>
      <div style={{ paddingTop: 10 }}>
        <Ticks f={f} at={56} items={['Sealed copy made', 'Stored and emailed', 'Sent for countersigning']} />
      </div>
    </Pad>
  )
}

function PwaFollow({ f }) {
  const tasks = [
    ['Follow up after first session', 'today', true],
    ['Send screening form', 'weekly', false],
    ['Review case summary', 'tomorrow', false],
    ['Group session notes', 'fri', false],
  ]
  const bubble = tween(f, 30, 44)
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 30 }}>
      <Panel>
        <Title size={26} style={{ marginBottom: 20 }}>Tasks</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map(([t, when, hot], i) => {
            const done = i === 0 && f > 60
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `1px solid ${hot ? 'rgba(245,135,30,0.4)' : S.line}`, background: hot ? SOFT : 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: 18, height: 18, borderRadius: 6, border: `2px solid ${done ? S.accent : 'rgba(255,255,255,0.18)'}`, background: done ? S.accent : 'transparent' }} />
                <span style={{ flex: 1, fontFamily: SANS, fontSize: 17, fontWeight: 500, color: done ? S.muted : S.ink, textDecoration: done ? 'line-through' : 'none' }}>{t}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.06em', color: S.muted }}>{when}</span>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              </div>
            )
          })}
        </div>
      </Panel>
      <div>
        <Label>whatsapp · sent for you</Label>
        <div style={{ marginTop: 16, ...PANEL, padding: 18, height: 360, background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ maxWidth: 260, marginLeft: 'auto', background: 'rgba(245,135,30,0.16)', border: '1px solid rgba(245,135,30,0.35)', borderRadius: '14px 14px 4px 14px', padding: '12px 14px', color: S.ink, fontFamily: SANS, fontSize: 15, lineHeight: 1.45, opacity: bubble, transform: `translateY(${(1 - bubble) * 16}px)` }}>
            A reminder that your next session is tomorrow at 3:00 pm. Reply 1 to confirm.
            <div style={{ fontFamily: MONO, fontSize: 11, opacity: 0.6, textAlign: 'right', marginTop: 4 }}>09:00</div>
          </div>
          <div style={{ maxWidth: 70, marginTop: 14, background: 'rgba(255,255,255,0.07)', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', color: S.ink, fontFamily: SANS, fontSize: 15, opacity: tween(f, 52, 62) }}>1</div>
        </div>
      </div>
      <Toast f={f} at={62}>Confirmed · task closed</Toast>
    </Pad>
  )
}

/* ---------- Care Journey Platform ---------- */

function UdDiscover({ f }) {
  return (
    <Pad style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
      <Label color={S.accent}>12-week recovery program</Label>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 62, lineHeight: 1.02, letterSpacing: '-0.045em', color: S.ink, margin: '18px 0 22px', maxWidth: 780 }}>
        Recovery that doesn’t stop between sessions.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560, marginBottom: 34 }}>
        <Bar w="94%" /> <Bar w="78%" />
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Btn p={press(f, TAP.discover)}>Take the first step</Btn>
        <Label>course · live therapy · help at any hour</Label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 46 }}>
        {['Self-paced course', 'Live one-to-one and group therapy', 'Safety net, always on'].map((t, i) => {
          const s = tween(f, 12 + i * 8, 28 + i * 8)
          return (
            <div key={t} style={{ ...PANEL, padding: 20, opacity: s, transform: `translateY(${(1 - s) * 16}px)` }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: S.accent, boxShadow: '0 0 12px rgba(245,135,30,0.8)', marginBottom: 16 }} />
              <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 500, color: S.ink }}>{t}</div>
            </div>
          )
        })}
      </div>
    </Pad>
  )
}

function UdTriage({ f }) {
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 34 }}>
      <Panel>
        <Label>first form</Label>
        <Title style={{ margin: '10px 0 24px' }}>Tell us a little about where you are</Title>
        <Field label="Name" fill={tween(f, 6, 18)} />
        <Field label="Best way to reach you" fill={tween(f, 16, 28)} />
        <Field label="What’s been happening" fill={tween(f, 26, 44)} lines={2} />
        <Btn p={press(f, TAP.triage)} done={f > 56}>{f > 56 ? 'Received' : 'Submit'}</Btn>
      </Panel>
      <div style={{ paddingTop: 80 }}>
        <Ticks f={f} at={58} title="creates" items={['A lead, not an account', 'Coordinator told']} />
        <div style={{ fontFamily: SANS, fontSize: 14, color: S.muted, lineHeight: 1.5, marginTop: 22, opacity: tween(f, 70, 82) }}>No portal until screening, assessment and payment are done.</div>
      </div>
      <Toast f={f} at={56}>New lead in the pipeline</Toast>
    </Pad>
  )
}

function UdScreen({ f }) {
  const cols = ['New', 'Screening', 'Assessed', 'Paid', 'Enrolled']
  const counts = [3, 2, 2, 1, 3]
  const move = tween(f, 26, 50, easeInOut)
  const colW = 192
  return (
    <Pad>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title size={26}>Lead pipeline</Title>
        <Label>admin</Label>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(5, ${colW}px)`, gap: 14 }}>
        {cols.map((c, i) => (
          <div key={c} style={{ ...PANEL, borderRadius: 14, padding: 14, minHeight: 500 }}>
            <Label style={{ marginBottom: 14 }}>{c}</Label>
            {Array.from({ length: counts[i] }).map((_, k) => (
              <div key={k} style={{ height: 64, borderRadius: 10, background: 'rgba(0,0,0,0.25)', border: `1px solid ${S.line}`, marginBottom: 10, padding: 12 }}>
                <Bar w="70%" h={9} c="rgba(255,255,255,0.13)" />
                <Bar w="40%" h={7} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 14 + move * (colW + 14),
            top: 42 + counts[0] * 74 - move * (counts[0] - counts[1]) * 74,
            width: colW - 28,
            height: 64,
            borderRadius: 10,
            background: '#21170d',
            border: `1.5px solid ${S.accent}`,
            padding: 12,
            boxSizing: 'border-box',
            boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 ${30 * Math.sin(move * Math.PI)}px rgba(245,135,30,0.4)`,
            transform: `rotate(${Math.sin(move * Math.PI) * 3}deg)`,
          }}
        >
          <Bar w="70%" h={9} c="rgba(245,135,30,0.55)" />
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', color: S.peach, marginTop: 9 }}>{move > 0.9 ? 'call booked' : 'new lead'}</div>
        </div>
      </div>
    </Pad>
  )
}

function UdAssess({ f }) {
  const items = ['Screening call held', 'History and risk reviewed', 'Program fit discussed', 'Family contact agreed']
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 30 }}>
      <Panel>
        <Label>clinical assessment</Label>
        <Title size={28} style={{ margin: '10px 0 28px' }}>Is the program the right fit?</Title>
        {items.map((t, i) => (
          <Tick key={t} on={tween(f, 8 + i * 10, 18 + i * 10)} label={t} last={i === items.length - 1} />
        ))}
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
        <Panel style={{ padding: 22, borderColor: f > 56 ? 'rgba(245,135,30,0.55)' : S.line, opacity: tween(f, 50, 60), boxShadow: f > 56 ? '0 0 40px -10px rgba(245,135,30,0.5)' : 'none' }}>
          <Label>outcome</Label>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: S.peach, marginTop: 10, letterSpacing: '-0.02em' }}>Suitable</div>
          <div style={{ fontFamily: SANS, fontSize: 15, color: S.muted, marginTop: 8 }}>Signed off by the clinician</div>
        </Panel>
        <div style={{ fontFamily: SANS, fontSize: 14, color: S.muted, lineHeight: 1.5, opacity: tween(f, 62, 74) }}>Payment only opens after this step.</div>
      </div>
    </Pad>
  )
}

function UdPay({ f }) {
  const paid = f > 48
  return (
    <Pad style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '440px 300px', gap: 40, alignItems: 'start' }}>
        <Panel style={{ padding: 30 }}>
          <Label>checkout</Label>
          <Title size={30} style={{ margin: '10px 0 6px' }}>Program intake</Title>
          <div style={{ fontFamily: SANS, fontSize: 16, color: S.muted, marginBottom: 26 }}>12 weeks · course and live care</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
            {['UPI', 'Card', 'Netbanking'].map((m, i) => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: `1px solid ${i === 0 ? S.accent : S.line}`, background: i === 0 ? SOFT : 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${i === 0 ? S.accent : 'rgba(255,255,255,0.18)'}`, background: i === 0 ? S.accent : 'transparent' }} />
                <span style={{ fontFamily: SANS, fontSize: 17, fontWeight: 500, color: S.ink }}>{m}</span>
              </div>
            ))}
          </div>
          <Btn p={press(f, TAP.pay)} done={paid} style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>{paid ? 'Paid' : 'Pay securely'}</Btn>
        </Panel>
        <div style={{ paddingTop: 30 }}>
          <Ticks f={f} at={52} title="checked on the server" items={['Payment confirmed', 'Enrolment recorded', 'Portal account made']} />
        </div>
      </div>
    </Pad>
  )
}

function UdEnrol({ f }) {
  const mods = [
    ['Understand', 'modules 1 to 3', 0.66, false],
    ['Regulate', 'modules 4 to 6', 0, true],
    ['Rebuild', 'modules 7 to 9', 0, true],
    ['Become', 'modules 10 to 12', 0, true],
  ]
  const pulse = 0.5 + 0.5 * Math.sin(f / 5)
  return (
    <Pad>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Label>client portal</Label>
          <Title size={32} style={{ marginTop: 8 }}>Week 3 of 12</Title>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Journal', 'Schedule', 'Toolkit'].map((t) => (
            <span key={t} style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: S.inkSoft, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '8px 16px' }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {mods.map(([t, s, p, locked], i) => {
          const a = tween(f, 4 + i * 6, 20 + i * 6)
          return (
            <div key={t} style={{ ...PANEL, padding: 22, borderColor: locked ? S.line : 'rgba(245,135,30,0.5)', background: locked ? 'rgba(255,255,255,0.02)' : 'rgba(245,135,30,0.06)', minHeight: 230, opacity: a, transform: `translateY(${(1 - a) * 14}px)`, display: 'flex', flexDirection: 'column' }}>
              <Label>{s}</Label>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: '-0.03em', color: locked ? S.muted : S.ink, marginTop: 8 }}>{t}</div>
              <div style={{ marginTop: 'auto' }}>
                {locked ? (
                  <Label>{i === 1 ? 'opens after your session' : 'locked'}</Label>
                ) : (
                  <>
                    <div style={{ height: 6, borderRadius: 6, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: 6, borderRadius: 6, width: `${p * tween(f, 20, 50) * 100}%`, background: S.accent, boxShadow: '0 0 12px rgba(245,135,30,0.7)' }} />
                    </div>
                    <Label color={S.peach} style={{ marginTop: 10 }}>in progress</Label>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', ...PANEL, borderRadius: 14, opacity: tween(f, 40, 54) }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: S.accent }} />
        <span style={{ fontFamily: SANS, fontSize: 16, color: S.inkSoft, fontWeight: 500 }}>The same lock is checked on every screen and every video link.</span>
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 34, padding: '14px 22px', borderRadius: 999, background: '#e5484d', color: '#fff', fontFamily: SANS, fontWeight: 600, fontSize: 17, boxShadow: `0 0 0 ${8 + pulse * 10}px rgba(229,72,77,${0.25 - pulse * 0.15})` }}>
        Get help now
      </div>
    </Pad>
  )
}

const sch = (Screen, stage, caption, chip, url, tap) => ({ kind: 'schematic', Screen, stage, caption, chip, url, tap })

export const SCHEMATIC_STORIES = {
  'therapist-pwa': {
    name: 'Clinic Staff App',
    stakes: 'Bookings. Notes. Consent. *Reminders.*',
    question: 'What if the clinic day ran *itself?*',
    headfake: 'The AI drafts. The therapist *decides.*',
    headfakeAt: 3,
    counts: [
      { n: '1,200+', label: 'client records' },
      { n: '11', label: 'therapists on one system' },
    ],
    steps: [
      sch(PwaEnquire, 'Enquire', 'A public form becomes a lead, and the front desk is told.', ['Lead', 'saved'], 'clinic staff app · enquiries', TAP.enquire),
      sch(PwaBook, 'Book', 'Booking checks real availability, then confirms on WhatsApp.', ['Booking', 'confirmed'], 'clinic staff app · booking desk', TAP.book),
      sch(PwaSee, 'See', 'The session records on the device, a minute at a time, even offline.', ['Recording', 'on device'], 'clinic staff app · session'),
      sch(PwaNote, 'Note', 'A session note is drafted in a minute, behind checks that fail loudly.', ['Note', 'drafted'], 'clinic staff app · notes'),
      sch(PwaConsent, 'Consent', 'Consent is signed, sealed, stored and sent for countersigning.', ['Consent', 'sealed'], 'client forms · consent'),
      sch(PwaFollow, 'Follow up', 'Follow-ups run themselves: tasks, reminders and confirmations.', ['Reminder', 'sent'], 'clinic staff app · tasks'),
    ],
  },
  'care-journey': {
    name: 'Care Journey Platform',
    stakes: 'Recovery stalls between *sessions.*',
    question: 'What if care never *paused?*',
    headfake: 'Nobody pays until a clinician says *yes.*',
    headfakeAt: 4,
    rehook: 'Twelve weeks. One *portal.*',
    steps: [
      sch(UdDiscover, 'Discover', 'A calm public site explains the three parts of the program.', null, 'care journey · home', TAP.discover),
      sch(UdTriage, 'Triage', 'The first form creates a lead, not an account.', ['Lead', 'created'], 'care journey · first form', TAP.triage),
      sch(UdScreen, 'Screen', 'A coordinator books the screening call from the pipeline.', ['Call', 'booked'], 'care journey · admin'),
      sch(UdAssess, 'Assess', 'A clinician checks the fit before anything can be paid for.', ['Fit', 'signed off'], 'care journey · assessment'),
      sch(UdPay, 'Pay', 'Payment is checked on the server. Only then is a portal made.', ['Payment', 'verified'], 'care journey · checkout', TAP.pay),
      sch(UdEnrol, 'Enrol', 'The course unlocks as the work gets done, gated on real sessions.', ['Portal', 'unlocked'], 'care journey · portal'),
    ],
  },
}
