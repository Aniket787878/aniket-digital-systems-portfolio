import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  m,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent
} from 'motion/react'
import { screenTour, projects } from '../../data.js'
import Icon from '../../components/icons.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* The logical space every capture was taken in (CSS px; the PNGs are 2x). */
const VW = 1440
const VH = 900
const MAX_ZOOM = 2.2
const N = screenTour.length

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function zoomFor(spot) {
  return Math.max(1.12, Math.min(MAX_ZOOM, 0.8 * Math.min(VW / spot.w, VH / spot.h)))
}

/* Where the camera sits for a zoom `s` centred on `spot`, clamped so the
   capture always covers the window (no empty edges). */
function frameFor(spot, s) {
  const cx = spot.x + spot.w / 2
  const cy = spot.y + spot.h / 2
  const tx = Math.min(0, Math.max(VW - VW * s, VW / 2 - cx * s))
  const ty = Math.min(0, Math.max(VH - VH * s, VH / 2 - cy * s))
  return { tx, ty }
}

/*
  The whole choreography as a pure function of scroll progress. Each beat:
  wide and tilted → push in to the spot (spotlight rises) → hold → pull
  back out to wide. Beats meet at the wide frame, which is where the
  capture swaps, so a change of screen always reads as a cut on a
  pulled-back shot.
*/
function camera(v) {
  const pos = clamp01(v) * N * 0.99999
  const i = Math.floor(pos)
  const t = pos - i
  const spot = screenTour[i].spot
  const S = zoomFor(spot)
  const zin = easeInOut(clamp01((t - 0.06) / 0.34))
  const zout = easeInOut(clamp01((t - 0.74) / 0.26))
  const z = zin * (1 - zout)
  const s = 1 + (S - 1) * z
  const { tx, ty } = frameFor(spot, s)
  return { i, t, z, s, x: (tx / VW) * 100, y: (ty / VH) * 100 }
}

/* Where the caption card goes in the held (fully zoomed) frame: beside the
   spot if there is room, else below or above it, else over the corner. */
function calloutPlace(spot) {
  const S = zoomFor(spot)
  const { tx, ty } = frameFor(spot, S)
  const l = ((spot.x * S + tx) / VW) * 100
  const r = (((spot.x + spot.w) * S + tx) / VW) * 100
  const t = ((spot.y * S + ty) / VH) * 100
  const b = (((spot.y + spot.h) * S + ty) / VH) * 100
  const W = 31
  const H = 24
  const top = Math.min(100 - H - 4, Math.max(4, t))
  if (r + W + 3 < 97) return { left: `${r + 2.5}%`, top: `${top}%` }
  if (l - W - 3 > 3) return { left: `${l - W - 2.5}%`, top: `${top}%` }
  if (b + H + 4 < 97) return { left: `${Math.max(3, Math.min(97 - W, l))}%`, top: `${b + 3}%` }
  if (t - H - 4 > 3) return { left: `${Math.max(3, Math.min(97 - W, l))}%`, top: `${t - H - 3}%` }
  return { left: '3%', bottom: '4%' }
}

const FILES = [...new Set(screenTour.map((b) => b.file))]
const TOOLS = [...new Set(screenTour.map((b) => b.slug))]
const projectOf = (slug) => projects.find((p) => p.slug === slug)

/* ---------------------------------------------------------------
   2b — Product tour. A pinned stage: the real screens of the three
   working demos, filmed by a scroll-driven camera. It pushes in to
   each feature under a spotlight, explains it in a callout, pulls
   back out and glides on to the next. Desktop only, and never under
   reduced motion: there the demo cards in Work stand in (see CSS).
   --------------------------------------------------------------- */
