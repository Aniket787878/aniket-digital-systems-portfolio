import { AbsoluteFill, Img, staticFile, spring } from 'remotion'
import { S, MONO, Glow, ChipStack, chipIn, PointerRing, BottomCaption, CaptionScrim, tween, lerp, easeInOut } from './kit.jsx'

/*
  The act for the three real-capture demos, where the real screen is the
  hero. One big glass window (about 88% of the frame width), centred, in
  the same place for the whole act: it may arrive once with the tilt and
  settle, then stays flat. Inside it the capture runs at full brightness,
  no dimming and no blur, and the camera tells the story: for every step
  it pushes in on the shot written in stories.js (CAMS), eased in over
  ~0.6 s on a settled spring, holds, then travels straight to the next
  shot while the next screen cuts in under it.

  The pointer is a saffron ring that glides to the clicked element from
  steps.json and gives one soft pulse. The caption is one line at the
  bottom centre over a dark scrim; every shot keeps its subject in the
  upper part of the frame, so the two never meet. The chips stack in one
  fixed spot, top right, with no wires.

  `bare` drops the window and the stage: the capture fills the frame (the
  card loop, whose card draws its own frame).
*/

const CW = 1440 // the captures' CSS viewport
const CH = 900
const AY = 0.42 // a shot's point sits this far down the viewport
const CUT = 9 // the next screen dissolves in over this many frames
const MOVE = 18 // a camera move, ~0.6 s
const CHIP_AT = 16 // the step's chip arrives once the camera has landed
const RET = 24 // loops: frames the last step takes to hand back to the first

const camSpring = (f) =>
  f <= 0 ? 0 : spring({ frame: f, fps: 30, config: { damping: 20, stiffness: 140, mass: 1 }, durationInFrames: MOVE })

/* Where in its step a shot starts: the first at once, a second a little
   before the middle, so both get a real hold. */
const shotAt = (i, stepLen) => (i === 0 ? 0 : Math.round(stepLen * 0.42))

/*
  The viewport: where the capture shows, in frame px, and its scale (frame
  px per capture px at zoom 1, i.e. the full width fitted).
*/
export function viewport(L) {
  if (L.bare) return { x: 0, y: 0, w: L.W, h: L.H, s: L.W / CW }
  const { x, y, w, h } = L.win
  return { x, y: y + L.chrome, w, h: h - L.chrome, s: w / CW }
}

/* Keep a shot inside the capture sideways and at the top; below the
   capture is the app's own #0b0b0c, so a shot may run past the bottom. */
function fit(cam, V) {
  const z = Math.max(1, cam.z)
  const half = CW / (2 * z)
  const x = Math.min(CW - half, Math.max(half, cam.x))
  const minY = (AY * V.h) / (V.s * z)
  return { x, y: Math.max(minY, cam.y), z }
}

const wide = (V) => ({ x: CW / 2, y: (AY * V.h) / V.s, z: 1 })

/* A move between two shots. A long one dips the zoom a little on the way,
   so the eye keeps its place instead of whipping across the screen. */
function travel(a, b, t) {
  const d = Math.hypot(b.x - a.x, b.y - a.y) / (CW / Math.max(a.z, b.z))
  const dip = Math.min(0.28, Math.max(0, (d - 0.4) * 0.35))
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t) * (1 - dip * Math.sin(Math.PI * Math.min(1, Math.max(0, t)))),
  }
}

const lastShot = (st, V) => fit(st.shots[st.shots.length - 1], V)

/* The camera at frame sf of step idx. */
function cameraAt(steps, idx, sf, stepLen, V, loop) {
  const st = steps[idx]
  let cam = idx === 0 ? wide(V) : lastShot(steps[idx - 1], V)
  st.shots.forEach((shot, i) => {
    const t = camSpring(sf - shotAt(i, stepLen))
    if (t > 0) cam = travel(cam, fit(shot, V), t)
  })
  if (loop && idx === steps.length - 1) {
    const r = tween(sf, stepLen - RET, stepLen - 3, easeInOut)
    if (r > 0) cam = travel(cam, wide(V), r)
  }
  return cam
}

/* Capture px -> viewport px under a camera. */
function mapper(cam, V) {
  const k = cam.z * V.s
  const tx = V.w / 2 - cam.x * k
  const ty = AY * V.h - cam.y * k
  return { k, tx, ty, at: (x, y) => ({ x: tx + x * k, y: ty + y * k }) }
}

const centre = (t) => (t ? { x: t.x + t.w / 2, y: t.y + t.h / 2 } : null)

