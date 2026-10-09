import { aiCheck } from '../../data.js'

/* ------------------------------------------------------------------
   The free AI check's result, worked out in the browser from the
   answers alone: no AI call, no server, so it is instant and the same
   answers always give the same result.

   1. Score every job. A job the visitor ticked under "where does the
      time go" starts well ahead of one they did not; the other answers
      (volume, reply speed, tools, team size, kind of business) nudge the
      order, so the top three still make sense if they ticked only one.
   2. Give each of the top three a rough hours-a-week range from a rule
      of thumb: enquiry-driven jobs scale with enquiries a week, admin
      jobs with team size. These are deliberately round, modest numbers
      and are always shown as a rough estimate, never as a measurement.
   ------------------------------------------------------------------ */

const VOLUME = { lt10: 0, '10-30': 1, '30-100': 2, '100+': 3 }
const TEAM = { '1-2': 0, '3-10': 1, '11-30': 2, '30+': 3 }

/* Hours a week, [low, high], indexed by the volume or team step. */
const HOURS = {
  replying: { by: 'volume', table: [[1, 2], [2, 5], [5, 10], [10, 20]] },
  faqs: { by: 'volume', table: [[1, 2], [1, 3], [3, 6], [6, 12]] },
  booking: { by: 'volume', table: [[1, 2], [2, 4], [3, 6], [6, 12]] },
  followups: { by: 'volume', table: [[1, 2], [1, 3], [2, 5], [4, 8]] },
  invoices: { by: 'team', table: [[1, 2], [2, 4], [3, 6], [5, 10]] },
  reports: { by: 'team', table: [[1, 2], [1, 3], [2, 4], [3, 6]] },
  dataentry: { by: 'team', table: [[1, 3], [2, 5], [4, 8], [6, 12]] }
}

/* Small nudges per answer: [job, points]. */
const NUDGES = {
  business: {
    clinic: [['booking', 2], ['followups', 2], ['faqs', 1]],
    studio: [['booking', 2], ['followups', 2]],
    agency: [['reports', 2], ['invoices', 2], ['dataentry', 1]],
    consultancy: [['invoices', 2], ['reports', 1], ['followups', 1]],
    education: [['faqs', 2], ['booking', 1], ['followups', 1]],
    other: [['replying', 1]]
  },
  speed: {
    minutes: [],
    hours: [['replying', 1]],
    day: [['replying', 2], ['followups', 1]],
    later: [['replying', 3], ['followups', 2]],
    missed: [['replying', 4], ['followups', 2]]
  },
  tools: {
    whatsapp: [['replying', 1], ['faqs', 1]],
    email: [['replying', 1]],
    phone: [['booking', 1]],
    sheets: [['dataentry', 2], ['reports', 1]],
    calendar: [['booking', 1], ['followups', 1]],
    accounts: [['invoices', 2]],
    clientlist: [['followups', 1], ['dataentry', 1]],
    paper: [['dataentry', 2], ['booking', 1]]
  }
}

const ORDER = Object.keys(aiCheck.jobs)

export function scoreJobs(answers) {
  const score = Object.fromEntries(ORDER.map((job) => [job, 0]))
  const add = (pairs) => pairs?.forEach(([job, n]) => (score[job] += n))

  for (const job of answers.time || []) score[job] += 10
  add(NUDGES.business[answers.business])
  add(NUDGES.speed[answers.speed])
  for (const tool of answers.tools || []) add(NUDGES.tools[tool])

  const volume = VOLUME[answers.enquiries] ?? 0
  score.replying += volume
  score.faqs += volume
  score.booking += Math.min(volume, 2)
  const team = TEAM[answers.team] ?? 0
  score.dataentry += team
  score.reports += team

  /* Ties keep the order of the question's options, so the result is stable. */
  return ORDER.map((job) => ({ job, score: score[job] })).sort((a, b) => b.score - a.score)
}

export function hoursFor(job, answers) {
  const { by, table } = HOURS[job]
  const step = by === 'volume' ? VOLUME[answers.enquiries] ?? 0 : TEAM[answers.team] ?? 0
  return table[step]
}

/* The top three jobs with their copy and rough range, plus the total. */
export function result(answers) {
  const top = scoreJobs(answers)
    .slice(0, 3)
    .map(({ job }) => ({ id: job, ...aiCheck.jobs[job], hours: hoursFor(job, answers) }))
  const low = top.reduce((sum, j) => sum + j.hours[0], 0)
  const high = top.reduce((sum, j) => sum + j.hours[1], 0)
  return { top, total: [low, high] }
}

/* Answer values back to the words the visitor picked. */
export function labelOf(stepId, value) {
  const step = aiCheck.steps.find((s) => s.id === stepId)
  return step?.options.find((o) => o.value === value)?.label || value
}

export function labelsOf(stepId, values) {
  return (values || []).map((v) => labelOf(stepId, v))
}

/* The plain-text summary that goes into the lead's message field
   (`workflow_broken`), so the existing intake (sheet, alert, auto-reply)
   files it with no change on the n8n side. */
export function summary(answers, res, whatsapp) {
  const lines = [
    'Free AI check',
    `Business: ${labelOf('business', answers.business)}`,
    `Enquiries a week: ${labelOf('enquiries', answers.enquiries)}`,
    `Reply time today: ${labelOf('speed', answers.speed)}`,
    `Time goes on: ${labelsOf('time', answers.time).join('; ') || 'not given'}`,
    `Tools today: ${labelsOf('tools', answers.tools).join('; ') || 'not given'}`,
    `Team: ${labelOf('team', answers.team)}`,
    whatsapp ? `WhatsApp: ${whatsapp}` : null,
    '',
    'Top 3 shown on screen:',
    ...res.top.map((j, i) => `${i + 1}. ${j.name} (${j.hours[0]} to ${j.hours[1]} hours a week, rough estimate)`),
    `Rough total shown: ${res.total[0]} to ${res.total[1]} hours a week`
  ]
  return lines.filter((line) => line !== null).join('\n')
}
