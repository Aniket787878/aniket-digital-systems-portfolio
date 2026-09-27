import { Img, staticFile, interpolate } from 'remotion'
import { C, SANS, DISPLAY, Cursor, Ripple, tween, easeInOut, clamp } from './shared.jsx'

/* The logical viewport every walkthrough was captured at (CSS px; the PNGs
   are 2x). Every rect in steps.json is in this space. */
export const VW = 1440
export const VH = 900

/* Frames per step, and the beats inside one. */
export const STEP = 96
const FADE = 12
const MOVE = [8, 40]
const CLICK = 44
const ZOOM_IN = [16, 52]
const ZOOM_OUT = [STEP - 20, STEP + 2]

const MAX_ZOOM = 1.75

const centre = (r) => (r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null)

function zoomFor(focus) {
  if (!focus) return 1
  const fit = Math.min(VW / focus.w, VH / focus.h) * 0.82
  return Math.max(1, Math.min(MAX_ZOOM, fit))
}

function camera(step, f) {
  const focus = step.focus || step.target
  const S = zoomFor(focus)
  const z = tween(f, ...ZOOM_IN, easeInOut) * (1 - tween(f, ...ZOOM_OUT, easeInOut))
  const s = 1 + (S - 1) * z
  const c = centre(focus) || { x: VW / 2, y: VH / 2 }
  const tx = Math.min(0, Math.max(VW - VW * s, VW / 2 - c.x * s))
  const ty = Math.min(0, Math.max(VH - VH * s, VH / 2 - c.y * s))
  return { s, tx, ty }
}

/* Where the pointer rests during step i, in image space. A step with no
   target keeps the pointer where the last one left it. */
function restPoint(steps, i) {
  for (let k = i; k >= 0; k--) {
    const c = centre(steps[k].target)
    if (c) return c
  }
  return { x: VW * 0.62, y: VH * 0.72 }
}

/*
  Renders `steps` (from a steps.json) as one continuous screen recording:
  each capture crossfades in wide, the camera eases into its focus region
  while the pointer travels to the control and clicks, then eases back out.
  `frame` is local to the first step. Captions are left to the caller.
*/
export function Screen({ slug, steps, frame, showCursor = true }) {
  const i = Math.max(0, Math.min(steps.length - 1, Math.floor(frame / STEP)))
  const f = frame - i * STEP
  const step = steps[i]
  const prev = i > 0 ? steps[i - 1] : null

  const cam = camera(step, f)
  const fadeIn = i === 0 ? 1 : tween(f, 0, FADE)

  // Pointer path: from the previous rest point to this step's target.
  const from = i > 0 ? restPoint(steps, i - 1) : { x: VW * 0.62, y: VH * 0.78 }
  const to = restPoint(steps, i)
  const m = tween(f, ...MOVE, easeInOut)
  // A slight arc reads as a hand, a straight line reads as a robot.
  const arc = Math.sin(m * Math.PI) * 26
  const px = from.x + (to.x - from.x) * m
  const py = from.y + (to.y - from.y) * m - arc
  const clicks = Boolean(step.target)
  const press = clicks
    ? interpolate(f, [CLICK - 3, CLICK, CLICK + 6], [0, 1, 0], clamp)
    : 0
  const rippleT = clicks ? interpolate(f, [CLICK, CLICK + 20], [0, 1], clamp) : 0

  const sx = px * cam.s + cam.tx
  const sy = py * cam.s + cam.ty

  const shot = (s) => staticFile(`walkthroughs/${s.slug || slug}/${s.file}`)

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: C.page }}>
      {prev && fadeIn < 1 && (
        <Img
          src={shot(prev)}
          style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: VW,
          height: VH,
          transformOrigin: '0 0',
          transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})`,
          opacity: fadeIn,
        }}
      >
        <Img src={shot(step)} style={{ width: VW, height: VH, display: 'block' }} />
      </div>
      {showCursor && (
        <>
          <Ripple x={sx} y={sy} t={rippleT} />
          <Cursor x={sx} y={sy} press={press} />
        </>
      )}
    </div>
  )
}

/* Small in-frame caption chip, for the silent loops. */
export function CaptionChip({ index, total, text, frame }) {
  const f = frame % STEP
  const o = tween(f, 6, 18) * (1 - tween(f, STEP - 12, STEP - 2))
  const y = (1 - tween(f, 6, 22)) * 14
  return (
    <div
      style={{
        position: 'absolute',
        left: 28,
        bottom: 28,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px 12px 14px',
        borderRadius: 999,
        background: 'rgba(16,16,16,0.86)',
        border: `1px solid ${C.lineStrong}`,
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
        opacity: o,
        transform: `translateY(${y}px)`,
        zIndex: 30,
      }}
    >
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 16,
          color: '#1a0900',
          background: C.accent,
          borderRadius: 999,
          padding: '4px 10px',
        }}
      >
        {String(index + 1).padStart(2, '0')}
        <span style={{ opacity: 0.6 }}>/{String(total).padStart(2, '0')}</span>
      </span>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.ink }}>{text}</span>
    </div>
  )
}
