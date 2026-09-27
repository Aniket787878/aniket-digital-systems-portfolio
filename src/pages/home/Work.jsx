import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { projects, images } from '../../data.js'
import SystemDiagram from '../../components/SystemDiagram.jsx'
import { fadeUp, stagger, revealStagger } from '../../motion/variants.js'
import { spotlightMove } from '../../motion/interactions.js'
import SplitText from '../../motion/SplitText.jsx'

/* ---------------------------------------------------------------
   2 — Selected work. Real case studies, each headed by a schematic
   of the system it describes; the card is the link.
   --------------------------------------------------------------- */
export default function Work() {
  return (
    <section className="work">
      <div className="container">
        <m.div className="split-head" {...revealStagger}>
          <m.div variants={stagger}>
            <m.p className="kicker" variants={fadeUp}>Selected Work</m.p>
            <SplitText
              as="h2"
              className="split-title"
              text="Problems, turned into systems"
              standalone={false}
            />
          </m.div>
          <m.p className="split-lede" variants={fadeUp}>
            Production systems built and shipped end to end by one person — the
            app, the backend, the payments, the AI and the infrastructure. The
            client systems run real businesses every day; Signet, Relay and
            Prospector are tools I built to work the same ideas in the open.
          </m.p>
        </m.div>

        {/* The first card is featured full-width in a horizontal split, which
            leads with the flagship real-client system and — not incidentally —
            resolves the orphan an odd number of cards would leave in a plain
            two-column grid (5 cards → 2 + 2 + 1). */}
        <m.ul className="work-grid" {...revealStagger}>
          {projects.map((project, i) => {
            const featured = i === 0
            /* The three self-built tools have real screenshots of their
               running UI in data.js (images.projects); the two client
               platforms do not — client records can't be shown — so those
               keep the honest schematic. */
            const shot = images.projects[project.slug]
            return (
              <m.li
                key={project.slug}
                className={`work-item${featured ? ' work-item-featured' : ''}`}
                variants={fadeUp}
              >
                <Link
                  to={`/projects/${project.slug}`}
                  className={`work-card spotlight${featured ? ' work-card-featured' : ''}`}
                  onPointerMove={spotlightMove}
                >
                  {shot ? (
                    <div className="media work-media">
                      <img
                        src={shot}
                        alt=""
                        className="media-img"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <SystemDiagram className="work-media" variant={project.diagram} />
                  )}
                  <div className="work-body">
                    <div className="work-meta">
                      <span className="work-index">{project.index}</span>
                      {featured && <span className="work-tag work-tag-flag">Flagship build</span>}
                      {project.private && (
                        <span className="work-tag">Private client</span>
                      )}
                      {/* Optional, like every other field in data.js — an entry with
                          no stated timeline rendered an empty pill here. ProjectsPage
                          already guarded it; this did not. */}
                      {project.timeline && (
                        <span className="work-tag">{project.timeline}</span>
                      )}
                    </div>
                    <h3 className="work-title">{project.title}</h3>
                    <p className="work-summary">{project.summary}</p>
                    <span className="arrow-link">
                      View system
                      <span className="arrow" aria-hidden="true">
                        &rarr;
                      </span>
                    </span>
                  </div>
                </Link>
              </m.li>
            )
          })}
        </m.ul>
      </div>
    </section>
  )
}
