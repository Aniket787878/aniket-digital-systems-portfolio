import { m } from 'motion/react'
import { capabilities } from '../../data.js'
import { fadeUp, stagger, revealStagger } from '../../motion/variants.js'
import { spotlightMove } from '../../motion/interactions.js'
import SplitText from '../../motion/SplitText.jsx'

/* ---------------------------------------------------------------
   2b — Capabilities. The hero names the four areas; this is where
   they get said properly, with the blurb and the concrete items that
   were already sitting unused in data.js.
   --------------------------------------------------------------- */
export default function Capabilities() {
  return (
    <section className="caps">
      <div className="container">
        <m.div className="split-head" {...revealStagger}>
          <m.div variants={stagger}>
            <m.p className="kicker" variants={fadeUp}>What I can help you with</m.p>
            <SplitText
              as="h2"
              className="split-title"
              text="Four things, done properly"
              standalone={false}
            />
          </m.div>
          <m.p className="split-lede" variants={fadeUp}>
            Most engagements touch two or three of these. The point is never
            the tool &mdash; it is the hour a week that stops being spent on
            copy-paste.
          </m.p>
        </m.div>

        <m.ul className="caps-grid" {...revealStagger}>
          {capabilities.map((cap) => (
            <m.li key={cap.index} className="caps-card spotlight" variants={fadeUp} onPointerMove={spotlightMove}>
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
