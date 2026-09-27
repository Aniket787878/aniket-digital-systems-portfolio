import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { C, SANS, BrowserChrome, Wordmark, useFonts, tween, clamp } from './shared.jsx'
import { DuskScene } from './DuskScene.jsx'
import { StageRail } from './PlatformFilm.jsx'
import { URLS } from './walkthroughs.js'
import { DEMO_STEPS, WIN, CHROME, Capture, demoSteps } from './demoScenes.jsx'

/*
  The card loop for the three working demos, framed like the platform
  films (wordmark, step rail, browser window, caption, night ground over
  the dusk) so all five project cards read as one set. The difference is
  the window: these are the real captures from public/walkthroughs/, and
  the tag says so. No title or sign-off: it is a loop, and it ends by
  crossfading back into its first step so there is no seam.
*/

export const F_STAGE = 96

/* Same steps and labels as the full demo films (demoScenes.jsx). */
export const FRAMED = DEMO_STEPS

export const framedLength = (slug) => FRAMED[slug].length * F_STAGE


export function FramedClip({ slug }) {
  useFonts()
  const frame = useCurrentFrame()
  const steps = demoSteps(slug)
  const idx = Math.min(steps.length - 1, Math.floor(frame / F_STAGE))
  const f = frame - idx * F_STAGE
  const total = framedLength(slug)

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, overflow: 'hidden' }}>
      <DuskScene frame={frame} push={0.5} rise={0.3} fade={1} horizon={0.74}>
        {/* the same night ground the platform films sit on while they run */}
        <AbsoluteFill style={{ background: 'rgba(11,11,12,0.72)' }} />
        <AbsoluteFill
          style={{
            backgroundImage: 'radial-gradient(rgba(242,240,237,0.07) 1.2px, transparent 1.3px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(80% 70% at 60% 50%, #000 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(80% 70% at 60% 50%, #000 30%, transparent 85%)',
          }}
        />

        <StageRail scenes={steps} idx={idx} f={f} local={frame} stageLen={F_STAGE} />

        <div
          style={{
            position: 'absolute',
            left: WIN.x,
            top: WIN.y,
            width: WIN.w,
            height: WIN.h,
            borderRadius: 18,
            overflow: 'hidden',
            border: `1px solid ${C.lineStrong}`,
            background: C.page,
            boxShadow: '0 40px 120px rgba(0,0,0,0.55)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <BrowserChrome url={URLS[slug]} height={CHROME} />
          <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
            {steps.map((s, i) => {
              const sf = frame - i * F_STAGE
              /* the last step also fades back in as step 1 at the loop point */
              const o =
                i === 0
                  ? Math.max(
                      interpolate(sf, [-2, 0, F_STAGE - 8, F_STAGE + 4], [1, 1, 1, 0], clamp),
                      tween(frame, total - 12, total)
                    )
                  : interpolate(sf, [-2, 10, F_STAGE - 8, F_STAGE + 4], [0, 1, 1, 0], clamp)
              if (o <= 0) return null
              return <Capture key={s.file} slug={slug} step={s} f={sf} opacity={o} />
            })}
          </div>
        </div>

        {/* Caption under the window */}
        <div
          style={{
            position: 'absolute',
            left: WIN.x,
            width: WIN.w,
            top: WIN.y + WIN.h + 30,
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: C.inkSoft,
            opacity: (idx === 0 ? 1 : tween(f, 8, 22)) * (1 - tween(f, F_STAGE - 10, F_STAGE)),
          }}
        >
          {steps[idx].caption}
        </div>
      </DuskScene>

      <div style={{ position: 'absolute', top: 52, left: 64, zIndex: 10 }}>
        <Wordmark size={36} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 44,
          right: 64,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 20px 10px 16px',
          borderRadius: 999,
          background: 'rgba(11,11,12,0.55)',
          border: '1px solid rgba(255,200,154,0.22)',
          fontSize: 24,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          color: C.inkSoft,
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.accent }} />
        Working demo · real screens
      </div>
    </AbsoluteFill>
  )
}
