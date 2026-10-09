import { useState, useEffect } from 'react'
import { AbsoluteFill, continueRender, delayRender } from 'remotion'
import { useVideoConfig } from 'remotion'
import * as data from '../../src/data.js'
import { Icon } from '../icons.jsx'
import { S, SANS, Ground, Wordmark } from '../explainers/stageLook.jsx'
import { Words, Label } from './Kinetic3.jsx'
import { COL } from './Morph3.jsx'
import { arriveT, ramp, EASE, cl } from './motion3.js'
import { Grain } from './Light3.jsx'

/*
  The v3 shell (night ground, grain, the closing fade) and the shared end
  card. The end card is the existing one's copy and layout (stageLook
  EndCard: four heading lines, "Book a free call", WhatsApp and email, the
  wordmark), laid out absolutely so the film's pill can land exactly on the
  button: the button is the last state of that pill, not a new element.
*/

export function Shell({ f, fadeAt, glow, glowSize = 0.8, children }) {
  const { durationInFrames: D } = useVideoConfig()
  const out = ramp(f, fadeAt ?? D - 15, 15, EASE.glide)
  return (
    <AbsoluteFill style={{ background: S.bg }}>
      <Ground f={f} glow={glow} glowSize={glowSize} />
      {children}
      <Grain f={f} />
      {out > 0 && <AbsoluteFill style={{ background: S.bg, opacity: out, zIndex: 95 }} />}
    </AbsoluteFill>
  )
}

export const END_LINES = ['Enquiries answered.', 'Bookings confirmed.', 'Follow-ups sent.', 'Without anyone {typing}.']

function phone(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`
  return raw || '+91 91365 82842'
}
const CONTACT = { whatsapp: phone(data.site?.whatsapp || '+91 9136582842'), email: data.site?.email || 'aniket.html@gmail.com' }

/* where everything sits on the end card, per layout */
export function endLayout(tall) {
  if (tall) return { headTop: 560, headSize: 92, lineH: 100, kickerTop: 470, btn: { x: 540, y: 1105, w: 500, h: 104 }, contactTop: 1200, contactLeft: null, mark: 300 }
  return { headTop: 236, headSize: 96, lineH: 104, kickerTop: 160, btn: { x: 760, y: 752, w: 420, h: 92 }, contactTop: 708, contactLeft: 1014, mark: 64 }
}

/* the pill state that is the button */
export function buttonState(at, tall, extra = {}) {
  const L = endLayout(tall)
  return { at, ...L.btn, r: 999, fill: COL.saffron, line: [255, 210, 160, 0.4], glow: 0.9, content: <ButtonLabel tall={tall} />, ...extra }
}

export function ButtonLabel({ tall }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: SANS, fontWeight: 500, fontSize: tall ? 42 : 36, letterSpacing: '-0.02em', color: S.onSaffron, whiteSpace: 'nowrap' }}>
      Book a free call
      <Icon name="arrow" size={tall ? 40 : 34} stroke={2.4} />
    </div>
  )
}

/* The card around the button. f is the film frame, at its start. */
export function EndCard3({ f, at, tall, kicker }) {
  const L = endLayout(tall)
  const c = arriveT(f, at + 30, 20)
  const m = arriveT(f, at + 42, 20)
  return (
    <AbsoluteFill style={{ zIndex: 22 }}>
      {kicker && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: L.kickerTop, textAlign: 'center', opacity: arriveT(f, at, 16) }}>
          <Label size={tall ? 32 : 28} color={S.peach}>{kicker}</Label>
        </div>
      )}
      {END_LINES.map((ln, i) => (
        <div key={i} style={{ position: 'absolute', left: 60, right: 60, top: L.headTop + i * L.lineH }}>
          <Words text={ln} f={f} at={at + 4 + i * 6} stagger={2} size={L.headSize} color={i < 3 ? S.inkSoft : S.ink} />
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: L.contactLeft ?? 0,
          right: L.contactLeft == null ? 0 : undefined,
          top: L.contactTop,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: L.contactLeft == null ? 'center' : 'flex-start',
          opacity: cl(c * 1.3),
          transform: `translateY(${((1 - c) * 14).toFixed(2)}px)`,
        }}
      >
        <Contact icon="chat" label="WhatsApp" value={CONTACT.whatsapp} size={tall ? 34 : 30} />
        <Contact icon="mail" value={CONTACT.email} size={tall ? 34 : 30} />
      </div>
      <div style={{ position: 'absolute', bottom: L.mark, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: m }}>
        <Wordmark size={tall ? 60 : 48} />
      </div>
    </AbsoluteFill>
  )
}

function Contact({ icon, label, value, size }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontSize: size, fontWeight: 500, letterSpacing: '-0.02em', color: S.ink, whiteSpace: 'nowrap' }}>
      <Icon name={icon} size={size * 0.95} color={S.saffron} stroke={2} />
      {label && <span style={{ color: S.muted }}>{label}</span>}
      {value}
    </div>
  )
}

/*
  Fonts first, then layout. useStageFonts only holds the screenshot until
  the faces load; the v3 films also measure text (textWidth) to place
  things, so they must not render at all before the faces are ready, or
  the measurements come from the fallback font.
*/
export function useFonts3() {
  const [handle] = useState(() => delayRender('v3-fonts'))
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const done = () => {
      setReady(true)
      continueRender(handle)
    }
    Promise.all([
      document.fonts.load('500 40px Inter', 'Aa ₹ ’…'),
      document.fonts.load('600 40px Inter', 'Aa'),
      document.fonts.load('italic 400 40px "Instrument Serif"', 'Aa?'),
    ])
      .then(() => document.fonts.ready)
      .then(done, done)
  }, [handle])
  return ready
}
