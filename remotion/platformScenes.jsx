import { interpolate } from 'remotion'
import { C, DISPLAY, tween, clamp, easeInOut } from './shared.jsx'
import { Icon } from './icons.jsx'

/* "Done" states use the peach tint of the Dusk palette rather than a
   green, so the schematics stay inside the brand's two-colour system. */
const OK = C.peach
const OK_SOFT = 'rgba(255,200,154,0.14)'

/*
  Wireframe screens for the two client platforms, one per stage of the
  real flow in data.js. Deliberately schematic: grey bars stand in for any
  text a client would have typed, and nothing here resembles a real
  record. Each Screen gets `f`, the frame local to its stage (0 to P_STAGE).
*/

/* ---------- primitives ---------- */

const Bar = ({ w = '100%', h = 12, o = 1, c = 'rgba(255,255,255,0.09)', style }) => (
  <div style={{ width: w, height: h, borderRadius: h, background: c, opacity: o, ...style }} />
)

const Panel = ({ children, style }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 26, ...style }}>{children}</div>
)

const Label = ({ children, style }) => (
  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, ...style }}>{children}</div>
)

const Title = ({ children, size = 30, style }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: size, letterSpacing: '-0.035em', color: C.ink, ...style }}>{children}</div>
)

function Field({ label, fill, lines = 1 }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 15, color: C.inkSoft, marginBottom: 8, fontWeight: 500 }}>{label}</div>
      <div style={{ border: `1px solid ${C.lineStrong}`, borderRadius: 10, padding: '14px 16px', background: C.page, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <Bar key={i} w={`${Math.max(0, Math.min(1, fill * lines - i)) * (i === lines - 1 ? 60 : 92)}%`} h={11} c="rgba(255,255,255,0.22)" />
        ))}
      </div>
    </div>
  )
}