export default function Tour() {
  const ref = useRef(null)
  const [idx, setIdx] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // A light spring on top of the scroll gives the camera weight: it eases
  // into a stop instead of halting on the exact pixel.
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 })

  const s = useTransform(p, (v) => camera(v).s)
  const x = useTransform(p, (v) => `${camera(v).x}%`)
  const y = useTransform(p, (v) => `${camera(v).y}%`)
  const dim = useTransform(p, (v) => camera(v).z)
  const tilt = useTransform(p, (v) => (1 - camera(v).z) * 9)
  const turn = useTransform(p, (v) => (1 - camera(v).z) * -5)
  const lift = useTransform(p, (v) => 0.94 + camera(v).z * 0.06)
  const callO = useTransform(p, (v) => {
    const { t } = camera(v)
    return clamp01((t - 0.36) / 0.08) * (1 - clamp01((t - 0.7) / 0.06))
  })
  const beatFill = useTransform(p, (v) => `${camera(v).t * 100}%`)

  useMotionValueEvent(p, 'change', (v) => {
    const next = camera(v).i
    if (next !== idx) setIdx(next)
  })

  const beat = screenTour[idx]
  const project = projectOf(beat.slug)
  const toolBeats = screenTour.filter((b) => b.slug === beat.slug)
  const nInTool = toolBeats.indexOf(beat) + 1

  return (
    <section className="tour night" ref={ref} aria-label="Product tour of three working demos">
      <div className="tour-pin">
        <div className="container tour-grid">
          <div className="tour-copy">
            <PillLabel icon="play" className="on-night">Working demos</PillLabel>
            <h2 className="h2">
              Watch them work.
              <br />
              <span className="soft">Real screens, real clicks.</span>
            </h2>

            <ul className="tour-tools">
              {TOOLS.map((slug) => {
                const pj = projectOf(slug)
                const on = slug === beat.slug
                return (
                  <li key={slug} className={on ? 'is-on' : ''}>
                    <span className="tour-tool-name">{pj.title}</span>
                    <span className="tour-tool-sub">{pj.subtitle}</span>
                  </li>
                )
              })}
            </ul>

            <div className="tour-caption" aria-live="polite">
              <AnimatePresence mode="wait">
                <m.p
                  key={idx}
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {beat.caption}
                </m.p>
              </AnimatePresence>
            </div>

            <div className="tour-progress" aria-hidden="true">
              {screenTour.map((b, i) => (
                <span
                  key={i}
                  className={`tour-bar${i < idx ? ' is-done' : ''}${
                    i > 0 && screenTour[i - 1].slug !== b.slug ? ' is-gap' : ''
                  }`}
                >
                  {i === idx && <m.i style={{ width: beatFill }} />}
                </span>
              ))}
            </div>

            <Link to={`/projects/${project.slug}`} className="text-link tour-link">
              See how the {project.title} was built <Icon name="arrow" size={16} />
            </Link>
          </div>

          <div className="tour-stage" aria-hidden="true">
            <m.div
              className="tour-window"
              style={{ rotateX: tilt, rotateY: turn, scale: lift, transformPerspective: 1800 }}
            >
              <div className="tour-bar-top">
                <span className="tour-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="tour-url">{beat.url}</span>
              </div>
              <div className="tour-view">
                <m.div className="tour-layer" style={{ x, y, scale: s }}>
                  {FILES.map((f) => (
                    <img
                      key={f}
                      src={f}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`tour-shot${f === beat.file ? ' is-on' : ''}`}
                    />
                  ))}
                  <m.span
                    className="tour-spot"
                    style={{
                      opacity: dim,
                      left: `${(beat.spot.x / VW) * 100}%`,
                      top: `${(beat.spot.y / VH) * 100}%`,
                      width: `${(beat.spot.w / VW) * 100}%`,
                      height: `${(beat.spot.h / VH) * 100}%`
                    }}
                  />
                </m.div>

                <m.div className="tour-callout" style={{ opacity: callO, ...calloutPlace(beat.spot) }}>
                  <span className="tour-callout-tag">
                    {project.title} &middot; {String(nInTool).padStart(2, '0')}/
                    {String(toolBeats.length).padStart(2, '0')}
                  </span>
                  <span className="tour-callout-text">{beat.caption}</span>
                </m.div>
              </div>
            </m.div>
            <p className="tour-note">Real screens from the running apps. Scroll to move the camera.</p>
          </div>
        </div>
      </div>

      <ol className="sr-only">
        {screenTour.map((b, i) => (
          <li key={i}>
            {projectOf(b.slug).title}: {b.caption}
          </li>
        ))}
      </ol>
    </section>
  )
}
