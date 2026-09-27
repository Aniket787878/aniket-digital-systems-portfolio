import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion'
import { projects } from '../src/data.js'
import { WALKTHROUGHS } from './walkthroughs.js'
import { STEP, modeSpec, trackAt, RecordingView } from './Screen.jsx'
import { lerpCam } from './Camera.jsx'
import { C, SANS, Wordmark, useFonts, splitTitle, tween, rise, clamp, easeInOut } from './shared.jsx'
import { DuskScene } from './DuskScene.jsx'
import { KineticText, PillLabel } from './KineticText.jsx'
import { Icon } from './icons.jsx'
import { CTA, CONTACT } from './EndCard.jsx'

/* Beats, in frames @30fps. */
export const INTRO = 104
export const OUTRO = 170
export const walkthroughLength = (slug) => INTRO + WALKTHROUGHS[slug].length * STEP + OUTRO

const HORIZON = 0.78

/*
  The case-study film for a self-built tool. It opens on the dusk scene
  with the app's window small and tilted in 3D, rising from behind the
  front ridge; the camera dollies in as it flattens. Each step then springs
  in to the region that matters (spotlit, with a callout), and pulls back
  out between steps. It closes by pulling back and tilting away into the
  dusk. Every pixel inside the window is a capture of the running app: the
  camera, pointer, spotlight and callouts are the only things added.
*/
export function Walkthrough({ slug }) {
  useFonts()
  const frame = useCurrentFrame()
  const steps = WALKTHROUGHS[slug]
  const project = projects.find((p) => p.slug === slug) || { title: slug }
  const [name, sub] = splitTitle(project)
  const total = walkthroughLength(slug)
  const stepsEnd = INTRO + steps.length * STEP
  const spec = modeSpec('film')
  const W = spec.wide

  const local = frame - INTRO
  const st = trackAt(steps, Math.max(0, Math.min(local, steps.length * STEP - 1)), spec)

  // Intro: small, tilted, rising from behind the front ridge; then dolly in.
  const up = spring({ frame: frame - 8, fps: 30, config: { damping: 200, stiffness: 60 } })
  const poseIn = { S: W.S * 0.46, cx: W.cx, cy: W.cy, ax: 960, ay: interpolate(up, [0, 1], [1260, 800]), rx: 18, ry: -14 }
  const dolly = spring({ frame: frame - 54, fps: 30, config: { damping: 200, stiffness: 70 }, durationInFrames: INTRO - 54 })
  // Outro: pull back and tilt away, down behind the ridge.
  const o = frame - stepsEnd
  const away = tween(o, 0, 64, easeInOut)
  const poseOut = { S: W.S * 0.4, cx: W.cx, cy: W.cy, ax: 960, ay: 1020, rx: 20, ry: 14 }

  let cam = st.cam
  if (local < 0) cam = lerpCam(poseIn, W, dolly)
  else if (o >= 0) cam = lerpCam(W, poseOut, away)

  const ridges =
    local < 0
      ? interpolate(rise(frame, 0, { stiffness: 45 }), [0, 1], [0.3, 1]) * (1 - tween(frame, 54, INTRO, easeInOut))
      : tween(o, 6, 70, easeInOut)

  const titleOut = 50
  const signAt = stepsEnd + 52
  const inSteps = local >= 0 && o < 0
  const cursorO = tween(local, 0, 10) * (1 - tween(o, 0, 8))
  const winO = 1 - tween(o, 44, 76)
  const progress = interpolate(frame, [0, total], [0, 1], clamp)

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, overflow: 'hidden' }}>
      <DuskScene
        frame={frame}
        push={tween(frame, 0, total, easeInOut)}
        rise={ridges}
        horizon={HORIZON}
        fade={tween(frame, 0, 20)}
        midground={
          <AbsoluteFill style={{ opacity: winO }}>
            <RecordingView st={st} cam={cam} spec={spec} slug={slug} title={`${name} · ${sub}`} showCursor={false} showCallout={false} />
          </AbsoluteFill>
        }
      >
        {/* pointer and callout live above the ridges, in screen space */}
        {inSteps && (
          <AbsoluteFill style={{ opacity: cursorO }}>
            <RecordingOverlay st={st} cam={cam} spec={spec} slug={slug} />
          </AbsoluteFill>
        )}

        {/* Title, over the sky while the window rises */}
        {frame < INTRO && (
          <div style={{ position: 'absolute', left: 96, right: 96, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ opacity: rise(frame, 6) * (1 - tween(frame, titleOut, titleOut + 14)), transform: `translateY(${(1 - rise(frame, 6)) * 16}px)` }}>
              <PillLabel dark size={28}>Working demo · real screens</PillLabel>
            </div>
            <div style={{ marginTop: 26 }}>
              <KineticText text={name} start={10} size={140} align="center" exit={titleOut} />
            </div>
            <div style={{ marginTop: 18 }}>
              <KineticText text={sub} start={18} stagger={3} size={44} color={C.peach} align="center" exit={titleOut + 2} tracking="-0.03em" />
            </div>
          </div>
        )}

        {/* Sign-off */}
        {o > 30 && (
          <div style={{ position: 'absolute', left: 96, right: 96, top: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ opacity: rise(frame, signAt + 30) }}>
              <Wordmark size={48} />
            </div>
            <div style={{ marginTop: 56 }}>
              <KineticText text={`${name}, built end to end\n{by one person.}`} start={signAt} stagger={4} size={104} align="center" lineHeight={1.04} />
            </div>
            <div style={{ marginTop: 30, fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em', color: C.inkSoft, opacity: rise(frame, signAt + 22) }}>
              Every screen in this film is the running app. Nothing is mocked up.
            </div>
            <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 36, opacity: rise(frame, signAt + 34), transform: `translateY(${(1 - rise(frame, signAt + 34)) * 16}px)` }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '22px 34px', borderRadius: 999, background: C.accent, color: C.onAccent, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', boxShadow: '0 14px 44px rgba(245,135,30,0.4)' }}>
                {CTA}
                <Icon name="arrow" size={30} stroke={2.2} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 500, color: C.ink, letterSpacing: '-0.015em', textAlign: 'left', lineHeight: 1.45 }}>
                <div>
                  <span style={{ color: C.muted }}>WhatsApp </span>
                  {CONTACT.whatsapp}
                </div>
                <div>{CONTACT.email}</div>
              </div>
            </div>
          </div>
        )}
      </DuskScene>

      {/* Progress hairline */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: `${progress * 100}%`, background: C.accent }} />
    </AbsoluteFill>
  )
}

/* The pointer and callout for the film, drawn over the ridges. */
function RecordingOverlay({ st, cam, spec, slug }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <RecordingView st={st} cam={cam} spec={spec} slug={slug} showWindow={false} />
    </div>
  )
}
