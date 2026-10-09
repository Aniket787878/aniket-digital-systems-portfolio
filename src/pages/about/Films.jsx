import { useState } from 'react'
import { fx } from '../../interactions/attrs.js'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { projects, films } from '../../data.js'
import { revealStagger, reveal, fadeUp } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import VideoDialog from '../../components/VideoDialog.jsx'
import { PillLabel } from '../../components/ui.jsx'
import '../../components/ProjectCard.css'

/* ---------------------------------------------------------------
   The five project films, one tap each, drawn like the project cards
   (ProjectCard.css) on the paper ground: the poster is the project's
   designed cover (data.js `projects[].cover`) in a framed 16:9 well,
   with nothing laid over it (a play button on the picture covered the
   cover's own words at phone size), and the kind of film (data.js
   `films[slug].kind`) is a label in the card body. One "Watch the film"
   button in the body opens the film in the site's <dialog> player
   (muted, like every film on the site); the poster opens it too, as a
   mouse shortcut, so it stays out of the tab order. The text link goes
   to the case study.

   Phones get a swipeable row (scroll-snap inside its own box, so the
   page itself never scrolls sideways) instead of five stacked posters.
   --------------------------------------------------------------- */
const KIND = {
  real: { label: 'Working demo · real build', tone: 'real' },
  schematic: { label: 'Client platform · illustrated', tone: 'schematic' }
}

export default function Films() {
  const [film, setFilm] = useState(null)
  const withFilm = projects.filter((p) => films[p.slug])
  const play = (p, f, kind) => setFilm({ title: `${p.title} · ${kind.label}`, src: f.src, poster: f.poster })

  return (
    <section className="paper about-films" aria-labelledby="about-films-title">
      <div className="container">
        <m.header className="about-band-head" {...reveal}>
          <PillLabel icon="play">The work</PillLabel>
          <h2 className="h2" {...fx('split')} id="about-films-title">
            Five builds, each with a short film.
            <span className="soft">Real screens, or drawings where client records are private.</span>
          </h2>
        </m.header>

        <m.ul className="about-films-row" {...revealStagger}>
          {withFilm.map((p) => {
            const f = films[p.slug]
            const kind = KIND[f.kind] || KIND.schematic
            const poster = p.cover?.src || f.poster
            return (
              <m.li key={p.slug} className="about-film pc pc-paper" variants={fadeUp}>
                <button
                  type="button"
                  className="pc-media about-film-media"
                  onClick={() => play(p, f, kind)}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <span className="pc-media-inner">
                    <img src={poster} alt="" className="pc-fill" width="1600" height="900" loading="lazy" decoding="async" />
                  </span>
                </button>
                <div className="pc-body">
                  <p className="pc-meta">
                    <span className={`pc-label is-${kind.tone}`}>{kind.label}</span>
                  </p>
                  <h3 className="pc-title">{p.title}</h3>
                  <p className="pc-sub">{p.subtitle}</p>
                  <div className="about-film-actions">
                    <button
                      type="button"
                      className="about-film-watch"
                      onClick={() => play(p, f, kind)}
                      aria-label={`Watch the ${p.title} film (${kind.label.toLowerCase()})`}
                    >
                      <span className="about-film-watch-icon" aria-hidden="true">
                        <Icon name="play" size={10} />
                      </span>
                      Watch the film
                    </button>
                    <Link to={`/projects/${p.slug}`} className="pc-cta">
                      Case study
                      <span className="pc-arrow" aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </m.li>
            )
          })}
        </m.ul>
      </div>
      <VideoDialog film={film} onClose={() => setFilm(null)} />
    </section>
  )
}
