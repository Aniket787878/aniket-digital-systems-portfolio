import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { useStageFonts } from './kit.jsx'
import { CaptureAct } from './CaptureAct.jsx'
import { DEMO_STORIES, captureStep } from './stories.js'

/*
  The card loop (Clip-<slug>, 1440x900, ~12 s, silent). Just the app's
  viewport: the site's card draws its own glass frame and honesty tag
  around it, and a frame inside a frame reads as clutter. Inside, the same
  camera language as the films: the camera pushes in on each step's shot,
  the saffron ring clicks, one caption line sits at the bottom centre and
  the chips stack top right. Frame 0 is the first screen at full width and
  the last step pulls back into it, so the loop has no seam.
*/

export const CLIP_STEP = 90

const LAYOUT = {
  W: 1440,
  H: 900,
  bare: true,
  caption: { size: 36, bottom: 40, scrim: 220 },
  chips: { top: 36, right: 40, size: 22, max: 2 },
  pointer: 34,
}

export const clipSteps = (slug) => {
  const story = DEMO_STORIES[slug]
  const byNum = Object.fromEntries(story.steps.map(([n, stage, chip]) => [n, { stage, chip }]))
  return story.clip.map((n) => captureStep(slug, n, byNum[n]?.stage, byNum[n]?.chip))
}

export const stageClipLength = (slug) => clipSteps(slug).length * CLIP_STEP

export function StageClip({ slug }) {
  useStageFonts()
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <CaptureAct steps={clipSteps(slug)} f={frame} stepLen={CLIP_STEP} L={LAYOUT} loop />
    </AbsoluteFill>
  )
}
