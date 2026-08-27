import { process, images } from '../../data.js'
import Media from '../../components/Media.jsx'

/* ---------------------------------------------------------------
   3 — Process. Hovering a row fills it with the accent and slides
   an image in from the right. The image is decorative: every word
   of the step is readable without hovering anything.
   --------------------------------------------------------------- */
export default function Process() {
  return (
    <section className="process">
      <div className="container">
        <div className="split-head">
          <div>
            <p className="kicker">Step-by-Step</p>
            <h2 className="split-title">How a build actually goes</h2>
          </div>
          <p className="split-lede">
            I don&rsquo;t start with the tool. I start with how the work happens
            today, and where the friction actually is.
          </p>
        </div>

        <ol className="process-steps">
          {process.map((step) => (
            <li key={step.index} className="process-step">
              <span className="process-rule" aria-hidden="true" />
              <span className="process-index">{step.index}</span>
              <h3 className="process-title">{step.title}</h3>
              <p className="process-text">{step.text}</p>
              <Media
                className="process-media"
                src={images.process[step.key]}
                label={step.title}
                alt=""
              />
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
