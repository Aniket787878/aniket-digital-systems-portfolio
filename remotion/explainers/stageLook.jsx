import { useState, useEffect } from 'react'
import { AbsoluteFill, continueRender, delayRender, interpolate, spring, useVideoConfig } from 'remotion'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import * as data from '../../src/data.js'
import { Icon } from '../icons.jsx'

/*
  The "Stage" look for the explainer films, from THE LOOK in
  docs/ideas/stage-films-brief.md: a near-black ground with a faint dot
  grid and one drifting saffron glow, Inter 600 headings with one
  Instrument Serif italic peach word, mono labels, dark glass panels with
  a saffron rim light, and flow chips joined by a saffron wire.

  It lives here, not in remotion/shared.jsx, because the product films are
  being rebuilt on their own kit at the same time; the two get merged
  later. Nothing in here may be cream or paper coloured.
*/

export const S = {
  bg: '#0b0b0c',
  ink: '#f2f0ed',
  inkSoft: '#cbc6bf',
  muted: '#9a958f',
  dim: '#6b6762',
  peach: '#ffc89a',
  saffron: '#f5871e',
  onSaffron: '#1a0900',
  line: 'rgba(255,255,255,0.13)',
  hair: 'rgba(255,255,255,0.08)',
  inner: '#111111',
  well: 'rgba(255,255,255,0.035)',
  red: '#ff7a6b',
  redTint: 'rgba(255,92,72,0.14)',
  amber: '#f2c46b',
  amberTint: 'rgba(242,196,107,0.12)',
  green: '#8fd19e',
  greenTint: 'rgba(143,209,158,0.11)',
  blue: '#8fb3ff',
  blueTint: 'rgba(143,179,255,0.11)',
}

export const SANS = 'Inter, system-ui, sans-serif'
export const SERIF = '"Instrument Serif", Georgia, serif'
export const MONO = 'ui-monospace, "SF Mono", Menlo, "DejaVu Sans Mono", monospace'

const clampX = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
export const lerp = (a, b, t) => a + (b - a) * t
export const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/* Confident ease-in-out for moves (0.4 to 0.6 s), and a settled spring for
   arrivals: springy, no wobble. */
const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
export const move = (f, a, dur = 15) => easeIO(cl((f - a) / dur))
export const fadeIn = (f, a, dur = 10) => easeOut(cl((f - a) / dur))
export const arrive = (f, a, stiff = 140) =>
  spring({ frame: f - a, fps: 30, config: { damping: 22, stiffness: stiff, mass: 0.9 } })

/* Wait for every face the films use, so no frame renders in fallback type. */
export function useStageFonts() {
  const [handle] = useState(() => delayRender('stage-fonts'))
  useEffect(() => {
    const done = () => continueRender(handle)
    Promise.all([
      document.fonts.load('600 40px Inter', 'Aa ₹ ’'),
      document.fonts.load('500 40px Inter', 'Aa ₹ ’'),
      document.fonts.load('italic 400 40px "Instrument Serif"', 'Aa'),
    ])
      .then(() => document.fonts.ready)
      .then(done, done)
  }, [handle])
}

/* ---------- ground ---------- */

/* glow: {x, y} in frame pixels, the subject the light follows. */
export function Ground({ f, glow = { x: 960, y: 540 }, glowSize = 1, children }) {
  const { width: W, height: H } = useVideoConfig()
  const big = Math.max(W, H)
  const r = big * 0.55 * glowSize
  const gx = glow.x + Math.sin(f * 0.011) * 40
  const gy = glow.y + Math.cos(f * 0.009) * 30
  return (
    <AbsoluteFill style={{ background: S.bg, overflow: 'hidden', fontFamily: SANS }}>
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 0.75px, transparent 1.1px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '14px 14px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: gx - r,
          top: gy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(245,135,30,0.18), rgba(245,135,30,0.07) 45%, rgba(245,135,30,0) 100%)',
        }}
      />
      {children}
      {/* a soft vignette keeps the corners quiet */}
      <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none' }} />
    </AbsoluteFill>
  )
}

