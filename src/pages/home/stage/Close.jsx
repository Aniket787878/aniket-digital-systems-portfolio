import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { m, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { StartCta, TalkCta } from '../../../components/FunnelCta.jsx'
import { svgPath } from './loop/lemniscate.js'
import '../../service/showcase/stage.css'
import './loop/loop.css'

/*
  The last band: the ask. The stream of light that left the ∞ above comes
  down the gutter, turns along the button row and wraps once around the
  primary button, so the whole page's line ends on the call.

  One primary ("Get started": website, software or AI, each with its own
  free plan) and one secondary (the call, see components/FunnelCta.jsx). Email lives on the contact page and footer.
*/

const WIDE = '(min-width: 1024px)'
const EASE = [0.22, 1, 0.36, 1]
const RING_GAP = 8
const RING_R = 20 // the button's 12px radius plus the gap

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

const settle = {
  initial: { opacity: 0, y: 12, filter: 'blur(10px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '0px 0px -10% 0px' },
  transition: { duration: 0.8, ease: EASE }
}

/* The ring alone (phones), or the stream from the top of the section into
   the ring (desktop). One path either way, so it draws as one line. */
function streamPath(g, withStream) {
  const x0 = g.left - RING_GAP
  const x1 = g.right + RING_GAP
  const y0 = g.top - RING_GAP
  const y1 = g.bottom + RING_GAP
  const r = Math.min(RING_R, (y1 - y0) / 2)
  const ring =
    `L${x1 - r} ${y1} A${r} ${r} 0 0 0 ${x1} ${y1 - r} L${x1} ${y0 + r} A${r} ${r} 0 0 0 ${x1 - r} ${y0} ` +
    `L${x0 + r} ${y0} A${r} ${r} 0 0 0 ${x0} ${y0 + r} L${x0} ${y1 - r} A${r} ${r} 0 0 0 ${x0 + r} ${y1}`
  if (!withStream) return `M${x0 + r} ${y1} ${ring}`
  const sx = g.sx
  const turn = Math.min(90, Math.max(30, (x0 - sx) / 3))
  return `M${sx} -2 L${sx} ${y1 - turn} Q${sx} ${y1} ${sx + turn} ${y1} L${x0 + r} ${y1} ${ring}`
}

export default function Close() {
  const wide = useMedia(WIDE)
  const reduced = useReducedMotion()
  const section = useRef(null)
  const probe = useRef(null)
  const primary = useRef(null)
  const path = useRef(null)
  const [geo, setGeo] = useState(null)
  const inf = useMemo(() => svgPath(1000, 400, 30), [])
  const remeasure = useRef(() => {})

  useEffect(() => {
    const measure = () => {
      if (!section.current || !primary.current || !probe.current) return
      const base = section.current.getBoundingClientRect()
      const b = primary.current.getBoundingClientRect()
      setGeo({
        w: base.width,
        h: base.height,
        sx: probe.current.getBoundingClientRect().left - base.left,
        left: b.left - base.left,
        right: b.right - base.left,
        top: b.top - base.top,
        bottom: b.bottom - base.top
      })
    }
    remeasure.current = measure
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(section.current)
    ro.observe(primary.current)
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [])

  // Desktop with motion: the line draws in as the band arrives. Phones and
  // reduced motion get it already drawn.
  const animate = wide && !reduced
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'start 15%'] })
  const draw = (p) => {
    if (path.current) path.current.style.strokeDashoffset = String(animate ? 1 - Math.min(1, Math.max(0, p)) : 0)
  }
  useMotionValueEvent(scrollYProgress, 'change', draw)
  useEffect(() => draw(scrollYProgress.get()))

  const glowY = geo ? `${(geo.top + geo.bottom) / 2}px` : '62%'

  return (
    <section id="close" ref={section} className="stage cl" aria-labelledby="cl-title" style={{ '--glow-y': glowY }}>
      <span className="cl-probe" ref={probe} aria-hidden="true" />
      <div className="stage-glow cl-glow" aria-hidden="true" />

      <svg className="cl-inf" viewBox="0 0 1000 400" aria-hidden="true">
        <defs>
          <mask id="cl-inf-mask" maskUnits="userSpaceOnUse" x="-50" y="-50" width="1100" height="500">
            <path d={inf} stroke="#fff" strokeWidth="46" fill="none" />
            <path d={inf} stroke="#000" strokeWidth="43.5" fill="none" />
          </mask>
        </defs>
        <rect x="-50" y="-50" width="1100" height="500" fill="#fff" fillOpacity="0.04" mask="url(#cl-inf-mask)" />
      </svg>

      {geo && (
        <svg className="cl-stream" width={geo.w} height={geo.h} aria-hidden="true">
          <path ref={path} pathLength="1" className="cl-stream-path" d={streamPath(geo, wide)} />
        </svg>
      )}

      <m.div className="container cl-inner" {...settle} onAnimationComplete={() => remeasure.current()}>
        <p className="stage-pill stage-mono cl-pill">
          <span className="stage-dot" aria-hidden="true" />
          Get started
        </p>
        <h2 id="cl-title" className="stage-title cl-title">
          Let&rsquo;s find your first <span className="stage-serif">leak.</span>
        </h2>
        <p className="stage-lede cl-lede">
          Pick a website, software or AI, and answer a few plain questions. You see straight away what fits,
          what it starts at and the next step. No call needed, no obligation.
        </p>
        <div className="cl-actions">
          <span className="cl-primary" ref={primary}>
            <StartCta placement="home-close" magnet />
          </span>
          <TalkCta placement="close-band" />
        </div>
      </m.div>
    </section>
  )
}
