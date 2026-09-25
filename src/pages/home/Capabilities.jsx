import { m } from 'motion/react'
import { capabilities } from '../../data.js'
import { fadeUp, reveal, revealStagger } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   2b — Capabilities. The hero names the four areas; this is where
   they get said properly, with the blurb and the concrete items that
   were already sitting unused in data.js.
   --------------------------------------------------------------- */
export default function Capabilities() {
  return (
    <section className="caps">
      <div className="container">
        <m.div className="split-head" {...reveal}>
          <div>
            <p className="kicker">What I can help you with</p>
            <h2 className="split-title">Four things, done properly</h2>
          </div>
          <p className="split-lede">
            Most engagements touch two or three of these. The point is never
            the tool &mdash; it is the hour a week that stops being spent on
            copy-paste.
          </p>
        </m.div>

        <m.ul className="caps-grid" {...revealStagger}>
          {capabilities.map((cap) => (
            <m.li key={cap.index} className="caps-card" variants={fadeUp}>
              <span className="caps-index">
                <span className="capability-hash" aria-hidden="true">
                  #
                </span>
                {cap.index}
              </span>
              <h3 className="caps-title">{cap.title}</h3>
              <p className="caps-blurb">{cap.blurb}</p>
              <ul className="caps-tags">
                {cap.items.map((item) => (
                  <li key={item} className="caps-tag">
                    {item}
                  </li>
                ))}
              </ul>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}
