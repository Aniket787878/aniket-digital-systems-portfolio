import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { projects, images, films } from '../../data.js'
import { fadeUp, stagger, revealStagger } from '../../motion/variants.js'
import { spotlightMove } from '../../motion/interactions.js'
import SplitText from '../../motion/SplitText.jsx'
import LoopVideo from '../../components/LoopVideo.jsx'

/* ---------------------------------------------------------------
   2 — Selected work, matched to the approved redesign concept.

   The split is honest, not cosmetic: the two client platforms have no
   shareable screenshots (client records), so their cards play a
   schematic film of the real flow, labelled as one on the card. The
   three self-built tools DO have real captures of their running UI, so
   their cards show a screenshot that plays a walkthrough on hover.
   --------------------------------------------------------------- */
export default function Work() {
  const platforms = projects.filter((p) => !images.projects[p.slug])
  const tools = projects.filter((p) => images.projects[p.slug])

  return (
    <section className="work">
      <div className="container">
        <m.div className="split-head" {...revealStagger}>
          <m.div variants={stagger}>
            <m.p className="kicker" variants={fadeUp}>Flagship builds</m.p>
            <SplitText
              as="h2"
              className="split-title"
              text="Two production platforms, built solo"
              standalone={false}
            />
          </m.div>
          <m.p className="split-lede" variants={fadeUp}>
            Not a service list &mdash; proof. The whole stack, from the
            client&rsquo;s screen to the self-hosted database, designed and
            shipped end to end by one person.
          </m.p>
        </m.div>

        <m.div className="work-flagships" {...revealStagger}>
          {platforms.map((project, i) => (
            <m.article
              key={project.slug}
              className={`work-flagship spotlight${i % 2 ? ' work-flagship-alt' : ''}`}
              onPointerMove={spotlightMove}
              variants={fadeUp}
            >
              <div className="work-flagship-body">
                <div className="work-meta">
                  <span className="work-index">{project.index}</span>
                  <span className="work-tag work-tag-flag">Production platform</span>
                </div>
                <h3 className="work-flagship-title">{project.title}</h3>
                <p className="work-flagship-summary">{project.summary}</p>

                {project.metrics && (
                  <div className="work-metrics">
                    {project.metrics.slice(0, 2).map((metric) => (
                      <div key={metric.label} className="work-metric">
                        <span className="work-metric-n">{metric.n}</span>
                        <span className="work-metric-label">{metric.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="work-stack">
                  {project.stack.slice(0, 6).map((tech) => (
                    <span key={tech} className="chip">{tech}</span>
                  ))}
                </div>

                <Link to={`/projects/${project.slug}`} className="arrow-link work-flagship-link">
                  Read the case study
                  <span className="arrow" aria-hidden="true">&rarr;</span>
                </Link>
              </div>

              <div className="work-flagship-panel">
                {films[project.slug] && (
                  <>
                    <span className="work-film-tag">
                      Schematic film &middot; client data never shown
                    </span>
                    <div className="work-film">
                      <LoopVideo
                        src={films[project.slug].src}
                        poster={films[project.slug].poster}
                        className="work-film-video"
                        label={`Schematic film of the ${project.title} flow`}
                      />
                    </div>
                  </>
                )}
                <span className="work-panel-label">The flow, end to end</span>
                <div className="work-flow">
                  {project.flow.map((stage) => (
                    <span key={stage} className="work-flow-stage">{stage}</span>
                  ))}
                </div>
              </div>
            </m.article>
          ))}
        </m.div>

        <m.div className="split-head work-tools-head" {...revealStagger}>
          <m.div variants={stagger}>
            <m.p className="kicker" variants={fadeUp}>Working demos</m.p>
            <SplitText
              as="h2"
              className="split-title"
              text="Tools I built to prove the mechanism"
              standalone={false}
            />
          </m.div>
          <m.p className="split-lede" variants={fadeUp}>
            Self-initiated, running apps &mdash; not mockups. Each card plays
            a walkthrough, and every frame of it is the real UI. Each rebuilds from
            scratch a thing the big platforms sell as a black box.
          </m.p>
        </m.div>

        <m.ul className="work-tools" {...revealStagger}>
          {tools.map((project) => (
            <m.li key={project.slug} className="work-tool-item" variants={fadeUp}>
              <Link
                to={`/projects/${project.slug}`}
                className="work-tool spotlight loop-video-host"
                onPointerMove={spotlightMove}
              >
                <div className="media work-tool-shot">
                  {films[project.slug]?.clip ? (
                    <LoopVideo
                      mode="hover"
                      src={films[project.slug].clip}
                      poster={films[project.slug].clipPoster}
                      className="media-img"
                    />
                  ) : (
                    <img
                      src={images.projects[project.slug]}
                      alt=""
                      className="media-img"
                      loading="lazy"
                    />
                  )}
                  <span className="work-tool-badge" aria-hidden="true">
                    <span className="work-tool-badge-dot" />
                    Real screens
                  </span>
                </div>
                <div className="work-tool-body">
                  <span className="work-tag">Working demo</span>
                  <h3 className="work-tool-title">{project.title}</h3>
                  <p className="work-tool-summary">{project.summary}</p>
                  <div className="work-stack">
                    {project.stack.slice(0, 3).map((tech) => (
                      <span key={tech} className="chip">{tech}</span>
                    ))}
                  </div>
                  <span className="arrow-link work-tool-link">
                    View the build
                    <span className="arrow" aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}
