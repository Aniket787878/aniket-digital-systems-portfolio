/* Shared, mutable state between the page (scroll, pointer) and the scene.
   Plain object on purpose: the page writes, useFrame reads, no re-renders. */
export const rig = {
  k: 0, // camera keyframe position, a float along KEYS
  px: 0, // pointer, -1..1
  py: 0,
  invalidate: null // set by the scene when it renders on demand
}

/* Camera keyframes, one per idea on the page. A walk around the sculpture:
   az = angle around it (radians), el = height angle, r = distance,
   ty = look-at height, ox = sideways framing (negative puts the sculpture
   to the right of the text, positive to the left). */
export const KEYS = [
  { az: -0.5, el: 0.1, r: 12.5, ty: 1.75, ox: -1.55 }, // hero
  { az: 0.35, el: 0.03, r: 9.2, ty: 2.0, ox: -1.7 }, // practice
  { az: 1.05, el: 0.2, r: 12, ty: 1.55, ox: -2.7 }, // services
  { az: 1.85, el: 0.07, r: 9.5, ty: 1.5, ox: -1.55 }, // process: listening
  { az: 2.6, el: 0.38, r: 12.5, ty: 1.55, ox: -1.7 }, // concept
  { az: 3.35, el: 0.04, r: 8.6, ty: 1.45, ox: -1.35 }, // drawings and materials
  { az: 4.15, el: 0.24, r: 10.5, ty: 1.6, ox: -1.55 }, // site and handover
  { az: 5.4, el: 0.24, r: 17, ty: -0.3, ox: -3.65 }, // selected work
  { az: 6.0, el: 0.12, r: 12.5, ty: 1.7, ox: 2.6 } // contact, back at the front
]

/* Phones: sculpture centred in the upper half, text below it. */
export const KEYS_MOBILE = KEYS.map((k) => ({
  ...k,
  r: k.r * 1.45,
  ox: 0,
  ty: k.ty - 2.05
}))
