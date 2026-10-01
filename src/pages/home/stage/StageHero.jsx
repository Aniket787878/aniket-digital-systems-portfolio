import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  m,
  useInView,
  useMotionValueEvent,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'motion/react'
import '../../service/showcase/stage.css'
import './hero/hero.css'
import { site, whatsappPrefill, explainers, explainersReady } from '../../../data.js'
import WhatsAppCta from '../../../components/WhatsAppCta.jsx'
import BookingCta from '../../../components/BookingCta.jsx'
import VideoDialog from '../../../components/VideoDialog.jsx'
import { hasWhatsApp } from '../../../whatsapp.js'
import { hasBooking } from '../../../booking.js'
import { fx } from '../../../interactions/attrs.js'
import FlowWindow from './hero/FlowWindow.jsx'
import FlowList from './hero/FlowList.jsx'
import Glyph from './hero/glyphs.jsx'
import { FINAL, T } from './hero/flow.js'
import { useLoopClock, usePageVisible, useWide } from './hero/useStage.js'

const EASE = [0.22, 1, 0.36, 1]
const [LINE_1, LINE_2] = site.headline
/* "Software and AI that run the rest." closes on its one serif word. */
const LAST = LINE_2.lastIndexOf(' ')
const LINE_2_HEAD = LINE_2.slice(0, LAST)
const LINE_2_TAIL = LINE_2.slice(LAST + 1)

const FILM = explainers.brand

const settle = (delay) => ({
  initial: { opacity: 0, y: 12, filter: 'blur(10px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
  transition: { duration: 0.8, delay, ease: EASE }
})

/* ---------------------------------------------------------------
   The first screen (docs/ideas/relay-direction.md, section 1): the
   claim on the left; on the right a glass window, tilted in 3D, in
   which a recorded enquiry plays through from first message to an
   08:00 reminder. The saffron stream of light starts under the window
   and runs down the page from here.
   --------------------------------------------------------------- */
export default function StageHero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const wide = useWide()
  const visible = usePageVisible()
  const inView = useInView(ref, { amount: 0.15 })
  const [film, setFilm] = useState(null)

  // Wide screens: the window plays on its own clock beside the claim.
  // Phones: the list sits below the fold, so the scroll plays it instead,
  // one step per stretch of scrolling, and scrolling back rewinds it.
  const running = !reduce && wide && inView && visible
  const clock = useLoopClock(running, T.total)
  const listRef = useRef(null)
  const scrolled = useScrollClock(listRef, !reduce && !wide)
  const t = reduce ? FINAL : wide ? clock : scrolled

  return (
    <section
      ref={ref}
      className="stage sh"
      aria-labelledby="sh-title"
      style={{ '--glow-x': '66%', '--glow-y': '58%' }}
    >
      <div className="stage-glow sh-glow" aria-hidden="true" />

      <div className="container sh-grid">
        <div className="sh-copy">
          <m.p className="stage-pill stage-mono sh-pill" {...(reduce ? {} : settle(0))}>
            <span className="stage-dot" aria-hidden="true" />
            taking on projects
          </m.p>

          <h1 className="stage-title sh-title" id="sh-title">
            <m.span className="sh-line" {...(reduce ? {} : settle(0.1))}>
              {LINE_1}
            </m.span>{' '}
            <m.span className="sh-line" {...(reduce ? {} : settle(0.25))}>
              {LINE_2_HEAD} <span className="stage-serif">{LINE_2_TAIL}</span>
            </m.span>
          </h1>

          <m.p className="stage-lede sh-lede" {...(reduce ? {} : settle(0.4))}>
            {site.heroLede}
          </m.p>

          <m.div className="sh-actions" {...(reduce ? {} : settle(0.5))}>
            {/* Same rule as every primary button on the site: the booking
                link once it exists, else the free call on WhatsApp, else
                the contact page. */}
            {hasBooking ? (
              <BookingCta className="btn-saffron" magnet />
            ) : hasWhatsApp ? (
              <WhatsAppCta message={whatsappPrefill.audit} label="Book a free call" className="btn-saffron" magnet />
            ) : (
              <Link to="/contact" className="btn-saffron" {...fx('magnet')}>
                Book a free call
              </Link>
            )}
            {explainersReady && (
              <button type="button" className="sh-watch" onClick={() => setFilm(FILM)}>
                <span className="sh-watch-icon" aria-hidden="true">
                  <Glyph name="play" size={12} />
                </span>
                Watch a build &middot; 1 minute
              </button>
            )}
          </m.div>
          <m.p className="stage-mono sh-foot" {...(reduce ? {} : settle(0.6))}>
            free 15-minute call &middot; no obligation
          </m.p>
        </div>

        <figure className="sh-figure">
          <figcaption className="sr-only">
            A recorded test run of the AI front desk for a made-up physio clinic. A visitor writes in the website chat: “Hi, I
            would like to book an initial assessment for next Monday morning please.” The front desk reads the clinic’s diary
            and offers 09:00, 09:30 and 10:00 on Monday 5 October. The visitor replies “10:00 works.” It books Monday 5 October,
            10:00 to 10:45, logs the booking and prepares a reminder for 08:00.
          </figcaption>
          {wide && !reduce ? <TiltedWindow t={t} sectionRef={ref} /> : (
            <div aria-hidden="true" className="sh-flat" ref={listRef}>
              {wide ? <FlowWindow t={t} /> : <FlowList t={t} />}
            </div>
          )}
        </figure>
      </div>

      {wide && !reduce && <HeroStream sectionRef={ref} />}

      <VideoDialog film={film} onClose={() => setFilm(null)} />
    </section>
  )
}

