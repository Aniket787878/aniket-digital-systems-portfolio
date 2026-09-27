import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { projects } from '../src/data.js'
import { WALKTHROUGHS, URLS } from './walkthroughs.js'
import { Screen, STEP, VW, VH } from './Screen.jsx'
import { C, DISPLAY, SANS, BrowserChrome, Wordmark, useFonts, splitTitle, tween, clamp } from './shared.jsx'

/* Beats, in frames @30fps. */
export const INTRO = 78
export const OUTRO = 110
export const walkthroughLength = (slug) => INTRO + WALKTHROUGHS[slug].length * STEP + OUTRO

const CHROME = 44
const WIN_SCALE = 0.92
const WIN_H = (VH + CHROME) * WIN_SCALE

/*
  The case-study film for a self-built tool: a title card, then the real
  captures from steps.json played as one screen recording inside a browser
  window, a caption per step, and a sign-off. Every pixel inside the window
  is a screenshot of the running app — the camera, pointer and captions are
  the only things added on top.
*/
export function Walkthrough({ slug }) {
  useFonts()
  const frame = useCurrentFrame()
  const steps = WALKTHROUGHS[slug]
  const project = projects.find((p) => p.slug === slug)
  const [name, sub] = splitTitle(project.title)
  const total = walkthroughLength(slug)
  const stepsEnd = INTRO + steps.length * STEP

  // Window: rises in with a tilt, then recedes for the sign-off.
  const rise = tween(frame, 36, 78)
  const recede = tween(frame, stepsEnd - 6, stepsEnd + 30)
  const winY = interpolate(rise, [0, 1], [560, 0]) + recede * -120
  const winTilt = interpolate(rise, [0, 1], [22, 0])
  const winScale = 1 - recede * 0.38
  const winOpacity = interpolate(rise, [0, 0.25], [0, 1], clamp) * (1 - tween(frame, stepsEnd + 14, stepsEnd + 34))

  // Title card
  const tIn = tween(frame, 0, 26)
  const tOut = tween(frame, 40, 70)

  // Caption for the current step
  const local = frame - INTRO
  const idx = Math.max(0, Math.min(steps.length - 1, Math.floor(local / STEP)))
  const f = local - idx * STEP
  const capO = local < 0 || frame >= stepsEnd ? 0 : tween(f, 4, 16) * (1 - tween(f, STEP - 10, STEP))
  const capY = (1 - tween(f, 4, 20)) * 18

  // Sign-off
  const oIn = tween(frame, stepsEnd + 18, stepsEnd + 48)

  const progress = interpolate(frame, [0, total], [0, 1], clamp)

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, overflow: 'hidden' }}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(60% 50% at 18% -8%, rgba(245,135,30,0.16), transparent 60%), radial-gradient(50% 45% at 90% 110%, rgba(245,135,30,0.08), transparent 60%)',
        }}
      />

      {/* Title card */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: tIn * (1 - tOut),
          transform: `translateY(${(1 - tIn) * 24 - tOut * 60}px)`,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.accent }}>
          Working demo · real screens
        </div>
        <div style={{ marginTop: 22, fontFamily: DISPLAY, fontWeight: 800, fontSize: 132, lineHeight: 0.95, letterSpacing: '-0.045em', color: C.ink }}>
          {name}
        </div>
        <div style={{ marginTop: 22, fontSize: 38, fontWeight: 500, color: C.inkSoft, letterSpacing: '-0.01em' }}>{sub}</div>
      </AbsoluteFill>

      {/* Browser window */}
      <div
        style={{
          position: 'absolute',
          left: (1920 - VW) / 2,
          top: 34,
          width: VW,
          height: WIN_H,
          perspective: 2200,
          opacity: winOpacity,
        }}
      >
        <div
          style={{
            width: VW,
            height: VH + CHROME,
            transformOrigin: '50% 0',
            transform: `translateY(${winY}px) scale(${WIN_SCALE * winScale}) rotateX(${winTilt}deg)`,
            transformStyle: 'preserve-3d',
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid ${C.lineStrong}`,
            boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            background: C.page,
          }}
        >
          <BrowserChrome url={URLS[slug]} height={CHROME} />
          <div style={{ position: 'relative', width: VW, height: VH }}>
            <Screen slug={slug} steps={steps} frame={Math.max(0, Math.min(local, steps.length * STEP - 1))} showCursor={local >= 0 && frame < stepsEnd} />
          </div>
        </div>
      </div>

      {/* Step caption */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 34 + WIN_H + 24,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          opacity: capO,
          transform: `translateY(${capY}px)`,
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: C.accent, letterSpacing: '0.02em' }}>
          {String(idx + 1).padStart(2, '0')}
          <span style={{ color: C.muted }}> / {String(steps.length).padStart(2, '0')}</span>
        </span>
        <span style={{ width: 1, height: 26, background: C.lineStrong }} />
        <span style={{ fontSize: 30, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>{steps[idx].caption}</span>
      </div>

      {/* Sign-off */}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          opacity: oIn,
          transform: `translateY(${(1 - oIn) * 26}px)`,
        }}
      >
        <Wordmark size={40} />
        <div style={{ marginTop: 30, fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, lineHeight: 1.02, letterSpacing: '-0.04em', color: C.ink, maxWidth: 1300 }}>
          {name}, built end to end
          <br />
          <span style={{ color: C.accent }}>by one person.</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 1100, marginTop: 40 }}>
          {project.stack.slice(0, 6).map((t) => (
            <span key={t} style={{ fontSize: 20, fontWeight: 500, color: C.inkSoft, border: `1px solid ${C.lineStrong}`, borderRadius: 999, padding: '9px 20px' }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 36, fontSize: 20, color: C.muted }}>
          Every screen in this film is the running app — nothing mocked up.
        </div>
      </AbsoluteFill>

      {/* Progress hairline */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${progress * 100}%`, background: C.accent }} />
    </AbsoluteFill>
  )
}
