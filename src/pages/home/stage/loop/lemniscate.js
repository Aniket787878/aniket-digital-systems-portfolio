/* The lemniscate of Bernoulli, shared by the 3D scene and the SVG
   fallback so both draw the same curve and put the stops in the same
   places.

   u runs 0..1 once around, starting at the left tip and heading down,
   because the stream of light comes straight down the page into that tip
   and leaves it the same way. The tip's tangent is vertical, so the
   stream merges into the curve instead of hitting it. The stops sit at
   the bottom and top of each lobe in the order the curve passes them:
   bottom left, top right, bottom right, top left. */

const TAU = Math.PI * 2

/* x in -1..1, y in about -0.354..0.354 (y up). */
export function lemniscate(u) {
  const t = Math.PI - u * TAU
  const s = Math.sin(t)
  const c = Math.cos(t)
  const k = 1 + s * s
  return { x: c / k, y: (s * c) / k, t }
}

/* Head progress at which each stop is reached. */
export const STOP_U = [1 / 8, 3 / 8, 5 / 8, 7 / 8]

/* Which stops sit on the top of a lobe (label goes above) or the bottom. */
export const STOP_TOP = [false, true, false, true]

/* An SVG path through the curve, fitted into a w x h box. */
export function svgPath(w, h, pad = 0, samples = 240) {
  const a = (w - pad * 2) / 2
  let d = ''
  for (let i = 0; i <= samples; i++) {
    const p = lemniscate(i / samples)
    d += `${i ? 'L' : 'M'}${(w / 2 + p.x * a).toFixed(2)} ${(h / 2 - p.y * a).toFixed(2)}`
  }
  return `${d}Z`
}

export function svgPoint(u, w, h, pad = 0) {
  const a = (w - pad * 2) / 2
  const p = lemniscate(u)
  return { x: w / 2 + p.x * a, y: h / 2 - p.y * a }
}

/* Scroll progress (0..1 across the pinned track) to head progress:
   a short hold at each end so the loop starts empty and ends full. */
export function headAt(p) {
  return Math.min(1, Math.max(0, (p - 0.06) / 0.82))
}

/* Index of the last stop the head has reached, or -1. */
export function stopAt(head) {
  let i = -1
  for (let s = 0; s < STOP_U.length; s++) if (head >= STOP_U[s] - 0.004) i = s
  return i
}
