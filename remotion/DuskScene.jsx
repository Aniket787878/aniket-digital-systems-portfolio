import { useMemo } from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { C, lerp } from './shared.jsx'

/*
  The signature scene: a dusk sky (the design system's gradient, top to
  horizon), a faint star field and three mountain ridges that parallax.
  Every explainer opens and closes on it.

  Props are all plain numbers so a caller can drive them from its own
  timeline:
    frame     local frame, drives the drift and the twinkle
    push      0→1 camera push-in (near ridges grow more than far ones)
    rise      0→1 ridges settle up into place from below
    horizon   horizon height as a fraction of the frame
    fade      0→1 fade up from black
*/

/* Small, fast, seeded PRNG so every render draws the same sky. */
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const OVERSCAN = 700

/* A ridge line, the same generator idea as the site hero
   (src/components/dusk/terrain.js): a few summed sine octaves plus a
   sharpened peak term, drawn as a jagged polyline so it reads as mountains,
   not hills. x is measured on a 1920-wide reference so the 9:16 cut shows
   the middle of the same landscape rather than a squashed one. */
function ridgePoints(W, base, amp, seed) {
  const r = rng(seed)
  const oct = [
    { f: 1.2 + r(), a: 1, p: r() * 6.28 },
    { f: 3.1 + r() * 2, a: 0.45, p: r() * 6.28 },
    { f: 7.3 + r() * 3, a: 0.2, p: r() * 6.28 },
    { f: 17 + r() * 6, a: 0.08, p: r() * 6.28 },
  ]
  const pk = 2.2 + (seed % 3)
  const off = (1920 - W) / 2
  const pts = []
  for (let x = -OVERSCAN; x <= W + OVERSCAN + 1; x += 14) {
    const u = (x + off) / 1920
    let y = 0
    for (const o of oct) y += Math.sin(u * o.f * Math.PI + o.p) * o.a
    y += -Math.abs(Math.sin(u * pk * Math.PI + seed)) * 0.5
    pts.push([x, base - y * amp])
  }
  return pts
}

function ridgePath(pts, bottom) {
  const f = (n) => n.toFixed(1)
  let d = `M ${f(pts[0][0])} ${bottom}`
  for (const [x, y] of pts) d += ` L ${f(x)} ${f(y)}`
  return `${d} L ${f(pts[pts.length - 1][0])} ${bottom} Z`
}

/* far → near: lighter and hazier at the back, night at the front. */
const LAYERS = [
  { id: 'far', seed: 7, base: -0.02, amp: 0.075, top: '#b95d22', bottom: '#7e3812', drift: 0.07, depth: 0.03, lift: 0.12 },
  { id: 'mid', seed: 19, base: 0.085, amp: 0.08, top: '#50240d', bottom: '#2a1409', drift: 0.16, depth: 0.065, lift: 0.22 },
  { id: 'near', seed: 41, base: 0.2, amp: 0.07, top: '#1c110a', bottom: '#0b0b0c', drift: 0.3, depth: 0.11, lift: 0.36 },
]

