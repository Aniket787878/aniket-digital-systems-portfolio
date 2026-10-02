import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { S, SANS, Ground, Glow, Wordmark, MonoTag, Mono, KineticLine, CountUp, EndCard, END_HEADING_AT, END_BUTTON_AT, useStageFonts, tween, settle, easeInOut } from './kit.jsx'
import { Act, actEvents } from './Act.jsx'
import { CaptureAct, captureEvents } from './CaptureAct.jsx'
import { Soundtrack, cue } from '../sound.jsx'
import { DEMO_STORIES, TAG, captureStep } from './stories.js'
import { SCHEMATIC_STORIES } from './schematics.jsx'

/*
  The showreel (HeroReel, 1440x900, ~46 s, with sound; the site plays it
  as a muted loop): one turn of the site's story loop with the real work as the proof. Stakes in three quick
  lines, the big question, then the three working demos back to back
  (real screens), the headfake, the clinic platform as a labelled
  schematic with its two true numbers, the rehook and the end card. The
  tag in the corner changes with what is on screen. The last frames
  settle back to the bare ground, which is where frame 0 starts.
*/

const STEP = 72
const pick = (slug, nums) => {
  const story = DEMO_STORIES[slug]
  const by = Object.fromEntries(story.steps.map(([n, stage, chip]) => [n, { stage, chip }]))
  return nums.map((n) => captureStep(slug, n, by[n]?.stage, by[n]?.chip))
}

const SEGMENTS = [
  { at: 160, name: 'Shared Inbox', kind: 'real', steps: pick('shared-inbox', [1, 3, 7]) },
  { at: 392, name: 'Consent & Contract Signer', kind: 'real', steps: pick('consent-signer', [2, 5, 8]) },
  { at: 676, name: 'Lead Research', kind: 'real', steps: pick('lead-research', [2, 3, 6]) },
  { at: 912, name: 'Clinic Staff App', kind: 'schematic', steps: [1, 3].map((i) => SCHEMATIC_STORIES['therapist-pwa'].steps[i]) },
]
const ENTER = 12 // frames from a segment's start to its first step
const segEnd = (s) => s.at + ENTER + s.steps.length * STEP

const LINES = [
  { at: 0, out: 34, text: 'Enquiries arrive at *midnight.*' },
  { at: 40, out: 70, text: 'Forms go *missing.*' },
  { at: 76, out: 106, text: 'Leads go *cold.*' },
  { at: 112, out: 150, text: 'What if the busywork ran *itself?*' },
  { at: 624, out: 668, text: 'Not more software. Fewer *steps.*' },
]
const COUNT_AT = segEnd(SEGMENTS[3]) - 6 // counts over the receded schematic
const REHOOK_AT = COUNT_AT + 78
const END_AT = REHOOK_AT + 50
export const HERO_LEN = END_AT + 186

/*
  The reel's sound (remotion/sound.jsx), from the beats above: each kinetic
  line, each window arriving (and leaving, where nothing arrives straight
  after), the acts' own camera moves, clicks and chips, the schematic
  receding under the counts, the rehook and the end card.
*/
const CUES = [
  ...LINES.map((l, i) => cue('thump', l.at + 2, i > 0 && i < 3 ? 0.65 : 0.85)),
  ...SEGMENTS.flatMap((s, si) => {
    const start = s.at + ENTER
    const events = s.kind === 'real' ? captureEvents(s.steps, STEP) : actEvents(s.steps, STEP)
    const next = SEGMENTS[si + 1]
    const leaves = si < SEGMENTS.length - 1 && next.at - segEnd(s) > 20
    return [
      cue('whoosh', s.at, 0.9),
      ...events.map((e) => cue(e.kind, start + e.f, e.gain)),
      ...(leaves ? [cue('whooshDown', segEnd(s), 0.7)] : []),
    ]
  }),
  cue('whooshDown', COUNT_AT - 6, 0.8),
  cue('thump', COUNT_AT, 0.85),
  cue('thump', REHOOK_AT + 2, 0.85),
  cue('thump', END_AT + END_HEADING_AT + 1, 0.7),
  cue('end', END_AT + END_BUTTON_AT),
]

const LAYOUT = {
  W: 1440,
  H: 900,
  win: { x: 100, y: 128, w: 940 },
  chips: { top: 86, right: 44, size: 19 },
  caption: { y: 788, size: 28 },
  enterRy: -14,
  glowSize: 1000,
  ghost: { dx: -70, dy: -50, scale: 0.92, ry: 6, opacity: 0.4, blur: 6 },
}

/* The three working demos: the same big centred window and camera as the
   films, scaled to the reel. */
const CAPTURE = {
  W: 1440,
  H: 900,
  win: { x: 86, y: 92, w: 1268, h: 782 },
  chrome: 32,
  radius: 16,
  caption: { size: 30, bottom: 38, scrim: 210 },
  chips: { top: 84, right: 44, size: 16, max: 3 },
  pointer: 30,
  glowSize: 1300,
}

