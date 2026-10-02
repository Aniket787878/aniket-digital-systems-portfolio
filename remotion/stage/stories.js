import { WALKTHROUGHS, URLS } from '../walkthroughs.js'

/*
  The words of every Stage film, in one place. Each film is one turn of the
  site's story loop: stakes, big question, headfake, rehook. *Starred* words
  are the serif accent; keep exactly one per line.

  Steps point at the real captures by number (1-based, as in the file names)
  and take their caption from that step's steps.json, so the words under a
  real screen are the words the capture script wrote for it. `chip` is the
  "what it did" pill; only set it when the product really did that thing on
  that screen. `headfakeAt` is the step the headfake line plays before.
*/

export const TAG = {
  real: 'Working demo · real screens',
  schematic: 'Schematic · client data never shown',
  reel: 'Showreel · real screens and schematics',
}

export const DEMO_STORIES = {
  'consent-signer': {
    name: 'Consent & Contract Signer',
    stakes: 'Paper consent forms get *lost.*',
    question: 'What if every signature proved *itself?*',
    headfake: 'Now try to change one *word.*',
    headfakeAt: 4,
    rehook: 'Signed. Sealed. *Checkable.*',
    steps: [
      [1, 'Documents', ['Documents', 'tracked']],
      [2, 'Template', ['Template', 'loaded']],
      [5, 'Sign', ['Signature', 'captured']],
      [6, 'Seal', ['Fingerprint', 'sealed']],
      [7, 'Verify', ['Check', 'authentic']],
      [8, 'Tamper check', ['Edit', 'caught']],
    ],
    clip: [2, 5, 6, 8],
  },
  'shared-inbox': {
    name: 'Shared Inbox',
    stakes: 'Enquiries land in three *places.*',
    question: 'What if they all landed in *one?*',
    headfake: 'Not every reply is for the *client.*',
    headfakeAt: 3,
    rehook: 'Every enquiry. One *board.*',
    steps: [
      [1, 'Inbox', ['Channels', 'merged']],
      [2, 'Thread', ['Client', 'details shown']],
      [3, 'Reply', ['Reply', 'sent']],
      [4, 'Notes', ['Note', 'team only']],
      [6, 'Stage', ['Stage', 'qualified']],
      [7, 'Pipeline', ['Board', 'updated']],
    ],
    clip: [1, 3, 5, 7],
  },
  'lead-research': {
    name: 'Lead Research',
    stakes: 'Hours lost hunting for *contacts.*',
    question: 'What if the research did *itself?*',
    headfake: 'It never guesses. *Ever.*',
    headfakeAt: 4,
    rehook: 'A list you can email *today.*',
    steps: [
      [1, 'Workspace', ['Leads', 'scored']],
      [2, 'Paste sites', ['Sites', 'added']],
      [3, 'Research', ['Sites', 'read live']],
      [4, 'Score', ['Score', '0 to 100']],
      [6, 'Contacts', ['Gaps', 'marked not found']],
      [8, 'Export', ['List', 'exported']],
    ],
    clip: [2, 3, 5, 6],
  },
}

/*
  The camera script for every real capture: the shots the camera holds on
  that screen, in the capture's own 1440x900 CSS px. Each shot is
  { x, y, z }: the point (x, y) lands at the viewport's horizontal centre
  and 42% down (so the subject sits in the upper part, clear of the
  caption at the bottom) and z is the zoom over the full-width view (1.6
  to 2.3, so the UI reads at 1280x720). Most screens hold one shot. Where
  the click and its result sit far apart, two: `click` says which shot
  the pointer's click plays in (cause, then effect; or context, then the
  click that leads on). `pt` corrects a steps.json target captured before
  a scroll (lead-research 5: the "Has email" filter is at y 537, not 297).
*/
export const CAMS = {
  'shared-inbox': {
    1: { shots: [{ x: 470, y: 250, z: 1.7 }] },
    2: { shots: [{ x: 600, y: 250, z: 1.6 }] },
    3: { shots: [{ x: 760, y: 790, z: 2.0 }, { x: 760, y: 240, z: 1.9 }], click: 0 },
    4: { shots: [{ x: 760, y: 790, z: 2.0 }, { x: 760, y: 430, z: 2.0 }], click: 0 },
    5: { shots: [{ x: 840, y: 205, z: 2.1 }, { x: 720, y: 520, z: 2.0 }], click: 0 },
    6: { shots: [{ x: 1060, y: 290, z: 2.1 }] },
    7: { shots: [{ x: 620, y: 245, z: 1.6 }] },
  },
  'consent-signer': {
    1: { shots: [{ x: 560, y: 270, z: 1.7 }, { x: 1000, y: 205, z: 2.0 }], click: 1 },
    2: { shots: [{ x: 520, y: 280, z: 2.0 }] },
    5: { shots: [{ x: 720, y: 725, z: 1.6 }] },
    6: { shots: [{ x: 1060, y: 552, z: 2.2 }] },
    7: { shots: [{ x: 720, y: 250, z: 2.3 }] },
    8: { shots: [{ x: 720, y: 250, z: 2.3 }] },
  },
  'lead-research': {
    1: { shots: [{ x: 640, y: 640, z: 1.6 }] },
    2: { shots: [{ x: 560, y: 360, z: 1.9 }] },
    3: { shots: [{ x: 1000, y: 180, z: 2.0 }, { x: 640, y: 450, z: 1.5 }], click: 0 },
    4: { shots: [{ x: 1000, y: 505, z: 2.0 }] },
    5: { shots: [{ x: 620, y: 640, z: 1.6 }], pt: { x: 449, y: 537, w: 80, h: 24 } },
    6: { shots: [{ x: 540, y: 250, z: 1.8 }] },
    8: { shots: [{ x: 1000, y: 170, z: 2.2 }] },
  },
}

/* A demo step in the shape the Act draws. */
export function captureStep(slug, n, stage, chip) {
  const s = WALKTHROUGHS[slug][n - 1]
  const cam = CAMS[slug]?.[n] || { shots: [{ x: 720, y: 378, z: 1 }] }
  return {
    kind: 'capture',
    slug,
    n,
    file: s.file,
    focus: s.focus,
    target: cam.pt || s.target,
    shots: cam.shots,
    click: cam.click ?? 0,
    caption: s.caption,
    stage,
    chip,
    url: URLS[slug],
  }
}

export const demoSteps = (slug) => DEMO_STORIES[slug].steps.map(([n, stage, chip]) => captureStep(slug, n, stage, chip))
