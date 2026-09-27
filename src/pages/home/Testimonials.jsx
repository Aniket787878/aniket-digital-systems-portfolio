import { m } from 'motion/react'
import { testimonials } from '../../data.js'
import { reveal } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   2b — Testimonials. A slot, not a fake (CLAUDE.md: no placeholder
   quotes). `testimonials` in data.js is empty, so this renders
   nothing at all; the moment a real, attributed quote lands there,
   the band appears between the work and the services.
   --------------------------------------------------------------- */
export default function Testimonials() {
  if (testimonials.length === 0) return null

  return (
    <section className="band voices">
      <div className="container">
        <m.header className="band-head" {...reveal}>
          <p className="kicker">In their words</p>
        </m.header>
        <ul className="voices-grid">
          {testimonials.map((t) => (
            <li key={`${t.name}-${t.business}`} className="voice">
              <blockquote>{t.quote}</blockquote>
              <p className="voice-by">
                <strong>{t.name}</strong>
                {t.role}
                {t.role && t.business ? ', ' : ''}
                {t.business}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
