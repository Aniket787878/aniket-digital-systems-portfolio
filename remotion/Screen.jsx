import { spring, interpolate } from 'remotion'
import { Cursor, Ripple, tween, easeInOut, clamp, lerp } from './shared.jsx'
import { PERSPECTIVE, lerpCam, camTransform, project, focusShot, Spotlight, Callout, CalloutPill } from './Camera.jsx'
import { BrowserFrame, SHADOW_NIGHT } from './BrowserFrame.jsx'

/* The logical viewport every walkthrough was captured at (CSS px; the PNGs
   are 2x). Every rect in steps.json is in this space. */
export const VW = 1440
export const VH = 900

/* Frames per step, and the beats inside one. Each step opens on the
   pulled-back window (where the new capture crossfades in, so the change
   reads as a match cut), springs in to the focus, holds with a spotlight
   and a callout, then pulls back out so the viewer re-orients. */
export const STEP = 144
const T = {
  fade: 14,
  inAt: 16,
  inDur: 40,
  move: [10, 48],
  click: 56,
  spot: [36, 56],
  call: 46,
  callOut: 112,
  spotOut: [110, 124],
  out: [116, STEP - 2],
}

/* The film window's chrome bar, in window px. */
export const CHROME = 60

/* Two ways of showing a recording:
   film  a floating window on a 1920x1080 stage, tilted when pulled back,
         with a chrome bar and a callout card beside the focus
   loop  just the viewport (the site wraps it in its own frame): no tilt,
         the zoom never shows an edge, and the callout is a compact pill */
export function modeSpec(mode, stageW = 1920, stageH = 1080) {
  if (mode === 'film') {
    const winH = VH + CHROME
    const S = Math.min(stageW / VW, stageH / winH) * 0.84
    return {
      mode,
      stage: { w: stageW, h: stageH, persp: PERSPECTIVE },
      win: { w: VW, h: winH },
      top: CHROME,
      wide: { S, cx: VW / 2, cy: winH / 2, ax: stageW / 2, ay: stageH / 2 + 6, rx: 5, ry: -6 },
      minS: S * 1.18,
      maxS: S * 2.2,
    }
  }
  return {
    mode,
    stage: { w: VW, h: VH, persp: PERSPECTIVE },
    win: { w: VW, h: VH },
    top: 0,
    wide: { S: 1, cx: VW / 2, cy: VH / 2, ax: VW / 2, ay: VH / 2, rx: 0, ry: 0 },
    minS: 1.2,
    maxS: 2.2,
  }
}

const centre = (r) => (r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null)

/* Where the pointer rests during step i, in capture space. A step with no
   target keeps the pointer where the last one left it. */
function restPoint(steps, i) {
  for (let k = i; k >= 0; k--) {
    const c = centre(steps[k].target)
    if (c) return c
  }
  return START
}
const START = { x: VW * 0.62, y: VH * 0.78 }

const focusRect = (step) => step.focus || step.target || { x: 0, y: 0, w: VW, h: VH }

/* The focus framing for one step, cached per mode. */
function shotFor(step, spec) {
  const r = focusRect(step)
  if (spec.mode === 'film') {
    const rect = { x: r.x, y: r.y + spec.top, w: r.w, h: r.h }
    const { cam, box } = focusShot({
      rect,
      win: spec.win,
      stage: spec.stage,
      side: { w: 540, h: 280 },
      stack: { w: 1040, h: 200 },
      minS: spec.minS,
      maxS: spec.maxS,
    })
    return { cam, box }
  }
  // loop: centre the focus, then clamp so the viewport never shows an edge
  const pad = 40
  const S = Math.max(spec.minS, Math.min(spec.maxS, Math.min((VW * 0.8) / (r.w + pad), (VH * 0.72) / (r.h + pad))))
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const ax = Math.min(S * cx, Math.max(VW - S * (VW - cx), VW / 2))
  const ay = Math.min(S * cy, Math.max(VH - S * (VH - cy), VH / 2))
  return { cam: { S, cx, cy, ax, ay, rx: 0, ry: 0 }, box: null }
}

