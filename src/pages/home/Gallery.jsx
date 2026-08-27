import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { images } from '../../data.js'
import Media from '../../components/Media.jsx'
import ArrowIcon from '../../components/ArrowIcon.jsx'

/* ---------------------------------------------------------------
   5 — Closing CTA over a fanned strip of image slots. The strip is
   purely decorative; the heading and button carry the meaning.
   --------------------------------------------------------------- */
/* Degrees between adjacent cards around the arc. */
const ARC_STEP = 15

/*
  Drives `--open` on the stage straight from scroll position: 0 while the
  section is still below the fold, 1 once it has risen into view. The arc
  uses it to spread and curve, so the section assembles itself as you
  arrive at it.

  Written to the DOM node rather than held in React state on purpose — a
  setState per scroll frame would re-render eight cards continuously for
  what is a single custom property.
*/
function useArcOpen(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0

    const update = () => {
      frame = 0
      if (motion.matches) {
        el.style.setProperty('--open', '1')
        return
      }
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      // Fully open by the time the top edge has travelled 85% of a
      // viewport upward — the arc finishes settling before it is centred,
      // rather than still moving while you are reading the headline.
      const p = (vh - r.top) / (vh * 0.85)
      el.style.setProperty('--open', String(Math.min(1, Math.max(0, p))))
    }

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    motion.addEventListener('change', update)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      motion.removeEventListener('change', update)
    }
  }, [ref])
}

export default function Gallery() {
  const slots = images.gallery
  const mid = (slots.length - 1) / 2
  const stageRef = useRef(null)
  useArcOpen(stageRef)

  return (
    <section className="gallery">
      <div className="gallery-stage" ref={stageRef} aria-hidden="true">
        <div className="gallery-fan">
          {slots.map((src, i) => {
            /* Lay the cards on a cylinder that curves *towards* the
               viewer, so the outer ones come forward and read larger —
               the shape you get standing inside the curve rather than
               looking at the outside of it.

               sin/cos are resolved here because they only depend on the
               card's index, never on the radius. That leaves the radius
               itself free to stay a responsive CSS clamp, instead of
               being pinned to whatever the viewport was at mount. */
            const offset = i - mid
            const rad = (offset * ARC_STEP * Math.PI) / 180
            const style = {
              '--sin': Math.sin(rad).toFixed(4),
              // 1 - cos: depth measured from the arc's nearest point, so
              // the centre card sits flat on the section plane at z = 0.
              '--depth': (1 - Math.cos(rad)).toFixed(4),
              '--angle': `${-offset * ARC_STEP}deg`,
              // Nearer cards paint over farther ones.
              zIndex: Math.round(10 - Math.abs(offset) * 2)
            }
            return (
              <div className="gallery-slot" key={i} style={style}>
                <Media src={src} label={`Slot ${i + 1}`} alt="" />
              </div>
            )
          })}
        </div>
      </div>

      <div className="container gallery-content">
        <p className="kicker">Behind the systems</p>
        <h2 className="gallery-title">Curious what else I&rsquo;ve built?</h2>
        <p className="gallery-lede">
          The full set of booking flows, intake systems, dashboards and
          automations &mdash; with the problem each one started from.
        </p>
        <Link to="/projects" className="btn-pill gallery-cta">
          See more projects
          <span className="btn-pill-icon" aria-hidden="true">
            <ArrowIcon />
          </span>
        </Link>
      </div>
    </section>
  )
}