/* The flow's time from the scroll: the list starts playing as its top
   comes up from the bottom of the screen and finishes, every step shown,
   once its bottom passes three-quarters of the way up. Rounded to 40ms so
   the list only re-renders when something in it can change. */
function useScrollClock(target, on) {
  const [t, setT] = useState(450)
  const { scrollYProgress } = useScroll({ target, offset: ['start 0.9', 'end 0.75'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => on && setT(Math.round((450 + p * (FINAL - 450)) / 40) * 40))
  return t
}

/* The window at rest: rotateX 10, rotateY -14, rotateZ 2. It follows
   the pointer by up to 4 degrees on a spring, and flattens towards
   rotateX 4 / rotateY -6 as the hero scrolls away. */
function TiltedWindow({ t, sectionRef }) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 70, damping: 18, mass: 0.6 })
  const sy = useSpring(py, { stiffness: 70, damping: 18, mass: 0.6 })
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const flat = useTransform(scrollYProgress, [0, 0.6], [0, 1], { clamp: true })

  const rotateX = useTransform([flat, sy], ([f, y]) => 10 + (4 - 10) * f - y * 4)
  const rotateY = useTransform([flat, sx], ([f, x]) => -14 + (-6 + 14) * f + x * 4)
  const rotateZ = useTransform(flat, [0, 1], [2, 0.5])

  useLayoutEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return undefined
    const move = (e) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 2)
      py.set((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [px, py])

  return (
    <m.div
      className="sh-persp"
      aria-hidden="true"
      initial={{ opacity: 0, y: 28, filter: 'blur(14px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
    >
      <m.div className="sh-tilt" style={{ rotateX, rotateY, rotateZ }}>
        <FlowWindow t={t} />
      </m.div>
    </m.div>
  )
}

/* The first segment of the stream of light: from under the window's
   bottom-left corner, a curve down to --stream-x, leaving the bottom of
   the hero where the next section picks it up. Measured, because the
   window's corner moves with the layout. */
function HeroStream({ sectionRef }) {
  const probe = useRef(null)
  const [geo, setGeo] = useState(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const pathLength = useTransform(scrollYProgress, [0, 0.5], [0.12, 1], { clamp: true })

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const measure = () => {
      const box = section.getBoundingClientRect()
      const win = section.querySelector('.sh-persp')
      if (!win || !probe.current) return
      const w = win.getBoundingClientRect()
      setGeo({
        w: box.width,
        h: box.height,
        sx: w.left - box.left + w.width * 0.06,
        sy: w.bottom - box.top - w.height * 0.06,
        ex: probe.current.getBoundingClientRect().left - box.left
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(section)
    return () => ro.disconnect()
  }, [sectionRef])

  let d = ''
  if (geo) {
    const { sx, sy, ex, h } = geo
    const mid = sy + (h - sy) * 0.55
    d = `M${sx} ${sy} C${sx} ${mid}, ${ex} ${sy + (h - sy) * 0.2}, ${ex} ${mid + (h - mid) * 0.35} L${ex} ${h}`
  }

  return (
    <div className="sh-stream" aria-hidden="true">
      <span className="sh-stream-probe" ref={probe} />
      {geo && (
        <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
          <m.path d={d} className="sh-stream-line" style={{ pathLength }} />
          <circle cx={geo.sx} cy={geo.sy} r="9" className="sh-stream-ring" />
          <circle cx={geo.sx} cy={geo.sy} r="2.5" className="sh-stream-node" />
        </svg>
      )}
    </div>
  )
}