/*
  Everything about the recording at one frame: which capture, the camera,
  the spotlight, the pointer and the callout. `frame` is local to the first
  step. With `loop`, the last step ends back on step 1's wide frame, so the
  clip loops without a seam.
*/
export function trackAt(steps, frame, spec, { loop = false } = {}) {
  const n = steps.length
  const i = Math.max(0, Math.min(n - 1, Math.floor(frame / STEP)))
  const f = frame - i * STEP
  const step = steps[i]
  const prev = i > 0 ? steps[i - 1] : null
  const last = i === n - 1
  const shot = shotFor(step, spec)

  const pin = spring({ frame: f - T.inAt, fps: 30, config: { damping: 22, stiffness: 110, mass: 1 }, durationInFrames: T.inDur })
  const pout = tween(f, T.out[0], T.out[1], easeInOut)
  const z = Math.max(0, pin) * (1 - pout)
  const cam = lerpCam(spec.wide, shot.cam, z)
  if (spec.mode !== 'film') {
    // the spring overshoots a touch; never let that show an edge in a loop
    cam.S = Math.max(1, cam.S)
    cam.ax = Math.min(cam.S * cam.cx, Math.max(VW - cam.S * (VW - cam.cx), cam.ax))
    cam.ay = Math.min(cam.S * cam.cy, Math.max(VH - cam.S * (VH - cam.cy), cam.ay))
  }

  const spot = tween(f, T.spot[0], T.spot[1]) * (1 - tween(f, T.spotOut[0], T.spotOut[1]))
  const call = spring({ frame: f - T.call, fps: 30, config: { damping: 200, stiffness: 120 } }) * (1 - tween(f, T.callOut, T.callOut + 10))

  // pointer, in capture space
  const from = i > 0 ? restPoint(steps, i - 1) : START
  const to = restPoint(steps, i)
  const m = tween(f, T.move[0], T.move[1], easeInOut)
  const arc = Math.sin(m * Math.PI) * 26
  let px = from.x + (to.x - from.x) * m
  let py = from.y + (to.y - from.y) * m - arc
  if (loop && last) {
    // glide home while the camera pulls back, so frame 0 follows seamlessly
    const back = tween(f, T.out[0] - 4, T.out[1], easeInOut)
    px = lerp(px, START.x, back)
    py = lerp(py, START.y, back)
  }
  const clicks = Boolean(step.target)
  const press = clicks ? interpolate(f, [T.click - 3, T.click, T.click + 6], [0, 1, 0], clamp) : 0
  const ripple = clicks ? interpolate(f, [T.click, T.click + 20], [0, 1], clamp) : 0

  // captures: crossfade on the pulled-back frame
  let src = step
  let prevSrc = prev
  let fade = i === 0 ? 1 : tween(f, 0, T.fade)
  if (loop && last && f > T.out[1] - 16) {
    prevSrc = step
    src = steps[0]
    fade = tween(f, T.out[1] - 16, T.out[1])
  }
  return { i, f, n, step, src, prevSrc, fade, cam, shot, spot, call, px, py, press, ripple, rect: focusRect(step) }
}

/* Draws a track state with the camera `cam` (the caller may have blended
   it with an intro or outro pose). */
export function RecordingView({ st, cam, spec, slug, title, showWindow = true, showCursor = true, showCallout = true, cursorSize }) {
  const { stage, top } = spec
  const film = spec.mode === 'film'
  const file = (s) => (s ? `walkthroughs/${s.slug || slug}/${s.file}` : null)
  const [sx, sy] = project(st.px, st.py + top, cam, stage)
  const cs = cursorSize ?? (film ? 38 : 34)

  // loop pill: next to the projected focus rect
  let pill = null
  if (!film && showCallout && st.call > 0.001) {
    const r = st.rect
    const [x0, y0] = project(r.x, r.y, cam, stage)
    const [x1, y1] = project(r.x + r.w, r.y + r.h, cam, stage)
    const estW = 110 + st.step.caption.length * 15.2
    const pillH = 64
    let y = y1 + 22
    if (y + pillH > stage.h - 28) y = y0 - 22 - pillH
    if (y < 28) y = stage.h - 28 - pillH
    const x = Math.max(28, Math.min(stage.w - 28 - estW, (x0 + x1) / 2 - estW / 2))
    pill = <CalloutPill x={x} y={y} index={st.i} text={st.step.caption} t={st.call} />
  }

  return (
    <>
      {showWindow && (
      <div style={{ position: 'absolute', inset: 0, perspective: stage.persp, perspectiveOrigin: '50% 50%', overflow: film ? 'visible' : 'hidden' }}>
        <BrowserFrame
          src={file(st.src)}
          prevSrc={file(st.prevSrc)}
          fade={st.fade}
          width={VW}
          title={title}
          chrome={film ? CHROME : 0}
          bare={!film}
          shadow={SHADOW_NIGHT}
          style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: camTransform(cam) }}
        >
          <Spotlight rect={st.rect} amount={st.spot} S={cam.S} w={VW} h={VH} />
        </BrowserFrame>
      </div>
      )}
      {showCursor && (
        <>
          <Ripple x={sx} y={sy} t={st.ripple} scale={cs / 30} />
          <Cursor x={sx} y={sy} press={st.press} size={cs} />
        </>
      )}
      {film && showCallout && st.shot.box && (
        <Callout box={st.shot.box} label={`Step ${String(st.i + 1).padStart(2, '0')}`} text={st.step.caption} t={st.call} />
      )}
      {pill}
    </>
  )
}
