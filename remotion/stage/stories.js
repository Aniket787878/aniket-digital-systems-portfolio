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

/* A demo step in the shape the Act draws. */
export function captureStep(slug, n, stage, chip) {
  const s = WALKTHROUGHS[slug][n - 1]
  return { kind: 'capture', slug, file: s.file, focus: s.focus, target: s.target, caption: s.caption, stage, chip, url: URLS[slug] }
}

export const demoSteps = (slug) => DEMO_STORIES[slug].steps.map(([n, stage, chip]) => captureStep(slug, n, stage, chip))
