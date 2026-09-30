/* The one place page and scene meet. The page writes scroll, pointer and the
   keyframe positions (measured from the DOM); the scene reads them each
   frame. No React state, so scrolling never re-renders anything. */

// m: shape (0 cloud, 1 globe, 2 chart, 3 ring), x/y/s: placement, o: opacity, arc: ring fill
const K = (id, at, d, mob) => ({ id, at, d, mob })
export const KEYS = [
  K('m-hero', 0, { m: 1, x: 1.55, y: 0.02, s: 1.08, o: 1, arc: 0 }, { x: 0, y: 0.98, s: 0.56, o: 1 }),
  K('m-story', 0, { m: 1, x: 1.4, y: 0, s: 1, o: 1, arc: 0 }, { x: 0, y: 0.95, s: 0.58, o: 1 }),
  K('m-story', 0.16, { m: 0, x: 0.8, y: 0, s: 1, o: 1, arc: 0 }, { x: 0, y: 0.6, s: 0.62, o: 0.9 }),
  K('m-story', 0.3, { m: 0, x: 0.8, y: 0, s: 1, o: 1, arc: 0 }, { x: 0, y: 0.6, s: 0.62, o: 0.9 }),
  K('m-story', 0.5, { m: 1, x: 1.4, y: 0, s: 1, o: 1, arc: 0 }, { x: 0, y: 0.95, s: 0.56, o: 1 }),
  K('m-story', 0.62, { m: 1, x: 1.4, y: 0, s: 1, o: 1, arc: 0 }, { x: 0, y: 0.95, s: 0.56, o: 1 }),
  K('m-story', 0.82, { m: 2, x: 1.25, y: 0.02, s: 0.8, o: 1, arc: 0 }, { x: 0, y: 0.95, s: 0.42, o: 1 }),
  K('m-story', 1, { m: 2, x: 1.25, y: 0.02, s: 0.8, o: 1, arc: 0 }, { x: 0, y: 0.95, s: 0.42, o: 1 }),
  K('m-services', 0.35, { m: 2, x: 0, y: -0.1, s: 1.2, o: 0.2, arc: 0 }, { x: 0, y: 0, s: 0.5, o: 0.16 }),
  K('m-how', 0, { m: 3, x: 1.5, y: 0, s: 0.86, o: 1, arc: 0 }, { x: 0, y: 0.9, s: 0.5, o: 0.55 }),
  K('m-how', 0.12, { m: 3, x: 1.5, y: 0, s: 0.86, o: 1, arc: 0 }, { x: 0, y: 0.9, s: 0.5, o: 0.55 }),
  K('m-how', 0.88, { m: 3, x: 1.5, y: 0, s: 0.86, o: 1, arc: 1 }, { x: 0, y: 0.9, s: 0.5, o: 0.55 }),
  K('m-fees', 0.4, { m: 3, x: 0, y: 0, s: 1.6, o: 0.26, arc: 1 }, { x: 0, y: 0, s: 0.62, o: 0.2 }),
  K('m-contact', 0.5, { m: 3, x: 2.0, y: 0.05, s: 0.85, o: 0.6, arc: 1 }, { x: 0, y: 0.5, s: 0.55, o: 0.2 })
]

export const bus = {
  scrollY: 0,
  vh: 900,
  mobile: false,
  pointer: { x: 0, y: 0, active: 0 },
  marks: [] // scroll position of each key, filled by measure()
}

export function measure() {
  const vh = window.innerHeight
  bus.vh = vh
  bus.mobile = window.innerWidth < 768
  bus.marks = KEYS.map((k) => {
    const el = document.getElementById(k.id)
    if (!el) return 0
    const top = el.getBoundingClientRect().top + window.scrollY
    return top + k.at * Math.max(0, el.offsetHeight - vh)
  })
}

const ease = (t) => t * t * (3 - 2 * t)
const FIELDS = ['m', 'x', 'y', 's', 'o', 'arc']

/* Target state for the current scroll position. */
export function sample(out) {
  const y = bus.scrollY
  const marks = bus.marks
  const get = (i) => (bus.mobile ? { ...KEYS[i].d, ...KEYS[i].mob } : KEYS[i].d)
  let i = 0
  while (i < KEYS.length - 1 && marks[i + 1] <= y) i++
  if (i >= KEYS.length - 1 || y <= marks[0]) {
    Object.assign(out, get(y <= marks[0] ? 0 : KEYS.length - 1))
    return out
  }
  const a = get(i)
  const b = get(i + 1)
  const span = Math.max(1, marks[i + 1] - marks[i])
  const t = ease(Math.min(1, Math.max(0, (y - marks[i]) / span)))
  for (const f of FIELDS) out[f] = a[f] + (b[f] - a[f]) * t
  return out
}