function Btn({ children, press = 0, done = false, style }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 26px',
        borderRadius: 999,
        background: done ? OK_SOFT : C.accent,
        color: done ? OK : C.onAccent,
        border: done ? `1px solid ${OK}` : 'none',
        fontWeight: 500,
        fontSize: 17,
        transform: `scale(${1 - press * 0.06})`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Tick({ on = 1, label, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: on, transform: `translateY(${(1 - on) * 10}px)`, ...style }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.accent, display: 'grid', placeItems: 'center', flex: 'none' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ fontSize: 17, color: C.inkSoft, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function Toast({ f, at, children }) {
  const t = tween(f, at, at + 14)
  return (
    <div
      style={{
        position: 'absolute',
        right: 26,
        top: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderRadius: 14,
        background: '#1d1d1d',
        border: `1px solid ${C.lineStrong}`,
        boxShadow: '0 18px 50px rgba(0,0,0,0.5)',
        opacity: t,
        transform: `translateY(${(1 - t) * -24}px)`,
        fontSize: 16,
        fontWeight: 500,
        color: C.ink,
        zIndex: 5,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.accent }} />
      {children}
    </div>
  )
}

const Pad = ({ children, style }) => <div style={{ position: 'absolute', inset: 0, padding: 36, ...style }}>{children}</div>

const press = (f, at) => interpolate(f, [at - 3, at, at + 6], [0, 1, 0], clamp)

/* ---------- Therapist PWA ---------- */

function PwaEnquire({ f }) {
  const fill = tween(f, 6, 40)
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
      <Panel>
        <Label>Public form</Label>
        <Title style={{ margin: '10px 0 26px' }}>Book a first conversation</Title>
        <Field label="Name" fill={tween(f, 6, 18)} />
        <Field label="Phone" fill={tween(f, 16, 28)} />
        <Field label="What would you like help with?" fill={tween(f, 26, 44)} lines={2} />
        <Btn press={press(f, 52)} done={f > 56}>{f > 56 ? 'Sent' : 'Send enquiry'}</Btn>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 70, opacity: fill }}>
        <Label>What happens next</Label>
        <Tick on={tween(f, 58, 68)} label="Lead lands in the CRM" />
        <Tick on={tween(f, 64, 74)} label="Front desk notified" />
        <Tick on={tween(f, 70, 80)} label="Screening form sent" />
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
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 26 }}>
      <Panel style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <Title size={26}>Booking desk</Title>
          <Label>Therapist availability</Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {days.map((d) => (
            <div key={d} style={{ fontSize: 15, color: C.muted, fontWeight: 600, textAlign: 'center' }}>{d}</div>
          ))}
          {Array.from({ length: 6 }).flatMap((_, r) =>
            days.map((d, c) => {
              const key = `${c}-${r}`
              const isPick = c === 1 && r === 4
              const on = isPick && pick
              return (
                <div
                  key={key}
                  style={{
                    height: 62,
                    borderRadius: 10,
                    background: on ? C.accent : busy.has(key) ? 'rgba(255,255,255,0.04)' : 'rgba(245,135,30,0.08)',
                    border: `1px solid ${on ? C.accent : busy.has(key) ? C.line : 'rgba(245,135,30,0.3)'}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 14,
                    fontWeight: 500,
                    color: on ? C.onAccent : busy.has(key) ? 'rgba(255,255,255,0.2)' : C.accent,
                    transform: on ? `scale(${1 + press(f, 34) * 0.06})` : 'none',
                  }}
                >
                  {busy.has(key) ? 'Booked' : `${11 + r}:00`}
                </div>
              )
            })
          )}
        </div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel style={{ padding: 22 }}>
          <Label>Session mode</Label>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {['In person', 'Telephonic', 'Online'].map((m, i) => (
              <span key={m} style={{ fontSize: 15, fontWeight: 600, padding: '8px 14px', borderRadius: 999, border: `1px solid ${i === 0 ? C.accent : C.lineStrong}`, color: i === 0 ? C.accent : C.muted, background: i === 0 ? C.accentSoft : 'transparent' }}>{m}</span>
            ))}
          </div>
          <div style={{ marginTop: 18, fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, letterSpacing: '-0.02em', color: pick ? C.ink : C.muted }}>{pick ? 'Tue · 15:00' : 'Pick a slot'}</div>
        </Panel>
        <Tick on={tween(f, 46, 56)} label="Google Calendar event" />
        <Tick on={tween(f, 54, 64)} label="WhatsApp confirmation" />
        <Tick on={tween(f, 62, 72)} label="Reminder scheduled" />
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6, opacity: tween(f, 66, 78) }}>Each step runs through an n8n workflow</div>
      </div>
    </Pad>
  )
}

function PwaSee({ f }) {
  const secs = 760 + Math.floor(f / 3)
  const chunks = [18, 34, 50, 66]
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 26 }}>
      <Panel style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff4d4d', opacity: 0.6 + 0.4 * Math.sin(f / 4) }} />
          <Label style={{ color: '#ff8080' }}>Recording on this device</Label>
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 96, letterSpacing: '-0.045em', color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
          {String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 90 }}>
          {Array.from({ length: 48 }).map((_, i) => {
            const h = 10 + Math.abs(Math.sin(i * 0.7 + f / 3.2) * Math.cos(i * 0.23 + f / 7)) * 78
            return <div key={i} style={{ width: 7, height: h, borderRadius: 4, background: i % 6 === 0 ? C.accent : 'rgba(245,135,30,0.55)' }} />
          })}
        </div>
      </Panel>
      <Panel style={{ padding: 22 }}>
        <Label>60-second chunks</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {chunks.map((at, i) => {
            const t = tween(f, at, at + 10)
            const done = f > at + 18
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, border: `1px solid ${C.line}`, background: C.page, opacity: t, transform: `translateX(${(1 - t) * 20}px)` }}>
                <span style={{ fontSize: 16, color: C.inkSoft, fontWeight: 600 }}>Chunk {String(i + 9).padStart(2, '0')}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: done ? OK : C.accent }}>
                  {done && <Icon name="check" size={14} stroke={3} />}
                  {done ? 'Transcribed' : 'Queued'}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 18, fontSize: 14, color: C.muted, lineHeight: 1.5 }}>Queued offline, retried, audio dropped once transcribed.</div>
      </Panel>
    </Pad>
  )
}

function PwaNote({ f }) {
  const sections = ['Presenting concerns', 'Session content', 'Interventions', 'Plan']
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 26 }}>
      <Panel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title size={28}>Clinical note</Title>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.accent, border: `1px solid ${C.accent}`, background: C.accentSoft, padding: '6px 12px', borderRadius: 999 }}>AI draft · therapist reviews</span>
        </div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((s, i) => {
            const t = tween(f, 8 + i * 12, 22 + i * 12)
            return (
              <div key={s} style={{ opacity: Math.min(1, t * 3) }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.inkSoft, marginBottom: 10 }}>{s}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Bar w={`${t * 96}%`} h={10} c="rgba(255,255,255,0.16)" />
                  <Bar w={`${Math.max(0, t * 2 - 1) * 72}%`} h={10} c="rgba(255,255,255,0.16)" />
                </div>
              </div>
            )
          })}
        </div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
        <Label>Guardrails</Label>
        <Tick on={tween(f, 50, 60)} label="Whole-file audio chunks" />
        <Tick on={tween(f, 56, 66)} label="Repetition-loop check" />
        <Tick on={tween(f, 62, 72)} label="Well-formed note check" />
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, marginTop: 6, opacity: tween(f, 66, 78) }}>A bad draft fails loudly instead of being trusted.</div>
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
        stroke={C.ink}
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
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 26 }}>
      <Panel style={{ position: 'relative' }}>
        <Label>Consent form</Label>
        <Title size={28} style={{ margin: '10px 0 22px' }}>Informed consent for therapy</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[96, 88, 92, 70, 94, 82, 60].map((w, i) => (
            <Bar key={i} w={`${w}%`} h={10} />
          ))}
        </div>
        <div style={{ marginTop: 26, borderTop: `1px dashed ${C.lineStrong}`, paddingTop: 12 }}>
          <Signature t={tween(f, 10, 44, easeInOut)} />
          <div style={{ fontSize: 14, color: C.muted }}>Client signature</div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 28,
            bottom: 34,
            transform: `rotate(-8deg) scale(${interpolate(sealed, [0, 1], [1.5, 1])})`,
            opacity: sealed,
            border: `3px solid ${C.accent}`,
            color: C.accent,
            borderRadius: 12,
            padding: '10px 18px',
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '0.06em',
          }}
        >
          SEALED PDF
        </div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
        <Label>Then, automatically</Label>
        <Tick on={tween(f, 56, 66)} label="PDF generated server-side" />
        <Tick on={tween(f, 62, 72)} label="Stored & emailed" />
        <Tick on={tween(f, 68, 78)} label="Countersign queue" />
      </div>
    </Pad>
  )
}

function PwaFollow({ f }) {
  const tasks = [
    ['Follow up after first session', 'Today', true],
    ['Send screening form', 'Repeats weekly', false],
    ['Review AI case summary', 'Tomorrow', false],
    ['Group session notes', 'Fri', false],
  ]
  const bubble = tween(f, 30, 44)
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 26 }}>
      <Panel>
        <Title size={26} style={{ marginBottom: 20 }}>Tasks</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map(([t, when, hot], i) => {
            const done = i === 0 && f > 60
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, border: `1px solid ${hot ? 'rgba(245,135,30,0.4)' : C.line}`, background: hot ? C.accentSoft : C.page }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${done ? C.accent : C.lineStrong}`, background: done ? C.accent : 'transparent' }} />
                <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: done ? C.muted : C.ink, textDecoration: done ? 'line-through' : 'none' }}>{t}</span>
                <span style={{ fontSize: 14, color: C.muted }}>{when}</span>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.surface3 }} />
              </div>
            )
          })}
        </div>
      </Panel>
      <div style={{ position: 'relative' }}>
        <Label>WhatsApp · automated</Label>
        <div style={{ marginTop: 16, background: '#0b141a', border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, height: 360 }}>
          <div style={{ maxWidth: 270, marginLeft: 'auto', background: '#005c4b', borderRadius: '14px 14px 4px 14px', padding: '12px 14px', color: '#e9edef', fontSize: 16, lineHeight: 1.45, opacity: bubble, transform: `translateY(${(1 - bubble) * 16}px)` }}>
            Hi! A reminder that your next session is tomorrow at 3:00 PM. Reply 1 to confirm.
            <div style={{ fontSize: 12, opacity: 0.6, textAlign: 'right', marginTop: 4 }}>09:00</div>
          </div>
          <div style={{ maxWidth: 80, marginTop: 14, background: '#202c33', borderRadius: '14px 14px 14px 4px', padding: '10px 14px', color: '#e9edef', fontSize: 16, opacity: tween(f, 52, 62) }}>1</div>
        </div>
      </div>
      <Toast f={f} at={62}>Confirmed · task closed</Toast>
    </Pad>
  )
}

