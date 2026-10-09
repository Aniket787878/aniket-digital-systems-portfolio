import { useId } from 'react'
import { Link } from 'react-router-dom'
import { fx } from '../interactions/attrs.js'
import LoopVideo from './LoopVideo.jsx'
import ScreenStill from './ScreenStill.jsx'
import './ProjectCard.css'

/* The window inside the well is 88% of its width; its screen is this
   shape, a little taller than the well, so the bottom of the screen runs
   off the card edge instead of ending in a second frame line. */
const WINDOW_ASPECT = 16 / 10

function Media({ media }) {
  if (!media) return null
  if (media.type === 'film') {
    return <LoopVideo mode="hover" src={media.src} poster={media.poster} className="pc-fill" />
  }
  if (media.type === 'still' && media.window) {
    return (
      <div className="pc-window">
        <span className="pc-window-bar" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <ScreenStill src={media.file} focus={media.focus} aspect={WINDOW_ASPECT} className="pc-window-screen" />
      </div>
    )
  }
  if (media.type === 'still') {
    return <ScreenStill src={media.file} focus={media.focus} className="pc-fill" />
  }
  return (
    <img
      src={media.src}
      alt={media.alt || ''}
      className="pc-fill"
      width="1600"
      height="900"
      loading="lazy"
      decoding="async"
    />
  )
}

/*
  A project card on the night ground: a lifted dark surface, the picture in
  a 16:9 well, then one meta row (the truth label: illustrated, real or
  made up), the title, a one-line subtitle, up to three lines of body and a quiet
  "Case study" cue pinned to the bottom so a row of cards lines up.

  The whole card is one link, named by its title and cue ("Appointment
  Desk Case study"), with the truth label as its description, so a screen
  reader does not read every word in the card as the link name.

  `layout="wide"` puts the picture beside the words (a group of one, the
  first project on /projects). `as` is the title's heading level.
*/
export default function ProjectCard({ card, as: Heading = 'h3', layout, showIndex = false, metrics }) {
  const uid = useId()
  const titleId = `${uid}-t`
  const descId = `${uid}-d`
  const ctaId = `${uid}-c`
  const tone = card.kind === 'real' || card.kind === 'site' ? 'real' : card.kind

  return (
    <Link
      to={card.to}
      className={`pc loop-video-host${layout === 'wide' ? ' pc-wide' : ''}`}
      aria-labelledby={`${titleId} ${ctaId}`}
      aria-describedby={descId}
      {...fx('lerp', 'view')}
    >
      <div className="pc-media">
        <div className="pc-media-inner">
          <Media media={card.media} />
        </div>
      </div>
      <div className="pc-body">
        <p className="pc-meta" id={descId}>
          {showIndex && card.index && <span className="pc-index">{card.index}</span>}
          <span className={`pc-label is-${tone}`}>{card.label}</span>
        </p>
        <Heading className="pc-title" id={titleId}>
          {card.title}
        </Heading>
        {card.subtitle && <p className="pc-sub">{card.subtitle}</p>}
        {card.note && <p className="pc-note">{card.note}</p>}
        {metrics && metrics.length > 0 && (
          <dl className="pc-metrics">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.n}</dd>
              </div>
            ))}
          </dl>
        )}
        <span className="pc-cta" id={ctaId}>
          {card.cta || 'Case study'}
          <span className="pc-arrow" aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  )
}
