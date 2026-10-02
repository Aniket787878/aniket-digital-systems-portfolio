import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Ground, Wordmark, MonoTag, useStageFonts } from './kit.jsx'
import { CaptureAct } from './CaptureAct.jsx'
import { TAG, demoSteps } from './stories.js'
import { CAPTURE_LAYOUT } from './StageFilm.jsx'

/* Same stage as the film, with the words a size up: this plays as a card,
   at about a third of the film's width. */
const LAYOUT = { ...CAPTURE_LAYOUT, caption: { size: 48, bottom: 50, scrim: 290 }, chips: { top: 112, right: 60, size: 24, max: 3 }, pointer: 42 }

/*
  The framed card loop (Framed-<slug>, 1920x1080, rendered at 0.6) for the
  /projects showcase and the service-page proof cards, where the demos sit
  beside the two platform films: the same window, camera, pointer, caption
  and chips as the film, without the title lines or the end card. Frame 0
  is the first screen at full width; the last step pulls back into it, so
  the loop has no seam.
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
      <CaptureAct steps={steps} f={frame} stepLen={FRAMED_STEP} L={LAYOUT} loop />
      <div style={{ position: 'absolute', top: 50, left: 60, zIndex: 50 }}>
        <Wordmark size={40} />
      </div>
      <MonoTag text={TAG.real} size={24} />
    </AbsoluteFill>
  )
}
