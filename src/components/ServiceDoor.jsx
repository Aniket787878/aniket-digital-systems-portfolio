import { useId } from 'react'
import { Link } from 'react-router-dom'
import { fx } from '../interactions/attrs.js'
import { inCurrency } from '../currency.js'
import './ProjectCard.css'

/* ---------------------------------------------------------------
   One service area as a card that opens its page, drawn like a project
   card (ProjectCard.css, prefix pc-) so the two read as one family: the
   area's designed cover in the framed 16:9 well (data.js
   `services[].cover`, rendered from scripts/covers/service-<slug>.html),
   then one small label, the first headline line, the promise, where it
   starts and the cue. Nothing sits on the picture: the cover carries its
   own "Illustration" tag, and the label lives in the body.
   Used two at a time at the foot of each service page (OtherAreas) and
   by the old home Services band.
   --------------------------------------------------------------- */
export default function ServiceDoor({ area, currency }) {
  const uid = useId()
  const titleId = `${uid}-t`
  const ctaId = `${uid}-c`

  return (
    <Link to={area.path} className="pc pc-door" aria-labelledby={`${titleId} ${ctaId}`} {...fx('lerp', 'view')}>
      <div className="pc-media">
        <div className="pc-media-inner">
          {area.cover && (
            <img
              src={area.cover.src}
              alt={area.cover.alt}
              className="pc-fill"
              width="1600"
              height="900"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>
      <div className="pc-body">
        <p className="pc-meta">
          <span className="pc-label is-real">{area.name}</span>
        </p>
        <h3 className="pc-title" id={titleId}>
          {area.title[0]}
        </h3>
        <p className="pc-note">{area.promise}</p>
        <p className="pc-from">
          From <strong>{inCurrency(area.from, currency)}</strong>
        </p>
        <span className="pc-cta" id={ctaId}>
          Prices and proof
          <span className="pc-arrow" aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  )
}
