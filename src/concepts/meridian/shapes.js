/* The four shapes the point field moves between. Every point i has a home in
   each shape; the shader blends between homes. All sizes are in world units
   (the camera sees about 4.4 units of height at z = 0).

   A  scattered cloud     (clumps of loose paper, and dust between them)
   B  globe               (latitude rings, meridians, a thin orbit ring)
   C  rising bar chart    (bars, a line through their tops, faint grid)
   D  one ring            (a single meridian, four quarter markers)       */

function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const CHART_BASE = -1.3
export const CHART_TOP = 1.45

export function buildShapes(n) {
  const r = seeded(20260)
  const gauss = () => {
    const u = Math.max(r(), 1e-6)
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * r())
  }
  const A = new Float32Array(n * 3)
  const B = new Float32Array(n * 3)
  const C = new Float32Array(n * 3)
  const D = new Float32Array(n * 3)
  // x: morph delay, y: size, z: tone (0 ivory .. 1 brass), w: ring position 0..1
  const R4 = new Float32Array(n * 4)

  // A: clumps
  const clumps = []
  for (let k = 0; k < 26; k++) {
    clumps.push([(r() * 2 - 1) * 3.6, (r() * 2 - 1) * 2.0, (r() * 2 - 1) * 1.6, 0.1 + r() * 0.32])
  }

  // B: latitude rings weighted by circumference
  const RAD = 1.55
  const LAT = 21
  const latW = []
  let latSum = 0
  for (let k = 0; k < LAT; k++) {
    const lat = ((-78 + (k * 156) / (LAT - 1)) * Math.PI) / 180
    latW.push([lat, Math.cos(lat)])
    latSum += Math.cos(lat)
  }
  const pickLat = () => {
    let x = r() * latSum
    for (const [lat, w] of latW) {
      if ((x -= w) <= 0) return lat
    }
    return 0
  }

  // C: bar heights, rising with a little honest wobble
  const BARS = 13
  const X0 = -2.2
  const X1 = 2.2
  const bw = ((X1 - X0) / BARS) * 0.3
  const heights = []
  let hSum = 0
  for (let i = 0; i < BARS; i++) {
    const f = (i + 1) / BARS
    const h = 0.28 + 2.05 * Math.pow(f, 1.55) + (i % 3 === 1 ? -0.1 : 0.04)
    heights.push(h)
    hSum += h + bw * 2
  }
  const barX = (i) => X0 + ((i + 0.5) * (X1 - X0)) / BARS
  const curve = (x) => {
    const f = ((x - X0) / (X1 - X0)) * BARS - 0.5
    const i = Math.max(0, Math.min(BARS - 2, Math.floor(f)))
    const t = Math.max(0, Math.min(1, f - i))
    const s = t * t * (3 - 2 * t)
    return CHART_BASE + heights[i] + (heights[i + 1] - heights[i]) * s
  }

  for (let i = 0; i < n; i++) {
    const i3 = i * 3
    const i4 = i * 4
    R4[i4] = r() * 0.42
    const big = r()
    R4[i4 + 1] = big > 0.985 ? 2.1 + r() : 0.55 + r() * 0.8
    R4[i4 + 2] = r() < 0.36 ? 0.7 + r() * 0.3 : r() * 0.25

    // A
    if (r() < 0.8) {
      const c = clumps[(r() * clumps.length) | 0]
      A[i3] = c[0] + gauss() * c[3]
      A[i3 + 1] = c[1] + gauss() * c[3] * 0.7
      A[i3 + 2] = c[2] + gauss() * c[3]
    } else {
      A[i3] = (r() * 2 - 1) * 3.9
      A[i3 + 1] = (r() * 2 - 1) * 2.3
      A[i3 + 2] = (r() * 2 - 1) * 2.2
    }

    // B
    const kind = r()
    if (kind < 0.56) {
      const lat = pickLat()
      const th = r() * 6.2831853
      const j = 1 + gauss() * 0.004
      B[i3] = RAD * j * Math.cos(lat) * Math.cos(th)
      B[i3 + 1] = RAD * j * Math.sin(lat)
      B[i3 + 2] = RAD * j * Math.cos(lat) * Math.sin(th)
    } else if (kind < 0.76) {
      const ph = (((r() * 16) | 0) / 16) * 6.2831853
      const lat = (r() - 0.5) * Math.PI
      B[i3] = RAD * Math.cos(lat) * Math.cos(ph)
      B[i3 + 1] = RAD * Math.sin(lat)
      B[i3 + 2] = RAD * Math.cos(lat) * Math.sin(ph)
    } else if (kind < 0.8) {
      // orbit ring, drawn in the shader's tilted frame
      const th = r() * 6.2831853
      const rr = RAD * 1.32 + gauss() * 0.006
      B[i3] = rr * Math.cos(th)
      B[i3 + 1] = gauss() * 0.004
      B[i3 + 2] = rr * Math.sin(th)
    } else {
      const u = r() * 2 - 1
      const th = r() * 6.2831853
      const s = Math.sqrt(1 - u * u)
      B[i3] = RAD * s * Math.cos(th)
      B[i3 + 1] = RAD * u
      B[i3 + 2] = RAD * s * Math.sin(th)
    }

    // C
    const ck = r()
    if (ck < 0.64) {
      let x = r() * hSum
      let b = 0
      for (; b < BARS - 1; b++) if ((x -= heights[b] + bw * 2) <= 0) break
      const h = heights[b]
      const cx = barX(b)
      const e = r()
      let px
      let py
      let pz
      if (e < 0.45) {
        // the four vertical edges and the top outline: a crisp wireframe
        const corner = (r() * 4) | 0
        const sx = corner & 1 ? 1 : -1
        const sz = corner & 2 ? 1 : -1
        if (r() < 0.72) {
          px = cx + sx * bw
          pz = sz * bw
          py = CHART_BASE + r() * h
        } else {
          const t = r() * 2 - 1
          py = CHART_BASE + h
          if (r() < 0.5) {
            px = cx + t * bw
            pz = sz * bw
          } else {
            px = cx + sx * bw
            pz = t * bw
          }
        }
      } else {
        // front face, lightly filled
        px = cx + (r() * 2 - 1) * bw
        py = CHART_BASE + Math.pow(r(), 0.8) * h
        pz = bw
      }
      C[i3] = px
      C[i3 + 1] = py
      C[i3 + 2] = pz
    } else if (ck < 0.76) {
      const x = X0 + r() * (X1 - X0)
      C[i3] = x
      C[i3 + 1] = curve(x) + 0.2 + gauss() * 0.006
      C[i3 + 2] = 0.2
    } else if (ck < 0.86) {
      const x = X0 + r() * (X1 - X0)
      const top = curve(x) + 0.2
      C[i3] = x
      C[i3 + 1] = CHART_BASE + Math.pow(r(), 0.6) * (top - CHART_BASE)
      C[i3 + 2] = -0.35
    } else {
      const level = (r() * 6) | 0
      C[i3] = X0 - 0.2 + r() * (X1 - X0 + 0.4)
      C[i3 + 1] = CHART_BASE + level * 0.5 + gauss() * 0.003
      C[i3 + 2] = -0.45
    }

    // D
    const dk = r()
    let s
    let rr
    if (dk < 0.86) {
      s = r()
      rr = 1.75 + gauss() * 0.01
      const a = s * 6.2831853
      D[i3] = rr * Math.sin(a)
      D[i3 + 1] = rr * Math.cos(a)
      D[i3 + 2] = gauss() * 0.01
    } else if (dk < 0.92) {
      s = ((r() * 4) | 0) / 4 + 0.001
      const a = s * 6.2831853
      D[i3] = 1.75 * Math.sin(a) + gauss() * 0.035
      D[i3 + 1] = 1.75 * Math.cos(a) + gauss() * 0.035
      D[i3 + 2] = gauss() * 0.035
    } else {
      s = r()
      rr = 2.05 + gauss() * 0.12
      const a = s * 6.2831853
      D[i3] = rr * Math.sin(a)
      D[i3 + 1] = rr * Math.cos(a)
      D[i3 + 2] = gauss() * 0.08
      s = 2 // halo: never part of the lit arc
    }
    R4[i4 + 3] = s
  }
  return { A, B, C, D, R4 }
}
