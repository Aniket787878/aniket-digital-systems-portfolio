import { AbsoluteFill, useVideoConfig } from 'remotion'
import { S, SANS } from '../explainers/stageLook.jsx'
import { tween, settle, easeOut, easeInOut, lerp, rand, STAGGER } from './motion.js'

/*
  The cinematic kit: thin glowing signal lines, rings that bloom from a
  point, a soft aurora backdrop and a small twinkle. Saffron, peach and
  amber only. Everything is driven by frame numbers passed in.
*/

const SAFFRON = S.saffron
const PEACH = S.peach

/* ---------- SignalField ----------
   Drifting lines that tangle across the frame, then converge to `point`.
   appear: array of frames, one per line (line i fades in at appear[i]);
   count lines are drawn (appear.length when given).
   converge: 0 (tangled) .. 1 (one point).  */
export function SignalField({ f, appear, count = 14, converge = 0, point, opacity = 1, seed = 1, tangle = 1, width = 2, bright = false }) {
  const { width: W, height: H } = useVideoConfig()
  const p = point || { x: W / 2, y: H / 2 }
  const n = appear ? appear.length : count
  const K = 72
  const lines = []
  for (let i = 0; i < n; i++) {
    const r = (k) => rand(i, seed + k)
    const at = appear ? appear[i] : 0
    const vis = tween(f, at, at + 24)
    if (vis <= 0.001) continue
    const y0 = H * (0.12 + 0.76 * r(1))
    const amp = (60 + 190 * r(2)) * tangle
    const fr = 1.2 + 2.2 * r(3)
    const ph = r(4) * 6.28 + f * (0.012 + 0.01 * r(5))
    const tilt = (r(6) - 0.5) * 420 * tangle
    const pts = []
    for (let k = 0; k < K; k++) {
      const t = k / (K - 1)
      // tangled: wide wave drifting slowly; the head of the line "drifts in"
      const grow = easeOut(Math.min(1, vis * 1.0))
      const x = lerp(-80, W + 80, t) + Math.sin(f * 0.01 + i) * 30
      const y = y0 + tilt * (t - 0.5) + Math.sin(t * fr * 6.28 + ph) * amp * (0.5 + 0.5 * Math.sin(t * 3.14)) * grow
      // converging: every point streams toward p, the line's tail first
      const c = easeInOut(Math.min(1, Math.max(0, converge)))
      const swirl = (1 - c) * 0
      pts.push([lerp(x, p.x, c) + swirl, lerp(y, p.y, c)])
    }
    const d = pts.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ')
    // pathLength drawn by vis from the left, so a line "drifts in"
    lines.push(
      <path
        key={i}
        d={d}
        fill="none"
        stroke={bright ? (i % 4 === 0 ? SAFFRON : PEACH) : i % 3 === 0 ? PEACH : SAFFRON}
        strokeWidth={width * (0.7 + 0.8 * r(7))}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${vis.toFixed(3)} 1`}
        opacity={(bright ? 0.55 + 0.45 * r(8) : 0.2 + 0.45 * r(8)) * opacity * (1 - 0.0 * converge) * Math.min(1, vis * 2)}
      />
    )
  }
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 6px rgba(245,135,30,0.55))' }}>
        {lines}
      </svg>
    </AbsoluteFill>
  )
}

/* ---------- Point ---------- a glowing dot with soft halo */
export function Point({ x, y, size = 18, glow = 1, opacity = 1 }) {
  return (
    <div style={{ position: 'absolute', left: x - size * 6, top: y - size * 6, width: size * 12, height: size * 12, opacity, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(245,135,30,${(0.5 * glow).toFixed(3)}), rgba(245,135,30,0) 100%)` }} />
      <div style={{ position: 'absolute', left: size * 6 - size / 2, top: size * 6 - size / 2, width: size, height: size, borderRadius: '50%', background: '#fff3e4', boxShadow: `0 0 ${size * 1.6}px ${size * 0.5}px rgba(245,135,30,0.9)` }} />
    </div>
  )
}

/* ---------- Rings ----------
   Concentric rings that bloom from a point at frame `start`, with an
   optional centre word. settleAt: rings stop breathing and hold.  */
export function Rings({ f, start, x, y, radius = 360, count = 4, inner = 0.3, word, wordSize = 64, wordAt, opacity = 1, out, children }) {
  const { width: W, height: H } = useVideoConfig()
  const cx = x ?? W / 2
  const cy = y ?? H / 2
  const o = out == null ? 1 : 1 - tween(f, out, out + 14, easeInOut)
  if (f < start - 1 || o <= 0) return null
  const wt = settle(f, wordAt ?? start + 8)
  const els = []
  for (let i = 0; i < count; i++) {
    const s = settle(f, start + i * STAGGER, { damping: 26, stiffness: 70, mass: 1.1 })
    const r = radius * (count > 1 ? inner + (1 - inner) * (i / (count - 1)) : 1) * s
    const breathe = 1 + Math.sin(f * 0.04 - i * 0.7) * 0.012
    els.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: cx - r * breathe,
          top: cy - r * breathe,
          width: r * 2 * breathe,
          height: r * 2 * breathe,
          borderRadius: '50%',
          border: `${i === 0 ? 2.5 : 1.5}px solid rgba(255,${200 - i * 12},${154 - i * 20},${(0.75 - i * 0.14).toFixed(3)})`,
          boxShadow: `0 0 ${24 - i * 4}px rgba(245,135,30,${(0.35 - i * 0.07).toFixed(3)}), inset 0 0 ${30 - i * 5}px rgba(245,135,30,${(0.12).toFixed(3)})`,
          opacity: Math.min(1, s * 2),
        }}
      />
    )
  }
  return (
    <AbsoluteFill style={{ opacity: opacity * o, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: cx - radius * 1.2, top: cy - radius * 1.2, width: radius * 2.4, height: radius * 2.4, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(245,135,30,0.22), rgba(245,135,30,0) 100%)', transform: `scale(${settle(f, start)})` }} />
      {els}
      {(word || children) && (
        <div style={{ position: 'absolute', left: cx - 320, top: cy - 100, width: 640, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: Math.min(1, wt * 1.6), transform: `scale(${(0.9 + 0.1 * wt).toFixed(4)})` }}>
          {word ? (
            <span style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontStyle: 'italic', fontSize: wordSize, color: PEACH, textShadow: '0 0 30px rgba(245,135,30,0.6)' }}>{word}</span>
          ) : (
            children
          )}
        </div>
      )}
    </AbsoluteFill>
  )
}

