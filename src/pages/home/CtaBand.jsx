import { Link } from 'react-router-dom'
import { site } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'

/* ---------------------------------------------------------------
   5b — CTA band. The reference breaks its long middle with a
   full-bleed colour block before the FAQ; this does the same job with
   the availability line, which is the most persuasive sentence on the
   page and was previously buried at the very bottom.
   --------------------------------------------------------------- */
export default function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <div className="cta-band-inner">
          <p className="kicker cta-band-kicker">Next step</p>
          <h2 className="cta-band-title">
            Tell me the part of the week you dread.
          </h2>
          <p className="cta-band-lede">{site.pricingAnchor}</p>
          <Link to="/contact" className="btn-pill cta-band-cta">
            Get in touch
            <span className="btn-pill-icon" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
          {site.availability && (
            <p className="cta-band-availability">{site.availability}</p>
          )}
        </div>
      </div>
    </section>
  )
}
