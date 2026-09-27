import { AbsoluteFill, useVideoConfig, interpolate } from 'remotion'
import * as data from '../src/data.js'
import { C, SANS, Wordmark, rise, tween, clamp, easeInOut } from './shared.jsx'
import { DuskScene } from './DuskScene.jsx'
import { KineticText, PillLabel } from './KineticText.jsx'
import { Icon } from './icons.jsx'

/*
  The closing card on every explainer: the offer, the call to action and
  the contact line, on the dusk scene. Prices and timelines are read from
  data.js `packages` (the site's source of truth) and only fall back to the
  same values here if that file is mid-rewrite.
*/

const FALLBACK = {
  sprint: { name: 'Ops Automation Sprint', price: '₹40k to ₹80k', timeline: 'Live in 2 weeks' },
  assistant: { name: 'AI Assistant Build', price: '₹80k to ₹1.5L', timeline: 'Live in 3 weeks' },
  tool: { name: 'Internal Tool / Dashboard', price: '₹1.5L to ₹3L', timeline: 'Live in 3 to 4 weeks' },
}
const MATCH = { sprint: /sprint/i, assistant: /assistant/i, tool: /internal tool/i }

/* "₹40k – ₹80k" → "₹40k to ₹80k": ranges read as words on screen. */
const words = (s) => String(s).replace(/\s*[–—]\s*/g, ' to ')

export function offer(key) {
  const pkgs = Array.isArray(data.packages) ? data.packages : []
  const p = pkgs.find((x) => MATCH[key].test(x?.name || ''))
  const f = FALLBACK[key]
  return {
    name: p?.name || f.name,
    price: words(p?.price || f.price),
    timeline: words(p?.timeline || f.timeline),
  }
}

/* +91 9136582842 → +91 91365 82842 */
function formatPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`
  return raw || '+91 91365 82842'
}
export const CONTACT = {
  whatsapp: formatPhone(data.site?.whatsapp || '+91 9136582842'),
  email: data.site?.email || 'aniket.html@gmail.com',
}
export const CTA = 'Book a free 20-minute audit'

/*
  frame     local frame (0 = the end card starts; the dusk is already up)
  headline  optional big line shown first, e.g. "Enquiries answered.\n{Follow-ups sent.}"
  headlineSize  overrides the headline's type size (a four-line headline needs
            less than the default to fit the frame)
  hold      frames the headline holds before the card replaces it
  price     overrides the price line (the brand film says "from ₹40,000")
  note      overrides the timeline line
*/
export function EndCard({ frame, offerKey = 'sprint', headline, headlineSize, hold = 70, price, note, riseFrom = 0 }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  const o = offer(offerKey)
  const cardAt = headline ? 16 + hold + 16 : 14
  const c = rise(frame, cardAt)
  const u = (k) => rise(frame, cardAt + k)
  const ridgeRise = interpolate(tween(frame, riseFrom, riseFrom + 50, easeInOut), [0, 1], [0.2, 1], clamp)
  const cardW = tall ? 920 : 1180

  return (
    <AbsoluteFill>
      <DuskScene frame={frame + 400} push={tween(frame, 0, 320, easeInOut)} rise={ridgeRise} />

      {headline && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: tall ? 380 : 170 }}>
          <KineticText text={headline} frame={frame} start={16} stagger={5} exit={16 + hold} size={headlineSize || (tall ? 132 : 140)} align="center" lineHeight={1.02} />
        </AbsoluteFill>
      )}

      {/* wordmark */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: tall ? 190 : 96, display: 'flex', justifyContent: 'center', opacity: u(34), transform: `translateY(${(1 - u(34)) * 20}px)` }}>
        <Wordmark size={tall ? 64 : 52} />
      </div>

      {/* offer card */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: tall ? 120 : 40 }}>
        <div
          style={{
            width: cardW,
            boxSizing: 'border-box',
            padding: tall ? '64px 64px 60px' : '60px 72px 56px',
            borderRadius: 32,
            background: 'linear-gradient(180deg, rgba(24,18,14,0.86), rgba(11,11,12,0.92))',
            border: '1px solid rgba(255,200,154,0.18)',
            boxShadow: '0 50px 140px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            fontFamily: SANS,
            color: C.ink,
            opacity: Math.min(1, c * 1.4),
            transform: `translateY(${(1 - c) * 70}px) scale(${0.96 + 0.04 * c})`,
            filter: c < 0.98 ? `blur(${((1 - c) * 12).toFixed(2)}px)` : undefined,
            textAlign: tall ? 'center' : 'left',
          }}
        >
          <div style={{ opacity: u(6), transform: `translateY(${(1 - u(6)) * 14}px)` }}>
            <PillLabel dark size={28}>{o.name}</PillLabel>
          </div>
          <div style={{ marginTop: 30 }}>
            <KineticText text={price || o.price} frame={frame} start={cardAt + 10} stagger={4} size={tall ? 112 : 120} align={tall ? 'center' : 'left'} lineHeight={1} />
          </div>
          <div style={{ marginTop: 22, fontSize: tall ? 38 : 40, fontWeight: 500, letterSpacing: '-0.025em', color: C.peach, opacity: u(18), transform: `translateY(${(1 - u(18)) * 14}px)` }}>
            {note || `${o.timeline}. Fixed scope, fixed price.`}
          </div>
          <div style={{ height: 1, background: 'rgba(242,240,237,0.12)', margin: tall ? '48px 0 44px' : '44px 0 40px', transform: `scaleX(${u(24)})`, transformOrigin: tall ? '50% 50%' : '0 50%' }} />
          <div style={{ display: 'flex', flexDirection: tall ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: tall ? 40 : 36 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 16,
                padding: tall ? '28px 44px' : '26px 40px',
                borderRadius: 999,
                background: C.accent,
                color: C.onAccent,
                fontSize: tall ? 40 : 38,
                fontWeight: 500,
                letterSpacing: '-0.025em',
                whiteSpace: 'nowrap',
                boxShadow: `0 16px 50px rgba(245,135,30,${0.4 * u(30)})`,
                opacity: u(30),
                transform: `translateY(${(1 - u(30)) * 18}px) scale(${0.94 + 0.06 * u(30)})`,
              }}
            >
              {CTA}
              <Icon name="arrow" size={tall ? 38 : 36} stroke={2.2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: tall ? 'center' : 'flex-end', opacity: u(38), transform: `translateY(${(1 - u(38)) * 14}px)` }}>
              <ContactLine icon="chat" label="WhatsApp" value={CONTACT.whatsapp} size={tall ? 32 : 30} />
              <ContactLine icon="mail" value={CONTACT.email} size={tall ? 32 : 30} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function ContactLine({ icon, label, value, size }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: size, fontWeight: 500, letterSpacing: '-0.02em', color: C.ink, whiteSpace: 'nowrap' }}>
      <Icon name={icon} size={size * 0.95} color={C.accent} stroke={2} />
      {label && <span style={{ color: C.muted }}>{label}</span>}
      {value}
    </div>
  )
}