/* ---------- Care journey platform ---------- */

function UdDiscover({ f }) {
  return (
    <Pad style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}>
      <Label style={{ color: C.accent }}>12-week recovery program</Label>
      <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 64, lineHeight: 1.02, letterSpacing: '-0.045em', color: C.ink, margin: '18px 0 22px', maxWidth: 760 }}>
        Recovery that doesn’t stop between sessions.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 560, marginBottom: 34 }}>
        <Bar w="94%" /> <Bar w="78%" />
      </div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <Btn press={press(f, 54)}>Take the first step</Btn>
        <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>Course · live therapy · always-on help</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 48 }}>
        {['Self-paced course', 'Live 1:1 & group therapy', 'Safety layer, always on'].map((t, i) => {
          const s = tween(f, 12 + i * 8, 28 + i * 8)
          return (
            <div key={t} style={{ padding: 20, borderRadius: 14, border: `1px solid ${C.line}`, background: C.surface, opacity: s, transform: `translateY(${(1 - s) * 16}px)` }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: C.accentSoft, border: `1px solid rgba(245,135,30,0.4)`, marginBottom: 12 }} />
              <div style={{ fontSize: 18, fontWeight: 500, color: C.ink }}>{t}</div>
            </div>
          )
        })}
      </div>
    </Pad>
  )
}

