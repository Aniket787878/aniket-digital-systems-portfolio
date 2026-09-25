import { useRef } from 'react'
import { m, useScroll, useTransform, useReducedMotion } from 'motion/react'
import { process, images } from '../../data.js'
import Media from '../../components/Media.jsx'
import { fadeLeft, reveal, revealStagger } from '../../motion/variants.js'

/* ---------------------------------------------------------------
   3 — Process. The "plan" showcase, built as a timeline.

   A spine runs down the left; its accent fill is drawn by scroll. A node
   sits at each step, and each node lights up the moment the fill reaches
   it — so the plan doesn't just fade in, it assembles, step by step, as you
   read down it. The steps themselves also slide in from the left, staggered,
   as the band enters.

   Fill and nodes share one scroll progress value, so they stay in lockstep.
   The nodes live on the spine (not inside the step rows) — evenly spaced to
   pair with the four steps — which keeps them clear of the alternating row
   fills and off the section's left edge. Under reduced motion the spine is
   shown full and every node lit: the finished state, no movement.
   --------------------------------------------------------------- */

const TRACK = 'rgba(255, 255, 255, 0.16)'
const ACCENT = '#f5871e'

function ProcessNode({ progress, threshold, top, reduce }) {
  // The node crosses from track-grey to accent over a short window as the
  // fill sweeps past it — a crisp activation, with a matching glow.
  const backgroundColor = useTransform(progress, [threshold - 0.05, threshold], [TRACK, ACCENT])
  const scale = useTransform(progress, [threshold - 0.05, threshold], [0.68, 1])
  const boxShadow = useTransform(
    progress,
    [threshold - 0.05, threshold],
    ['0 0 0 0 rgba(245,135,30,0)', '0 0 11px 1px rgba(245,135,30,0.55)']
  )
  return (
    <m.span
      className="process-dot"
      style={
        reduce
          ? { top: `${top}%`, backgroundColor: ACCENT }
          : { top: `${top}%`, backgroundColor, scale, boxShadow }
      }
    />
  )
}

export default function Process() {
  const listRef = useRef(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 82%', 'end 55%'],
  })
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1])
  const n = process.length

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
          <span className="process-spine" aria-hidden="true">
            <m.span
              className="process-spine-fill"
              style={{ scaleY: reduce ? 1 : fill }}
            />
            {process.map((step, i) => (
              <ProcessNode
                key={step.index}
                progress={scrollYProgress}
                threshold={(i + 0.6) / n}
                top={((i + 0.5) / n) * 100}
                reduce={reduce}
              />
            ))}
          </span>

          <m.ol className="process-steps" {...revealStagger}>
            {process.map((step) => (
              <m.li key={step.index} className="process-step" variants={fadeLeft}>
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
