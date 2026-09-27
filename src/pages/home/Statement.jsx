import { useState } from 'react'
import { m } from 'motion/react'
import { explainers, explainersReady } from '../../data.js'
import ScrollWords from '../../motion/ScrollWords.jsx'
import Icon from '../../components/icons.jsx'
import { reveal } from '../../motion/variants.js'

const film = explainers.brand

/* ---------------------------------------------------------------
   1b — Statement + the one-minute explainer. The problem, lit word by
   word as it scrolls past, then the film that answers it. The film
   waits behind its poster until asked to play: it has a story to
   tell, so it starts at the start.
   --------------------------------------------------------------- */
export default function Statement() {
  const [playing, setPlaying] = useState(false)

  return (
    <section className="statement night">
      <div className="container statement-inner">
        <ScrollWords
          className="statement-text"
          parts={[
            'Most service businesses run on',
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
              {playing ? (
                <video src={film.src} poster={film.poster} controls autoPlay playsInline />
              ) : (
                <button
                  type="button"
                  className="explainer-poster"
                  onClick={() => setPlaying(true)}
                  aria-label={`Play: ${film.title}`}
                >
                  <img src={film.poster} alt="" loading="lazy" />
                  <span className="explainer-play" aria-hidden="true">
                    <Icon name="play" size={26} />
                  </span>
                </button>
              )}
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
