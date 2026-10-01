import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { Ground, Glow, Wordmark, MonoTag, KineticLine, CountUp, EndCard, useStageFonts, tween, settle, easeInOut } from './kit.jsx'
import { Act } from './Act.jsx'
import { DEMO_STORIES, TAG, demoSteps } from './stories.js'
import { SCHEMATIC_STORIES } from './schematics.jsx'

/*
  The site film for one product (Platform-<slug>, 1920x1080, ~27 s), told
  like a launch: a stakes line and a big question own the frame, the
  window arrives tilted and soft and settles, the steps cut inside it with
  chips landing beside it, a headfake line plays over the receded window,
  then the rehook and the end card. The mono tag in the corner says what
  the footage is on every frame.
*/

export const STEP_LEN = 78
const LINE = 44 // one kinetic line: ~1.5 s
const A0 = 96 // first step starts
const HF = 50 // the headfake beat
const TAIL = 204 // rehook + end card
const END = 72 // the end card starts this far into the tail

export const FILM_LAYOUT = {
  W: 1920,
  H: 1080,
  win: { x: 150, y: 150, w: 1180 },
  chips: { x: 1410, gap: 82, size: 25 },
  caption: { y: 964, size: 34 },
  enterRy: -12,
  ghost: { dx: -96, dy: -64, scale: 0.92, ry: 6, opacity: 0.42, blur: 7 },
  glowSize: 1300,
}

export function storyFor(slug) {
  if (DEMO_STORIES[slug]) return { ...DEMO_STORIES[slug], kind: 'real', steps: demoSteps(slug) }
  return { ...SCHEMATIC_STORIES[slug], kind: 'schematic' }
}

export const stageFilmLength = (slug) => A0 + storyFor(slug).steps.length * STEP_LEN + HF + TAIL

export function StageFilm({ slug }) {
  useStageFonts()
  const frame = useCurrentFrame()
  const story = storyFor(slug)
  const L = FILM_LAYOUT
  const n = story.steps.length
  const k = story.headfakeAt // headfake plays before step index k
  const hfAt = A0 + k * STEP_LEN
  const actEnd = A0 + n * STEP_LEN + HF
  const total = actEnd + TAIL

  /* the act's own clock pauses through the headfake */
  const actF = frame < hfAt ? frame - A0 : frame < hfAt + HF ? k * STEP_LEN - 1 : frame - A0 - HF
  const enter = settle(frame, A0 - 12, { stiffness: 70, damping: 18 })
  const recede = tween(frame, hfAt - 2, hfAt + 8, easeInOut) * (1 - tween(frame, hfAt + HF - 8, hfAt + HF, easeInOut))
  const leave = tween(frame, actEnd, actEnd + 16, easeInOut)
  const push = tween(frame, A0, actEnd, easeInOut)

  const tailF = frame - actEnd
  const endF = tailF - END

  /* the ground glow when no window is on screen */
  const titleGlow = 1 - tween(frame, A0 - 16, A0 + 6)
  const drift = Math.sin(frame / 50) * 40

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Ground drift={frame * 0.15} />
      <Glow x={960 + drift} y={560} size={1300} opacity={Math.max(titleGlow, tween(tailF, 0, 20))} />

      {frame >= A0 - 20 && frame < actEnd + 24 && (
        <Act steps={story.steps} f={actF} stepLen={STEP_LEN} L={L} enter={enter} recede={recede} leave={leave} push={push} tilt={{ rx: 2.5 * (1 - push), ry: 5 - 8 * push }} />
      )}

      {/* stakes, then the big question */}
      {frame < LINE + 2 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <KineticLine text={story.stakes} f={frame} start={2} out={LINE - 6} size={140} maxWidth={1600} />
        </AbsoluteFill>
      )}
      {frame >= LINE && frame < A0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <KineticLine text={story.question} f={frame - LINE} start={0} out={A0 - LINE - 14} size={140} maxWidth={1600} />
        </AbsoluteFill>
      )}

      {/* the headfake, over the receded window */}
      {frame >= hfAt && frame < hfAt + HF && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <KineticLine text={story.headfake} f={frame - hfAt} start={2} out={HF - 7} size={128} maxWidth={1600} />
        </AbsoluteFill>
      )}

      {/* rehook: a count-up where there is a true number, else a line */}
      {tailF >= 0 && endF < 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          {story.counts ? (
            <div style={{ display: 'flex', gap: 160, alignItems: 'flex-start', opacity: 1 - tween(endF, -8, 0) }}>
              {story.counts.map((c, i) => (
                <CountUp key={c.label} value={c.n} label={c.label} f={tailF} start={10 + i * 8} size={190} />
              ))}
            </div>
          ) : (
            <KineticLine text={story.rehook} f={tailF} start={8} out={END - 8} size={140} maxWidth={1600} />
          )}
        </AbsoluteFill>
      )}

      {endF >= 0 && <EndCard f={endF} />}

      {/* the chrome on every frame */}
      <div style={{ position: 'absolute', top: 50, left: 60, zIndex: 50, opacity: 1 - tween(endF, 0, 10) }}>
        <Wordmark size={34} />
      </div>
      <MonoTag text={TAG[story.kind]} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 3, width: `${((frame / (total - 1)) * 100).toFixed(3)}%`, background: 'rgba(245,135,30,0.7)' }} />
    </AbsoluteFill>
  )
}
