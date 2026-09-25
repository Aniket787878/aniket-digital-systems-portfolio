import { useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { process, images } from '../../data.js'
import Media from '../../components/Media.jsx'
import { fadeLeft, reveal, revealStagger } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   3 — Process. The "plan" showcase.

   Two motions layer here. The steps slide in from the left, staggered,
   as the band enters. And a spine down the left edge draws itself with
   scroll — a fill that tracks how far through the section you are, so the
   plan literally assembles as you read it.

   Hovering a row still fills it with the accent and, if a photograph has
   been set for that step, slides it in from the right (see HomePage.css).
   The reveal animation never touches those transitions — it runs on the
   list items, the hover runs on the row, and they do not collide.
   --------------------------------------------------------------- */
export default function Process() {
  const listRef = useRef(null)
  const reduce = useReducedMotion()

  // Draw the spine from when the list reaches 82% down the viewport until
  // its end passes the middle — the fill finishes as you reach the last step.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 82%', 'end 55%'],
  })
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section className="process">
      <div className="container">
        <m.div className="split-head" {...reveal}>
          <div>
            <p className="kicker">Step-by-Step</p>
            <h2 className="split-title">How a build actually goes</h2>
          </div>
          <p className="split-lede">
            I don&rsquo;t start with the tool. I start with how the work happens
            today, and where the friction actually is.
          </p>
        </m.div>

        <div className="process-steps-wrap" ref={listRef}>
          {/* The spine: a faint track with an accent fill that grows on
              scroll. aria-hidden — it is a visual echo of the numbered list
              beside it, which is the real content. Held static (full) under
              reduced motion. */}
          <span className="process-spine" aria-hidden="true">
            <m.span
              className="process-spine-fill"
              style={{ scaleY: reduce ? 1 : fill }}
            />
          </span>

          <m.ol className="process-steps" {...revealStagger}>
            {process.map((step) => (
              <m.li key={step.index} className="process-step" variants={fadeLeft}>
                <span className="process-rule" aria-hidden="true" />
                <span className="process-index">{step.index}</span>
                <h3 className="process-title">{step.title}</h3>
                <p className="process-text">{step.text}</p>
                {images.process[step.key] && (
                  <Media
                    className="process-media"
                    src={images.process[step.key]}
                    label={step.title}
                    alt=""
                  />
                )}
              </m.li>
            ))}
          </m.ol>
        </div>
      </div>
    </section>
  )
}
