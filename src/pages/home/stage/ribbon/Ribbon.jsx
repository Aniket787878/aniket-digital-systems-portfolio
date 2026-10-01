import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/*
  The stream of light behind the whole home page (after the Relay
  reference): one ribbon of glowing threads on a fixed layer under every
  section. It is the page's story told in light:

  - hero: crisp, sweeping in from the top right and pinching white-hot
    just beside the hero buttons, so the eye lands on them;
  - between: it drifts behind the content, swaying left and right as the
    page scrolls, blurred and dimmed so it never fights the text;
  - close: it pours in from the top right and ends on the "Book the
    free call" button: the pinch sits near the end of the spine, so the
    stream stops there instead of fanning on past it.

  The three shapes are cubic spines in viewport fractions. Two of them
  are pinned: after scaling, the whole spine is shifted so its pinch lands
  on a real element (the hero buttons, the close button), so the pinch
  follows the layout at every screen size.

  three.js loads as its own chunk after first paint (the scene module is
  imported dynamically), never in the main bundle. No WebGL: nothing is
  drawn and the page is unchanged. Reduced motion: one still frame,
  redrawn only when the scroll moves the shape. The loop stops while the
  tab is hidden.
*/

const WIDE = {
  hero: { p: [[1.02, -0.16], [0.62, 0.3], [0.28, 0.98], [0.98, 1.2]], w: 0.34, wMin: 9, pinchT: 0.6, pinchW: 0.12, twist: 5.2, gain: 1 },
  a: { p: [[0.44, -0.25], [-0.12, 0.3], [0.42, 0.72], [0.02, 1.25]], w: 0.62, wMin: 130, pinchT: 0.5, pinchW: 0.26, twist: 4.2, gain: 0.45 },
  b: { p: [[0.08, -0.25], [0.6, 0.34], [-0.06, 0.66], [0.4, 1.25]], w: 0.62, wMin: 130, pinchT: 0.5, pinchW: 0.26, twist: 4.6, gain: 0.45 },
  close: { p: [[1.0, -0.3], [0.55, 0.1], [0.1, 0.6], [0.45, 0.95]], w: 0.36, wMin: 8, pinchT: 0.82, pinchW: 0.12, twist: 5, gain: 1 }
}

// Phones: the hero stacks, so the ribbon runs more upright and narrower.
// Between the hero and the close the text spans the whole screen and there
// is no blur, so the ribbon there is wide, loose and very dim.
const NARROW = {
  hero: { p: [[1.6, -0.15], [1.05, 0.3], [0.7, 0.95], [1.4, 1.15]], w: 0.28, wMin: 6, pinchT: 0.6, pinchW: 0.13, twist: 4.6, gain: 0.75 },
  a: { p: [[0.7, -0.2], [-0.2, 0.3], [0.9, 0.7], [0.2, 1.2]], w: 0.6, wMin: 150, pinchT: 0.5, pinchW: 0.26, twist: 4, gain: 0.55 },
  b: { p: [[0.2, -0.2], [1.1, 0.35], [0.0, 0.65], [0.8, 1.2]], w: 0.6, wMin: 150, pinchT: 0.5, pinchW: 0.26, twist: 4.2, gain: 0.55 },
  close: { p: [[1.3, -0.3], [0.9, 0.1], [0.1, 0.6], [0.5, 0.95]], w: 0.5, wMin: 7, pinchT: 0.82, pinchW: 0.13, twist: 4.6, gain: 0.95 }
}

const lerp = (a, b, k) => a + (b - a) * k
const clamp01 = (x) => Math.min(1, Math.max(0, x))
const smooth = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

function bez(p, t) {
  const u = 1 - t
  const a = u * u * u
  const b = 3 * u * u * t
  const c = 3 * u * t * t
  const d = t * t * t
  return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]]
}

// A key shape in pixels. `w` is a fraction of the viewport's short-ish
// side (height on wide screens, width on phones). With a target, the
// spine is shifted so its pinch sits on it.
function place(key, W, H, wide, target) {
  let p = key.p.map(([x, y]) => [x * W, y * H])
  if (target) {
    const [px, py] = bez(p, key.pinchT)
    const dx = target[0] - px
    const dy = target[1] - py
    p = p.map(([x, y]) => [x + dx, y + dy])
  }
  return { ...key, p, wMax: key.w * (wide ? H : W), calm: target ? 0 : 1 }
}

function mix(a, b, k) {
  return {
    p: a.p.map(([x, y], i) => [lerp(x, b.p[i][0], k), lerp(y, b.p[i][1], k)]),
    wMax: lerp(a.wMax, b.wMax, k),
    wMin: lerp(a.wMin, b.wMin, k),
    pinchT: lerp(a.pinchT, b.pinchT, k),
    pinchW: lerp(a.pinchW, b.pinchW, k),
    twist: lerp(a.twist, b.twist, k),
    gain: lerp(a.gain, b.gain, k),
    calm: lerp(a.calm ?? 1, b.calm ?? 1, k)
  }
}

