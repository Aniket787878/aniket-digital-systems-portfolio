import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from 'remotion'
import { C, SANS, BrowserChrome, Wordmark, useFonts, tween, clamp } from './shared.jsx'
import { DuskScene } from './DuskScene.jsx'
import { StageRail } from './PlatformFilm.jsx'
import { WALKTHROUGHS, URLS } from './walkthroughs.js'

/*
  The card loop for the three working demos, framed like the platform
  films (wordmark, step rail, browser window, caption, night ground over
  the dusk) so all five project cards read as one set. The difference is
  the window: these are the real captures from public/walkthroughs/, and
  the tag says so. No title or sign-off: it is a loop, and it ends by
  crossfading back into its first step so there is no seam.
*/

export const F_STAGE = 96

/* Short rail labels for the steps each card shows (1-based, as in the
   file names). The captions under the window come from steps.json. */
export const FRAMED = {
  'consent-signer': [
    [1, 'Documents'],
    [2, 'Template'],
    [5, 'Sign'],
    [6, 'Seal'],
    [7, 'Verify'],
    [8, 'Tamper check'],
  ],
  'shared-inbox': [
    [1, 'Inbox'],
    [2, 'Thread'],
    [3, 'Reply'],
    [4, 'Notes'],
    [6, 'Stage'],
    [7, 'Pipeline'],
  ],
  'lead-research': [
    [1, 'Workspace'],
    [2, 'Paste sites'],
    [3, 'Research'],
    [4, 'Score'],
    [6, 'Contacts'],
    [8, 'Export'],
  ],
}

export const framedLength = (slug) => FRAMED[slug].length * F_STAGE

const WIN = { x: 700, y: 170, w: 1120, h: 720 }
const CHROME = 48

export function FramedClip({ slug }) {
  useFonts()
  const frame = useCurrentFrame()
  const steps = FRAMED[slug].map(([n, stage]) => ({ ...WALKTHROUGHS[slug][n - 1], stage }))
  const idx = Math.min(steps.length - 1, Math.floor(frame / F_STAGE))
  const f = frame - idx * F_STAGE
  const total = framedLength(slug)
  const imgW = WIN.w
  const imgH = (imgW * 900) / 1440

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
              /* Push in toward the step's focus region (from steps.json), so
                 the real screen stays legible at card size. Capped at 1.45x
                 so the reader never loses where on the page they are. */
              const k = imgW / 1440
              const fc = s.focus || { x: 0, y: 0, w: 1440, h: 900 }
              const vw = WIN.w
              const vh = WIN.h - CHROME
              const Z = Math.max(1, Math.min(1.45, vw / (fc.w * k), vh / (fc.h * k)))
              const z = 1 + (Z - 1) * tween(sf, 10, 56)
              const cx = (fc.x + fc.w / 2) * k
              const cy = (fc.y + fc.h / 2) * k
              const tx = Math.min(0, Math.max(vw - imgW * z, vw / 2 - cx * z))
              const ty = Math.min(0, Math.max(vh - imgH * z, vh / 2 - cy * z))
              return (
                <Img
                  key={s.file}
                  src={staticFile(`walkthroughs/${slug}/${s.file}`)}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: imgW,
                    height: imgH,
                    opacity: o,
                    transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${z.toFixed(4)})`,
                    transformOrigin: '0 0',
                  }}
                />
              )
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
