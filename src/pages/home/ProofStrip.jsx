import { m } from 'motion/react'
import { stackMarquee } from '../../data.js'
import Marquee from '../../components/Marquee.jsx'
import { reveal } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   1b — "Built with" strip. A slow marquee of the stack the systems
   are actually built on, straight under the hero. It pauses on hover
   and stops (and wraps) under reduced motion — see .marquee.

   The honest version of a logo wall — no client logos to show yet,
   but the real toolset tells a technical buyer more than six greyed
   wordmarks would. Names come from proofTools in data.js.
   --------------------------------------------------------------- */
export default function ProofStrip() {
  return (
    <section className="builtwith">
      <m.div className="container builtwith-inner" {...reveal}>
        <span className="builtwith-label">Built with</span>
        <Marquee seconds={40}>
          {stackMarquee.map((tool) => (
            <span key={tool} className="builtwith-item">
              {tool}
            </span>
          ))}
        </Marquee>
      </m.div>
    </section>
  )
}