function centre(el, dx = 0, dy = 0) {
  if (!el) return null
  const r = el.getBoundingClientRect()
  return [r.left + r.width / 2 + dx, r.top + r.height / 2 + dy]
}

let webglOk
function hasWebGL() {
  if (webglOk === undefined) {
    try {
      const c = document.createElement('canvas')
      webglOk = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webglOk = false
    }
  }
  return webglOk
}

export default function Ribbon() {
  const reduce = useReducedMotion()
  const wrap = useRef(null)
  const canvasRef = useRef(null)
  const haloRef = useRef(null)

  useEffect(() => {
    if (!hasWebGL()) return undefined
    let ribbon = null
    let raf = 0
    let alive = true
    let lastBlur = -1
    let lastDraw = 0
    let eased = null
    // The two targets, looked up again only once they leave the page.
    const els = {}
    const find = (k, sel) => (els[k]?.isConnected ? els[k] : (els[k] = document.querySelector(sel)))
    const t0 = performance.now()

    const draw = (now) => {
      raf = 0
      if (!ribbon || !alive) return
      const W = window.innerWidth
      const H = window.innerHeight
      const wide = W >= 1024
      // Seconds since the last frame, capped so a hidden tab coming back
      // doesn't make the shape jump.
      const dt = lastDraw ? Math.min((now - lastDraw) / 1000, 0.1) : 1
      lastDraw = now
      const K = wide ? WIDE : NARROW
      const y = window.scrollY

      // Where the pinches go: just past the last hero button, and on the
      // close button itself.
      const heroBtn = find('hero', '.sh-actions > :last-child')
      const heroAt = heroBtn
        ? (() => {
            const r = heroBtn.getBoundingClientRect()
            return wide ? [r.right + 150, r.top + r.height / 2 + 12] : [W * 0.93, r.top + r.height / 2]
          })()
        : null
      const closeBtn = find('close', '.cl-primary')
      const closeAt = centre(closeBtn)
      const closeTop = closeBtn ? closeBtn.closest('section')?.getBoundingClientRect().top ?? H : H

      const h = 1 - smooth(0.08 * H, 0.95 * H, y)
      const c = closeBtn ? smooth(0.95 * H, 0.3 * H, closeTop) : 0
      const sway = 0.5 - 0.5 * Math.cos((Math.PI * y) / (2.2 * H))

      let goal = mix(place(K.a, W, H, wide), place(K.b, W, H, wide), sway)
      if (h > 0) goal = mix(goal, place(K.hero, W, H, wide, heroAt), h)
      if (c > 0) goal = mix(goal, place(K.close, W, H, wide, closeAt), c)
      // The ribbon eases toward where the scroll says it should be instead
      // of snapping there, so a flick of the page reads as the current
      // swinging, not jumping. Reduced motion snaps.
      const shape = (eased = eased && !reduce ? mix(eased, goal, 1 - Math.exp(-dt * 7)) : goal)

      const focus = 1 - shape.calm
      // Blur in whole pixels, written only when it changes: a filter
      // change re-rasterises the layer, so not every frame.
      const blur = wide ? Math.round((1 - focus) * 9) : 0
      if (blur !== lastBlur) {
        canvasRef.current.style.filter = blur ? `blur(${blur}px)` : 'none'
        lastBlur = blur
      }

      const [hx, hy] = bez(shape.p, shape.pinchT)
      const halo = haloRef.current
      halo.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`
      halo.style.opacity = (0.15 + 0.85 * focus) * shape.gain

      const time = reduce ? 4 : (now - t0) / 1000
      ribbon.frame(time, shape)
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw)
    }

    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      if (!ribbon) return
      ribbon.resize(window.innerWidth, window.innerHeight)
      kick()
    }

    import('./RibbonScene.js')
      .then(({ createRibbon }) => {
        if (!alive || !canvasRef.current) return
        const wide = window.innerWidth >= 1024
        try {
          ribbon = createRibbon(canvasRef.current, {
            threads: wide ? 420 : 130,
            steps: wide ? 140 : 64,
            sparks: wide ? 240 : 40,
            // Full sharpness up to 2x: at 1x the hairline threads stair-step
            // on a phone's dense screen. Phones save their time on the thread
            // count instead.
            dpr: Math.min(window.devicePixelRatio || 1, 2),
            antialias: true
          })
        } catch {
          return
        }
        wrap.current?.classList.add('is-on')
        resize()
      })
      .catch(() => {})

    // Reduced motion draws on demand; otherwise the loop is already
    // running, and these only restart it after the tab was hidden.
    const onScroll = () => (reduce || !raf) && kick()
    const onVisible = () => !document.hidden && kick()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      alive = false
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisible)
      ribbon?.dispose()
    }
  }, [reduce])

  return (
    <div className="stage-ribbon" ref={wrap} aria-hidden="true">
      <span className="stage-ribbon-halo" ref={haloRef} />
      <canvas className="stage-ribbon-canvas" ref={canvasRef} />
    </div>
  )
}
