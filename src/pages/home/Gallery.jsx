import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'

/* ---------------------------------------------------------------
   5 — Closing CTA, optionally over a fanned arc of the real case studies.

   The arc fans the real builds themselves — index, title and stack, all
   of it real copy already on the site — so the decoration carries the
   same argument as the section it sits behind.

   It only renders when there are enough builds to read as a curve (see
   ARC_MIN). With fewer, a "fan" of one or two cards reads as a broken or
   ghosted layout rather than a flourish, so the section falls back to the
   clean closing CTA — which, being the point of the section, stands fine
   on its own. The cards are `aria-hidden` because every one of them is
   stated again in the Selected Work band above.
   --------------------------------------------------------------- */
/* Degrees between adjacent cards around the arc. Tuned so a small
   handful of cards still spread into a legible curve. */
const ARC_STEP = 26

/* An arc needs at least this many cards to read as a curve. Below it,
   the fan collapses into a sparse cluster behind the headline, so the
   stage is dropped entirely and only the CTA renders. */
const ARC_MIN = 3

/*
  Drives `--open` on the stage straight from scroll position: 0 while the
  section is still below the fold, 1 once it has risen into view. The arc
  uses it to spread and curve, so the section assembles itself as you
  arrive at it.

  Written to the DOM node rather than held in React state on purpose — a
  setState per scroll frame would re-render every card continuously for
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
  const slots = projects
  const showArc = slots.length >= ARC_MIN
  const mid = (slots.length - 1) / 2
  const stageRef = useRef(null)
  // Safe to call unconditionally: with the stage unrendered the ref is
  // null and the hook no-ops.
  useArcOpen(stageRef)

  return (
    <section className="gallery">
      {showArc && (
      <div className="gallery-stage" ref={stageRef} aria-hidden="true">
        <div className="gallery-fan">
          {slots.map((project, i) => {
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
              <div className="gallery-slot" key={project.slug} style={style}>
                <span className="gallery-card-index">{project.index}</span>
                <span className="gallery-card-title">{project.title}</span>
                <span className="gallery-card-stack">
                  {project.stack.slice(0, 3).join(' · ')}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      )}

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
