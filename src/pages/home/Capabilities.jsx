import { capabilities } from '../../data.js'

/* ---------------------------------------------------------------
   2b — Capabilities. The hero names the four areas; this is where
   they get said properly, with the blurb and the concrete items that
   were already sitting unused in data.js.
   --------------------------------------------------------------- */
export default function Capabilities() {
  return (
    <section className="caps">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">What I can help you with</p>
            <h2 className="split-title">Four things, done properly</h2>
          </div>
          <p className="split-lede">
            Most engagements touch two or three of these. The point is never
            the tool &mdash; it is the hour a week that stops being spent on
            copy-paste.
          </p>
        </div>

        <ul className="caps-grid">
          {capabilities.map((cap) => (
            <li key={cap.index} className="caps-card">
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
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
