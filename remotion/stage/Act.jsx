import { AbsoluteFill, Img, staticFile } from 'remotion'
import { S, SANS, GlassWindow, ChipStack, chipIn, Pointer, Glow, Mono, tween, settle, lerp, easeInOut, clamp } from './kit.jsx'
import { interpolate } from 'remotion'

/*
  The act for the schematic films: one glass window floating on the
  stage, the product's steps cutting inside it, the "what it did" chips
  stacked top right (no wires) and a caption with a mono step counter
  underneath. The real-capture demos use CaptureAct instead. The film
  around it decides when the window enters (tilted and soft, settling flat)
  and leaves; the act does everything in between.

  Every pixel inside the window of a capture step is the real capture: the
  act only adds the camera (a push in to the step's focus region from
  steps.json), the pointer and its ring. Schematic steps draw a wireframe
  screen instead, and the film labels itself accordingly.
*/

/* Logical window: the captures' own CSS viewport. The window is drawn at
   this size and scaled, so a rect from steps.json maps 1:1. */
export const VW = 1440
export const VH = 900
export const CHROME = 52

/* Beats inside one step, in frames. */
const CUT = 8 // the new screen cuts in over this many frames
const ZOOM = [6, 28] // push in to the focus region (0.7 s)
const MOVE = [8, 28] // pointer glides to the target
const CLICK = 30
const CHIP = 34

/* The push for a capture step at a given amount `t` (0 wide, 1 in). */
function zoomFor(step, t) {
  const fc = step.focus || { x: 0, y: 0, w: VW, h: VH }
  const Z = Math.max(1.1, Math.min(1.75, (VW * 0.96) / fc.w, (VH * 0.9) / fc.h))
  const z = 1 + (Z - 1) * t
  const cx = fc.x + fc.w / 2
  const cy = fc.y + fc.h / 2
  const tx = Math.min(0, Math.max(VW - VW * z, VW / 2 - cx * z))
  const ty = Math.min(0, Math.max(VH - VH * z, VH / 2 - cy * z))
  return { z, tx, ty, fx: cx * z + tx, fy: cy * z + ty }
}

const zoomT = (sf, stepLen, loopOut) => {
  const t = tween(sf, ZOOM[0], ZOOM[1], easeInOut)
  return loopOut ? t * (1 - tween(sf, stepLen - 22, stepLen - 4, easeInOut)) : t
}

/* One screen at local frame `sf`. */
export function Screen({ step, sf, stepLen, pointer = true, loopOut = false }) {
  if (step.kind === 'schematic') {
    const Comp = step.Screen
    const z = 1 + 0.04 * tween(sf, 0, stepLen, easeInOut)
    return (
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${z.toFixed(4)})`, transformOrigin: '50% 50%' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1120, height: 700, transform: `scale(${VW / 1120})`, transformOrigin: '0 0' }}>
          <Comp f={(sf * 96) / stepLen} />
        </div>
      </div>
    )
  }
  const { z, tx, ty } = zoomFor(step, zoomT(sf, stepLen, loopOut))
  const tg = step.target
  const px = tg ? tg.x + tg.w / 2 : 0
  const py = tg ? tg.y + tg.h / 2 : 0
  const m = tween(sf, MOVE[0], MOVE[1], easeInOut)
  const pOpacity = tg ? tween(sf, MOVE[0] - 2, MOVE[0] + 6) * (loopOut ? 1 - tween(sf, stepLen - 26, stepLen - 16) : 1) : 0
  return (
    <div style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${z.toFixed(5)})` }}>
      <Img src={staticFile(`walkthroughs/${step.slug}/${step.file}`)} style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH }} />
      {pointer && tg && pOpacity > 0.001 && (
        <Pointer
          x={lerp(px + 150, px, m) - Math.sin(m * Math.PI) * 10}
          y={lerp(py + 110, py, m) - Math.sin(m * Math.PI) * 24}
          click={interpolate(sf, [CLICK, CLICK + 22], [0, 1], clamp)}
          opacity={pOpacity}
          size={40}
          k={1 / z}
        />
      )}
    </div>
  )
}

/* Where on the stage the subject of step i sits at local frame sf. */
function subjectPoint(L, step, sf, stepLen) {
  const s = L.win.w / VW
  const top = L.win.y + CHROME * s
  if (step.kind !== 'capture') return { x: L.win.x + (VW / 2) * s, y: top + (VH / 2) * s }
  const { fx, fy } = zoomFor(step, zoomT(sf, stepLen))
  return { x: L.win.x + fx * s, y: top + fy * s }
}

