import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import { projects, films } from '../../data.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import LoopVideo from '../../components/LoopVideo.jsx'
import Icon from '../../components/icons.jsx'
import { PillLabel } from '../../components/ui.jsx'

/* A `services[].proof` entry as one card. A project slug becomes its
   case-study card, with the badge saying whether the screens are real
   (a working demo) or illustrated (a client platform, whose real screens
   hold client records). An object is proof that is not a project, such
   as this site, and carries its own still of real screens. */
function toCard(entry) {
  const item = typeof entry === 'string' ? { slug: entry } : entry
  if (!item.slug) {
    return { ...item, id: item.key }
  }
  const project = projects.find((p) => p.slug === item.slug)
  const film = films[item.slug]
  const real = film?.kind === 'real'
  return {
    id: item.slug,
    title: project.title,
    subtitle: project.subtitle,
    note: item.note || project.tagline,
    to: `/projects/${item.slug}`,
    cta: 'Read the case study',
    badge: real ? 'Working demo · real screens' : 'Client platform · illustrated',
    film: real
      ? { src: film.framed, poster: film.framedPoster }
      : { src: film.src, poster: film.poster }
  }
}

/* ---------------------------------------------------------------
   2 — Proof, on the night ground straight out of the hero (its near
   ridge is filled with --night, so the two read as one). What backs
   this area, most convincing first, each card opening its evidence.
   --------------------------------------------------------------- */
export default function Proof({ area }) {
  const cards = area.proof.map(toCard)

  return (
    <section className="night svc-proof" aria-labelledby="svc-proof-title">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="layers" className="on-night">
            Proof
          </PillLabel>
          <h2 className="h2" id="svc-proof-title">
            {area.proofHead[0]}
            <br />
            <span className="soft">{area.proofHead[1]}</span>
          </h2>
        </m.header>

        <m.ul className="cards svc-cards" data-count={cards.length} {...revealStagger}>
          {cards.map((card) => (
            <m.li key={card.id} variants={fadeUp}>
              <Link to={card.to} className="card loop-video-host">
                <div className="card-media">
                  {card.film ? (
                    <LoopVideo
                      mode="hover"
                      src={card.film.src}
                      poster={card.film.poster}
                      className="card-video"
                    />
                  ) : (
                    <img
                      src={card.image}
                      alt=""
                      className="card-video"
                      width="1600"
                      height="900"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="card-badge">
                    {card.film && <Icon name="play" size={10} />} {card.badge}
                  </span>
                </div>
                <div className="card-body">
                  <div className="card-title">
                    <h3>{card.title}</h3>
                    <span>{card.subtitle}</span>
                  </div>
                  <p>{card.note}</p>
                  <span className="text-link">
                    {card.cta} <Icon name="arrow" size={16} />
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