export function DuskScene({ frame = 0, push = 0, rise = 1, horizon, fade = 1, stars = 1, glow = 1, midground, children }) {
  const { width: W, height: H } = useVideoConfig()
  const tall = H > W
  const hz = (horizon ?? (tall ? 0.72 : 0.7)) * H
  const u = Math.min(W, H)

  const ridges = useMemo(
    () =>
      LAYERS.map((l) => ({
        ...l,
        d: ridgePath(ridgePoints(W, hz + l.base * u, l.amp * u, l.seed), H + u),
      })),
    [W, H, hz, u]
  )

  const starField = useMemo(() => {
    const r = rng(1234)
    return Array.from({ length: tall ? 150 : 170 }, () => {
      const y = Math.pow(r(), 1.5) * hz * 0.72
      return {
        x: r() * W,
        y,
        s: 0.8 + r() * 1.6,
        o: (0.25 + r() * 0.6) * (1 - y / (hz * 0.8)),
        tw: 0.02 + r() * 0.05,
        ph: r() * 6.28,
      }
    })
  }, [W, hz, tall])

  // The gradient is placed in px so the horizon sits where the ridges start
  // whatever the aspect ratio.
  const sky = `linear-gradient(180deg, #0b0b0c 0px, #1d1109 ${hz * 0.36}px, #5a2a0c ${hz * 0.64}px, #c8661c ${hz * 0.87}px, #f7a55a ${hz}px, #f7a55a ${H}px)`
  const skyScale = 1 + push * 0.02

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <AbsoluteFill style={{ opacity: fade }}>
        <AbsoluteFill style={{ background: sky, transform: `scale(${skyScale})`, transformOrigin: `50% ${hz}px` }} />
        {/* the sun just under the horizon */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(${W * 0.55}px ${hz * 0.42}px at 50% ${hz}px, rgba(255,214,168,${0.55 * glow}), rgba(247,165,90,${0.2 * glow}) 45%, transparent 75%)`,
          }}
        />
        {/* stars */}
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: stars, transform: `translateX(${-frame * 0.02}px) scale(${1 + push * 0.015})`, transformOrigin: '50% 0' }}>
          {starField.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff4e8" opacity={Math.max(0, s.o * (0.72 + 0.28 * Math.sin(frame * s.tw + s.ph)))} />
          ))}
        </svg>
        {/* ridges */}
        {ridges.map((l, i) => {
          const s = 1 + push * l.depth
          // `midground` (e.g. a product window) sits between the mid and
          // near ridges, so the front ridge can overlap it, as on the site.
          const mid = i === 2 && midground ? <AbsoluteFill key="mid">{midground}</AbsoluteFill> : null
          const lift = (1 - rise) * l.lift * u
          const x = -OVERSCAN - frame * l.drift
          return [
            mid,
            <div key={l.id} style={{ position: 'absolute', inset: 0, transform: `translateY(${lift}px) scale(${s})`, transformOrigin: `50% ${H}px` }}>
              <svg width={W + OVERSCAN * 2} height={H + u} viewBox={`${-OVERSCAN} 0 ${W + OVERSCAN * 2} ${H + u}`} style={{ position: 'absolute', left: x, top: 0, overflow: 'visible' }}>
                <defs>
                  <linearGradient id={`ridge-${l.id}`} x1="0" y1={hz + (l.base - 2 * l.amp) * u} x2="0" y2={H} gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor={l.top} />
                    <stop offset="1" stopColor={l.bottom} />
                  </linearGradient>
                </defs>
                <path d={l.d} fill={`url(#ridge-${l.id})`} />
              </svg>
              {/* haze in front of the far and mid ridges, which is what sells the depth */}
              {i < 2 && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: hz + l.base * u - u * 0.1,
                    height: u * 0.2,
                    background: `linear-gradient(0deg, transparent, rgba(247,165,90,${i === 0 ? 0.2 : 0.09}) 45%, transparent)`,
                  }}
                />
              )}
            </div>,
          ]
        })}
        {/* soft vignette keeps the eye in the middle */}
        <AbsoluteFill style={{ background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.35) 100%)' }} />
      </AbsoluteFill>
      {children}
    </AbsoluteFill>
  )
}

/* The warm light ground for the explaining scenes. Static texture only, so
   it costs the encoder almost nothing. */
export function PaperGround({ children, style }) {
  return (
    <AbsoluteFill style={{ background: C.paper, ...style }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(70% 55% at 12% -5%, rgba(245,135,30,0.09), transparent 65%), radial-gradient(60% 50% at 100% 110%, rgba(245,135,30,0.06), transparent 60%)',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(22,20,18,0.07) 1.3px, transparent 1.4px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(75% 70% at 50% 50%, #000 20%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(75% 70% at 50% 50%, #000 20%, transparent 90%)',
        }}
      />
      {children}
    </AbsoluteFill>
  )
}

/* A rounded sheet that rises over whatever is behind it: the masked wipe
   from dusk to paper. p runs 0→1 (0 = hidden below, 1 = full bleed). */
export function sheetClip(p, H, radius = 56) {
  const top = lerp(H, 0, p)
  const r = lerp(radius, 0, Math.max(0, (p - 0.75) / 0.25))
  return `inset(${top.toFixed(1)}px 0px 0px 0px round ${r.toFixed(1)}px ${r.toFixed(1)}px 0px 0px)`
}
