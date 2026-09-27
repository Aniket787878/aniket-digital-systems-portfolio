import { C, SANS } from '../shared.jsx'
import { Icon } from '../icons.jsx'

/*
  Generic, clearly illustrative UI for the explaining scenes: chat bubbles,
  a spreadsheet, a toast, a calendar, a sticky note. No product logos, no
  client names, no real records. Every size here is at least 26px, so it
  still reads on a phone.
*/

export const cardShadow = '0 1px 2px rgba(22,20,18,0.06), 0 14px 40px rgba(22,20,18,0.10)'
export const liftShadow = '0 2px 4px rgba(22,20,18,0.06), 0 26px 60px rgba(22,20,18,0.14)'

const base = { fontFamily: SANS, fontWeight: 500, letterSpacing: '-0.015em', boxSizing: 'border-box' }

function DoubleTick({ color = C.accent, size = 26 }) {
  return (
    <svg width={size * 1.3} height={size} viewBox="0 0 30 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 13l5 5L18 6" />
      <path d="M12 16l2 2L25 6" />
    </svg>
  )
}

export function ChatBubble({ text, side = 'in', time, width = 460, tag, style }) {
  const out = side === 'out'
  return (
    <div
      style={{
        ...base,
        width,
        padding: '22px 28px 18px',
        borderRadius: out ? '28px 28px 8px 28px' : '28px 28px 28px 8px',
        background: out ? C.tint : C.card,
        border: `1.5px solid ${out ? 'rgba(184,86,10,0.18)' : C.cardLine}`,
        boxShadow: cardShadow,
        color: C.inkDark,
        ...style,
      }}
    >
      <div style={{ fontSize: 28, lineHeight: 1.32 }}>{text}</div>
      {(time || tag) && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, fontSize: 26, color: C.mutedDark }}>
          {tag && <span style={{ marginRight: 'auto', color: C.accentDeep }}>{tag}</span>}
          {time}
          {out && <DoubleTick />}
        </div>
      )}
    </div>
  )
}

export function Toast({ icon = 'phone', title, sub, width = 470, tone = 'alert', style }) {
  return (
    <div
      style={{
        ...base,
        width,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '20px 26px',
        borderRadius: 24,
        background: C.inkDark,
        color: C.ink,
        boxShadow: liftShadow,
        ...style,
      }}
    >
      <div style={{ width: 58, height: 58, borderRadius: 18, flex: 'none', display: 'grid', placeItems: 'center', background: tone === 'alert' ? C.alert : C.accent, color: '#fff' }}>
        <Icon name={icon} size={30} stroke={2.1} />
      </div>
      <div>
        <div style={{ fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ marginTop: 6, fontSize: 26, color: C.muted }}>{sub}</div>}
      </div>
    </div>
  )
}

export function EmailCard({ subject, lines = 2, width = 520, style }) {
  return (
    <div style={{ ...base, width, padding: '24px 28px', borderRadius: 22, background: C.card, border: `1.5px solid ${C.cardLine}`, boxShadow: cardShadow, color: C.inkDark, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: C.paper2, display: 'grid', placeItems: 'center', color: C.mutedDark, flex: 'none' }}>
          <Icon name="mail" size={26} />
        </div>
        <div style={{ fontSize: 28, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{subject}</div>
      </div>
      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} style={{ height: 12, borderRadius: 12, background: '#ebe5dd', width: i === lines - 1 ? '62%' : '94%' }} />
        ))}
      </div>
    </div>
  )
}

