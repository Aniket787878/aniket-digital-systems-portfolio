/* ----------------------------------------------------------------
   The hero's enquiry flow, as one schedule. Every message and value
   is copied from the recorded runs in
   n8n/demos/appointment-desk/test-log.md (tests 1a, 1b and 9), so the
   window never says anything the demo did not actually do.

   The whole window is a pure function of t (ms into the loop): the
   clock in FlowWindow advances t, reduced motion pins it at FINAL.
   ---------------------------------------------------------------- */

export const MESSAGE = 'Hi, I would like to book an initial assessment for next Monday morning please.'
export const REPLY = '10:00 works.'
export const SLOTS = ['09:00', '09:30', '10:00']
export const PICKED = '10:00'

/* Node centres in the flow's 1000 x 600 coordinate box. Sizes are in
   the same units (1 unit = 0.1cqi), so wires meet the node edges. */
export const NODES = {
  chat: { x: 148, y: 296, w: 252, h: 318 },
  desk: { x: 452, y: 296, w: 214, h: 124 },
  cal: { x: 820, y: 108, w: 310, h: 170 },
  sheet: { x: 820, y: 326, w: 310, h: 100 },
  remind: { x: 820, y: 506, w: 310, h: 100 }
}

const right = (n) => [NODES[n].x + NODES[n].w / 2, NODES[n].y]
const left = (n) => [NODES[n].x - NODES[n].w / 2, NODES[n].y]
const curve = ([x1, y1], [x2, y2]) => {
  const mx = (x1 + x2) / 2
  return `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`
}

export const WIRES = {
  'chat-desk': curve(right('chat'), left('desk')),
  'desk-cal': curve(right('desk'), left('cal')),
  'desk-sheet': curve(right('desk'), left('sheet')),
  'desk-remind': curve(right('desk'), left('remind'))
}

/* Pulses: [wire, start, end, reverse]. Reverse runs right-to-left
   (the answer travelling back towards the chat). */
const PULSES = [
  ['chat-desk', 3050, 3650, false],
  ['desk-cal', 4900, 5500, false],
  ['desk-cal', 6250, 6800, true],
  ['chat-desk', 6800, 7350, true],
  ['chat-desk', 9350, 9950, false],
  ['desk-cal', 9950, 10550, false],
  ['desk-sheet', 10750, 11350, false],
  ['desk-remind', 11550, 12150, false]
]

export const T = {
  typeStart: 500,
  typeEnd: 2900,
  read: 3650,
  slots: 5500,
  offered: 7350,
  replyStart: 8500,
  replyEnd: 9150,
  booked: 10550,
  logged: 11350,
  reminded: 12150,
  fadeOut: 14600,
  total: 15400
}

export const FINAL = T.fadeOut - 1

const span = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)))

/* Everything the window shows at time t. */
export function derive(t) {
  const typed = Math.round(span(t, T.typeStart, T.typeEnd) * MESSAGE.length)
  const replyTyped = Math.round(span(t, T.replyStart, T.replyEnd) * REPLY.length)

  const pulses = []
  const lit = new Set()
  for (const [wire, a, b, reverse] of PULSES) {
    if (t < a) continue
    lit.add(wire)
    if (t < b) pulses.push({ wire, u: span(t, a, b), reverse, key: `${wire}-${a}` })
  }

  let desk = 'idle'
  if (t >= T.read) desk = 'reading'
  if (t >= T.offered) desk = 'waiting'
  if (t >= T.replyEnd) desk = 'booking'
  if (t >= T.reminded) desk = 'done'

  let focus = null
  if (t >= T.typeStart) focus = 'chat'
  if (t >= T.read) focus = 'desk'
  if (t >= T.slots) focus = 'cal'
  if (t >= T.offered) focus = 'desk'
  if (t >= T.replyStart) focus = 'chat'
  if (t >= 9950) focus = 'desk'
  if (t >= T.booked) focus = 'cal'
  if (t >= T.logged) focus = 'sheet'
  if (t >= T.reminded) focus = 'remind'

  return {
    typed,
    typing: t >= T.typeStart && t < T.typeEnd + 250,
    replyTyped,
    replyTyping: t >= T.replyStart - 200 && t < T.replyEnd + 250,
    replyShown: t >= T.replyStart - 200,
    desk,
    focus,
    lit,
    pulses,
    slotsShown: SLOTS.map((_, i) => t >= T.slots + i * 160),
    slotsLabel: t >= T.slots,
    booked: t >= T.booked,
    logged: t >= T.logged,
    reminded: t >= T.reminded,
    waiting: t >= T.offered && t < T.replyEnd,
    fade: 1 - span(t, T.fadeOut, T.total - 100),
    fadeIn: span(t, 0, 450)
  }
}

export const DESK_STATUS = {
  idle: 'ready',
  reading: 'reading the clinic’s diary',
  waiting: 'free times offered',
  booking: 'booking 10:00',
  done: 'booked · logged'
}

/* The same steps as a list: the phone layout and the reduced-motion
   reading order. `at` is when each step appears in the loop. */
export const STEPS = [
  { id: 'chat', glyph: 'web', label: 'Website chat', at: T.typeStart },
  { id: 'desk', glyph: 'desk', label: 'AI front desk', detail: 'reading the clinic’s diary', at: T.read },
  { id: 'cal', glyph: 'cal', label: 'Calendar', detail: 'free times · Mon 5 Oct', at: T.slots },
  { id: 'wait', glyph: 'ring', label: 'Waiting on a yes', at: T.offered },
  { id: 'reply', glyph: 'web', label: 'Website chat', at: T.replyStart },
  { id: 'booked', glyph: 'cal', label: 'Calendar', detail: 'Booked · Mon 5 Oct, 10:00 to 10:45', at: T.booked },
  { id: 'sheet', glyph: 'sheet', label: 'Sheets', detail: 'Booking logged', at: T.logged },
  { id: 'remind', glyph: 'bell', label: 'Reminder', detail: 'Reminder prepared for 08:00', at: T.reminded }
]

export const LOG = [
  { text: '10:00 booked · Mon 5 Oct', tool: 'calendar', at: T.booked },
  { text: 'Booking logged', tool: 'sheets', at: T.logged },
  { text: 'Reminder prepared for 08:00', tool: 'reminder', at: T.reminded }
]