/* The pointer at frame sf of step idx, in capture px, with its click. */
function pointerAt(steps, idx, sf, stepLen, loop) {
  const st = steps[idx]
  const here = centre(st.target)
  const prev = idx > 0 ? centre(steps[idx - 1].target) : null
  const at = shotAt(st.click, stepLen)
  const out = loop && idx === steps.length - 1 ? 1 - tween(sf, stepLen - RET, stepLen - RET + 10) : 1
  if (!here) {
    if (!prev) return null
    return { ...prev, o: (1 - tween(sf, 0, 8)) * out, click: -1 }
  }
  const from = prev || { x: here.x + 110, y: here.y + 80 }
  const m = tween(sf, at + 2, at + 18, easeInOut)
  return {
    x: lerp(from.x, here.x, m),
    y: lerp(from.y, here.y, m) - Math.sin(m * Math.PI) * 18,
    o: (prev ? 1 : tween(sf, at, at + 8)) * out,
    click: sf >= at + 21 ? Math.min(1, (sf - at - 21) / 20) : -1,
  }
}

function Capture({ step }) {
  return <Img src={staticFile(`walkthroughs/${step.slug}/${step.file}`)} style={{ position: 'absolute', left: 0, top: 0, width: CW, height: CH }} />
}

/*
  steps    capture steps from stories.js (captureStep)
  f        frames since the first step began (negative while entering)
  L        { W, H, bare?, win: {x, y, w, h}, chrome, radius, caption:
           {size, bottom, scrim}, chips: {top, right, size, max}, pointer }
  enter    0..1 the window's arrival; leave 0..1 its exit; recede 0..1
           it steps back under a kinetic line
  loop     the last step hands back to the first, so last frame = frame 0
*/
export function CaptureAct({ steps, f, stepLen, L, enter = 1, leave = 0, recede = 0, loop = false, chips = true, caption = true, url }) {
  const n = steps.length
  const V = viewport(L)
  const fc = Math.max(0, f)
  const idx = Math.min(n - 1, Math.floor(fc / stepLen))
  const sf = fc - idx * stepLen
  const step = steps[idx]
  const prev = idx > 0 ? steps[idx - 1] : null
  const last = idx === n - 1
  const loopOut = loop && last

  const cam = f < 0 ? wide(V) : cameraAt(steps, idx, sf, stepLen, V, loop)
  const M = mapper(cam, V)
  const cutIn = prev ? tween(sf, 0, CUT, easeInOut) : 1
  const home = loopOut ? tween(sf, stepLen - 18, stepLen - 4, easeInOut) : 0

  /* the window's pose: tilted, low and soft only while it arrives */
  const e = Math.max(0, Math.min(1.03, enter))
  const settled = e > 0.995 && leave < 0.005 && recede < 0.005
  const sc = (0.92 + 0.08 * e) * (1 - 0.06 * leave) * (1 - 0.07 * recede)
  const blur = settled ? 0 : 14 * (1 - Math.min(1, e)) + 10 * leave + 10 * recede
  const o = Math.min(1, e * 1.6) * (1 - tween(leave, 0, 1, easeInOut)) * (1 - 0.72 * recede)
  const ui = (1 - recede) * (1 - leave)

  /* pointer, in frame px */
  const p = f < 0 ? null : pointerAt(steps, idx, sf, stepLen, loop)
  let ptr = null
  if (p && p.o > 0.001) {
    const q = M.at(p.x, p.y)
    const inset = 22
    const vis = Math.max(0, Math.min(1, Math.min(q.x - inset, V.w - inset - q.x, q.y - inset, V.h - inset - q.y) / 24))
    ptr = { x: V.x + q.x, y: V.y + q.y, o: p.o * vis, click: p.click }
  }

  /* caption: in after the cut, out before the next; a loop's last step
     hands its line back to the first */
  const capIn = idx === 0 && (loop || f < 0) ? 1 : tween(sf, 3, 13)
  const capOut = loopOut ? tween(sf, stepLen - RET, stepLen - RET + 8) : last ? 0 : tween(sf, stepLen - 6, stepLen - 1)
  const capHome = loopOut ? tween(sf, stepLen - 12, stepLen - 3) : 0

  const chipItems = steps.map((st, i) => ({
    key: i,
    label: st.chip?.[0],
    state: st.chip?.[1],
    t: !st.chip ? 0 : i < idx ? 1 : i === idx && f >= 0 ? chipIn(sf, CHIP_AT) : 0,
  }))
  const chipsO = ui * (loopOut ? 1 - tween(sf, stepLen - RET, stepLen - RET + 12) : 1)

  const screens = (
    <div style={{ position: 'absolute', left: 0, top: 0, width: CW, height: CH, transformOrigin: '0 0', transform: `translate(${M.tx.toFixed(3)}px, ${M.ty.toFixed(3)}px) scale(${M.k.toFixed(5)})` }}>
      {prev && cutIn < 1 && <Capture step={prev} />}
      <div style={{ position: 'absolute', inset: 0, opacity: cutIn }}>
        <Capture step={step} />
      </div>
      {home > 0 && (
        <div style={{ position: 'absolute', inset: 0, opacity: home }}>
          <Capture step={steps[0]} />
        </div>
      )}
    </div>
  )

  const cap = L.caption
  return (
    <AbsoluteFill>
      {!L.bare && <Glow x={V.x + V.w / 2} y={V.y + V.h * 0.45} size={L.glowSize ?? 1500} opacity={0.9 * o} />}

      {L.bare ? (
        <AbsoluteFill style={{ background: S.ground, overflow: 'hidden' }}>{screens}</AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ perspective: 2400, perspectiveOrigin: `${L.win.x + L.win.w / 2}px ${L.win.y + L.win.h / 2}px` }}>
          <div
            style={{
              position: 'absolute',
              left: L.win.x,
              top: L.win.y,
              width: L.win.w,
              height: L.win.h,
              transformOrigin: '50% 50%',
              transform: settled ? undefined : `translateY(${(110 * (1 - e)).toFixed(2)}px) rotateX(${(18 * (1 - e)).toFixed(3)}deg) scale(${sc.toFixed(5)})`,
              opacity: o,
              filter: blur > 0.3 ? `blur(${blur.toFixed(2)}px)` : undefined,
            }}
          >
            <Window L={L} url={step.url || url}>
              {screens}
            </Window>
          </div>
        </AbsoluteFill>
      )}

      {ptr && <PointerRing x={ptr.x} y={ptr.y} click={ptr.click} opacity={ptr.o * ui} size={L.pointer ?? 34} />}

      {caption && cap && (
        <>
          <CaptionScrim H={L.H} height={cap.scrim} opacity={L.bare ? 1 : o} />
          <BottomCaption i={idx} n={n} text={step.caption} t={capIn} out={capOut} size={cap.size} bottom={cap.bottom} opacity={ui} />
          {capHome > 0 && <BottomCaption i={0} n={n} text={steps[0].caption} t={1} size={cap.size} bottom={cap.bottom} opacity={capHome * ui} />}
        </>
      )}

      {chips && L.chips && <ChipStack items={chipItems} top={L.chips.top} right={L.chips.right} size={L.chips.size} max={L.chips.max ?? 3} opacity={chipsO} />}
    </AbsoluteFill>
  )
}