/* The fixed honesty tag, top left, on every frame. */
export function Tag({ text = 'Illustration' }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  return (
    <div
      style={{
        position: 'absolute',
        left: tall ? 56 : 64,
        top: tall ? 72 : 52,
        zIndex: 50,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 18px 10px 14px',
        borderRadius: 999,
        border: `1px solid ${S.line}`,
        background: 'rgba(17,17,17,0.72)',
        fontFamily: MONO,
        fontSize: tall ? 24 : 21,
        letterSpacing: '0.08em',
        color: S.muted,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: S.saffron, boxShadow: '0 0 10px rgba(245,135,30,0.8)' }} />
      {text}
    </div>
  )
}

export function Mono({ children, size = 22, color = S.muted, style }) {
  return <span style={{ fontFamily: MONO, fontSize: size, letterSpacing: '0.08em', color, ...style }}>{children}</span>
}

/* ---------- type ---------- */

/*
  A kinetic line. "\n" breaks a line; a word in {braces} is the one serif
  word (Instrument Serif italic, peach). Words arrive on a settled spring,
  rising out of a short blur, and leave together in a quick lift, which
  reads as a cut rather than a fade.
*/
export function Line({ text, f, start = 0, exit, stagger = 3, size = 120, color = S.ink, align = 'center', lineHeight = 1.02, weight = 600, style }) {
  const lines = String(text).split('\n')
  let n = 0
  const out = exit == null ? 0 : move(f, exit, 9)
  if (out >= 1 || f < start - 1) return null
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: '-0.03em',
        lineHeight,
        color,
        textAlign: align,
        opacity: 1 - out,
        transform: `translateY(${(-out * 0.18 * size).toFixed(2)}px)`,
        filter: out > 0.01 ? `blur(${(out * 10).toFixed(2)}px)` : undefined,
        ...style,
      }}
    >
      {lines.map((line, li) => {
        // a {braced phrase} may span words: serif from "{" through "}"
        let inSerif = false
        return (
        <div key={li} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start', columnGap: '0.24em' }}>
          {line
            .split(' ')
            .filter(Boolean)
            .map((raw, wi) => {
              if (raw.includes('{')) inSerif = true
              const serif = inSerif
              if (raw.includes('}')) inSerif = false
              const word = raw.replace(/[{}]/g, '')
              const s = arrive(f, start + n++ * stagger, 150)
              const blur = (1 - s) * 12
              return (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    whiteSpace: 'pre',
                    fontFamily: serif ? SERIF : undefined,
                    fontStyle: serif ? 'italic' : undefined,
                    fontWeight: serif ? 400 : undefined,
                    fontSize: serif ? '1.12em' : undefined,
                    lineHeight: serif ? 0.9 : undefined,
                    letterSpacing: serif ? '-0.01em' : undefined,
                    color: serif ? S.peach : undefined,
                    paddingRight: serif ? '0.06em' : undefined,
                    opacity: cl(s * 1.6),
                    transform: `translateY(${((1 - s) * 0.42).toFixed(4)}em)`,
                    filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : undefined,
                  }}
                >
                  {word}
                </span>
              )
            })}
        </div>
        )
      })}
    </div>
  )
}

/* A full-frame kinetic beat: the line owns the frame for its window. */
export function Beat({ f, text, start, end, size, sub, subSize }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  if (f < start - 1 || f > end + 10) return null
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: tall ? '0 72px' : '0 140px', zIndex: 30 }}>
      <Line text={text} f={f} start={start} exit={end} size={size || (tall ? 128 : 150)} />
      {sub && (
        <div style={{ marginTop: tall ? 36 : 30 }}>
          <Line text={sub} f={f} start={start + 10} exit={end} size={subSize || (tall ? 52 : 54)} color={S.muted} weight={500} />
        </div>
      )}
    </AbsoluteFill>
  )
}

/* A caption that swaps as the story advances, sitting above the scene. */
export function Captions({ f, items, top, size, align = 'center', left = 120, right = 120, scrim = true }) {
  return (
    <>
      {/* a soft dark band so a panel pushed up under the caption never fights it */}
      {scrim && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: top + size * 2.1, background: `linear-gradient(180deg, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.78) 62%, rgba(11,11,12,0) 100%)`, zIndex: 24 }} />}
      {items.map((it, i) => {
        const next = items[i + 1]
        const exit = it.exit ?? (next ? next.at - 8 : undefined)
        if (f < it.at - 1 || (exit != null && f > exit + 10)) return null
        return (
          <div key={i} style={{ position: 'absolute', left, right, top, zIndex: 25 }}>
            <Line text={it.text} f={f} start={it.at} exit={exit} size={size} align={align} stagger={2} />
          </div>
        )
      })}
    </>
  )
}

