import { m, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'

const FAR = ridge({ seed: 29, base: 250, amp: 70, detail: 0.9 })
const NEAR = ridge({ seed: 47, base: 320, amp: 45, detail: 1.2 })
const STARS = starField(26, 5)

/* ---------------------------------------------------------------
   The About portrait. Renders `founder.photo` when it is set (see the
   comment on `photo` in data.js for the one-line swap). Until then it
   shows a dusk card with a monogram: the site's own ridges and sky, the
   initial rising between them. It is drawn, not photographed, so it can
   never be mistaken for a headshot, and it carries no stock face.

   On a fine pointer the ridges drift a few pixels against the cursor,
   the same parallax idea as the home hero. Skipped under reduced motion
   and on touch (pointer events never fire the move handler there).
   --------------------------------------------------------------- */
export default function Portrait({ photo, name, role, basedIn }) {
  const reduce = useReducedMotion()
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 120, damping: 20 })
  const sy = useSpring(py, { stiffness: 120, damping: 20 })
  const farX = useTransform(sx, (v) => v * -6)
  const nearX = useTransform(sx, (v) => v * -14)
  const markX = useTransform(sx, (v) => v * -9)
  const markY = useTransform(sy, (v) => v * -6)

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <figure
      className={`about-portrait${photo ? ' has-photo' : ''}`}
      onPointerMove={photo ? undefined : onMove}
      onPointerLeave={photo ? undefined : onLeave}
    >
      {photo ? (
        <img
          className="about-portrait-img"
          src={photo}
          srcSet={`${photo.replace(/\.jpg$/, '-560.jpg')} 560w, ${photo} 1120w`}
          sizes="(max-width: 760px) 92vw, 27rem"
          width="1120"
          height="1400"
          alt={`${name}, ${role.toLowerCase()}`}
        />
      ) : (
        <div className="about-portrait-art" role="img" aria-label={`${name}: monogram over a dusk ridge`}>
          <div className="about-portrait-sky" aria-hidden="true">
            {STARS.map((s) => (
              <i
                key={s.id}
                style={{ left: `${s.x}%`, top: `${s.y * 0.8}%`, width: s.r, height: s.r, opacity: s.o }}
              />
            ))}
            <span className="about-portrait-sun" />
          </div>
          <m.div className="about-portrait-layer about-portrait-far" style={{ x: farX }} aria-hidden="true">
            <Ridge d={FAR} fill="#3a1b0b" />
          </m.div>
          <m.span className="about-portrait-mark" style={{ x: markX, y: markY }} aria-hidden="true">
            {name.charAt(0)}
          </m.span>
          <m.div className="about-portrait-layer about-portrait-near" style={{ x: nearX }} aria-hidden="true">
            <Ridge d={NEAR} fill="var(--night)" />
          </m.div>
        </div>
      )}

      <figcaption className="about-portrait-caption">
        <span className="about-portrait-name">{name}</span>
        <span className="about-portrait-role">{role}</span>
        {basedIn && <span className="about-portrait-place">{basedIn}</span>}
      </figcaption>
    </figure>
  )
}
