/* The v3 films' one motion file: the beat grid, the curves and the springs
   from the v3 shot list (films-2026-10-09/shot-list.md, section 3). Every
   v3 film and kit component reads its timing from here, so a curve changes
   in one place.

   Grid: 120 BPM at 30 fps is exactly 15 frames per beat and 60 per bar, so
   every scene start in the beat sheets is a multiple of 15 and the score
   (scripts/make-music-v3.py) lands its hits on the same frames. */
import { Easing, interpolate, spring } from 'remotion'
import { rand } from './motion.js'

export { rand }

export const FPS = 30
export const BPM = 120
export const BEAT = 15
export const BAR = 60
export const beat = (n) => n * BEAT

const C = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }

export const EASE = {
  arrive: Easing.bezier(0.16, 1, 0.3, 1), // everything entering
  leave: Easing.bezier(0.7, 0, 0.84, 0), // everything leaving, shorter than entrances
  glide: Easing.bezier(0.65, 0, 0.35, 1), // camera pushes and pulls
  flood: Easing.bezier(0.83, 0, 0.17, 1), // flood and contract
  roll: Easing.bezier(0.16, 1, 0.3, 1), // odometer digits
  linear: (x) => x,
}

export const DUR = { arrive: 18, leave: 10, glide: 60, flood: 9, roll: 24 }
export const STAGGER_WORD = 4
export const STAGGER_CARD = 6

export const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t

/* 0..1 over [at, at + dur] on a curve */
export const ramp = (f, at, dur, ease = EASE.arrive) => interpolate(f, [at, at + Math.max(1, dur)], [0, 1], { ...C, easing: ease })
export const arriveT = (f, at, dur = DUR.arrive) => ramp(f, at, dur, EASE.arrive)
export const leaveT = (f, at, dur = DUR.leave) => ramp(f, at, dur, EASE.leave)
export const glideT = (f, at, dur = DUR.glide) => ramp(f, at, dur, EASE.glide)
export const floodT = (f, at, dur = DUR.flood) => ramp(f, at, dur, EASE.flood)

/* in at inAt, out at outAt (null: stays) */
export const live = (f, inAt, outAt, inDur = DUR.arrive, outDur = DUR.leave) =>
  arriveT(f, inAt, inDur) * (outAt == null ? 1 : 1 - leaveT(f, outAt, outDur))

/* Springs. settle is over-damped (no overshoot); lead/trail are the two
   edges of a stretching pill: the leading edge is stiffer, so the shape
   stretches while it moves and the trailing edge catches up (overshoot
   about 0.2%). Remotion's spring is a pure function of the frame, so any
   frame renders the same on its own. */
export const SPRING = {
  settle: { damping: 26, stiffness: 120, mass: 1 },
  lead: { damping: 24, stiffness: 180, mass: 1 },
  trail: { damping: 24, stiffness: 90, mass: 1 },
}
export const spr = (f, at, cfg = SPRING.settle) => (f <= at ? 0 : spring({ frame: f - at, fps: FPS, config: cfg }))

/* A value that changes target several times: the sum of one spring (or
   eased ramp) per change. keys: [{ at, v }], the first is the start value. */
export function keyed(f, keys, cfg = SPRING.settle) {
  let v = keys[0].v
  for (let i = 1; i < keys.length; i++) v += (keys[i].v - keys[i - 1].v) * spr(f, keys[i].at, cfg)
  return v
}
export function keyedEase(f, keys, dur = DUR.glide, ease = EASE.glide) {
  let v = keys[0].v
  for (let i = 1; i < keys.length; i++) v += (keys[i].v - keys[i - 1].v) * ramp(f, keys[i].at, keys[i].dur ?? dur, keys[i].ease ?? ease)
  return v
}

/* Text width at render time (the fonts are loaded before the first frame
   by useStageFonts), so a layout can place a "?" dot or centre a stack
   without guessing. */
let ctx
export function textWidth(text, size, { serif = false, weight = 500, tracking = -0.045 } = {}) {
  if (typeof document === 'undefined') return text.length * size * 0.5
  if (!ctx) ctx = document.createElement('canvas').getContext('2d')
  ctx.font = serif ? `italic 400 ${size}px "Instrument Serif"` : `${weight} ${size}px Inter`
  ctx.letterSpacing = `${serif ? 0 : tracking * size}px`
  return ctx.measureText(text).width
}
