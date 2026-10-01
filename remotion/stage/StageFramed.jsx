import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Ground, Wordmark, MonoTag, useStageFonts } from './kit.jsx'
import { Act } from './Act.jsx'
import { TAG, demoSteps } from './stories.js'
import { FILM_LAYOUT } from './StageFilm.jsx'

/* Same stage as the film, with the words a size up: this plays as a card,
   at about a third of the film's width. */
const LAYOUT = { ...FILM_LAYOUT, win: { x: 130, y: 150, w: 1140 }, chips: { x: 1370, gap: 92, size: 30 }, caption: { y: 950, size: 42 } }

/*
  The framed card loop (Framed-<slug>, 1920x1080, rendered at 0.6) for the
  /projects showcase and the service-page proof cards, where the demos sit
  beside the two platform films: the same stage, window, chips and caption
  as the film, without the title lines or the end card. It runs the six
  steps and dissolves back into the first, so it loops without a seam.
*/

export const FRAMED_STEP = 72
export const stageFramedLength = (slug) => demoSteps(slug).length * FRAMED_STEP

export function StageFramed({ slug }) {
  useStageFonts()
  const frame = useCurrentFrame()
  const steps = demoSteps(slug)
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Ground />
      <Act steps={steps} f={frame} stepLen={FRAMED_STEP} L={LAYOUT} loop tilt={{ rx: 1.5, ry: 2.5 }} />
      <div style={{ position: 'absolute', top: 50, left: 60, zIndex: 50 }}>
        <Wordmark size={40} />
      </div>
      <MonoTag text={TAG.real} size={24} />
    </AbsoluteFill>
  )
}
