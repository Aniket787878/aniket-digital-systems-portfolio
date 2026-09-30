/*
  "A day at the front desk": seven moments from one clinic day, replayed.
  Every `user` and `reply` string is copied verbatim from a recorded test
  run (execution numbers in each comment, logs in each n8n/demos/<demo>/test-log.md).
  Only passing, positive runs are used: no refusals, no "I don't know",
  no clinical or emergency messages.

  The tests all ran on Wed 30 Sep 2026, which is why the reminder says
  "Thursday 1 October" and the booking says "next Monday, 5 October".
  Times of day come from the log where it states them (08:00 reminder,
  18:30 follow-up job); the others are placed at plausible hours.

  `result` is the one-line caption on the tool node. It is ours, not the
  AI's, and only says what that run's tool call actually did.
  `channel` is where the conversation happens: wa (WhatsApp), web
  (website chat) or inbox (team inbox, on the tools side).
*/

export const DAY_LABEL = 'Wed 30 Sep'
export const DAY_START = 8 * 60
export const DAY_END = 23 * 60

export const MOMENTS = [
  {
    // Appointment Desk test 9, execution 23830: the weekdays 08:00
    // confirmation job. Calendar and log row pinned, send disabled.
    id: 'reminder',
    time: '08:00',
    channel: 'wa',
    header: 'WhatsApp · automatic',
    label: 'Appointment reminder sent',
    log: 'reminder sent for Thu 1 Oct',
    tally: { r: 1 },
    turns: [
      {
        tools: [
          { node: 'cal', result: 'Tomorrow · 1 to remind' },
          { node: 'sheet', result: 'Reminder logged' },
        ],
        reply:
          'Hello Demo, this is Demo Physio Clinic. You have an appointment on Thursday 1 October, 10:00 AM. Please reply CONFIRM to keep it, or RESCHEDULE or CANCEL and we will help. This is an automated message. For anything urgent, call 112 or your doctor.',
      },
    ],
  },
  {
    // Appointment Desk MSG91 path test M-a, execution 23861: a WhatsApp
    // message from the allowed number. The model ran for real; the send
    // was pinned.
    id: 'fees',
    time: '09:20',
    channel: 'wa',
    header: 'WhatsApp',
    label: 'Fees and timings answered',
    log: 'fees and timings answered',
    tally: { q: 1 },
    turns: [
      {
        user: 'What are your timings and fees?',
        tools: [{ node: 'docs', result: 'From the fee list' }],
        reply:
          'Our opening hours are Monday to Friday 09:00-18:00 and Saturday 09:00-13:00. We are closed on Sundays.\n\n' +
          'Our fees are:\n' +
          '- Initial assessment (45 minutes): Rs 1,200\n' +
          '- Follow-up session (30 minutes): Rs 800\n\n' +
          'Would you like to book an appointment?',
      },
    ],
  },
  {
    // Knowledge Assistant, Postgres variant row 5, execution 23842: a
    // staff question answered from the services table and the fee list.
    id: 'pack',
    time: '11:05',
    channel: 'inbox',
    header: 'Team inbox · staff question',
    label: 'Staff question answered, source named',
    log: 'pack of 5 priced at ₹4,050',
    tally: { q: 1 },
    turns: [
      {
        user: 'What would a pack of 5 follow-up sessions of 45 minutes cost in total?',
        tools: [{ node: 'docs', result: 'Fee List · ₹4,050' }],
        reply:
          'A single 45-minute follow-up session costs ₹900. A pack of 5 follow-up sessions is charged at a 10% discount, making the total cost ₹4,050.\n\n' +
          'Sources: Services Table; Fee List',
      },
    ],
  },
  {
    // Knowledge Assistant, Postgres variant row 2, execution 23824, as
    // replayed in the Website Answer Widget captures.
    id: 'saturday',
    time: '13:10',
    channel: 'web',
    header: 'Website chat',
    label: 'Saturday hours answered on the website',
    log: 'Saturday hours answered',
    tally: { q: 1 },
    turns: [
      {
        user: 'What time do you open on Saturday?',
        tools: [{ node: 'docs', result: 'Opening Hours and Contact' }],
        reply: 'We are open from 9:00 am to 1:00 pm on Saturdays.\n\nSources: Opening Hours and Contact',
      },
    ],
  },
  {
    // Appointment Desk test 10, execution 23831: the Mon to Sat 18:30
    // follow-up job, "review_requested" branch. Calendar and log pinned.
    // The review link was a placeholder in the run; it is drawn as a
    // link chip, the words around it are verbatim.
    id: 'followup',
    time: '18:30',
    channel: 'wa',
    header: 'WhatsApp · automatic',
    label: 'Thank-you follow-up after a visit',
    log: 'follow-up sent after a visit',
    tally: { f: 1 },
    turns: [
      {
        tools: [
          { node: 'cal', result: 'Today · visit attended' },
          { node: 'sheet', result: 'Follow-up logged' },
        ],
        reply:
          'Hi Demo, thank you for visiting Demo Physio Clinic today. If you have a minute, we would value a short review of the service: REPLACE_WITH_REVIEW_LINK . Please do not include health details in it. Thank you!',
      },
    ],
  },
  {
    // Appointment Desk tests 1a (execution 23810, free times read from
    // the real calendar) and 1b (execution 23812). The same booking was
    // written to a real calendar and sheet in test 1d (execution 23954).
    id: 'booking',
    time: '22:05',
    channel: 'web',
    header: 'Website chat · after hours',
    label: 'Late-night booking made',
    log: 'booked Mon 5 Oct, 10:00',
    tally: { b: 1 },
    turns: [
      {
        user: 'Hi, I would like to book an initial assessment for next Monday morning please.',
        tools: [{ node: 'cal', result: 'Free · 09:00, 09:30, 10:00' }],
        reply:
          'I can certainly help you with that. An initial assessment is 45 minutes and costs Rs 1,200.\n\n' +
          'For next Monday, 5 October, I have the following morning slots available:\n' +
          '- 09:00\n' +
          '- 09:30\n' +
          '- 10:00\n\n' +
          'Do any of these work for you?',
      },
      {
        user: '10:00 works. My name is Demo Patient Alpha and my mobile is 0000000001.',
        tools: [
          { node: 'cal', result: 'Booked · Mon 5 Oct, 10:00' },
          { node: 'sheet', result: 'Booking logged' },
        ],
        reply:
          'I have booked your initial assessment for Monday, 5 October, at 10:00.\n\n' +
          'Please remember to arrive 10 minutes early and bring any reports you have. You can cancel or reschedule for free up to 12 hours before your appointment. If you need to make changes after that, please call the clinic.',
      },
    ],
  },
  {
    // Appointment Desk test 2, execution 23817: the free-slot check ran
    // for real; the move and the log row were pinned.
    id: 'reschedule',
    time: '22:50',
    channel: 'web',
    header: 'Website chat · after hours',
    label: 'Appointment moved',
    log: 'moved to Tue 6 Oct, 15:00',
    tally: { b: 1 },
    turns: [
      {
        user: 'Hello, I need to move my appointment on Monday 5 October at 10:00 to Tuesday 6 October at 15:00 if possible. I am Demo Patient Alpha, mobile 0000000001.',
        tools: [
          { node: 'cal', result: 'Moved · Tue 6 Oct, 15:00' },
          { node: 'sheet', result: 'Change logged' },
        ],
        reply:
          'Your appointment has been successfully rescheduled to Tuesday 6 October at 15:00. Please remember that you can cancel or reschedule for free up to 12 hours before your appointment.',
      },
    ],
  },
]

