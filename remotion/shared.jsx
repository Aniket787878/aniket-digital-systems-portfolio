import { useState, useEffect } from 'react'
import { continueRender, delayRender, interpolate, spring, Easing } from 'remotion'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'

/* The "Dusk" tokens from docs/design-system.md, so a film and the page it
   sits on read as one product. Night tokens for the dark ground, paper
   tokens for the explaining scenes. */
export const C = {
  // night ground
  bg: '#0b0b0c',
  page: '#0f0f11',
  surface: '#141416',
  surface2: '#1b1a1c',
  surface3: '#262427',
  ink: '#f2f0ed',
  inkSoft: '#d8d3cc',
  muted: '#9a958f',
  line: 'rgba(242,240,237,0.10)',
  lineStrong: 'rgba(242,240,237,0.18)',
  // saffron
  accent: '#f5871e',
  accentDeep: '#b8560a',
  accentSoft: 'rgba(245,135,30,0.14)',
  peach: '#ffc89a',
  onAccent: '#1a0900',
  // paper ground
  paper: '#f5f3ef',
  paper2: '#ebe7e1',
  inkDark: '#161412',
  mutedDark: '#6d6862',
  tint: '#fbe6d2',
  card: '#ffffff',
  cardLine: '#e7e1d9',
  // illustrative "something is wrong" red, used only in the chaos scenes
  alert: '#d64545',
  alertTint: '#fbe3e1',
}

/* Inter only (design system, principle 2). DISPLAY is kept as a name so the
   older films read the same; headings use it at 500, never bold. */
export const DISPLAY = 'Inter, system-ui, sans-serif'
export const SANS = 'Inter, system-ui, sans-serif'
export const TRACK = '-0.045em'

export const ease = Easing.bezier(0.22, 1, 0.36, 1)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

/* 0→1 over [a,b] with the house ease-out. */
export const tween = (frame, a, b, fn = ease) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: fn })

/* A calm, critically damped spring: the default for anything that arrives. */
export const rise = (frame, start, config) =>
  spring({ frame: frame - start, fps: 30, config: { damping: 200, stiffness: 90, mass: 1, ...config } })

/* A spring with a touch of overshoot, for things that "land" (nodes, chips). */
export const pop = (frame, start) =>
  spring({ frame: frame - start, fps: 30, config: { damping: 15, stiffness: 120, mass: 0.9 } })

export const lerp = (a, b, t) => a + (b - a) * t

/* Hold every frame until the brand fonts are in, so no frame is rendered
   with fallback metrics (the same trap CLAUDE.md warns about for probes).
   The second argument pulls in the latin-ext subset too, which is where
   Inter keeps the rupee sign. */
export function useFonts() {
  const [handle] = useState(() => delayRender('fonts'))
  useEffect(() => {
    const done = () => continueRender(handle)
    const sample = 'Aa ₹ … · ’'
    Promise.all([
      document.fonts.load(`600 28px Inter`, sample),
      document.fonts.load(`500 28px Inter`, sample),
      document.fonts.load(`400 24px Inter`, sample),
    ])
      .then(() => document.fonts.ready)
      .then(done, done)
  }, [handle])
}

/* A project's name and its one-line subtitle. data.js titles no longer
   carry a "Name, subtitle" pair in one string, so prefer `subtitle`. */
export function splitTitle(project) {
  if (project && typeof project === 'object') {
    const [name, sub] = splitTitle(project.title)
    return [name, project.subtitle || sub]
  }
  const [name, ...rest] = String(project).split(/\s+[—–]\s+/)
  return [name, rest.join(', ')]
}

/* "Aniket" with a saffron dot: the sign-off on every film. */
export function Wordmark({ size = 26, color = C.ink }) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 500,
        fontSize: size,
        color,
        letterSpacing: '-0.035em',
        display: 'inline-flex',
        alignItems: 'baseline',
        lineHeight: 1,
      }}
    >
      Aniket
      <span
        style={{
          display: 'inline-block',
          width: size * 0.2,
          height: size * 0.2,
          borderRadius: '50%',
          background: C.accent,
          marginLeft: size * 0.08,
          boxShadow: `0 0 ${size * 0.4}px rgba(245,135,30,0.6)`,
        }}
      />
    </div>
  )
}

/* Browser chrome drawn in HTML so it stays crisp at any render scale. */
export function BrowserChrome({ url, height = 44 }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 18px',
        background: '#18171a',
        borderBottom: `1px solid ${C.line}`,
        flex: 'none',
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.9 }} />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          maxWidth: 520,
          margin: '0 auto',
          height: height - 16,
          borderRadius: 8,
          background: C.bg,
          border: `1px solid ${C.line}`,
          color: C.muted,
          fontSize: Math.round(height * 0.34),
          fontFamily: SANS,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" stroke={C.muted} strokeWidth="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={C.muted} strokeWidth="2" />
        </svg>
        {url}
      </div>
      <div style={{ width: 52 }} />
    </div>
  )
}

/* A macOS-style pointer. (x, y) is the hotspot. */
export function Cursor({ x, y, press = 0, opacity = 1, size = 30 }) {
  const s = (1 - press * 0.14) * (size / 30)
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        opacity,
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        style={{
          position: 'absolute',
          left: -4,
          top: -3,
          transform: `scale(${s})`,
          transformOrigin: '4px 3px',
          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.45))',
        }}
      >
        <path
          d="M5 3l14 8.2-6.1 1.5 3.6 6.9-2.7 1.4-3.6-6.9L5 18.7z"
          fill="#ffffff"
          stroke="#111"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/* Expanding ring where the pointer clicks. t runs 0→1 over the ripple. */
export function Ripple({ x, y, t, scale = 1 }) {
  if (t <= 0 || t >= 1) return null
  const r = interpolate(t, [0, 1], [6, 46]) * scale
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        border: `3px solid ${C.accent}`,
        background: 'rgba(245,135,30,0.18)',
        opacity: 1 - t,
        zIndex: 19,
      }}
    />
  )
}
