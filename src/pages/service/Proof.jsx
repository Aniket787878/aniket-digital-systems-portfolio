import { fx } from '../../interactions/attrs.js'
import { m } from 'motion/react'
import { reveal, revealStagger, fadeUp } from '../../motion/variants.js'
import ProjectCard from '../../components/ProjectCard.jsx'
import { projectCard } from '../../components/projectCard.js'
import { PillLabel } from '../../components/ui.jsx'

/* A `services[].proof` entry as one card. A project slug becomes its
   case-study card, labelled by what its picture is (components/
   projectCard.js). An object is proof that is not a project, such as this
   site, and carries its own picture and label. */
function toCard(entry) {
  const item = typeof entry === 'string' ? { slug: entry } : entry
  if (!item.slug) {
    return {
      ...item,
      id: item.key,
      kind: 'site',
      label: item.badge,
      media: { type: 'image', src: item.image, alt: item.imageAlt }
    }
  }
  return projectCard(item.slug, item.note ? { note: item.note } : {})
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

/* One card; a group (or grid) of one, and the lead card of three on a
   mid-width screen, go wide: picture beside the words. */
function ProofCard({ card, wide }) {
  return (
    <m.li variants={fadeUp}>
      <ProjectCard card={card} layout={wide ? 'wide' : undefined} />
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
          <m.ul className="pc-grid" data-count={cards.length} {...revealStagger}>
            {cards.map((card) => (
              <ProofCard key={card.id} card={card} wide={cards.length === 1} />
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
                  <span className="svc-group-name">{g.head}</span>
                  <span className="svc-group-note">{g.note}</span>
                </m.p>
                <m.ul
                  className="pc-grid"
                  data-count={g.cards.length}
                  aria-labelledby={`svc-group-${g.key}`}
                  {...revealStagger}
                >
                  {g.cards.map((card) => (
                    <ProofCard key={card.id} card={card} wide={g.cards.length === 1} />
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