function UdTriage({ f }) {
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
      <Panel>
        <Label>Triage form</Label>
        <Title style={{ margin: '10px 0 24px' }}>Tell us a little about where you are</Title>
        <Field label="Name" fill={tween(f, 6, 18)} />
        <Field label="Best way to reach you" fill={tween(f, 16, 28)} />
        <Field label="What’s been happening" fill={tween(f, 26, 44)} lines={2} />
        <Btn press={press(f, 52)} done={f > 56}>{f > 56 ? 'Received' : 'Submit'}</Btn>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 70 }}>
        <Label>Creates</Label>
        <Tick on={tween(f, 58, 68)} label="A lead, not an account" />
        <Tick on={tween(f, 64, 74)} label="Coordinator alerted" />
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, opacity: tween(f, 70, 82) }}>No portal access until screening, assessment and payment are done.</div>
      </div>
      <Toast f={f} at={56}>New lead in the pipeline</Toast>
    </Pad>
  )
}

function UdScreen({ f }) {
  const cols = ['New', 'Screening', 'Assessed', 'Paid', 'Enrolled']
  const counts = [3, 2, 2, 1, 4]
  const move = tween(f, 26, 50, easeInOut)
  const colW = 188
  return (
    <Pad>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title size={26}>Lead pipeline</Title>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.muted }}>Admin</span>
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(5, ${colW}px)`, gap: 16 }}>
        {cols.map((c, i) => (
          <div key={c} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, minHeight: 470 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: C.inkSoft, marginBottom: 12 }}>{c}</div>
            {Array.from({ length: counts[i] }).map((_, k) => (
              <div key={k} style={{ height: 64, borderRadius: 10, background: C.page, border: `1px solid ${C.line}`, marginBottom: 10, padding: 12 }}>
                <Bar w="70%" h={10} c="rgba(255,255,255,0.14)" />
                <Bar w="40%" h={8} style={{ marginTop: 10 }} />
              </div>
            ))}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            left: 14 + move * (colW + 16),
            top: 44 + counts[0] * 74 - move * (counts[0] - counts[1]) * 74,
            width: colW - 28,
            height: 64,
            borderRadius: 10,
            background: '#241a10',
            border: `1.5px solid ${C.accent}`,
            padding: 12,
            boxShadow: move > 0 && move < 1 ? '0 20px 40px rgba(0,0,0,0.5)' : 'none',
            transform: `rotate(${Math.sin(move * Math.PI) * 3}deg)`,
          }}
        >
          <Bar w="70%" h={10} c="rgba(245,135,30,0.6)" />
          <div style={{ fontSize: 12, fontWeight: 500, color: C.accent, marginTop: 8 }}>{move > 0.9 ? 'Call booked · Cal.com' : 'New lead'}</div>
        </div>
      </div>
    </Pad>
  )
}

function UdAssess({ f }) {
  const items = ['Screening call held', 'History & risk reviewed', 'Program fit discussed', 'Family contact agreed']
  return (
    <Pad style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 26 }}>
      <Panel>
        <Label>Clinical assessment</Label>
        <Title size={28} style={{ margin: '10px 0 26px' }}>Is the program the right fit?</Title>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {items.map((t, i) => (
            <Tick key={t} on={tween(f, 8 + i * 10, 18 + i * 10)} label={t} />
          ))}
        </div>
      </Panel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 10 }}>
        <Panel style={{ padding: 22, borderColor: f > 56 ? OK : C.line, opacity: tween(f, 50, 60) }}>
          <Label>Outcome</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: DISPLAY, fontWeight: 500, fontSize: 26, color: OK, marginTop: 10 }}>
            <Icon name="check" size={24} stroke={2.6} />
            Suitable
          </div>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>Signed off by the clinician</div>
        </Panel>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.5, opacity: tween(f, 62, 74) }}>Payment only unlocks after this step.</div>
      </div>
    </Pad>
  )
}

function UdPay({ f }) {
  const paid = f > 48
  return (
    <Pad style={{ display: 'grid', placeItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '440px 320px', gap: 30, alignItems: 'start' }}>
        <Panel style={{ padding: 30 }}>
          <Label>Checkout</Label>
          <Title size={30} style={{ margin: '10px 0 6px' }}>Program intake</Title>
          <div style={{ fontSize: 16, color: C.muted, marginBottom: 26 }}>12 weeks · course + live care</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
            {['UPI', 'Card', 'Netbanking'].map((m, i) => (
              <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 10, border: `1px solid ${i === 0 ? C.accent : C.line}`, background: i === 0 ? C.accentSoft : C.page }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${i === 0 ? C.accent : C.lineStrong}`, background: i === 0 ? C.accent : 'transparent' }} />
                <span style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{m}</span>
              </div>
            ))}
          </div>
          <Btn press={press(f, 40)} done={paid} style={{ width: '100%', justifyContent: 'center', boxSizing: 'border-box' }}>{paid ? 'Paid' : 'Pay securely · Razorpay'}</Btn>
        </Panel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 30 }}>
          <Label>Server-side</Label>
          <Tick on={tween(f, 52, 62)} label="Signed webhook verified" />
          <Tick on={tween(f, 58, 68)} label="Enrolment recorded" />
          <Tick on={tween(f, 64, 74)} label="Portal account created" />
        </div>
      </div>
    </Pad>
  )
}

