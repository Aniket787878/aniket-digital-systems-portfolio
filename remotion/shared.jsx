import { useState, useEffect } from 'react'
import { continueRender, delayRender, interpolate, Easing } from 'remotion'
import '@fontsource/archivo/600.css'
import '@fontsource/archivo/700.css'
import '@fontsource/archivo/800.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'

/* Brand tokens, lifted from src/index.css so every film matches the site. */
export const C = {
  bg: '#0c0c0c',
  page: '#101010',
  surface: '#171717',
  surface2: '#1f1f1f',
  surface3: '#272727',
  ink: '#ffffff',
  inkSoft: '#d2d2d2',
  muted: '#9a9a9a',
  line: 'rgba(255,255,255,0.10)',
  lineStrong: 'rgba(255,255,255,0.18)',
  accent: '#f5871e',
  accentSoft: 'rgba(245,135,30,0.14)',
  green: '#3ecf8e',
}
export const DISPLAY = 'Archivo, system-ui, sans-serif'
export const SANS = 'Inter, system-ui, sans-serif'

export const ease = Easing.bezier(0.22, 1, 0.36, 1)
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1)

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

/* 0→1 over [a,b] with the house ease-out. */
export const tween = (frame, a, b, fn = ease) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: fn })

/* Hold every frame until the brand fonts are in, so no frame is rendered
   with fallback metrics (the same trap CLAUDE.md warns about for probes). */
export function useFonts() {
  const [handle] = useState(() => delayRender('fonts'))
  useEffect(() => {
    const done = () => continueRender(handle)
    Promise.all([
      document.fonts.load('800 100px Archivo'),
      document.fonts.load('700 40px Archivo'),
      document.fonts.load('600 28px Inter'),
      document.fonts.load('500 28px Inter'),
      document.fonts.load('400 24px Inter'),
    ])
      .then(() => document.fonts.ready)
      .then(done, done)
  }, [handle])
}

/* "Signet — Consent & Contract Signing" → ["Signet", "Consent & Contract Signing"] */
export function splitTitle(title) {
  const [name, ...rest] = String(title).split(' — ')
  return [name, rest.join(' — ')]
}

export function Wordmark({ size = 26 }) {
  return (
    <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: size, color: C.ink, letterSpacing: '-0.02em' }}>
      Aniket<span style={{ color: C.accent }}>.</span>
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
        background: '#1b1b1b',
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
          height: 26,
          borderRadius: 8,
          background: '#101010',
          border: `1px solid ${C.line}`,
          color: C.muted,
          fontSize: 13,
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
export function Cursor({ x, y, press = 0, opacity = 1 }) {
  const s = 1 - press * 0.14
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
export function Ripple({ x, y, t }) {
  if (t <= 0 || t >= 1) return null
  const r = interpolate(t, [0, 1], [6, 46])
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
