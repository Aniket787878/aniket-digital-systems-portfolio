import { Component, Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useInView, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import {
  LAYERS,
  LEDE,
  NOTE,
  REHOOK,
  SCREEN_ALT,
  SCREEN_SRC_SMALL,
  TITLE,
  TOOLS,
  focusAt
} from './software/content.js'
import './stage.css'
import './software.css'

/*
  "Inside the software": the software showpiece. One real screen (the
  Shared Inbox demo) sits on three illustrated layers; as the visitor
  scrolls, the product comes apart like an exploded diagram, each layer
  takes its turn, then it snaps back together.

  Two builds of the same story:
  - Desktop (1024px+), motion allowed, WebGL available: a pinned 3D scene
    (software/Scene.jsx). It is React.lazy()'d, so three.js stays out of
    the main bundle; the heading, lede and labels are DOM beside it.
  - Everything else (phones, reduced motion, no WebGL, or the scene
    throwing): a static exploded stack drawn in CSS. No pinning.
*/

const Scene = lazy(() => import('./software/Scene.jsx'))

const WIDE = '(min-width: 1024px)'
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

/* Catches a scene that cannot start (no context, driver quirk) and hands
   the section over to the static build instead of leaving a hole. */
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

function Heading({ id }) {
  return (
    <h2 id={id} className="stage-title sw3-title">
      {TITLE.lead} <span className="stage-serif">{TITLE.serif}.</span>
    </h2>
  )
}

function Note() {
  return (
    <p className="stage-note">
      <span className="stage-dot" aria-hidden="true" />
      <span className="stage-mono">{NOTE}</span>
    </p>
  )
}

function Rehook() {
  return (
    <Link to={REHOOK.to} className="sw3-rehook">
      {REHOOK.label}
      <span aria-hidden="true"> →</span>
    </Link>
  )
}

/* ---------- The 3D build ---------- */

function Pinned({ onFail }) {
  const track = useRef(null)
  const pin = useRef(null)
  const frame = useRef(null)
  const labelList = useRef(null)
  const labels = useRef([])
  const metrics = useRef({ fx: 0, fw: 0, lx: 0, short: [], full: [] })
  const [focus, setFocus] = useState(-1)
  const [end, setEnd] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)
  const inView = useInView(track, { margin: '200px 0px' })

  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const f = focusAt(p)
    setFocus((prev) => (prev === f ? prev : f))
    const e = p > 0.8
    setEnd((prev) => (prev === e ? prev : e))
  })

  // The scene reads these every frame: where the free space between the
  // copy and the labels is (to centre and fit the product), where the
  // labels start (for the leader lines) and how tall each label is.
  useEffect(() => {
    const measure = () => {
      if (!pin.current || !frame.current || !labelList.current) return
      const base = pin.current.getBoundingClientRect()
      const f = frame.current.getBoundingClientRect()
      const l = labelList.current.getBoundingClientRect()
      metrics.current.fx = f.left - base.left + f.width / 2
      metrics.current.fw = f.width
      metrics.current.lx = l.left - base.left
      // Closed and opened heights: the inner block's scrollHeight is its
      // full content even while the row is collapsed to zero.
      metrics.current.short = labels.current.map((el) => (el ? el.querySelector('.sw3-label-title').offsetHeight : 28))
      metrics.current.full = labels.current.map((el, i) =>
        el ? metrics.current.short[i] + el.querySelector('.sw3-label-inner').scrollHeight : 80
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(pin.current)
    labels.current.forEach((el) => el && ro.observe(el))
    return () => ro.disconnect()
  }, [])

  return (
    <div className="sw3-track" ref={track}>
      <div className="sw3-pin" ref={pin}>
        <div className="stage-glow" aria-hidden="true" />
        <div className="sw3-scene" aria-hidden="true">
          {/* The real screen capture, centred, while the three.js chunk
              downloads and the scene renders its first frame; the pinned
              layout otherwise opens onto a blank canvas for a beat. */}
          <div className={`sw3-preload${sceneReady ? ' is-done' : ''}`}>
            <div className="sw3-preload-plate">
              <PlateArt kind="screen" />
            </div>
          </div>
          <SceneBoundary onFail={onFail}>
            <Suspense fallback={null}>
              <Scene
                progress={scrollYProgress}
                labels={labels}
                metrics={metrics}
                active={inView}
                onReady={() => setSceneReady(true)}
              />
            </Suspense>
          </SceneBoundary>
        </div>

        <div className="sw3-layout">
          <div className="sw3-copy">
            <p className="stage-pill stage-mono sw3-eyebrow">
              <span className="stage-dot" aria-hidden="true" />
              Inside the software
            </p>
            <Heading id="sw3-title" />
            <p className="stage-lede sw3-lede">{LEDE}</p>
            <Note />
            <p className={`sw3-rehook-wrap${end ? ' is-on' : ''}`}>
              <Rehook />
            </p>
          </div>
          <div className="sw3-frame" ref={frame} aria-hidden="true" />
          <ol className="sw3-labels" ref={labelList}>
            {LAYERS.map((layer, i) => (
              <li
                key={layer.key}
                ref={(el) => (labels.current[i] = el)}
                className={`sw3-label${focus === i ? ' is-active' : ''}`}
              >
                <span className="stage-mono sw3-idx">0{i + 1}</span>
                <span className="sw3-label-body">
                  <span className="sw3-label-title">{layer.title}</span>
                  <span className="sw3-label-more">
                    <span className="sw3-label-inner">
                      {layer.lines.map((line) => (
                        <span key={line} className="sw3-line">
                          {line}
                        </span>
                      ))}
                    </span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

/* ---------- The static build ---------- */

function PlateArt({ kind }) {
  if (kind === 'screen') {
    return (
      <img
        src={SCREEN_SRC_SMALL}
        alt={SCREEN_ALT}
        width="1200"
        height="750"
        loading="lazy"
        decoding="async"
        className="sw3-plate-img"
      />
    )
  }
  if (kind === 'rules') {
    return (
      <svg viewBox="0 0 320 200" className="sw3-plate-svg" aria-hidden="true">
        <g fill="none" stroke="#f5871e" strokeWidth="1.6" strokeOpacity="0.7">
          <path d="M40 50 C 90 40, 110 95, 150 100" />
          <path d="M40 150 C 90 160, 110 105, 150 100" />
          <path d="M150 100 C 190 60, 210 50, 240 48" />
          <path d="M150 100 C 190 140, 210 152, 240 152" />
          <path d="M240 48 C 270 60, 280 90, 285 100" />
          <path d="M240 152 C 270 140, 280 110, 285 100" />
        </g>
        <g fill="#ffc89a">
          {[[40, 50], [40, 150], [150, 100], [240, 48], [240, 152], [285, 100]].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="12" fill="#f5871e" fillOpacity="0.16" />
              <circle cx={x} cy={y} r="5" />
            </g>
          ))}
        </g>
      </svg>
    )
  }
  if (kind === 'records') {
    return (
      <div className="sw3-cards" aria-hidden="true">
        {Array.from({ length: 15 }, (_, i) => (
          <span key={i} className={`sw3-card${i % 5 === 2 && i < 10 ? ' is-new' : ''}`} />
        ))}
      </div>
    )
  }
  return (
    <div className="sw3-ports" aria-hidden="true">
      {TOOLS.map((t) => (
        <span key={t} className="sw3-port">
          <span className="sw3-socket" />
          <span className="sw3-cable" />
          <span className="sw3-tile">{t}</span>
        </span>
      ))}
    </div>
  )
}

function StaticStack() {
  return (
    <div className="container sw3-static">
      <div className="stage-glow" aria-hidden="true" />
      <div className="sw3-static-head">
        <p className="stage-pill stage-mono sw3-eyebrow">
          <span className="stage-dot" aria-hidden="true" />
          Inside the software
        </p>
        <Heading id="sw3-title" />
        <p className="stage-lede sw3-lede">{LEDE}</p>
      </div>

      <ol className="sw3-stack">
        {LAYERS.map((layer, i) => (
          <li key={layer.key} className={`sw3-layer sw3-layer--${layer.key}`}>
            <div className="sw3-plate-wrap">
              <div className="sw3-plate">
                <PlateArt kind={layer.key} />
              </div>
            </div>
            <div className="sw3-layer-text">
              <span className="stage-mono sw3-idx">0{i + 1}</span>
              <h3 className="sw3-layer-title">{layer.title}</h3>
              <ul className="sw3-layer-lines">
                {layer.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="sw3-static-foot">
        <Note />
        <p className="sw3-rehook-wrap is-on">
          <Rehook />
        </p>
      </div>
    </div>
  )
}

export default function SoftwareShowcase() {
  const wide = useMedia(WIDE)
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const use3D = wide && !reduced && !failed && hasWebGL()

  return (
    <section className={`stage sw3${use3D ? ' is-3d' : ' is-static'}`} aria-labelledby="sw3-title">
      {use3D ? <Pinned onFail={() => setFailed(true)} /> : <StaticStack />}
    </section>
  )
}
