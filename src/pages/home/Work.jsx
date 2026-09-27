import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { projects, films } from '../../data.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import LoopVideo from '../../components/LoopVideo.jsx'
import Counter from '../../motion/Counter.jsx'
import Icon from '../../components/icons.jsx'
import { PillLabel, TickList } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   2 — Work, on the light ground. The two client platforms get the
   getstage-style feature row: the film on a saffron-tinted panel,
   the copy beside it with a tick list and real counts. The three
   working demos follow as cards that play real captures on hover.
   Every film says which kind it is (data.js `films`).
   --------------------------------------------------------------- */
export default function Work() {
  const platforms = projects.filter((p) => films[p.slug]?.kind === 'schematic')
  const tools = projects.filter((p) => films[p.slug]?.kind === 'real')

  return (
    <section className="paper work" id="work">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="layers">Work</PillLabel>
          <h2 className="h2">
            One platform in daily use, one in pre-launch.
            <br />
            <span className="soft">Three working tools, running now.</span>
          </h2>
        </m.header>

        <div className="rows">
          {platforms.map((project, i) => (
            <m.article
              key={project.slug}
              className={`row${i % 2 ? ' row-flip' : ''}`}
              {...reveal}
            >
              <Link to={`/projects/${project.slug}`} className="row-panel" aria-label={`${project.title} case study`}>
                <div className="row-frame">
                  <LoopVideo
                    src={films[project.slug].src}
                    poster={films[project.slug].poster}
                    className="row-video"
                  />
                </div>
                <span className="row-tag">Schematic film &middot; client data never shown</span>
              </Link>

              <div className="row-copy">
                <PillLabel icon={i === 0 ? 'calendar' : 'lock'}>{project.subtitle}</PillLabel>
                <h3 className="h3">{project.title}</h3>
                <p className="row-lede">{project.tagline}</p>
                <TickList items={project.highlights} />
                <dl className="row-facts">
                  {project.metrics.slice(0, 2).map((metric) => (
                    <div key={metric.label}>
                      <dt>{metric.label}</dt>
                      <dd>
                        <Counter value={metric.n} />
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link to={`/projects/${project.slug}`} className="text-link">
                  Read the case study <Icon name="arrow" size={16} />
                </Link>
              </div>
            </m.article>
          ))}
        </div>

        <m.ul className="cards" {...revealStagger}>
          {tools.map((project) => (
            <m.li key={project.slug} variants={fadeUp}>
              <Link to={`/projects/${project.slug}`} className="card loop-video-host">
                <div className="card-media">
                  <LoopVideo
                    mode="hover"
                    src={films[project.slug].framed}
                    poster={films[project.slug].framedPoster}
                    className="card-video"
                  />
                  <span className="card-badge">
                    <Icon name="play" size={10} /> Real screens
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-title">
                    <h3>{project.title}</h3>
                    <span>{project.subtitle}</span>
                  </div>
                  <p>{project.tagline}</p>
                  <span className="text-link">
                    View the build <Icon name="arrow" size={16} />
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
