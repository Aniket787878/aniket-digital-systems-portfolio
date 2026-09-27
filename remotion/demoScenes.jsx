import { Img, staticFile } from 'remotion'
import { tween } from './shared.jsx'
import { WALKTHROUGHS, URLS } from './walkthroughs.js'

/*
  The three working demos, told the way the platform films are told:
  a stage rail, a browser window and a caption per stage. PlatformFilm
  and FramedClip both read these. The difference from the platforms is
  what fills the window: the real captures from public/walkthroughs/,
  not a drawn wireframe, and the films label themselves accordingly.

  Each entry: [step number (1-based, as in the file names), rail label].
  The caption comes from that step's steps.json.
*/
export const DEMO_STEPS = {
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

/* The window both films draw the screen into, and its address bar. */
export const WIN = { x: 700, y: 170, w: 1120, h: 720 }
export const CHROME = 48

/*
  One capture, filling the window body, pushing in toward the step's
  focus region (from steps.json) so the real screen stays legible even at
  card size. Capped at 1.45x so the reader never loses where on the page
  they are. `f` is frames since the stage began.
*/
export function Capture({ slug, step, f, opacity = 1 }) {
  const vw = WIN.w
  const vh = WIN.h - CHROME
  const imgW = vw
  const imgH = (imgW * 900) / 1440
  const k = imgW / 1440
  const fc = step.focus || { x: 0, y: 0, w: 1440, h: 900 }
  const Z = Math.max(1, Math.min(1.45, vw / (fc.w * k), vh / (fc.h * k)))
  const z = 1 + (Z - 1) * tween(f, 10, 56)
  const cx = (fc.x + fc.w / 2) * k
  const cy = (fc.y + fc.h / 2) * k
  const tx = Math.min(0, Math.max(vw - imgW * z, vw / 2 - cx * z))
  const ty = Math.min(0, Math.max(vh - imgH * z, vh / 2 - cy * z))
  return (
    <Img
      src={staticFile(`walkthroughs/${slug}/${step.file}`)}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: imgW,
        height: imgH,
        opacity,
        transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${z.toFixed(4)})`,
        transformOrigin: '0 0',
      }}
    />
  )
}

export const demoSteps = (slug) =>
  DEMO_STEPS[slug].map(([n, stage]) => ({ ...WALKTHROUGHS[slug][n - 1], stage }))

/* Scene objects in the shape PlatformFilm expects from SCENES. */
export const DEMO_SCENES = Object.fromEntries(
  Object.keys(DEMO_STEPS).map((slug) => [
    slug,
    demoSteps(slug).map((step) => ({
      stage: step.stage,
      url: URLS[slug],
      caption: step.caption,
      Screen: ({ f }) => <Capture slug={slug} step={step} f={f} />,
    })),
  ])
)
