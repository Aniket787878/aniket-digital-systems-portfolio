import { AbsoluteFill, useVideoConfig } from 'remotion'
import { ramp, EASE } from './motion3.js'

/*
  Light and material (shot list T8). A soft specular band crosses a panel
  when it lands, a very light film grain sits over the whole frame, and a
  restrained vignette keeps the corners quiet. The UI itself stays sharp:
  nothing here blurs the product.
*/

/* Put inside a panel with overflow hidden. paper: a gentler band for light grounds. */
export function LightSweep({ f, at, dur = 24, paper = false, strength = 1 }) {
  const p = ramp(f, at, dur, EASE.glide)
  if (p <= 0 || p >= 1) return null
  const x = -60 + p * 220
  const a = (paper ? 0.55 : 0.16) * strength
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        mixBlendMode: paper ? 'soft-light' : 'screen',
        background: `linear-gradient(105deg, rgba(255,255,255,0) ${(x - 18).toFixed(1)}%, rgba(255,236,214,${a}) ${x.toFixed(1)}%, rgba(255,255,255,0) ${(x + 18).toFixed(1)}%)`,
        zIndex: 5,
      }}
    />
  )
}

/* 3% grain, large grain size, re-seeded every other frame. */
export function Grain({ f, amount = 0.03 }) {
  const { width: W, height: H } = useVideoConfig()
  const seed = Math.floor(f / 2) % 24
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 90, opacity: amount * 4, mixBlendMode: 'overlay' }}>
      <svg width={W} height={H}>
        <filter id={`g3-${seed}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#g3-${seed})`} opacity="0.5" />
      </svg>
    </AbsoluteFill>
  )
}

export function Vignette({ amount = 0.4 }) {
  return <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 88, background: `radial-gradient(120% 95% at 50% 45%, rgba(0,0,0,0) 58%, rgba(0,0,0,${amount}) 100%)` }} />
}
