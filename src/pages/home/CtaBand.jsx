import { Link } from 'react-router-dom'
import { site, whatsappPrefill } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import { hasWhatsApp } from '../../whatsapp.js'

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
          <p className="kicker cta-band-kicker">Free automation audit</p>
          <h2 className="cta-band-title">
            Start with a free 20-minute audit.
          </h2>
          {/* A no-risk top-of-funnel offer (docs/research/06, gap G5): the
              audit gives them something useful whether or not they hire me,
              which lowers the bar to the first message. The price anchor
              stays, demoted to the sub-note below. */}
          <p className="cta-band-lede">
            We map the one process eating the most time and I tell you
            straight what could be automated, what it would take, and whether
            it is even worth doing &mdash; yours to keep, no obligation.
          </p>
          <div className="cta-band-actions">
            <WhatsAppCta
              message={whatsappPrefill.audit}
              label="Book a free audit"
              className="btn-pill cta-band-cta"
            />
            {hasWhatsApp ? (
              <Link to="/contact" className="arrow-link cta-band-alt">
                Or send a message
                <span className="arrow" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            ) : (
              <Link to="/contact" className="btn-pill cta-band-cta">
                Get in touch
                <span className="btn-pill-icon" aria-hidden="true">
                  <ArrowIcon />
                </span>
              </Link>
            )}
          </div>
          <p className="cta-band-anchor">{site.pricingAnchor}</p>
          {site.availability && (
            <p className="cta-band-availability">{site.availability}</p>
          )}
        </div>
      </div>
    </section>
  )
}
