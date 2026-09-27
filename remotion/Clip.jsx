import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { WALKTHROUGHS } from './walkthroughs.js'
import { STEP, modeSpec, trackAt, RecordingView } from './Screen.jsx'
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
  hover previews on the project cards. Same camera language as the films
  (push in, spotlight, pull back), without the dusk or the tilt, and it
  ends on step 1's wide frame so it loops without a seam.
*/
export function Clip({ items, captions = true }) {
  useFonts()
  const frame = useCurrentFrame()
  const steps = clipSteps(items)
  const spec = modeSpec('loop')
  const st = trackAt(steps, frame, spec, { loop: true })
  return (
    <AbsoluteFill style={{ background: C.page, overflow: 'hidden' }}>
      <RecordingView st={st} cam={st.cam} spec={spec} slug={steps[0].slug} showCallout={captions} />
    </AbsoluteFill>
  )
}