export function HeroReel() {
  useStageFonts()
  const frame = useCurrentFrame()

  /* which tag: the segment on screen, else the reel's own */
  const live = SEGMENTS.find((s) => frame >= s.at - 4 && frame < segEnd(s) + 10)
  const countOn = frame >= COUNT_AT - 4 && frame < REHOOK_AT
  const tag = live ? TAG[live.kind] : countOn ? TAG.schematic : TAG.reel

  const endF = frame - END_AT
  const tail = tween(frame, HERO_LEN - 30, HERO_LEN - 6, easeInOut)
  const anyWindow = Boolean(live)

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Ground scale={0.8} drift={frame * 0.12} />
      <Glow x={720 + Math.sin(frame / 60) * 40} y={460} size={1000} opacity={anyWindow ? 0 : 1 - tail * 0.6} />

      {SEGMENTS.map((s, si) => {
        if (frame < s.at - 2 || frame > segEnd(s) + 20) return null
        const f = frame - s.at - ENTER
        const enter = settle(frame, s.at, { stiffness: 80, damping: 18 })
        const leave = tween(frame, segEnd(s), segEnd(s) + 16, easeInOut)
        const isLast = si === SEGMENTS.length - 1
        /* the schematic recedes under the count-up instead of leaving */
        const recede = isLast ? tween(frame, COUNT_AT - 6, COUNT_AT + 6, easeInOut) : 0
        const lv = isLast ? tween(frame, REHOOK_AT - 8, REHOOK_AT + 8, easeInOut) : leave
        const push = tween(frame, s.at, segEnd(s), easeInOut)
        const labelO = Math.min(1, enter * 1.4) * (1 - lv) * (1 - recede)
        return (
          <AbsoluteFill key={s.name}>
            {s.kind === 'real' ? (
              <CaptureAct steps={s.steps} f={Math.min(f, s.steps.length * STEP - 1)} stepLen={STEP} L={CAPTURE} enter={enter} leave={lv} recede={recede} />
            ) : (
              <Act
                steps={s.steps}
                f={Math.min(f, s.steps.length * STEP - 1)}
                stepLen={STEP}
                L={LAYOUT}
                enter={enter}
                leave={lv}
                recede={recede}
                push={push}
                tilt={{ rx: 2 * (1 - push), ry: 4 - 7 * push }}
              />
            )}
            <div
              style={
                s.kind === 'real'
                  ? { position: 'absolute', left: 0, right: 0, top: 40, display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 14, opacity: labelO, transform: `translateY(${((1 - enter) * 12).toFixed(2)}px)` }
                  : { position: 'absolute', left: LAYOUT.win.x, top: LAYOUT.win.y - 56, display: 'flex', alignItems: 'baseline', gap: 14, opacity: labelO, transform: `translateY(${((1 - enter) * 20).toFixed(2)}px)` }
              }
            >
              <Mono size={15} color={S.accent}>{String(si + 1).padStart(2, '0')}</Mono>
              <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: '-0.03em', color: S.ink }}>{s.name}</span>
            </div>
          </AbsoluteFill>
        )
      })}

      {LINES.map((l) =>
        frame >= l.at && frame < l.out + 7 ? (
          <AbsoluteFill key={l.text} style={{ alignItems: 'center', justifyContent: 'center' }}>
            <KineticLine text={l.text} f={frame - l.at} start={1} out={l.out - l.at} size={l.text.length > 24 ? 92 : 112} maxWidth={1280} />
          </AbsoluteFill>
        ) : null
      )}

      {countOn && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 130, opacity: 1 - tween(frame, REHOOK_AT - 10, REHOOK_AT - 2) }}>
            <CountUp value="1,200+" label="client records" f={frame - COUNT_AT} start={4} size={150} />
            <CountUp value="11" label="therapists on one system" f={frame - COUNT_AT} start={12} size={150} />
          </div>
        </AbsoluteFill>
      )}
      {frame >= REHOOK_AT && frame < END_AT + 2 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <KineticLine text="Running in a real clinic *today.*" f={frame - REHOOK_AT} start={1} out={END_AT - REHOOK_AT - 6} size={92} maxWidth={1280} />
        </AbsoluteFill>
      )}

      {endF >= 0 && (
        <AbsoluteFill style={{ opacity: 1 - tail }}>
          <Glow x={720} y={430} size={1000} opacity={tween(endF, 0, 16)} />
          <EndCard f={endF} scale={0.75} />
        </AbsoluteFill>
      )}

      <div style={{ position: 'absolute', top: 40, left: 46, zIndex: 50, opacity: (1 - tween(endF, 0, 10)) + tail }}>
        <Wordmark size={28} />
      </div>
      <TagSwap frame={frame} tag={tag} />
      <Soundtrack cues={CUES} />
    </AbsoluteFill>
  )
}

/* The mono tag, crossfading when what is on screen changes kind. */
function TagSwap({ frame, tag }) {
  const prevTag = tagAt(frame - 8)
  const swap = prevTag === tag ? 1 : tween(frame, frameOfChange(frame, tag), frameOfChange(frame, tag) + 8)
  return <MonoTag text={tag} prev={prevTag !== tag ? prevTag : undefined} swap={swap} size={16} top={34} right={44} />
}

function tagAt(frame) {
  const live = SEGMENTS.find((s) => frame >= s.at - 4 && frame < segEnd(s) + 10)
  const countOn = frame >= COUNT_AT - 4 && frame < REHOOK_AT
  return live ? TAG[live.kind] : countOn ? TAG.schematic : TAG.reel
}

function frameOfChange(frame, tag) {
  let k = frame
  while (k > 0 && tagAt(k - 1) === tag) k--
  return k
}