/* The glass window in frame px: radius, hairline, a saffron rim light
   along the top edge, a quiet chrome bar. The body is the capture's own
   #0b0b0c, so a shot that runs past the capture's edge shows no seam. */
function Window({ L, url, children }) {
  const { w, h } = L.win
  const c = L.chrome
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: w,
        height: h,
        borderRadius: L.radius ?? 18,
        overflow: 'hidden',
        background: S.ground,
        border: `1px solid ${S.border}`,
        boxSizing: 'border-box',
        boxShadow: [
          '0 0 0 1px rgba(0,0,0,0.5)',
          '0 50px 120px -30px rgba(0,0,0,0.85)',
          '0 -10px 70px -24px rgba(245,135,30,0.32)',
          'inset 0 1px 0 rgba(255,200,154,0.3)',
        ].join(', '),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: c,
          display: 'flex',
          alignItems: 'center',
          padding: `0 ${c * 0.45}px`,
          gap: c * 0.18,
          background: 'linear-gradient(180deg, #19181a, #131214)',
          borderBottom: `1px solid ${S.line}`,
          boxSizing: 'border-box',
          zIndex: 2,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: c * 0.24, height: c * 0.24, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
        ))}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {url && (
            <span
              style={{
                fontFamily: MONO,
                fontSize: c * 0.36,
                letterSpacing: '0.06em',
                color: S.muted,
                padding: `${c * 0.12}px ${c * 0.45}px`,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${S.line}`,
                whiteSpace: 'nowrap',
              }}
            >
              {url}
            </span>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, top: c, width: w, height: h - c, overflow: 'hidden' }}>{children}</div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: 1.5,
          zIndex: 3,
          background: 'linear-gradient(90deg, rgba(255,200,154,0.85), rgba(245,135,30,0.32) 40%, transparent 85%)',
        }}
      />
    </div>
  )
}
