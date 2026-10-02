import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/*
  The stream of light behind the whole home page (after the Relay
  reference): one ribbon of glowing threads on a fixed layer under every
  section. It is the page's story told in light:

  - hero: crisp, sweeping in from the top right and pinching white-hot
    just beside the hero buttons, so the eye lands on them;
  - between: it drifts behind the content, swaying left and right as the
    page scrolls, out of focus and dimmed so it never fights the text (the
    softening is done in the shader, continuously; there is no CSS blur);
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

// The key shapes, the text to keep clear and the maths that mixes them
// live in RibbonScene.js, so they load with three.js instead of adding to
// the main bundle.

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
    let S = null
    let raf = 0
    let alive = true
    let lastDraw = 0
    let eased = null
    let lowRes = false
    // Pixel ratios: full sharpness up to 2x in focus; out of focus the
    // threads are wide and soft, so 1.5x is enough (about half the pixels).
    const dprFull = Math.min(window.devicePixelRatio || 1, 2)
    const dprCalm = Math.min(dprFull, 1.5)
    // Text rectangles in page coordinates, re-measured every so often
    // (the copy settles in with a small animation) and on resize.
    const range = document.createRange()
    const text = { hero: [], close: [] }
    let measured = -1
    let frameNo = 0
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
      // Seconds since the last frame. Capped at a 20fps frame, so a long
      // stall (or a hidden tab coming back) eases on instead of jumping.
      const dt = lastDraw ? Math.min((now - lastDraw) / 1000, 0.05) : 1 / 60
      lastDraw = now
      const K = wide ? S.WIDE : S.NARROW
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
      const closeAt = S.centre(closeBtn)
      const closeTop = closeBtn ? closeBtn.closest('section')?.getBoundingClientRect().top ?? H : H

      const h = 1 - S.smooth(0.08 * H, 0.95 * H, y)
      const c = closeBtn ? S.smooth(0.95 * H, 0.3 * H, closeTop) : 0
      const sway = 0.5 - 0.5 * Math.cos((Math.PI * y) / (2.2 * H))

      let goal = S.mix(S.place(K.a, W, H, wide), S.place(K.b, W, H, wide), sway)
      if (h > 0) goal = S.mix(goal, S.place(K.hero, W, H, wide, heroAt), h)
      if (c > 0) goal = S.mix(goal, S.place(K.close, W, H, wide, closeAt), c)
      // The ribbon eases toward where the scroll says it should be instead
      // of snapping there, so a flick of the page reads as the current
      // swinging, not jumping. Reduced motion snaps.
      const shape = (eased = eased && !reduce ? S.mix(eased, goal, 1 - Math.exp(-dt * 7)) : goal)

      const focus = 1 - shape.calm
      // Fewer pixels while out of focus, with a gap between the two
      // thresholds so it never flips back and forth.
      if (wide && dprCalm < dprFull) {
        if (!lowRes && shape.calm > 0.85) lowRes = true
        else if (lowRes && shape.calm < 0.5) lowRes = false
        ribbon.setDpr(lowRes ? dprCalm : dprFull)
      }

      // The text to keep clear, faded in with its section's shape.
      const rects = []
      if (h > 0.01 || c > 0.01) {
        if (frameNo - measured > 20 || measured < 0) {
          for (const k of ['hero', 'close'])
            text[k] = S.TEXT[k].map(([sel, dim]) => {
              const el = document.querySelector(sel)
              const r = el && S.textRect(el, range)
              return r && [...r, dim]
            })
          measured = frameNo
        }
        for (const [k, wgt] of [['hero', h], ['close', c]]) {
          if (wgt <= 0.01) continue
          for (const r of text[k]) if (r) rects.push([r[0], r[1] - y, r[2], r[3] - y, r[4] * wgt])
        }
      }
      frameNo++

      const [hx, hy] = S.bez(shape.p, shape.pinchT)
      const halo = haloRef.current
      halo.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`
      halo.style.opacity = (0.15 + 0.85 * focus) * shape.gain

      const time = reduce ? 4 : (now - t0) / 1000
      ribbon.frame(time, shape, rects)
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw)
    }

    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(draw)
    }

    const resize = () => {
      if (!ribbon) return
      ribbon.resize(window.innerWidth, window.innerHeight)
      measured = -1
      kick()
    }

    import('./RibbonScene.js')
      .then((mod) => {
        if (!alive || !canvasRef.current) return
        S = mod
        const wide = window.innerWidth >= 1024
        try {
          ribbon = mod.createRibbon(canvasRef.current, {
            threads: wide ? 420 : 130,
            steps: wide ? 140 : 64,
            sparks: wide ? 240 : 40,
            // Full sharpness up to 2x: at 1x the hairline threads stair-step
            // on a phone's dense screen. Phones save their time on the thread
            // count instead.
            dpr: dprFull,
            // Out of focus: wide screens soften each thread to a band about
            // 18px across and draw a third of them (the glow is continuous by
            // then); phones stay nearly crisp, just dim, as before.
            soft: wide ? 8 : 0.6,
            keepCalm: wide ? 0.34 : 1.12
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
    // Coming back to the tab: start timing afresh so the first frame
    // doesn't count the time away.
    const onVisible = () => {
      if (document.hidden) return
      lastDraw = 0
      kick()
    }
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