/* cells: array of rows; a cell is a string or { t, tone: 'red' | 'amber' | 'dim' } */
export function SheetCard({ title, cols, rows, width = 600, colW, style }) {
  const tones = {
    red: { background: C.alertTint, color: C.alert },
    amber: { background: '#fcecc9', color: '#8a5a00' },
    green: { background: '#e3f1e0', color: '#2f6b2a' },
    blue: { background: '#e2ebf8', color: '#2d5a9a' },
    dim: { color: '#a59d93' },
  }
  const widths = colW || cols.map(() => `${100 / cols.length}%`)
  return (
    <div style={{ ...base, width, borderRadius: 20, background: C.card, border: `1.5px solid ${C.cardLine}`, boxShadow: cardShadow, overflow: 'hidden', color: C.inkDark, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 22px', background: '#f3efe9', borderBottom: `1.5px solid ${C.cardLine}` }}>
        <Icon name="grid" size={28} color={C.mutedDark} />
        <span style={{ fontSize: 26, color: C.mutedDark, whiteSpace: 'nowrap' }}>{title}</span>
      </div>
      <div style={{ display: 'flex', borderBottom: `1.5px solid ${C.cardLine}` }}>
        {cols.map((c, i) => (
          <div key={i} style={{ width: widths[i], padding: '12px 18px', fontSize: 26, color: C.mutedDark, borderLeft: i ? `1.5px solid ${C.cardLine}` : 'none', whiteSpace: 'nowrap', overflow: 'hidden' }}>{c}</div>
        ))}
      </div>
      {rows.map((r, ri) => (
        <div key={ri} style={{ display: 'flex', borderBottom: ri < rows.length - 1 ? `1.5px solid ${C.cardLine}` : 'none' }}>
          {r.map((cell, ci) => {
            const c = typeof cell === 'string' ? { t: cell } : cell
            return (
              <div key={ci} style={{ width: widths[ci], padding: '12px 18px', fontSize: 26, borderLeft: ci ? `1.5px solid ${C.cardLine}` : 'none', whiteSpace: 'nowrap', overflow: 'hidden', ...(c.tone ? tones[c.tone] : null) }}>
                {c.t}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export function CalendarCard({ day = 'Tuesday', width = 420, style }) {
  const hours = ['4 pm', '5 pm', '6 pm']
  const rowH = 78
  return (
    <div style={{ ...base, width, borderRadius: 22, background: C.card, border: `1.5px solid ${C.cardLine}`, boxShadow: cardShadow, color: C.inkDark, overflow: 'hidden', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: `1.5px solid ${C.cardLine}` }}>
        <span style={{ fontSize: 28, letterSpacing: '-0.02em' }}>{day}</span>
        <Icon name="calendar" size={28} color={C.mutedDark} />
      </div>
      <div style={{ position: 'relative', height: rowH * hours.length + 12 }}>
        {hours.map((h, i) => (
          <div key={h} style={{ position: 'absolute', left: 0, right: 0, top: 6 + i * rowH, height: rowH, borderTop: i ? `1.5px dashed ${C.cardLine}` : 'none', display: 'flex' }}>
            <span style={{ width: 96, padding: '8px 0 0 22px', fontSize: 26, color: C.mutedDark }}>{h}</span>
          </div>
        ))}
        {[0, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: 112 + k * 64,
              right: 22 + (1 - k) * 40,
              top: 6 + rowH + 6 + k * 22,
              height: rowH - 4,
              borderRadius: 12,
              background: k ? 'rgba(214,69,69,0.16)' : C.alertTint,
              borderLeft: `5px solid ${C.alert}`,
              boxShadow: k ? '0 8px 20px rgba(214,69,69,0.18)' : 'none',
              padding: '8px 14px',
              fontSize: 26,
              color: C.alert,
              boxSizing: 'border-box',
            }}
          >
            Session
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', background: C.alertTint, color: C.alert, fontSize: 26 }}>
        <Icon name="alert" size={26} stroke={2.1} />
        Double booked
      </div>
    </div>
  )
}

export function StickyNote({ text, width = 270, style }) {
  return (
    <div
      style={{
        ...base,
        width,
        minHeight: width * 0.86,
        padding: '30px 28px',
        background: 'linear-gradient(180deg, #fde3c4, #fbd9b3)',
        boxShadow: '0 2px 3px rgba(22,20,18,0.08), 0 18px 34px rgba(22,20,18,0.14)',
        color: '#4a2a10',
        fontSize: 32,
        lineHeight: 1.22,
        letterSpacing: '-0.02em',
        borderRadius: 6,
        ...style,
      }}
    >
      {text}
    </div>
  )
}

/* A floating status chip, e.g. "11:04 pm". */
export function Chip({ icon, children, dark = false, size = 30, style }) {
  return (
    <div
      style={{
        ...base,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: `${size * 0.42}px ${size * 0.8}px ${size * 0.42}px ${size * 0.6}px`,
        borderRadius: 999,
        background: dark ? C.inkDark : C.card,
        color: dark ? C.ink : C.inkDark,
        border: dark ? 'none' : `1.5px solid ${C.cardLine}`,
        boxShadow: cardShadow,
        fontSize: size,
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size * 1.05} color={dark ? C.peach : C.accentDeep} stroke={2.1} />}
      {children}
    </div>
  )
}
