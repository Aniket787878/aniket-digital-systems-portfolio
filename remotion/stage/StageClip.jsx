import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { S, SANS, Mono, Chip, useStageFonts, tween, settle, easeInOut } from './kit.jsx'
import { Screen } from './Act.jsx'
import { DEMO_STORIES, captureStep } from './stories.js'

/*
  The card loop (Clip-<slug>, 1440x900, ~12 s, silent). Just the app's
  viewport: the site's card draws its own glass frame and honesty tag
  around it, and a frame inside a frame reads as clutter. Inside, the same
  grammar as the films: a quick cut to each screen, a push in to the part
  that matters, the pointer's saffron ring, a glass caption with a mono
  counter and the "what it did" chip. The last step pulls back and
  dissolves into the first screen's wide frame, which is frame 0, so the
  loop has no seam.
*/

export const CLIP_STEP = 90

export const clipSteps = (slug) => {
  const story = DEMO_STORIES[slug]
  const byNum = Object.fromEntries(story.steps.map(([n, stage, chip]) => [n, { stage, chip }]))
  return story.clip.map((n) => captureStep(slug, n, byNum[n]?.stage, byNum[n]?.chip))
}

export const stageClipLength = (slug) => clipSteps(slug).length * CLIP_STEP

export function StageClip({ slug }) {
  useStageFonts()
  const frame = useCurrentFrame()
  const steps = clipSteps(slug)
  const n = steps.length
  const L = CLIP_STEP
  const idx = Math.min(n - 1, Math.floor(frame / L))
  const sf = frame - idx * L
  const step = steps[idx]
  const prev = idx > 0 ? steps[idx - 1] : null
  const last = idx === n - 1

  const cutIn = idx === 0 ? 1 : tween(sf, 0, 8, easeInOut)
  const home = last ? tween(sf, L - 14, L, easeInOut) : 0

  /* caption and chip: in after the push, out before the cut */
  const capIn = settle(sf, 12)
  const capOut = tween(sf, L - (last ? 26 : 7), L - (last ? 16 : 1), easeInOut)
  const chipIn = step.chip ? settle(sf, 34) : 0

  return (
    <AbsoluteFill style={{ background: S.inner, overflow: 'hidden' }}>
      {prev && cutIn < 1 && (
        <AbsoluteFill style={{ opacity: 1 - cutIn * 0.6 }}>
          <Screen step={prev} sf={L + sf} stepLen={L} pointer={false} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ opacity: cutIn, transform: cutIn < 1 ? `scale(${(1.03 - 0.03 * cutIn).toFixed(4)})` : undefined }}>
        <Screen step={step} sf={sf} stepLen={L} loopOut={last} />
      </AbsoluteFill>
      {home > 0 && (
        <AbsoluteFill style={{ opacity: home }}>
          <Screen step={steps[0]} sf={0} stepLen={L} />
        </AbsoluteFill>
      )}

      {/* a low shade so the caption always reads, whatever the screen */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(0deg, rgba(11,11,12,0.78) 0%, rgba(11,11,12,0.35) 16%, transparent 32%)',
          opacity: Math.min(1, capIn * 1.4) * (1 - capOut),
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '16px 28px 16px 22px',
          borderRadius: 999,
          background: S.glass,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 24px 60px -16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,200,154,0.18)',
          maxWidth: 1300,
          opacity: Math.min(1, capIn * 1.5) * (1 - capOut),
          transform: `translateY(${((1 - capIn) * 22 - capOut * 8).toFixed(2)}px)`,
          filter: capIn < 0.97 || capOut > 0.03 ? `blur(${((1 - capIn) * 8 + capOut * 6).toFixed(2)}px)` : undefined,
        }}
      >
        <Mono size={20} color={S.accent}>
          {String(idx + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </Mono>
        <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, letterSpacing: '-0.025em', color: S.ink, whiteSpace: 'nowrap' }}>{step.caption}</span>
      </div>

      {step.chip && chipIn > 0.001 && (
        <div style={{ position: 'absolute', right: 40, top: 40, opacity: 1 - capOut }}>
          <Chip label={step.chip[0]} state={step.chip[1]} t={chipIn} active size={28} />
        </div>
      )}
    </AbsoluteFill>
  )
}
