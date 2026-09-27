import { m } from 'motion/react'
import { explainers, explainersReady } from '../../data.js'
import ScrollWords from '../../motion/ScrollWords.jsx'
import LoopVideo from '../../components/LoopVideo.jsx'
import { reveal } from '../../motion/variants.js'

const film = explainers.brand

/* ---------------------------------------------------------------
   1b — Statement + the one-minute explainer. The problem, lit word by
   word as it scrolls past, then the film that answers it. No player:
   the film plays itself, silent and looping, while it is on screen
   (LoopVideo: poster only until it nears the viewport, and never
   autoplays under reduced motion).
   --------------------------------------------------------------- */
export default function Statement() {
  return (
    <section className="statement night">
      <div className="container statement-inner">
        <ScrollWords
          className="statement-text"
          parts={[
            'Most clinics and care practices run on',
            { icon: 'whatsapp' },
            'WhatsApp threads,',
            { icon: 'sheet' },
            'spreadsheets and somebody’s memory. Enquiries wait, bookings clash and follow-ups slip.'
          ]}
        />
        <ScrollWords
          className="statement-text"
          parts={[
            'I replace that with one system',
            { icon: 'flow' },
            'that runs by itself. Built by one person, end to end, and yours to keep.'
          ]}
        />

        {explainersReady && (
          <m.figure className="explainer" {...reveal}>
            <div className="explainer-frame">
            <LoopVideo
              src={film.src}
              poster={film.poster}
              className="explainer-video"
              label={film.title}
            />
          </div>
          <figcaption className="explainer-caption">
              <span>{film.title}</span>
              <span>The problem, the system, the result</span>
            </figcaption>
          </m.figure>
        )}
      </div>
    </section>
  )
}