/*
  steps     from stories.js (capture) or schematics.jsx (schematic)
  f         frames since the act's first step began (may be negative while
            the window is still entering)
  enter     0..1, the window's arrival (tilted, low and soft at 0)
  leave     0..1, its exit (recedes and blurs)
  push      0..1, the slow dolly across the whole act
  loop      the last step hands back to the first, chips clear, so the
            act's last frame matches its first
*/
export function Act({ steps, f, stepLen, L, enter = 1, leave = 0, recede = 0, push = 0, loop = false, tilt = { rx: 0, ry: 0 }, chips = true, caption = true, glow = 1, url }) {
  const n = steps.length
  const fc = Math.max(0, f)
  const idx = Math.min(n - 1, Math.floor(fc / stepLen))
  const sf = fc - idx * stepLen
  const step = steps[idx]
  const prev = idx > 0 ? steps[idx - 1] : null
  const last = idx === n - 1
  const s = L.win.w / VW
  const winH = (VH + CHROME) * s
  const loopOut = loop && last

  /* the window pose */
  const e = Math.max(0, Math.min(1.08, enter))
  const ry0 = L.enterRy ?? -10
  const pose = {
    rx: 18 * (1 - e) + tilt.rx,
    ry: ry0 * (1 - e) + tilt.ry + leave * 16,
    y: 150 * (1 - e) + leave * 10,
    x: -leave * 220,
    sc: (0.9 + 0.1 * e) * (1 + 0.035 * push) * (1 - 0.08 * leave) * (1 - 0.1 * recede),
    blur: 16 * (1 - Math.min(1, e)) + 12 * leave + 14 * recede,
    o: Math.min(1, e * 1.6) * (1 - tween(leave, 0.3, 1, easeInOut)) * (1 - 0.72 * recede),
    ui: 1 - recede,
  }

  /* the screens inside: the current one, and the previous one fading
     under it for the first CUT frames */
  const cutIn = idx === 0 && !loopOut ? 1 : tween(sf, 0, CUT, easeInOut)
  const backToStart = loopOut ? tween(sf, stepLen - 14, stepLen, easeInOut) : 0

  /* glow follows the subject */
  const here = subjectPoint(L, step, sf, stepLen)
  const was = prev ? subjectPoint(L, prev, stepLen, stepLen) : here
  let gp = { x: lerp(was.x, here.x, tween(sf, 0, 24, easeInOut)), y: lerp(was.y, here.y, tween(sf, 0, 24, easeInOut)) }
  if (loopOut) {
    const home = subjectPoint(L, steps[0], 0, stepLen)
    gp = { x: lerp(gp.x, home.x, backToStart), y: lerp(gp.y, home.y, backToStart) }
  }

  /* chips: a tidy stack top right, one per step, no wires */
  const chipsFade = loopOut ? 1 - tween(sf, stepLen - 16, stepLen - 4) : 1
  const chipItems = steps.map((st, i) => ({
    key: i,
    label: st.chip?.[0],
    state: st.chip?.[1],
    t: !st.chip ? 0 : i < idx ? 1 : i === idx && f >= 0 ? chipIn(sf, CHIP) : 0,
  }))

  /* caption */
  const capIn = idx === 0 && f < stepLen && !loop ? settle(f, 6) : idx === 0 && loop ? 1 : settle(sf, 4)
  const capOut = !loop && last ? 0 : tween(sf, stepLen - 5, stepLen, easeInOut)
  const nextCap = loopOut ? tween(sf, stepLen - 10, stepLen) : 0

  return (
    <AbsoluteFill>
      {glow > 0 && <Glow x={gp.x} y={gp.y} size={L.glowSize ?? 1200} opacity={glow * pose.o} />}

      <AbsoluteFill style={{ perspective: 2200, perspectiveOrigin: `${L.win.x + L.win.w / 2}px ${L.win.y + winH / 2}px` }}>
        {L.ghost && (
          <Ghost L={L} s={s} winH={winH} pose={pose} step={loopOut ? steps[0] : steps[Math.min(n - 1, idx + 1)]} />
        )}
        <div
          style={{
            position: 'absolute',
            left: L.win.x,
            top: L.win.y,
            width: L.win.w,
            height: winH,
            transformOrigin: '50% 50%',
            transform: `translate(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px) rotateX(${pose.rx.toFixed(3)}deg) rotateY(${pose.ry.toFixed(3)}deg) scale(${pose.sc.toFixed(5)})`,
            opacity: pose.o,
            filter: pose.blur > 0.1 ? `blur(${pose.blur.toFixed(2)}px)` : undefined,
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: 0, transform: `scale(${s})`, transformOrigin: '0 0' }}>
            <GlassWindow width={VW} bodyH={VH} chrome={CHROME} url={step.url || url}>
              {prev && cutIn < 1 && (
                <div style={{ position: 'absolute', inset: 0, opacity: 1 - cutIn * 0.6 }}>
                  <Screen step={prev} sf={stepLen + sf} stepLen={stepLen} pointer={false} />
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: cutIn,
                  transform: cutIn < 1 ? `translateY(${((1 - cutIn) * 26).toFixed(2)}px) scale(${(1.025 - 0.025 * cutIn).toFixed(4)})` : undefined,
                  transformOrigin: '50% 50%',
                }}
              >
                <Screen step={step} sf={sf} stepLen={stepLen} loopOut={loopOut} />
              </div>
              {backToStart > 0 && (
                <div style={{ position: 'absolute', inset: 0, opacity: backToStart }}>
                  <Screen step={steps[0]} sf={0} stepLen={stepLen} />
                </div>
              )}
              {/* a whisper of glass sheen over the screen */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.035), transparent 35%)', pointerEvents: 'none' }} />
            </GlassWindow>
          </div>
        </div>
      </AbsoluteFill>

      {chips && L.chips && (
        <ChipStack items={chipItems} top={L.chips.top} right={L.chips.right} size={L.chips.size} max={L.chips.max ?? 6} opacity={pose.o * pose.ui * chipsFade} />
      )}

      {/* caption with its mono step counter */}
      {caption && L.caption && (
        <div style={{ position: 'absolute', left: L.caption.x ?? L.win.x, top: L.caption.y, width: L.caption.w ?? L.W - (L.caption.x ?? L.win.x) - 60, opacity: pose.o * pose.ui }}>
          <CaptionRow i={idx} n={n} text={step.caption} t={capIn} out={capOut} size={L.caption.size} fadeTo={nextCap} />
          {nextCap > 0 && (
            <div style={{ position: 'absolute', left: 0, top: 0, width: '100%' }}>
              <CaptionRow i={0} n={n} text={steps[0].caption} t={1} out={0} size={L.caption.size} opacity={nextCap} />
            </div>
          )}
        </div>
      )}
    </AbsoluteFill>
  )
}

