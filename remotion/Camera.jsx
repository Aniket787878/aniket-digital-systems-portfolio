import { C, SANS, lerp } from './shared.jsx'

/*
  The camera for real app screens. A window (the capture plus, in the films,
  a chrome bar) sits on a stage with CSS perspective; the camera says which
  point of the window (cx, cy) lands on which point of the stage (ax, ay),
  at what scale S and with what tilt (rx, ry in degrees).

  Everything here is plain math so a caller can blend shots (intro pose,
  wide, focus) on its own timeline, and `project` gives the exact screen
  position of any window point, so the pointer and callouts can live in
  screen space at a constant size while the window zooms under them.
*/

export const PERSPECTIVE = 2400

/* Scale blends in log space, so a zoom feels even rather than front-loaded. */
export function lerpCam(A, B, t) {
  return {
    S: Math.exp(lerp(Math.log(A.S), Math.log(B.S), t)),
    cx: lerp(A.cx, B.cx, t),
    cy: lerp(A.cy, B.cy, t),
    ax: lerp(A.ax, B.ax, t),
    ay: lerp(A.ay, B.ay, t),
    rx: lerp(A.rx || 0, B.rx || 0, t),
    ry: lerp(A.ry || 0, B.ry || 0, t),
  }
}

export const camTransform = (c) =>
  `translate(${c.ax.toFixed(2)}px, ${c.ay.toFixed(2)}px) rotateX(${(c.rx || 0).toFixed(3)}deg) rotateY(${(c.ry || 0).toFixed(3)}deg) scale(${c.S.toFixed(5)}) translate(${(-c.cx).toFixed(2)}px, ${(-c.cy).toFixed(2)}px)`

/* Window point → stage point, matching what the browser does with the
   transform above and the stage's perspective. */
export function project(px, py, c, stage) {
  const ry = ((c.ry || 0) * Math.PI) / 180
  const rx = ((c.rx || 0) * Math.PI) / 180
  const x = (px - c.cx) * c.S
  const y = (py - c.cy) * c.S
  const x1 = x * Math.cos(ry)
  const z1 = -x * Math.sin(ry)
  const y1 = y * Math.cos(rx) - z1 * Math.sin(rx)
  const z2 = y * Math.sin(rx) + z1 * Math.cos(rx)
  const d = stage.persp || PERSPECTIVE
  const ox = stage.w / 2
  const oy = stage.h / 2
  const k = d / (d - z2)
  return [ox + (x1 + c.ax - ox) * k, oy + (y1 + c.ay - oy) * k]
}

/*
  Where to put the camera for a focus rect (window coords), leaving room
  for a callout beside or below it. Tries both layouts and keeps whichever
  allows the bigger zoom, capped at maxS. Returns the camera and the
  callout's box in stage px.
*/
export function focusShot({ rect, win, stage, margin = 96, side = { w: 540, h: 230 }, stack = { w: 900, h: 170 }, gap = 44, minS, maxS, pad = 14 }) {
  const fw = rect.w + pad * 2
  const fh = rect.h + pad * 2
  const fcx = rect.x + rect.w / 2
  const fcy = rect.y + rect.h / 2
  const availW = stage.w - margin * 2
  const availH = stage.h - margin * 2
  const sSide = Math.min((availW - side.w - gap) / fw, availH / fh)
  const sStack = Math.min(availW / fw, (availH - stack.h - gap) / fh)
  const useSide = sSide >= sStack * 0.92
  const S = Math.max(minS, Math.min(maxS, useSide ? sSide : sStack))
  const w = fw * S
  const h = fh * S
  let ax
  let ay
  let box
  if (useSide) {
    const calloutLeft = fcx > win.w / 2
    const groupW = w + gap + side.w
    const left = (stage.w - groupW) / 2
    ay = stage.h / 2
    if (calloutLeft) {
      ax = left + side.w + gap + w / 2
      box = { x: left, y: ay - side.h / 2, w: side.w, h: side.h, from: 'left' }
    } else {
      ax = left + w / 2
      box = { x: left + w + gap, y: ay - side.h / 2, w: side.w, h: side.h, from: 'right' }
    }
  } else {
    const below = fcy < win.h / 2
    const groupH = h + gap + stack.h
    const top = (stage.h - groupH) / 2
    ax = stage.w / 2
    if (below) {
      ay = top + h / 2
      box = { x: (stage.w - stack.w) / 2, y: top + h + gap, w: stack.w, h: stack.h, from: 'below' }
    } else {
      ay = top + stack.h + gap + h / 2
      box = { x: (stage.w - stack.w) / 2, y: top, w: stack.w, h: stack.h, from: 'above' }
    }
  }
  return { cam: { S, cx: fcx, cy: fcy, ax, ay, rx: 0, ry: 0 }, box, S }
}