/* ---------- camera ---------- */

/*
  keys: [{ at, dur, x, y, s, rx, ry }]. (x, y) is the world point centred
  in frame, s the zoom. Each key eases from the previous pose over
  [at, at + dur], so a move is a confident 0.4 to 0.6 s push, then holds.
*/
export function camAt(f, keys) {
  let cam = { x: 960, y: 540, s: 1, rx: 0, ry: 0, ...keys[0] }
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]
    const t = move(f, k.at, k.dur || 16)
    if (t <= 0) break
    const next = { ...cam, ...k }
    cam = {
      x: lerp(cam.x, next.x, t),
      y: lerp(cam.y, next.y, t),
      s: lerp(cam.s, next.s, t),
      rx: lerp(cam.rx, next.rx, t),
      ry: lerp(cam.ry, next.ry, t),
    }
  }
  return cam
}

/* The 3D world the panels float in. Children use frame coordinates. */
export function World({ cam, children, persp = 2200 }) {
  const { width: W, height: H } = useVideoConfig()
  return (
    <AbsoluteFill style={{ perspective: persp, perspectiveOrigin: '50% 50%' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformStyle: 'preserve-3d',
          transformOrigin: `${cam.x}px ${cam.y}px`,
          transform: `translate(${(W / 2 - cam.x).toFixed(2)}px, ${(H / 2 - cam.y).toFixed(2)}px) scale(${cam.s.toFixed(4)}) rotateX(${cam.rx.toFixed(3)}deg) rotateY(${cam.ry.toFixed(3)}deg)`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}

/* ---------- glass ---------- */

const RIM = {
  left: { grad: 'linear-gradient(180deg, rgba(245,135,30,0) 5%, rgba(245,135,30,0.85) 45%, rgba(255,200,154,0.6) 60%, rgba(245,135,30,0) 95%)', box: { left: -1, top: 18, bottom: 18, width: 1.5 }, glow: '-28px 0 70px -34px rgba(245,135,30,0.75)' },
  right: { grad: 'linear-gradient(180deg, rgba(245,135,30,0) 5%, rgba(245,135,30,0.85) 45%, rgba(255,200,154,0.6) 60%, rgba(245,135,30,0) 95%)', box: { right: -1, top: 18, bottom: 18, width: 1.5 }, glow: '28px 0 70px -34px rgba(245,135,30,0.75)' },
  top: { grad: 'linear-gradient(90deg, rgba(245,135,30,0) 5%, rgba(245,135,30,0.85) 40%, rgba(255,200,154,0.6) 60%, rgba(245,135,30,0) 95%)', box: { top: -1, left: 18, right: 18, height: 1.5 }, glow: '0 -26px 70px -34px rgba(245,135,30,0.75)' },
  bottom: { grad: 'linear-gradient(90deg, rgba(245,135,30,0) 5%, rgba(245,135,30,0.85) 40%, rgba(255,200,154,0.6) 60%, rgba(245,135,30,0) 95%)', box: { bottom: -1, left: 18, right: 18, height: 1.5 }, glow: '0 26px 70px -34px rgba(245,135,30,0.75)' },
}

/* A dark glass window: radius 18, 1 px hairline, #111 inside, a saffron rim
   light on one edge. lit (0..1) brightens the border to saffron. */
export function Glass({ rim = 'left', rimAmt = 1, lit = 0, radius = 18, style, children, pad }) {
  const R = rim ? RIM[rim] : null
  return (
    <div
      style={{
        position: 'absolute',
        boxSizing: 'border-box',
        borderRadius: radius,
        background: 'linear-gradient(180deg, rgba(26,26,28,0.94), rgba(17,17,17,0.96))',
        border: `1px solid ${lit > 0.01 ? `rgba(245,135,30,${(0.13 + lit * 0.6).toFixed(3)})` : S.line}`,
        boxShadow: [
          '0 1px 0 rgba(255,255,255,0.06) inset',
          '0 40px 100px -20px rgba(0,0,0,0.7)',
          R && rimAmt > 0 ? R.glow.replace('0.75)', `${(0.75 * rimAmt).toFixed(3)})`) : null,
          lit > 0.01 ? `0 0 60px -10px rgba(245,135,30,${(lit * 0.45).toFixed(3)})` : null,
        ]
          .filter(Boolean)
          .join(', '),
        padding: pad,
        color: S.ink,
        fontFamily: SANS,
        fontWeight: 500,
        ...style,
      }}
    >
      {R && rimAmt > 0 && <div style={{ position: 'absolute', ...R.box, background: R.grad, opacity: rimAmt, borderRadius: 2 }} />}
      {children}
    </div>
  )
}

/* A window bar for glass panels: three quiet dots, a title, a mono label. */
export function Bar({ title, label, icon, h = 64, size = 26 }) {
  return (
    <div style={{ height: h, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', borderBottom: `1px solid ${S.hair}` }}>
      <div style={{ display: 'flex', gap: 7, marginRight: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
        ))}
      </div>
      {icon && <Icon name={icon} size={size} color={S.peach} />}
      <span style={{ fontSize: size, letterSpacing: '-0.02em', color: S.ink, whiteSpace: 'nowrap' }}>{title}</span>
      {label && (
        <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          <Mono size={size * 0.74}>{label}</Mono>
        </span>
      )}
    </div>
  )
}

/* "What it did" chip: a glass pill with a saffron live dot. */
export function Chip({ icon, label, sub, live = 1, size = 28, style, lit = 0 }) {
  return (
    <div
      style={{
        position: 'absolute',
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.5,
        padding: `${size * 0.48}px ${size * 0.86}px ${size * 0.48}px ${size * 0.62}px`,
        borderRadius: 999,
        background: 'linear-gradient(180deg, rgba(30,29,31,0.95), rgba(18,18,19,0.96))',
        border: `1px solid ${lit > 0.01 ? `rgba(245,135,30,${(0.13 + lit * 0.55).toFixed(3)})` : S.line}`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.06) inset, 0 24px 60px -18px rgba(0,0,0,0.75)${lit > 0.01 ? `, 0 0 40px -8px rgba(245,135,30,${(lit * 0.4).toFixed(3)})` : ''}`,
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '-0.02em',
        color: S.ink,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <span style={{ position: 'relative', width: size * 0.34, height: size * 0.34, flex: 'none' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: live > 0.5 ? S.saffron : 'rgba(255,255,255,0.22)', boxShadow: live > 0.5 ? '0 0 12px rgba(245,135,30,0.9)' : 'none' }} />
      </span>
      {icon && <Icon name={icon} size={size * 1.02} color={S.peach} />}
      <span>{label}</span>
      {sub && <Mono size={size * 0.74} style={{ marginLeft: size * 0.1 }}>{sub}</Mono>}
    </div>
  )
}

/* ---------- wires ---------- */

/* A curved path between two points, leaving and entering along a side. */
export function wirePath(a, b, side = 'h') {
  if (side === 'h') {
    const dx = Math.max(60, Math.abs(b.x - a.x) * 0.5)
    return `M ${a.x} ${a.y} C ${a.x + dx * Math.sign(b.x - a.x || 1)} ${a.y}, ${b.x - dx * Math.sign(b.x - a.x || 1)} ${b.y}, ${b.x} ${b.y}`
  }
  const dy = Math.max(60, Math.abs(b.y - a.y) * 0.5)
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy * Math.sign(b.y - a.y || 1)}, ${b.x} ${b.y - dy * Math.sign(b.y - a.y || 1)}, ${b.x} ${b.y}`
}

/*
  A thin saffron wire. draw (0..1) lays it down; pulse (0..1) runs a bright
  spark along it once, when the step really happens. Rendered as an SVG
  layer the size of the frame (pass W, H).
*/
export function Wire({ d, draw = 1, pulse = -1, W = 1920, H = 1080, uid, width = 2 }) {
  if (draw <= 0) return null
  const len = 2000
  return (
    <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <filter id={`wg-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke="rgba(245,135,30,0.22)" strokeWidth={width * 4} filter={`url(#wg-${uid})`} pathLength={len} strokeDasharray={`${draw * len} ${len}`} />
      <path d={d} fill="none" stroke="rgba(245,135,30,0.75)" strokeWidth={width} strokeLinecap="round" pathLength={len} strokeDasharray={`${draw * len} ${len}`} />
      {pulse > 0 && pulse < 1 && (
        <>
          <path d={d} fill="none" stroke="#ffd2a8" strokeWidth={width * 2} strokeLinecap="round" pathLength={len} strokeDasharray={`${len * 0.12} ${len}`} strokeDashoffset={-(pulse * len * 1.12 - len * 0.12)} />
          <path d={d} fill="none" stroke="rgba(245,135,30,0.9)" strokeWidth={width * 7} strokeLinecap="round" filter={`url(#wg-${uid})`} pathLength={len} strokeDasharray={`${len * 0.1} ${len}`} strokeDashoffset={-(pulse * len * 1.1 - len * 0.1)} />
        </>
      )}
    </svg>
  )
}

/* ---------- pointer ---------- */

export function Pointer({ x, y, press = 0, ring = 0, opacity = 1, size = 1 }) {
  if (opacity <= 0) return null
  const rr = interpolate(ring, [0, 1], [10, 58], clampX)
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, zIndex: 40 }}>
      {ring > 0 && ring < 1 && (
        <div style={{ position: 'absolute', left: -rr, top: -rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `2.5px solid ${S.saffron}`, opacity: 1 - ring, boxShadow: '0 0 24px rgba(245,135,30,0.6)' }} />
      )}
      <svg width={34 * size} height={34 * size} viewBox="0 0 24 24" style={{ position: 'absolute', left: -4 * size, top: -3 * size, transform: `scale(${1 - press * 0.14})`, transformOrigin: '4px 3px', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.6))' }}>
        <path d="M5 3l14 8.2-6.1 1.5 3.6 6.9-2.7 1.4-3.6-6.9L5 18.7z" fill="#ffffff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ---------- end card ---------- */

function formatPhone(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`
  return raw || '+91 91365 82842'
}
const CONTACT = {
  whatsapp: formatPhone(data.site?.whatsapp || '+91 9136582842'),
  email: data.site?.email || 'aniket.html@gmail.com',
}

export function Wordmark({ size = 40 }) {
  return (
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: '-0.035em', color: S.ink, display: 'inline-flex', alignItems: 'baseline', lineHeight: 1 }}>
      Aniket
      <span style={{ display: 'inline-block', width: size * 0.2, height: size * 0.2, borderRadius: '50%', background: S.saffron, marginLeft: size * 0.07, boxShadow: `0 0 ${size * 0.4}px rgba(245,135,30,0.7)` }} />
    </div>
  )
}

/*
  The closing card, the same on every explainer: the promise (one serif
  word), the saffron button, the contact line and the wordmark. f is local.
*/
export const END_LINE = 'Enquiries answered.\nBookings confirmed.\nFollow-ups sent.\nWithout anyone {typing.}'

export function EndCard({ f, line = END_LINE }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  const u = (k) => arrive(f, k, 120)
  const b = u(34)
  const c = u(42)
  const lines = line.split('\n')
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: tall ? '0 64px' : 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {lines.map((l, i) => (
          <Line key={i} text={l} f={f} start={4 + i * 6} size={tall ? 92 : 96} lineHeight={1.08} color={i < lines.length - 1 ? S.inkSoft : S.ink} stagger={2} />
        ))}
        <div style={{ marginTop: tall ? 80 : 60, display: 'flex', flexDirection: tall ? 'column' : 'row', alignItems: 'center', gap: tall ? 44 : 44 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              padding: tall ? '28px 46px' : '24px 40px',
              borderRadius: 999,
              background: S.saffron,
              color: S.onSaffron,
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: tall ? 40 : 34,
              letterSpacing: '-0.02em',
              boxShadow: `0 18px 60px rgba(245,135,30,${(0.45 * b).toFixed(3)}), 0 1px 0 rgba(255,255,255,0.35) inset`,
              opacity: cl(b * 1.5),
              transform: `translateY(${((1 - b) * 24).toFixed(2)}px) scale(${(0.94 + 0.06 * b).toFixed(4)})`,
            }}
          >
            Contact now
            <Icon name="arrow" size={tall ? 38 : 32} stroke={2.4} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: tall ? 'center' : 'flex-start', opacity: cl(c * 1.5), transform: `translateY(${((1 - c) * 16).toFixed(2)}px)` }}>
            <ContactLine icon="chat" label="WhatsApp" value={CONTACT.whatsapp} size={tall ? 32 : 28} />
            <ContactLine icon="mail" value={CONTACT.email} size={tall ? 32 : 28} />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: tall ? 120 : 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: cl(u(50) * 1.5) }}>
        <Wordmark size={tall ? 60 : 46} />
      </div>
    </AbsoluteFill>
  )
}

function ContactLine({ icon, label, value, size }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: SANS, fontSize: size, fontWeight: 500, letterSpacing: '-0.02em', color: S.ink, whiteSpace: 'nowrap' }}>
      <Icon name={icon} size={size * 0.95} color={S.saffron} stroke={2} />
      {label && <span style={{ color: S.muted }}>{label}</span>}
      {value}
    </div>
  )
}

/* A chat bubble on the dark ground. side 'out' is the business's reply. */
export function Bubble({ text, side = 'in', time, tag, width = 460, size = 28, style }) {
  const out = side === 'out'
  return (
    <div
      style={{
        width,
        boxSizing: 'border-box',
        padding: `${size * 0.72}px ${size}px ${size * 0.6}px`,
        borderRadius: out ? `${size}px ${size}px 8px ${size}px` : `${size}px ${size}px ${size}px 8px`,
        background: out ? 'linear-gradient(180deg, rgba(245,135,30,0.2), rgba(245,135,30,0.12))' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${out ? 'rgba(245,135,30,0.38)' : S.line}`,
        color: S.ink,
        fontFamily: SANS,
        fontWeight: 500,
        letterSpacing: '-0.015em',
        ...style,
      }}
    >
      <div style={{ fontSize: size, lineHeight: 1.32 }}>{text}</div>
      {(time || tag) && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 14 }}>
          {tag && <Mono size={size * 0.72} color={S.peach} style={{ marginRight: 'auto' }}>{tag}</Mono>}
          {time && <Mono size={size * 0.72}>{time}</Mono>}
          {out && (
            <svg width={size * 1.05} height={size * 0.8} viewBox="0 0 30 24" fill="none" stroke={S.saffron} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 13l5 5L18 6" />
              <path d="M12 16l2 2L25 6" />
            </svg>
          )}
        </div>
      )}
    </div>
  )
}

/* Depth of field: a panel's blur and dimming for how far it sits behind. */
export const depth = (d) => ({
  filter: d > 0.02 ? `blur(${(d * 7).toFixed(2)}px)` : undefined,
  opacity: 1 - d * 0.45,
})

/*
  A flow step: a glass node with an icon tile, a label and a mono status
  line. lit (0..1) is the moment the step really runs: the tile turns
  saffron, the border warms and the status swaps to what it did.
*/
export function FlowNode({ x, y, w = 420, h = 124, icon, label, sub, subLit, lit = 0, appear = 1, size = 32, style }) {
  if (appear <= 0.001) return null
  const on = lit > 0.5
  return (
    <Glass
      rim={null}
      lit={lit}
      style={{
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.62,
        padding: `0 ${size * 0.8}px`,
        opacity: cl(appear * 1.5),
        transform: `scale(${(0.9 + 0.1 * appear).toFixed(4)})`,
        ...style,
      }}
    >
      <div style={{ width: size * 2, height: size * 2, borderRadius: size * 0.5, flex: 'none', display: 'grid', placeItems: 'center', background: on ? S.saffron : 'rgba(245,135,30,0.12)', color: on ? S.onSaffron : S.peach, boxShadow: on ? '0 0 30px rgba(245,135,30,0.45)' : 'none' }}>
        <Icon name={icon} size={size * 1.05} stroke={2} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: size, letterSpacing: '-0.025em', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{ marginTop: 6, whiteSpace: 'nowrap' }}>
          <Mono size={size * 0.62} color={on ? S.peach : S.muted}>{on && subLit ? subLit : sub}</Mono>
        </div>
      </div>
      {on && (
        <div style={{ position: 'absolute', right: 18, top: 16 }}>
          <Icon name="check" size={size * 0.7} color={S.saffron} stroke={2.6} />
        </div>
      )}
    </Glass>
  )
}
