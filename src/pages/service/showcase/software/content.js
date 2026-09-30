/* Copy for "Inside the software". Shared by the 3D scene's labels and the
   static fallback so the two can never say different things. Top layer
   first, the order the stack is drawn in. */

export const TITLE = { lead: 'One screen. Four layers doing the', serif: 'work' }

export const LEDE =
  'Custom software looks like one simple screen. Underneath, the layers below it do the real work: they follow your rules, keep every record and keep your other tools in step.'

export const NOTE = 'Real screen from a working demo · layers illustrated'

export const REHOOK = { to: '/projects/shared-inbox', label: 'See the Shared Inbox this is taken from' }

export const SCREEN_SRC = '/showcase/software/inbox-2048.webp'
export const SCREEN_SRC_SMALL = '/showcase/software/inbox-1200.webp'
export const SCREEN_ALT =
  'The Shared Inbox demo: a list of client conversations on the left, an open WhatsApp thread in the middle and the client’s details on the right.'

export const LAYERS = [
  {
    key: 'screen',
    title: 'What your team sees',
    lines: ['Every client message in one list, with who owns it and what happens next.']
  },
  {
    key: 'rules',
    title: 'The rules it follows',
    lines: [
      'New email from a client goes to the right person',
      'Nothing sits unanswered past a day',
      'Every reply is logged'
    ]
  },
  {
    key: 'records',
    title: 'Where everything is kept',
    lines: ['Every client, conversation and note, filed where the whole team can find it.']
  },
  {
    key: 'tools',
    title: 'The tools it talks to',
    lines: ['Email, calendar, sheets and WhatsApp stay in step, so nobody copies anything across by hand.']
  }
]

export const TOOLS = ['Email', 'Calendar', 'Sheets', 'WhatsApp']

/* The whole scroll story as pure functions of progress p (0..1 across the
   pinned track), so the scene and the DOM labels read the same clock.
   0–0.14 assembled and turning · 0.14–0.3 comes apart · 0.26–0.7 each
   layer takes focus in turn · 0.7–0.82 snaps shut with one small hop ·
   0.8–0.92 the screen lights up. */
const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smooth = (a, b, v) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const inOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function explodeAt(p) {
  if (p <= 0.14) return 0
  if (p <= 0.3) return inOutCubic((p - 0.14) / 0.16)
  if (p <= 0.7) return 1
  if (p <= 0.82) {
    const t = (p - 0.7) / 0.12
    // Fall shut (accelerating, like something closing under its own
    // weight), then one small hop off the landing before it settles.
    if (t < 0.62) return 1 - Math.pow(t / 0.62, 2)
    return 0.07 * Math.sin((Math.PI * (t - 0.62)) / 0.38)
  }
  return 0
}

export function focusAt(p) {
  if (p < 0.26 || p >= 0.7) return -1
  return Math.min(3, Math.floor((p - 0.26) / 0.11))
}

export const litAt = (p) => smooth(0.8, 0.92, p)
