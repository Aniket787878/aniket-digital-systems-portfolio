import { EASE, DUR } from './motion3.js'
import { COL } from './Morph3.jsx'

/*
  Transitions for v3 (shot list section 3, in order of preference): a
  shared element first (the pill states themselves), then the mask wipe
  through type (Kinetic3 Words exit), the camera push-through (Camera3),
  and flood and contract, built here as MorphPill states so the flood is
  the same one shape as everything else.

  Flood: a circle grows from a point until it covers the frame,
  overscaled to 1.15 x the diagonal so the corners are covered well before
  the end and no single frame changes half the screen. Then it holds and
  contracts into the next shape.
*/

export function floodState(at, W, H, fill = COL.saffron, dur = DUR.flood) {
  const D = Math.hypot(W, H) * 1.15
  return { at, x: W / 2, y: H / 2, w: D, h: D, r: D / 2, fill, line: [fill[0], fill[1], fill[2], 0], glow: 0, content: null, ease: { dur, curve: EASE.flood } }
}

/* a full-frame rectangle (the paper ground as a pill state) */
export function frameState(at, W, H, fill = COL.paper, dur = DUR.flood) {
  const D = Math.hypot(W, H) * 1.15
  return { at, x: W / 2, y: H / 2, w: D, h: D, r: D / 2, fill, line: [0, 0, 0, 0], glow: 0, content: null, ease: { dur, curve: EASE.flood } }
}

/* a dot (the start of a flood, or the end of a contract) */
export const dotState = (at, x, y, d = 18, fill = COL.saffron, extra = {}) => ({ at, x, y, w: d, h: d, r: d / 2, fill, line: [fill[0], fill[1], fill[2], 0], content: null, ...extra })

/* contract on the flood curve over dur frames into a target state */
export const contract = (state, dur = 15) => ({ ...state, ease: { dur, curve: EASE.flood } })

/* A hard cut is only allowed into a headfake, on a downbeat: a scene
   simply stops drawing at the cut frame. */
export const before = (f, cut) => f < cut
export const between = (f, a, b) => f >= a && f < b
