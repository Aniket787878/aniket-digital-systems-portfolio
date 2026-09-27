import { AbsoluteFill, spring } from 'remotion'
import { C, SANS, rise, tween, easeInOut, lerp } from '../shared.jsx'
import { KineticText } from '../KineticText.jsx'
import { PERSPECTIVE, lerpCam, camTransform, focusShot, Spotlight, Callout } from '../Camera.jsx'
import { BrowserFrame } from '../BrowserFrame.jsx'

/*
  The proof beat of the brand film: three real captures, in the same camera
  language as the walkthrough films. They cascade in as tilted windows,
  then each comes forward in turn, flattens, and the camera springs in to
  the part that matters (spotlit, with a callout) before pulling back out
  to the fan so the viewer re-orients.

  All three focus regions avoid the lines of the captured UI that contain
  dashes, so nothing on screen is highlighted that the house style forbids.
*/

const VW = 1440
const VH = 900
const CH = 84 // chrome, tall enough that the product name still reads when small
const WIN = { w: VW, h: VH + CH }

export const APPS = [
  { key: 'relay', src: 'walkthroughs/relay/02.png', title: 'Relay · shared inbox', rect: { x: 528, y: 222, w: 400, h: 100 }, label: 'Relay', text: 'Every enquiry lands in one shared inbox.' },
  { key: 'signet', src: 'walkthroughs/signet/06.png', title: 'Signet · consent signing', rect: { x: 876, y: 413, w: 388, h: 268 }, label: 'Signet', text: 'Signed, sealed and verifiable by anyone.' },
  { key: 'prospector', src: 'walkthroughs/prospector/05.png', title: 'Prospector · lead research', rect: { x: 945, y: 578, w: 262, h: 290 }, label: 'Prospector', text: 'Every lead scored, shortlisted, tracked.' },
]

/* Fan poses (window centre → stage point), per aspect. */
const FAN = {
  wide: {
    relay: { S: 0.66, ax: 960, ay: 610, rx: 0, ry: 0 },
    signet: { S: 0.52, ax: 560, ay: 590, rx: 0, ry: 26 },
    prospector: { S: 0.52, ax: 1360, ay: 590, rx: 0, ry: -26 },
  },
  tall: {
    prospector: { S: 0.55, ax: 540, ay: 700, rx: 10, ry: 0 },
    signet: { S: 0.57, ax: 540, ay: 1040, rx: 10, ry: 0 },
    relay: { S: 0.59, ax: 540, ay: 1390, rx: 10, ry: 0 },
  },
}
/* paint order: back to front */
const ORDER = { wide: ['signet', 'prospector', 'relay'], tall: ['prospector', 'signet', 'relay'] }

export const PROOF = { fanIn: 0, first: 76, every: 100, push: 32, hold: 44, back: 24 }
export const proofLength = PROOF.first + PROOF.every * 3 - 4

