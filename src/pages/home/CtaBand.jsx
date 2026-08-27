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
          <p className="kicker cta-band-kicker">Next step</p>
          <h2 className="cta-band-title">
            Tell me the part of the week you dread.
          </h2>
          <p className="cta-band-lede">{site.pricingAnchor}</p>
          <div className="cta-band-actions">
            <WhatsAppCta
              message={whatsappPrefill.cta}
              label="Message me on WhatsApp"
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
          {site.availability && (
            <p className="cta-band-availability">{site.availability}</p>
          )}
        </div>
      </div>
    </section>
  )
}