function UdEnrol({ f }) {
  const mods = [
    ['Understand', 'Modules 1–3', 0.66, false],
    ['Regulate', 'Modules 4–6', 0, true],
    ['Rebuild', 'Modules 7–9', 0, true],
    ['Become', 'Modules 10–12', 0, true],
  ]
  const pulse = 0.5 + 0.5 * Math.sin(f / 5)
  return (
    <Pad>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <Label>Client portal</Label>
          <Title size={32} style={{ marginTop: 8 }}>Week 3 of 12</Title>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Journal', 'Schedule', 'Toolkit'].map((t) => (
            <span key={t} style={{ fontSize: 15, fontWeight: 600, color: C.inkSoft, border: `1px solid ${C.lineStrong}`, borderRadius: 999, padding: '8px 16px' }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {mods.map(([t, s, p, locked], i) => {
          const a = tween(f, 4 + i * 6, 20 + i * 6)
          return (
            <div key={t} style={{ padding: 22, borderRadius: 16, border: `1px solid ${locked ? C.line : 'rgba(245,135,30,0.5)'}`, background: locked ? C.surface : '#1d160f', minHeight: 230, opacity: a, transform: `translateY(${(1 - a) * 14}px)`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{s}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 28, letterSpacing: '-0.03em', color: locked ? C.muted : C.ink, marginTop: 8 }}>{t}</div>
              <div style={{ marginTop: 'auto' }}>
                {locked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.muted, fontWeight: 600 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke={C.muted} strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={C.muted} strokeWidth="2" /></svg>
                    {i === 1 ? 'Opens after your therapist session' : 'Locked'}
                  </div>
                ) : (
                  <>
                    <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.08)' }}>
                      <div style={{ height: 8, borderRadius: 8, width: `${p * tween(f, 20, 50) * 100}%`, background: C.accent }} />
                    </div>
                    <div style={{ fontSize: 14, color: C.accent, fontWeight: 600, marginTop: 8 }}>In progress</div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderRadius: 14, border: `1px solid ${C.line}`, background: C.surface, opacity: tween(f, 40, 54) }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke={C.accent} strokeWidth="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={C.accent} strokeWidth="2" /></svg>
        <span style={{ fontSize: 16, color: C.inkSoft, fontWeight: 500 }}>Clinical gate: the same lock is checked by every screen and every media link.</span>
      </div>
      <div style={{ position: 'absolute', right: 30, bottom: 26, padding: '14px 22px', borderRadius: 999, background: '#e5484d', color: '#fff', fontWeight: 500, fontSize: 17, boxShadow: `0 0 0 ${8 + pulse * 10}px rgba(229,72,77,${0.25 - pulse * 0.15})` }}>
        Get help now
      </div>
    </Pad>
  )
}

export const SCENES = {
  'therapist-pwa': [
    { stage: 'Enquire', tag: 'Public form to CRM lead', url: 'forms.clinic/enquiry', caption: 'A public form becomes a lead in the CRM, and the desk is notified.', Screen: PwaEnquire },
    { stage: 'Book', tag: 'Real-time availability', url: 'crm.clinic/booking-desk', caption: 'Booking checks real availability and syncs Calendar and WhatsApp through n8n.', Screen: PwaBook },
    { stage: 'See', tag: 'Recorded on the device', url: 'crm.clinic/session', caption: 'The session records on the device in 60-second chunks, queued offline.', Screen: PwaSee },
    { stage: 'Note', tag: 'AI draft, guarded', url: 'crm.clinic/notes/draft', caption: 'A clinical note is drafted within a minute, behind guards that fail loudly.', Screen: PwaNote },
    { stage: 'Consent', tag: 'Signed, then sealed as a PDF', url: 'forms.clinic/consent', caption: 'Consent is signed, sealed as a PDF server-side, stored and countersigned.', Screen: PwaConsent },
    { stage: 'Follow up', tag: 'Tasks + WhatsApp', url: 'crm.clinic/tasks', caption: 'Follow-ups run themselves: owned tasks, WhatsApp reminders, desktop push.', Screen: PwaFollow },
  ],
  'care-journey': [
    { stage: 'Discover', tag: 'Public site', url: 'care-journey.app', caption: 'A calm public site explains the three parts of the program.', Screen: UdDiscover },
    { stage: 'Triage', tag: 'Creates a lead, not an account', url: 'care-journey.app/triage', caption: 'The triage form creates a lead, not an account.', Screen: UdTriage },
    { stage: 'Screen', tag: 'Coordinator books a call', url: 'admin.care-journey.app/leads', caption: 'A coordinator books the screening call from the pipeline.', Screen: UdScreen },
    { stage: 'Assess', tag: 'Clinician signs off', url: 'admin.care-journey.app/assessment', caption: 'A clinician assesses fit before anything can be paid for.', Screen: UdAssess },
    { stage: 'Pay', tag: 'Verified server-side', url: 'care-journey.app/checkout', caption: 'Payment is verified server-side; only then is a portal account made.', Screen: UdPay },
    { stage: 'Enrol', tag: 'Gated course + crisis help', url: 'portal.care-journey.app', caption: 'The course unlocks as the work gets done, gated on real sessions.', Screen: UdEnrol },
  ],
}