export function ProofBeat({ f, W, H }) {
  const tall = H > W
  const stage = { w: W, h: H, persp: PERSPECTIVE }
  const poses = FAN[tall ? 'tall' : 'wide']
  const maxS = 1.85

  // which app is forward, and how far (0 = in the fan, 1 = focused)
  const focusOf = (k) => {
    const at = PROOF.first + k * PROOF.every
    const pin = spring({ frame: f - at, fps: 30, config: { damping: 22, stiffness: 110 }, durationInFrames: PROOF.push })
    const pout = tween(f, at + PROOF.push + PROOF.hold, at + PROOF.push + PROOF.hold + PROOF.back, easeInOut)
    return { at, z: Math.max(0, pin) * (1 - pout) }
  }
  const foci = APPS.map((_, k) => focusOf(k))
  const anyZ = Math.max(...foci.map((x) => x.z))
  const out = rise(f, proofLength + 4, { stiffness: 70 })

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 96, right: 96, top: tall ? 150 : 96 }}>
        <KineticText text={tall ? 'Real screens.\n{Running apps.}' : 'Real screens. {Running apps.}'} frame={f} start={6} stagger={5} exit={PROOF.first - 8} size={tall ? 100 : 88} color={C.inkDark} accent={C.accentDeep} align="center" />
      </div>
      <AbsoluteFill
        style={{
          perspective: PERSPECTIVE,
          perspectiveOrigin: '50% 50%',
          opacity: 1 - out,
          transform: `translateY(${(-out * 200).toFixed(2)}px)`,
          filter: out > 0.01 ? `blur(${(out * 12).toFixed(2)}px)` : undefined,
        }}
      >
        {ORDER[tall ? 'tall' : 'wide'].map((key, paint) => {
          const k = APPS.findIndex((a) => a.key === key)
          const app = APPS[k]
          const fan = { ...poses[key], cx: WIN.w / 2, cy: WIN.h / 2 }
          const rect = { x: app.rect.x, y: app.rect.y + CH, w: app.rect.w, h: app.rect.h }
          const shot = focusShot({ rect, win: WIN, stage, side: { w: 520, h: 250 }, stack: { w: tall ? 888 : 1000, h: 190 }, minS: fan.S * 1.2, maxS })
          const { z } = foci[k]
          // arriving: rise from below and out of depth, staggered
          const a = rise(f, PROOF.fanIn + paint * 12, { stiffness: 50 })
          const arrive = { ...fan, ay: fan.ay + (1 - a) * 420, S: fan.S * (0.85 + 0.15 * a), rx: fan.rx + (1 - a) * 18 }
          const float = { ...arrive, ax: arrive.ax + Math.sin(f * 0.02 + k * 2) * 5, ay: arrive.ay + Math.cos(f * 0.018 + k * 2) * 6 }
          const cam = lerpCam(float, shot.cam, z)
          // the others step back while one is forward
          const back = Math.max(0, anyZ - z)
          const spot = tween(f, foci[k].at + 20, foci[k].at + 34) * (1 - tween(f, foci[k].at + PROOF.push + PROOF.hold - 6, foci[k].at + PROOF.push + PROOF.hold + 8))
          return (
            <BrowserFrame
              key={key}
              src={app.src}
              width={VW}
              title={app.title}
              chrome={CH}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                transformOrigin: '0 0',
                transform: camTransform(cam),
                opacity: Math.min(1, a * 1.6) * (1 - back * 0.96),
                filter: a < 0.98 || back > 0.01 ? `blur(${((1 - a) * 14 + back * 6).toFixed(2)}px)` : undefined,
                zIndex: z > 0.001 ? 10 : paint,
              }}
            >
              <Spotlight rect={app.rect} amount={spot} S={cam.S} w={VW} h={VH} />
            </BrowserFrame>
          )
        })}
      </AbsoluteFill>
      {/* callouts, in screen space */}
      {APPS.map((app, k) => {
        const at = foci[k].at
        const t = spring({ frame: f - at - 26, fps: 30, config: { damping: 200, stiffness: 120 } }) * (1 - tween(f, at + PROOF.push + PROOF.hold - 8, at + PROOF.push + PROOF.hold + 4))
        const rect = { x: app.rect.x, y: app.rect.y + CH, w: app.rect.w, h: app.rect.h }
        const fan = { ...FAN[tall ? 'tall' : 'wide'][app.key] }
        const shot = focusShot({ rect, win: WIN, stage, side: { w: 520, h: 250 }, stack: { w: tall ? 888 : 1000, h: 190 }, minS: fan.S * 1.2, maxS })
        return <Callout key={app.key} box={shot.box} label={app.label} text={app.text} t={t} />
      })}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: tall ? 110 : 96,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 26,
          fontWeight: 500,
          color: C.mutedDark,
          letterSpacing: '-0.01em',
          opacity: rise(f, 50) * (1 - anyZ) * (1 - out),
          transform: `translateY(${lerp(10, 0, rise(f, 50)).toFixed(2)}px)`,
        }}
      >
        Captured from the running apps, not mocked up.
      </div>
    </AbsoluteFill>
  )
}
