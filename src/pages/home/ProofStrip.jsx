import { m } from 'motion/react'
import { proofTools } from '../../data.js'
import { reveal } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   1b — "Built with" strip. A quiet, static credential row straight
   under the hero, matching the redesign concept: no auto-scrolling
   marquee, just the stack the systems are actually built on.

   The honest version of a logo wall — no client logos to show yet,
   but the real toolset tells a technical buyer more than six greyed
   wordmarks would. Names come from proofTools in data.js.
   --------------------------------------------------------------- */
export default function ProofStrip() {
  return (
    <section className="builtwith">
      <m.div className="container builtwith-inner" {...reveal}>
        <span className="builtwith-label">Built with</span>
        <ul className="builtwith-list">
          {proofTools.map((tool) => (
            <li key={tool.name} className="builtwith-item">
              {tool.name}
            </li>
          ))}
        </ul>
      </m.div>
    </section>
  )
}