/* A second glass panel behind the window, out of focus: the next screen
   waiting, which gives the stage its depth. */
function Ghost({ L, s, winH, pose, step }) {
  const g = L.ghost
  return (
    <div
      style={{
        position: 'absolute',
        left: L.win.x,
        top: L.win.y,
        width: L.win.w,
        height: winH,
        transformOrigin: '50% 50%',
        transform: `translate(${(pose.x * 0.6 + g.dx).toFixed(2)}px, ${(pose.y * 0.6 + g.dy).toFixed(2)}px) rotateX(${(pose.rx * 0.7).toFixed(3)}deg) rotateY(${(pose.ry * 0.7 + (g.ry || 0)).toFixed(3)}deg) scale(${(pose.sc * g.scale).toFixed(5)})`,
        opacity: pose.o * (g.opacity ?? 0.4),
        filter: `blur(${(g.blur ?? 7) + pose.blur * 0.5}px)`,
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        <GlassWindow width={VW} bodyH={VH} chrome={CHROME} rim={0.4}>
          <Screen step={step} sf={0} stepLen={78} pointer={false} />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,11,12,0.35)' }} />
        </GlassWindow>
      </div>
    </div>
  )
}

export function CaptionRow({ i, n, text, t = 1, out = 0, size = 34, opacity = 1, fadeTo = 0 }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: size * 0.6,
        opacity: Math.min(1, t * 1.5) * (1 - out) * opacity * (1 - fadeTo),
        transform: `translateY(${((1 - t) * 18 - out * 10).toFixed(2)}px)`,
        filter: t < 0.97 || out > 0.03 ? `blur(${((1 - t) * 8 + out * 8).toFixed(2)}px)` : undefined,
      }}
    >
      <Mono size={size * 0.56} color={S.accent} style={{ position: 'relative', top: -size * 0.06 }}>
        {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
      </Mono>
      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, letterSpacing: '-0.025em', color: S.ink, lineHeight: 1.2 }}>{text}</span>
    </div>
  )
}
