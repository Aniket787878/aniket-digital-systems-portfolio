import { AbsoluteFill, useVideoConfig } from 'remotion'
import { ramp, EASE, DUR, lerp } from './motion3.js'

/*
  One screen-studio camera per film (shot list T6). keys: [{ at, dur, x,
  y, s, ease }]: (x, y) is the world point centred in frame and s the zoom.
  Each key glides from the pose before it, then holds. No drift, no shake.

  Directional motion blur only during fast moves (push-throughs, whips):
  World3 reads the camera's speed and blurs along the axis of travel with
  an SVG filter (stdDeviation x y), so a slow push stays perfectly sharp.
*/
export function cam3(f, keys) {
  let c = { x: 960, y: 540, s: 1, ...keys[0] }
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i]
    const t = ramp(f, k.at, k.dur ?? DUR.glide, k.ease ?? EASE.glide)
    if (t <= 0) break
    c = { x: lerp(c.x, k.x ?? c.x, t), y: lerp(c.y, k.y ?? c.y, t), s: lerp(c.s, k.s ?? c.s, t) }
  }
  return c
}

/* screen-space speed (px per frame) of the camera at f */
export function camSpeed(f, keys) {
  const a = cam3(f - 0.5, keys)
  const b = cam3(f + 0.5, keys)
  return { vx: (b.x - a.x) * b.s, vy: (b.y - a.y) * b.s, vs: (b.s - a.s) * 900 }
}

export function World3({ f, keys, blur = false, blurAbove = 18, children, id = 'w3' }) {
  const { width: W, height: H } = useVideoConfig()
  const c = cam3(f, keys)
  let filter
  let defs = null
  if (blur) {
    const v = camSpeed(f, keys)
    const sx = Math.max(0, Math.abs(v.vx) - blurAbove) * 0.15
    const sy = Math.max(0, Math.abs(v.vy) - blurAbove) * 0.15
    const sz = Math.max(0, Math.abs(v.vs) - blurAbove) * 0.12
    if (sx + sy + sz > 0.3) {
      defs = (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation={`${(sx + sz).toFixed(2)} ${(sy + sz).toFixed(2)}`} />
          </filter>
        </svg>
      )
      filter = `url(#${id})`
    }
  }
  return (
    <AbsoluteFill>
      {defs}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          transformOrigin: '0 0',
          transform: `translate(${(W / 2 - c.x * c.s).toFixed(2)}px, ${(H / 2 - c.y * c.s).toFixed(2)}px) scale(${c.s.toFixed(5)})`,
          filter,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}
