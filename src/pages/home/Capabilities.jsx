import { m } from 'motion/react'
import { capabilities } from '../../data.js'
import { fadeUp, stagger, revealStagger } from '../../motion/variants.js'
import { spotlightMove } from '../../motion/interactions.js'
import SplitText from '../../motion/SplitText.jsx'

/* One line-icon per area, keyed by capability index. */
const ICONS = {
  '01': (
    <>
      <rect x="3" y="4" width="18" height="14" rx="2.5" />
      <path d="M3 9h18M8 13h3M8 16h6" />
    </>
  ),
  '02': (
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  '03': (
    <>
      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
    </>
  ),
  '04': (
    <>
      <path d="M4 19V5M4 19h16" />
      <path d="M7.5 15l3.5-4 3 2.5 5-6.5" />
    </>
  )
}

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
              <span className="caps-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[cap.index]}
                </svg>
              </span>
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
