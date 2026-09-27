import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { WALKTHROUGHS } from './walkthroughs.js'
import { Screen, CaptionChip, STEP } from './Screen.jsx'
import { C, useFonts } from './shared.jsx'

/* Pick steps (1-based numbers, as in the file names) from one or more
   walkthroughs into a single run, each step tagged with its own slug. */
export function clipSteps(items) {
  return items.flatMap(({ slug, pick }) =>
    (pick || WALKTHROUGHS[slug].map((_, i) => i + 1)).map((n) => ({
      ...WALKTHROUGHS[slug][n - 1],
      slug,
    }))
  )
}

export const clipLength = (items) => clipSteps(items).length * STEP

/*
  The silent loop: just the viewport, no title or sign-off, so the site
  can wrap it in its own browser frame. Used by the hero reel and the
  hover previews on the project cards.
*/
export function Clip({ items, captions = true }) {
  useFonts()
  const frame = useCurrentFrame()
  const steps = clipSteps(items)
  const i = Math.min(steps.length - 1, Math.floor(frame / STEP))
  return (
    <AbsoluteFill style={{ background: C.page }}>
      <Screen slug={steps[0].slug} steps={steps} frame={frame} />
      {captions && (
        <CaptionChip index={i} total={steps.length} text={steps[i].caption} frame={frame} />
      )}
    </AbsoluteFill>
  )
}
