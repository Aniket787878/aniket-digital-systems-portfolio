import { useState } from 'react'
import { fx } from '../../interactions/attrs.js'
import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { projects, films } from '../../data.js'
import { revealStagger, reveal, fadeUp } from '../../motion/variants.js'
import Icon from '../../components/icons.jsx'
import VideoDialog from '../../components/VideoDialog.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* ---------------------------------------------------------------
   The five project films, one tap each. The poster opens the film in
   the site's <dialog> player; the text link goes to the case study.
   Every card says which kind of film it is (data.js `films[slug].kind`):
   real captures of the working demos, schematics of the two client
   platforms whose real screens hold client records.

   Phones get a swipeable row (scroll-snap inside its own box, so the
   page itself never scrolls sideways) instead of five stacked posters.
   --------------------------------------------------------------- */
export default function Films() {
  const [film, setFilm] = useState(null)
  const withFilm = projects.filter((p) => films[p.slug])

  return (
    <section className="paper about-films" aria-labelledby="about-films-title">
      <div className="container">
        <m.header className="about-band-head" {...reveal}>
          <PillLabel icon="play">The work</PillLabel>
          <h2 className="h2" {...fx('split')} id="about-films-title">
            Five builds, on film.
            <span className="soft">Real screens, or drawings where client records are private.</span>
          </h2>
        </m.header>

        <m.ul className="about-films-row" {...revealStagger}>
          {withFilm.map((p) => {
            const f = films[p.slug]
            const kind = f.kind === 'real' ? 'Real screens' : 'Illustrated film'
            return (
              <m.li key={p.slug} className="about-film" variants={fadeUp}>
                <button
                  type="button"
                  className="about-film-media"
                  onClick={() => setFilm({ title: `${p.title} · ${kind}`, src: f.src, poster: f.poster })}
                  aria-label={`Play the ${p.title} film (${kind.toLowerCase()})`}
                >
                  <img src={f.poster} alt="" loading="lazy" />
                  <span className="about-film-play" aria-hidden="true">
                    <Icon name="play" size={16} />
                  </span>
                  <span className={`about-film-kind is-${f.kind}`} aria-hidden="true">
                    {kind}
                  </span>
                </button>
                <div className="about-film-body">
                  <h3>{p.title}</h3>
                  <p>{p.subtitle}</p>
                  <Link to={`/projects/${p.slug}`} className="text-link">
                    Case study <Icon name="arrow" size={16} />
                  </Link>
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
