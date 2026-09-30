import { m } from 'motion/react'
import { fx } from '../../interactions/attrs.js'
import { heroReel } from '../../data.js'
import ScrollWords from '../../motion/ScrollWords.jsx'
import LoopVideo from '../../components/LoopVideo.jsx'
import { reveal } from '../../motion/variants.js'
import { useStillMedia } from '../../stillMedia.js'


/* ---------------------------------------------------------------
   1b — Statement + the showreel. The problem, lit word by word as it
   scrolls past, then the real apps that answer it (the explainer film
   moved up to the hero). No player: the reel plays itself, silent and
   looping, while it is on screen; phones and reduced motion get its
   poster (see stillMedia.js).
   --------------------------------------------------------------- */
export default function Statement() {
  const still = useStillMedia()
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
            'I build the website that brings the work in,',
            { icon: 'flow' },
            'and the system that runs it by itself. End to end, and yours to keep.'
          ]}
        />

        <m.figure className="explainer" {...fx('progress')} {...reveal}>
          <div className="explainer-frame explainer-frame--reel" {...fx('media')}>
            {still ? (
              <img
                src={heroReel.poster}
                alt="Still from the showreel of three working demos: a shared inbox, a consent signer and a lead research tool"
                className="explainer-video"
                width="1440"
                height="900"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <LoopVideo
                src={heroReel.src}
                poster={heroReel.poster}
                className="explainer-video"
                label="Showreel of three working demos: a shared inbox, a consent signer and a lead research tool"
              />
            )}
          </div>
          <figcaption className="explainer-caption">
            <span>Shared inbox, consent signer, lead research</span>
            <span>Recorded from the running apps</span>
          </figcaption>
        </m.figure>
      </div>
    </section>
  )
}
