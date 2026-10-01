import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { m, useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { AGAIN, LEDE, REHOOK, STOPS, TITLE } from './loop/content.js'
import { STOP_TOP, STOP_U, headAt, stopAt, svgPath, svgPoint } from './loop/lemniscate.js'
import '../../service/showcase/stage.css'
import './loop/loop.css'

/*
  "How I work" as the site's signature: the loop every project runs (find
  the leak, map it, build it, measure it), drawn as a glowing ∞.

  - Desktop (1024px+), motion allowed, WebGL: a pinned section where a
    light travels once around a glass ∞ as you scroll, lighting each stop
    (loop/LoopScene.jsx, React.lazy()'d so three.js stays out of the main
    bundle). The stream of light comes down the page into the loop's left
    tip and leaves from it, threading on into Close.
  - Everything else (phones, reduced motion, no WebGL, the scene failing):
    the same curve in SVG with the four stops as cards below. No pinning.
*/

const LoopScene = lazy(() => import('./loop/LoopScene.jsx'))

const WIDE = '(min-width: 1024px)'
const EASE = [0.22, 1, 0.36, 1]

function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
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

/* A scene that cannot start hands the section to the SVG build. */
class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/* Arrive out of focus and settle. */
const settle = {
  initial: { opacity: 0, y: 12, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: 0.8, ease: EASE }
}

const pad2 = (n) => String(n).padStart(2, '0')
const clamp01 = (x) => Math.min(1, Math.max(0, x))

function Heading() {
  return (
    <h2 id="hl-title" className="stage-title hl-title">
      {TITLE.lead} <span className="stage-serif">{TITLE.serif}.</span>
    </h2>
  )
}

function Eyebrow() {
  return (
    <p className="stage-pill stage-mono hl-eyebrow">
      <span className="stage-dot" aria-hidden="true" />
      How I work
    </p>
  )
}

function Rehook({ on = true }) {
  return (
    <p className={`hl-rehook${on ? ' is-on' : ''}`}>
      <a href="#close" className="hl-rehook-link">
        {REHOOK}
        <span aria-hidden="true"> ↓</span>
      </a>
    </p>
  )
}

/* ---------- The 3D build ---------- */

function Pinned({ onFail }) {
  const track = useRef(null)
  const pin = useRef(null)
  const probe = useRef(null)
  const copy = useRef(null)
  const inPath = useRef(null)
  const outPath = useRef(null)
  const again = useRef(null)
  const labels = useRef([])
  const metrics = useRef({ ready: false, sx: 0, right: 0, cy: 0, H: 0 })
  const enter = useRef(0)
  const [active, setActive] = useState(-1)
  const [done, setDone] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const inView = useInView(track, { margin: '100px 0px' })

  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const { scrollYProgress: enterProgress } = useScroll({ target: track, offset: ['start end', 'start start'] })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const s = stopAt(headAt(p))
    setActive((prev) => (prev === s ? prev : s))
    const d = p > 0.9
    setDone((prev) => (prev === d ? prev : d))
  })
  useMotionValueEvent(enterProgress, 'change', (p) => {
    enter.current = p
  })

  useEffect(() => {
    enter.current = enterProgress.get()
    const measure = () => {
      if (!pin.current || !probe.current || !copy.current) return
      const base = pin.current.getBoundingClientRect()
      const c = copy.current.getBoundingClientRect()
      const mt = metrics.current
      mt.sx = probe.current.getBoundingClientRect().left - base.left
      mt.right = c.left - base.left
      mt.H = base.height
      mt.cy = base.height * 0.53
      mt.ready = true
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(pin.current)
    ro.observe(copy.current)
    return () => ro.disconnect()
  }, [enterProgress])

  // Called by the scene every frame with the projected tip and crossing:
  // the stream of light is redrawn to meet the tip wherever the (gently
  // tilting) loop puts it.
  const overlay = useRef({ labels: null, onFrame: null })
  useEffect(() => {
    overlay.current.labels = labels.current
    overlay.current.onFrame = ({ tip, mid, head, glow }) => {
      const mt = metrics.current
      const H = mt.H
      const sx = mt.sx
      const [tx, ty] = tip
      if (inPath.current) {
        inPath.current.setAttribute('d', `M${sx} -2 L${sx} ${ty - 150} C${sx} ${ty - 70} ${tx} ${ty - 80} ${tx} ${ty}`)
        inPath.current.style.strokeDashoffset = String(1 - clamp01(enter.current * 1.1))
      }
      if (outPath.current) {
        outPath.current.setAttribute('d', `M${tx} ${ty} C${tx} ${ty + 80} ${sx} ${ty + 70} ${sx} ${ty + 150} L${sx} ${H + 2}`)
        outPath.current.style.strokeDashoffset = String(1 - clamp01((head - 0.97) / 0.03) * clamp01((scrollYProgress.get() - 0.88) / 0.1))
      }
      if (again.current) {
        again.current.style.transform = `translate3d(${mid[0].toFixed(1)}px, ${mid[1].toFixed(1)}px, 0)`
        again.current.style.opacity = String(glow)
      }
    }
  }, [scrollYProgress])

  const card = Math.max(0, active)

  return (
    <div className="hl-track" ref={track}>
      <div className="hl-pin" ref={pin}>
        <div className="stage-glow hl-glow" aria-hidden="true" />
        <span className="hl-probe" ref={probe} aria-hidden="true" />

        <svg className="hl-stream" aria-hidden="true">
          <path ref={inPath} pathLength="1" className="hl-stream-path" />
          <path ref={outPath} pathLength="1" className="hl-stream-path" />
        </svg>

        <div className={`hl-scene${sceneReady ? ' is-ready' : ''}`} aria-hidden="true">
          <SceneBoundary onFail={onFail}>
            <Suspense fallback={null}>
              <LoopScene
                progress={scrollYProgress}
                overlay={overlay}
                metrics={metrics}
                active={inView}
                onReady={() => setSceneReady(true)}
              />
            </Suspense>
          </SceneBoundary>
        </div>

        <ol className={`hl-labels${sceneReady ? ' is-ready' : ''}`} aria-hidden="true">
          {STOPS.map((s, i) => (
            <li
              key={s.key}
              ref={(el) => (labels.current[i] = el)}
              className={`hl-label${STOP_TOP[i] ? ' is-top' : ' is-bottom'}${i <= active ? ' is-lit' : ''}${i === active ? ' is-now' : ''}`}
            >
              <span className="hl-label-inner">
                <span className="stage-mono hl-label-idx">{pad2(i + 1)}</span>
                <span className="hl-label-name">{s.name}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="stage-mono hl-again" ref={again} aria-hidden="true">
          {AGAIN}
        </p>

        <div className="hl-layout">
          <m.div className="hl-copy" ref={copy} {...settle}>
            <Eyebrow />
            <Heading />
            <p className="stage-lede hl-lede">{LEDE}</p>

            <ol className="sr-only">
              {STOPS.map((s, i) => (
                <li key={s.key}>
                  {pad2(i + 1)} {s.name}: {s.text}
                </li>
              ))}
            </ol>

            <div className="stage-glass hl-card" aria-hidden="true">
              {STOPS.map((s, i) => (
                <div key={s.key} className={`hl-card-face${i === card ? ' is-on' : ''}${active < 0 ? ' is-waiting' : ''}`}>
                  <p className="stage-mono hl-card-count">
                    <span className="hl-card-now">{pad2(i + 1)}</span> / {pad2(STOPS.length)}
                  </p>
                  <h3 className="hl-card-title">{s.name}</h3>
                  <p className="hl-card-text">{s.text}</p>
                </div>
              ))}
            </div>

            <Rehook on={done} />
          </m.div>
        </div>
      </div>
    </div>
  )
}

/* ---------- The SVG build ---------- */

const VB_W = 1000
const VB_H = 400
const VB_PAD = 40

function Flat({ reduced }) {
  const fig = useRef(null)
  const dot = useRef(null)
  const halo = useRef(null)
  const d = useMemo(() => svgPath(VB_W, VB_H, VB_PAD), [])
  const pts = useMemo(() => STOP_U.map((u) => svgPoint(u, VB_W, VB_H, VB_PAD)), [])
  const [reached, setReached] = useState(reduced ? STOPS.length - 1 : -1)

  // The dot travels the curve while the figure crosses the screen.
  const { scrollYProgress } = useScroll({ target: fig, offset: ['start 85%', 'end 25%'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (reduced) return
    const u = clamp01(p)
    const pt = svgPoint(Math.min(u, 0.9999), VB_W, VB_H, VB_PAD)
    for (const el of [dot.current, halo.current]) {
      if (!el) continue
      el.setAttribute('cx', pt.x.toFixed(1))
      el.setAttribute('cy', pt.y.toFixed(1))
      el.style.opacity = u > 0.002 && u < 0.998 ? '1' : '0'
    }
    const s = stopAt(u)
    setReached((prev) => (prev === s ? prev : s))
  })

  const lit = (i) => reduced || i <= reached

  return (
    <div className="container hl-flat">
      <div className="stage-glow hl-flat-glow" aria-hidden="true" />
      <m.div className="hl-flat-head" {...settle}>
        <Eyebrow />
        <Heading />
        <p className="stage-lede hl-lede">{LEDE}</p>
      </m.div>

      <figure className="hl-figure" ref={fig} aria-hidden="true">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="hl-figure-svg">
          <defs>
            <filter id="hl-glow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={d} className="hl-figure-glass" />
          <path d={d} className="hl-figure-line" filter="url(#hl-glow)" />
          {pts.map((p, i) => (
            <g key={i} className={`hl-figure-stop${lit(i) ? ' is-lit' : ''}`}>
              <circle cx={p.x} cy={p.y} r="16" className="hl-figure-halo" />
              <circle cx={p.x} cy={p.y} r="7" className="hl-figure-dot" />
            </g>
          ))}
          {!reduced && (
            <>
              <circle ref={halo} r="20" className="hl-figure-head-halo" style={{ opacity: 0 }} />
              <circle ref={dot} r="6" className="hl-figure-head" style={{ opacity: 0 }} />
            </>
          )}
        </svg>
        {pts.map((p, i) => (
          <span
            key={STOPS[i].key}
            className={`hl-figure-label${STOP_TOP[i] ? ' is-top' : ' is-bottom'}${lit(i) ? ' is-lit' : ''}`}
            style={{ left: `${(p.x / VB_W) * 100}%`, top: `${(p.y / VB_H) * 100}%` }}
          >
            <span className="stage-mono">{pad2(i + 1)}</span> {STOPS[i].name}
          </span>
        ))}
      </figure>

      <ol className="hl-cards">
        {STOPS.map((s, i) => (
          <m.li key={s.key} className={`stage-glass hl-flat-card${lit(i) ? ' is-lit' : ''}`} {...settle} transition={{ ...settle.transition, delay: i * 0.06 }}>
            <p className="stage-mono hl-card-count">
              <span className="hl-card-now">{pad2(i + 1)}</span> / {pad2(STOPS.length)}
            </p>
            <h3 className="hl-card-title">{s.name}</h3>
            <p className="hl-card-text">{s.text}</p>
          </m.li>
        ))}
      </ol>

      <Rehook />
    </div>
  )
}

export default function HowLoop() {
  const wide = useMedia(WIDE)
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const use3D = wide && !reduced && !failed && hasWebGL()

  return (
    <section id="how" className={`stage hl${use3D ? ' is-3d' : ' is-flat'}`} aria-labelledby="hl-title">
      {use3D ? <Pinned onFail={() => setFailed(true)} /> : <Flat reduced={!!reduced} />}
      {!use3D && <span className="hl-stream-static" aria-hidden="true" />}
    </section>
  )
}