export const TALLY = [
  { key: 'q', label: 'Questions answered' },
  { key: 'b', label: 'Appointments booked or moved' },
  { key: 'r', label: 'Reminders sent' },
  { key: 'f', label: 'Follow-ups sent' },
]

/* ---------- timing: everything is a pure function of (moment, t) ---------- */

const CLOCK_MS = 700
const CHAR_MS = 22
const PULSE_MS = 720
const TOOL_GAP = 200
const WORD_MS = 36
const TURN_GAP = 900
const HOLD_MS = 3200
export { CLOCK_MS, WORD_MS }

export const minutesOf = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export const wordCount = (text) => text.split(/\s+/).filter(Boolean).length

/* Builds when each thing happens inside one moment. Pulses carry the
   edge they run along and which way (towards or away from the desk). */
function build(moment) {
  let t = CLOCK_MS
  const turns = []
  const pulses = []
  for (const turn of moment.turns) {
    const s = { composeStart: t, sentAt: t }
    if (turn.user) {
      t += turn.user.length * CHAR_MS
      s.sentAt = t
      pulses.push({ edge: moment.channel, toDesk: true, start: t, end: t + PULSE_MS })
      t += PULSE_MS + 120
    }
    for (const tool of turn.tools) {
      pulses.push({ edge: tool.node, toDesk: false, start: t, end: t + PULSE_MS, result: tool.result })
      t += PULSE_MS + TOOL_GAP
    }
    s.replyStart = t
    s.words = wordCount(turn.reply)
    pulses.push({ edge: moment.channel, toDesk: false, start: t, end: t + PULSE_MS })
    t += s.words * WORD_MS
    s.replyEnd = t
    t += TURN_GAP
    turns.push(s)
  }
  return { turns, pulses, doneAt: t - TURN_GAP, total: t + HOLD_MS }
}

export const SCHEDULES = MOMENTS.map(build)
