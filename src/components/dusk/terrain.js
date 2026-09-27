/*
  The dusk mountain ridges, drawn from seeded noise so the silhouette is the
  same on every load and every render (the films use the same generator
  idea, so site and video share one landscape).

  ridge() returns an SVG path in a 1440-wide viewBox: a jagged top line made
  of a few summed sine octaves, closed down to the bottom edge.
*/

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function ridge({ seed, base, amp, height = 400, detail = 1, steps = 96 }) {
  const rnd = mulberry32(seed)
  const octaves = [
    { f: 1.2 + rnd(), a: 1, p: rnd() * 6.28 },
    { f: 3.1 + rnd() * 2, a: 0.45, p: rnd() * 6.28 },
    { f: 7.3 + rnd() * 3, a: 0.2 * detail, p: rnd() * 6.28 },
    { f: 17 + rnd() * 6, a: 0.08 * detail, p: rnd() * 6.28 }
  ]
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 1440
    const u = i / steps
    let y = 0
    for (const o of octaves) y += Math.sin(u * o.f * Math.PI + o.p) * o.a
    // Sharpen the peaks a little: mountains, not hills.
    const peak = -Math.abs(Math.sin(u * (2.2 + seed % 3) * Math.PI + seed)) * 0.5
    pts.push([x, base - (y + peak) * amp])
  }
  let d = `M0 ${height} L0 ${pts[0][1].toFixed(1)}`
  for (const [x, y] of pts) d += ` L${x.toFixed(1)} ${y.toFixed(1)}`
  return `${d} L1440 ${height} Z`
}

/* Deterministic star field for the top of the sky. */
export function starField(count = 70, seed = 7) {
  const rnd = mulberry32(seed)
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rnd() * 100,
    y: rnd() * 55,
    r: rnd() < 0.85 ? 1 : 1.8,
    o: 0.25 + rnd() * 0.6,
    d: (rnd() * 6).toFixed(2)
  }))
}
