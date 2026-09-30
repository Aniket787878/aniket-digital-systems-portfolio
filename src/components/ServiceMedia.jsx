import { films, explainers } from '../data.js'
import LoopVideo from './LoopVideo.jsx'

/* ---------------------------------------------------------------
   The picture for one service area (`services[].media` in data.js):
   a still of a real screen, a working demo's framed loop, or an
   explainer film. Loops play on hover inside a .loop-video-host, the
   same as the project cards.
   --------------------------------------------------------------- */
export default function ServiceMedia({ media, className }) {
  if (media.kind === 'image') {
    return (
      <img
        src={media.src}
        alt={media.alt}
        className={className}
        width="1600"
        height="900"
        loading="lazy"
        decoding="async"
      />
    )
  }

  const film =
    media.kind === 'clip'
      ? { src: films[media.slug].framed, poster: films[media.slug].framedPoster }
      : { src: explainers[media.key].src, poster: explainers[media.key].poster }

  return <LoopVideo mode="hover" src={film.src} poster={film.poster} className={className} />
}
