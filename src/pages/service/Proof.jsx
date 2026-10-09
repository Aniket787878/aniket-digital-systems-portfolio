import { Link } from 'react-router-dom'
import { fx } from '../../interactions/attrs.js'
import { m } from 'motion/react'
import { projects, films, stills, labelFor, mediaKind } from '../../data.js'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import LoopVideo from '../../components/LoopVideo.jsx'
import ScreenStill from '../../components/ScreenStill.jsx'
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
    return { ...item, id: item.key, kind: 'site' }
  }
  const project = projects.find((p) => p.slug === item.slug)
  const film = films[item.slug]
  /* A demo with real screens and no film yet: its cover still, never an
     empty player. The badge says the replies were a recorded test run. */
  if (!film && stills[item.slug]) {
    return {
      id: item.slug,
      kind: mediaKind(item.slug),
      title: project.title,
      subtitle: project.subtitle,
      note: item.note || project.tagline,
      to: `/projects/${item.slug}`,
      cta: 'Read the case study',
      badge: stills[item.slug].kind === 'demo' ? labelFor(item.slug).badge : 'Working demo · recorded test run',
      still: stills[item.slug].cover
    }
  }
  const real = film?.kind === 'real'
  return {
    id: item.slug,
    kind: mediaKind(item.slug),
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

/* What kind of proof a card is, in the order the groups appear: running
   client work first, then working builds, then designed screens. The
   heading and note say in words what each card's badge says in short. */
const GROUPS = [
  {
    key: 'schematic',
    head: 'Client platforms',
    note: 'Built for a client. Shown as illustrations, because the real screens hold client records.'
  },
  { key: 'real', head: 'Working demos', note: 'Real screens of working builds.' },
  { key: 'demo', head: 'Demo screens', note: 'Designed screens for a made-up business. Not built.' }
]

function groupCards(cards) {
  return GROUPS.map((g) => ({ ...g, cards: cards.filter((c) => c.kind === g.key) })).filter(
    (g) => g.cards.length
  )
}

function ProofCard({ card }) {
  return (
    <m.li variants={fadeUp}>
      <Link to={card.to} className="card loop-video-host" {...fx('lerp', 'view')}>
        <div className="card-media">
          {card.still ? (
            <ScreenStill src={card.still.file} focus={card.still.focus} className="card-video" />
          ) : card.film ? (
            <LoopVideo mode="hover" src={card.film.src} poster={card.film.poster} className="card-video" />
          ) : (
            <img
              src={card.image}
              alt={card.imageAlt || ''}
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
  )
}

/* ---------------------------------------------------------------
   2 — Proof, on the night ground straight out of the hero (its near
   ridge is filled with --night, so the two read as one). What backs
   this area, most convincing first, each card opening its evidence.
   --------------------------------------------------------------- */
export default function Proof({ area }) {
  const cards = area.proof.map(toCard)
  const groups = groupCards(cards)

  return (
    <section className="night svc-proof" aria-labelledby="svc-proof-title">
      <div className="container">
        <m.header className="center-head" {...reveal}>
          <PillLabel icon="layers" className="on-night">
            Proof
          </PillLabel>
          <h2 className="h2" {...fx('split')} id="svc-proof-title">
            {area.proofHead[0]}
            <span className="soft">{area.proofHead[1]}</span>
          </h2>
        </m.header>

        {groups.length < 2 ? (
          <m.ul className="cards svc-cards" data-count={cards.length} {...revealStagger}>
            {cards.map((card) => (
              <ProofCard key={card.id} card={card} />
            ))}
          </m.ul>
        ) : (
          /* Mixed kinds (the software and AI areas): one small plain
             heading per kind, each group laid out for its own count, so no
             row ever ends on a lone card. */
          <div className="svc-groups">
            {groups.map((g) => (
              <div key={g.key} className="svc-group">
                <m.p className="svc-group-head" id={`svc-group-${g.key}`} {...reveal}>
                  <span>{g.head}</span> {g.note}
                </m.p>
                <m.ul
                  className="cards svc-cards"
                  data-count={g.cards.length}
                  aria-labelledby={`svc-group-${g.key}`}
                  {...revealStagger}
                >
                  {g.cards.map((card) => (
                    <ProofCard key={card.id} card={card} />
                  ))}
                </m.ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