/* Dims everything but the focus rect and rings it in saffron. Lives inside
   the transformed window, so strokes are divided by the scale to stay 2px
   on screen. */
export function Spotlight({ rect, amount, S, w, h, top = 0, pad = 12, radius = 16, dim = 0.62 }) {
  if (!rect || amount <= 0.001) return null
  const x = rect.x - pad
  const y = rect.y - pad
  const rw = rect.w + pad * 2
  const rh = rect.h + pad * 2
  const r = radius
  const hole = `M ${x + r} ${y} H ${x + rw - r} A ${r} ${r} 0 0 1 ${x + rw} ${y + r} V ${y + rh - r} A ${r} ${r} 0 0 1 ${x + rw - r} ${y + rh} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + rh - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`
  const k = 1 / Math.max(0.2, S)
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: 'absolute', left: 0, top, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <filter id="spot-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={8 * k} />
        </filter>
      </defs>
      <path d={`M 0 0 H ${w} V ${h} H 0 Z ${hole}`} fill={`rgba(6,6,8,${(dim * amount).toFixed(3)})`} fillRule="evenodd" />
      <rect x={x} y={y} width={rw} height={rh} rx={r} fill="none" stroke={C.accent} strokeWidth={10 * k} opacity={0.4 * amount} filter="url(#spot-glow)" />
      <rect x={x} y={y} width={rw} height={rh} rx={r} fill="none" stroke={C.accent} strokeWidth={2 * k} opacity={amount} />
    </svg>
  )
}

/* The film callout: a night card with a saffron step pill and the caption. */
export function Callout({ box, label, text, t, tall = false }) {
  if (t <= 0.001) return null
  const dx = box.from === 'left' ? -1 : box.from === 'right' ? 1 : 0
  const dy = box.from === 'above' ? -1 : box.from === 'below' ? 1 : 0
  const stackMode = dx === 0
  return (
    <div
      style={{
        position: 'absolute',
        left: box.x,
        top: box.y,
        width: box.w,
        height: box.h,
        display: 'flex',
        alignItems: box.from === 'below' ? 'flex-start' : box.from === 'above' ? 'flex-end' : 'center',
        justifyContent: stackMode ? 'center' : box.from === 'left' ? 'flex-end' : 'flex-start',
        opacity: Math.min(1, t * 1.4),
        transform: `translate(${((1 - t) * 40 * dx).toFixed(2)}px, ${((1 - t) * 30 * dy).toFixed(2)}px)`,
        filter: t < 0.98 ? `blur(${((1 - t) * 10).toFixed(2)}px)` : undefined,
        zIndex: 25,
      }}
    >
      <div
        style={{
          boxSizing: 'border-box',
          maxWidth: box.w,
          padding: tall ? '30px 34px' : '28px 32px 30px',
          borderRadius: 24,
          background: 'rgba(14,13,15,0.92)',
          border: '1px solid rgba(255,200,154,0.2)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          fontFamily: SANS,
          textAlign: stackMode ? 'center' : 'left',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 18px 8px 14px', borderRadius: 999, background: C.accent, color: C.onAccent, fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.onAccent, opacity: 0.7 }} />
          {label}
        </div>
        <div style={{ marginTop: 18, fontSize: 38, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1.18, color: C.ink }}>{text}</div>
      </div>
    </div>
  )
}

/* The loop callout: a compact pill that sits next to the focus. */
export function CalloutPill({ x, y, index, text, t }) {
  if (t <= 0.001) return null
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 24px 12px 12px',
        borderRadius: 999,
        background: 'rgba(14,13,15,0.9)',
        border: '1px solid rgba(255,200,154,0.22)',
        boxShadow: '0 16px 44px rgba(0,0,0,0.5)',
        fontFamily: SANS,
        whiteSpace: 'nowrap',
        opacity: Math.min(1, t * 1.4),
        transform: `translateY(${((1 - t) * 16).toFixed(2)}px)`,
        zIndex: 30,
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 500, color: C.onAccent, background: C.accent, borderRadius: 999, padding: '5px 13px', lineHeight: 1.1 }}>{String(index + 1).padStart(2, '0')}</span>
      <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', color: C.ink }}>{text}</span>
    </div>
  )
}