/* ---------- Aurora ---------- soft gradient backdrop (no photos) */
export function Aurora({ f, opacity = 1, shift = 0 }) {
  const { width: W, height: H } = useVideoConfig()
  const blob = (cx, cy, r, c1, a, k) => {
    const x = cx + Math.sin(f * 0.008 + k + shift) * 90
    const y = cy + Math.cos(f * 0.007 + k * 2 + shift) * 60
    return <div key={k} style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(closest-side, rgba(${c1},${a}), rgba(${c1},0) 100%)` }} />
  }
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      {blob(W * 0.3, H * 0.62, 760, '245,135,30', 0.3, 1)}
      {blob(W * 0.72, H * 0.45, 700, '255,200,154', 0.2, 2)}
      {blob(W * 0.5, H * 0.95, 620, '242,196,107', 0.16, 3)}
    </AbsoluteFill>
  )
}

/* ---------- Sparkle ---------- a small four-point twinkle */
export function Sparkle({ f, x, y, size = 40, at = 0, period = 60, color = PEACH }) {
  const t = ((f - at) % period + period) % period / period
  const tw = Math.max(0, Math.sin(t * Math.PI)) ** 2
  if (f < at) return null
  const s = size * (0.3 + 0.7 * tw)
  return (
    <svg width={size * 2} height={size * 2} viewBox="-1 -1 2 2" style={{ position: 'absolute', left: x - size, top: y - size, opacity: tw, transform: `rotate(${(t * 40).toFixed(1)}deg)`, filter: 'drop-shadow(0 0 8px rgba(245,135,30,0.8))', pointerEvents: 'none' }}>
      <path d={`M0 -${s / size} Q0 0 ${s / size} 0 Q0 0 0 ${s / size} Q0 0 -${s / size} 0 Q0 0 0 -${s / size} Z`} fill={color} />
    </svg>
  )
}

/* ---------- Burst ----------
   A big soft bloom (saffron core, peach, then clear) behind a key word. It
   swells on the word's entrance (at) and breathes down to a calm glow; out
   fades it. size is the radius in px (1000-1200 px wide is typical).
   mode 'screen' glows on dark; 'paper' is a gentler version for light grounds. */
export function Burst({ f, at, x, y, size = 520, peak = 1, out, mode = 'screen' }) {
  const s = settle(f, at, { damping: 18, stiffness: 70, mass: 1 })
  const pulse = 1 - 0.3 * tween(f, at + 6, at + 40)
  const o = out == null ? 1 : 1 - tween(f, out, out + 14, easeInOut)
  if (f < at - 1 || o <= 0) return null
  const r = size * (0.45 + 0.55 * s)
  const paper = mode === 'paper'
  return (
    <div
      style={{
        position: 'absolute',
        left: x - r,
        top: y - r * 0.62,
        width: r * 2,
        height: r * 1.24,
        borderRadius: '50%',
        background: paper
          ? 'radial-gradient(closest-side, rgba(245,135,30,0.42), rgba(255,200,154,0.34) 50%, rgba(255,200,154,0) 100%)'
          : 'radial-gradient(closest-side, rgba(245,135,30,0.8), rgba(255,158,69,0.38) 50%, rgba(255,158,69,0) 100%)',
        opacity: Math.min(1, s * 1.6) * pulse * peak * o,
        mixBlendMode: paper ? 'normal' : 'screen',
        pointerEvents: 'none',
      }}
    />
  )
}

/* ---------- SparkleField ----------
   A drifting layer of twinkles scattered over an area, each starting a few
   frames after the last. */
export function SparkleField({ f, count = 8, seed = 1, at = 0, area = { x0: 120, x1: 1800, y0: 120, y1: 960 }, size = 26, color = PEACH }) {
  const out = []
  for (let i = 0; i < count; i++) {
    const r = (k) => rand(i, seed + 40 + k)
    const x = lerp(area.x0, area.x1, r(1)) + Math.sin(f * 0.01 + i * 1.7) * 44
    const y = lerp(area.y0, area.y1, r(2)) + Math.cos(f * 0.008 + i * 2.3) * 34
    out.push(<Sparkle key={i} f={f} x={x} y={y} size={size * (0.7 + 0.8 * r(3))} at={at + i * 5} period={70 + Math.floor(r(4) * 60)} color={color} />)
  }
  return <>{out}</>
}

/* ---------- Flash ---------- a clean saffron-to-peach hook flash, quick ease-out */
export function Flash({ f, dur = 12, peak = 0.95 }) {
  if (f >= dur) return null
  const o = Math.pow(1 - tween(f, 6, dur, (x) => x), 2) * peak
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: o, background: 'radial-gradient(80% 70% at 50% 45%, #fbe6d2 0%, #ffc89a 32%, #ff9e45 66%, rgba(245,135,30,0) 100%)' }} />
  )
}
