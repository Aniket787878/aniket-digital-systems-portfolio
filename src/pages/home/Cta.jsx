import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { site, whatsappPrefill } from '../../data.js'
import WhatsAppCta from '../../components/WhatsAppCta.jsx'
import { Ridge } from '../../components/dusk/Mountains.jsx'
import { ridge, starField } from '../../components/dusk/terrain.js'
import { hasWhatsApp } from '../../whatsapp.js'
import { reveal } from '../../motion/variants.js'

const FAR = ridge({ seed: 71, base: 190, amp: 55, detail: 0.8 })
const NEAR = ridge({ seed: 83, base: 270, amp: 40, detail: 1.1 })
const STARS = starField(40, 19)

/* ---------------------------------------------------------------
   6 — Closing call to action, back at dusk: the page ends where it
   began. The free audit is the ask (docs/research/06, gap G5).
   --------------------------------------------------------------- */
export default function Cta() {
  return (
    <section className="dusk-cta">
      <div className="dusk-sky dusk-sky-low" aria-hidden="true">
        <div className="dusk-stars">
          {STARS.map((s) => (
            <i
              key={s.id}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.o, animationDelay: `${s.d}s` }}
            />
          ))}
        </div>
        <div className="dusk-sun" />
      </div>
      <div className="dusk-layer dusk-far" aria-hidden="true">
        <Ridge d={FAR} fill="#3a1b0b" />
      </div>
      <div className="dusk-layer dusk-near" aria-hidden="true">
        <Ridge d={NEAR} fill="var(--night)" />
      </div>

      <m.div className="container dusk-cta-inner" {...reveal}>
        <p className="glass-pill">
          <span className="status-dot" aria-hidden="true" />
          Free 20-minute audit
        </p>
        <h2 className="dusk-title dusk-cta-title">
          Have a process
          <br />
          <span className="dusk-title-warm">that eats your week?</span>
        </h2>
        <p className="dusk-sub">
          We map the one process costing you the most time, and I tell you
          straight what automating it would take and whether it is worth doing.
        </p>
        <div className="dusk-actions">
          {hasWhatsApp ? (
            <WhatsAppCta message={whatsappPrefill.audit} label="Book the free audit" className="btn-saffron" />
          ) : (
            <Link to="/contact" className="btn-saffron">
              Book the free audit
            </Link>
          )}
          <Link to="/contact" className="btn-light">
            Send a message
          </Link>
        </div>
        <p className="dusk-footnote">{site.pricingAnchor}</p>
      </m.div>
    </section>
  )
}
