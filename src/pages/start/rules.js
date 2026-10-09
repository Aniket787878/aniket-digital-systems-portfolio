import { budgetBands, packages, startFlows } from '../../data.js'

/* ------------------------------------------------------------------
   The website and software plans' results, worked out in the browser
   from the answers alone (like the AI check's aicheck/rules.js): no
   server, no AI call, the same answers always give the same result.

   Every price and timeline shown is read from `packages` in data.js.
   Nothing here makes up a number: where the answers go past what a
   package includes (more pages, payments), the result says it is
   priced on the call instead of guessing.
   ------------------------------------------------------------------ */

const pkg = (name) => packages.find((p) => p.name === name)
export const BUSINESS_WEBSITE = pkg('Business Website')
export const WEBSITE_AI = pkg('Website + AI Assistant')
export const INTERNAL_TOOL = pkg('Internal Tool / Dashboard')
export const PLATFORM = pkg('Custom Platform')

/* The top of each budget band, in that band's own currency, so a budget
   below a package's starting price can be said out loud. The open-ended
   bands and "not sure" have no top. */
const BAND_TOP = { 'usd:<1.5k': 1500, 'usd:1.5k-5k': 5000, '<50k': 50000, '50k-2L': 200000 }

/* "From $1,200", "₹1.5L – ₹3L", "From ₹35,000": the first amount, as a
   number. Null when the price is not a number ("Quoted after a call"). */
export function startingAmount(price) {
  const match = /([\d.,]+)\s*([kL])?/.exec(price || '')
  if (!match) return null
  const n = Number(match[1].replace(/,/g, ''))
  if (!Number.isFinite(n)) return null
  return n * (match[2] === 'L' ? 100000 : match[2] === 'k' ? 1000 : 1)
}

/* True when the visitor's band tops out below where the package starts,
   compared in the band's own currency. */
export function belowStart(band, pack) {
  const top = BAND_TOP[band]
  if (!top || typeof pack.price !== 'object') return false
  const currency = band.startsWith('usd:') ? 'usd' : 'inr'
  const start = startingAmount(pack.price[currency])
  return start !== null && top < start
}

/* ---------- website ---------- */

/* What the Business Website already includes (its `includes` in
   data.js: pages, phone-first, Google, enquiry form and WhatsApp
   button). Anything else they ticked is scoped and priced on the call. */
const IN_WEBSITE = ['services', 'enquiries', 'whatsapp']

export function websiteResult(answers) {
  const flow = startFlows.websites
  const needs = answers.needs || []
  const ai = needs.includes('assistant')
  const pack = ai ? WEBSITE_AI : BUSINESS_WEBSITE
  const covered = needs.filter((n) => IN_WEBSITE.includes(n) || (ai && n === 'assistant'))
  const extra = needs.filter((n) => !covered.includes(n))

  const why = ai
    ? 'You want questions answered by an AI assistant, so this is the website with the assistant built in.'
    : 'You need a clear site that brings enquiries in, without an assistant. That is the Business Website. An assistant can be added later.'

  const notes = []
  if (answers.pages === '6-10' || answers.pages === '10+') {
    notes.push('The package covers up to 5 pages. More pages are priced on the call, once we know what goes on them.')
  }
  if (answers.current === 'rebuild') {
    notes.push('You have a site that works. If the real problem is enquiries going nowhere, wiring them into your inbox and WhatsApp may be all it needs, and I will say so on the call.')
  }
  if (belowStart(answers.budget, pack)) {
    notes.push(
      ai
        ? 'Your budget is under where this starts. On the call we can look at the Business Website first and adding the assistant later.'
        : 'Your budget is under where this starts. On the call I will say honestly what fits it.'
    )
  }

  return {
    pack,
    why,
    covered: covered.map((n) => ({ id: n, text: flow.needs[n] })),
    extra: extra.map((n) => ({ id: n, text: flow.needs[n] })),
    notes
  }
}

/* ---------- software ---------- */

/* Points per answer: [module, points]. A must-have counts most; what is
   messy today and who uses it nudge the order. */
const MUST = {
  bookings: [['bookings', 10]],
  payments: [['payments', 10]],
  portal: [['portal', 10]],
  roles: [['roles', 10]],
  reports: [['reports', 10]],
  documents: [['documents', 10]]
}
const MESS = {
  sheets: [['records', 4], ['dashboard', 3]],
  whatsapp: [['inbox', 5]],
  paper: [['documents', 4], ['records', 2]],
  apps: [['dashboard', 3], ['records', 2], ['inbox', 2]],
  portal: [['portal', 5]],
  reports: [['reports', 4], ['dashboard', 2]],
  payments: [['payments', 5]]
}
const USERS = {
  clients: [['portal', 2], ['bookings', 1]],
  staff: [['roles', 2], ['dashboard', 1]],
  managers: [['reports', 2], ['dashboard', 2]]
}

export function scoreModules(answers) {
  const order = Object.keys(startFlows.software.modules)
  const score = Object.fromEntries(order.map((id) => [id, 0]))
  const add = (pairs) => pairs?.forEach(([id, n]) => (score[id] += n))
  for (const v of answers.must || []) add(MUST[v])
  for (const v of answers.mess || []) add(MESS[v])
  for (const v of answers.users || []) add(USERS[v])
  /* Ties keep the order modules are listed in, so the result is stable. */
  return order.map((id) => ({ id, score: score[id] })).sort((a, b) => b.score - a.score)
}

export function softwareResult(answers) {
  const flow = startFlows.software
  const must = answers.must || []
  const users = answers.users || []
  const clients = users.includes('clients') || must.includes('portal')
  /* A platform when clients log in too and several parts must work
     together from day one, or when the must-haves alone are most of the
     list. Otherwise an internal tool for the team. */
  const platform = (clients && must.length >= 3) || must.length >= 4
  const pack = platform ? PLATFORM : INTERNAL_TOOL

  const why = platform
    ? clients
      ? 'Your clients would log in as well as your team, and several parts have to work together from day one. That is a platform, quoted once we have mapped it.'
      : 'Several parts have to work together from day one. That is a platform, quoted once we have mapped it.'
    : 'It is for your team, replacing the spreadsheets and threads it runs on now. That is an internal tool.'

  const modules = scoreModules(answers)
    .slice(0, 3)
    .map(({ id }) => ({ id, ...flow.modules[id] }))

  const notes = []
  if (!platform && belowStart(answers.budget, pack)) {
    notes.push('Your budget is under where this starts. On the call I will say honestly whether a smaller first step, like one automation, fits better.')
  }

  return { pack, why, modules, notes }
}

/* ---------- the lead ---------- */

/* Answer values back to the words the visitor picked. Budget values come
   from `budgetBands`, so they are looked up there. */
const ALL_BANDS = [...budgetBands.usd, ...budgetBands.inr]

export function labelOf(flow, stepId, value) {
  if (stepId === 'budget') return ALL_BANDS.find((b) => b.value === value)?.label || value
  const step = flow.steps.find((s) => s.id === stepId)
  return step?.options.find((o) => o.value === value)?.label || value
}

const words = (flow, step, value) =>
  Array.isArray(value)
    ? value.map((v) => labelOf(flow, step.id, v)).join('; ') || 'not given'
    : value
      ? labelOf(flow, step.id, value)
      : 'not given'

/* The plain-text summary that goes into the lead's message field
   (`workflow_broken`), so the n8n intake files it with no change. */
export function summary(key, answers, res, whatsapp) {
  const flow = startFlows[key]
  const price = (p) => (typeof p.price === 'object' ? `${p.price.usd} / ${p.price.inr}` : p.price)
  const lines = [
    key === 'websites' ? 'Free website plan' : 'Free software plan',
    ...flow.steps.map((step) => `${step.question} ${words(flow, step, answers[step.id])}`),
    whatsapp ? `WhatsApp: ${whatsapp}` : null,
    '',
    `Suggested on screen: ${res.pack.name} (${price(res.pack)}, ${res.pack.timeline})`,
    ...(res.modules ? ['First screens shown:', ...res.modules.map((mod, i) => `${i + 1}. ${mod.name}`)] : []),
    ...(res.extra?.length ? [`Priced on the call: ${res.extra.map((n) => labelOf(flow, 'needs', n.id)).join('; ')}`] : []),
    ...res.notes.map((n) => `Note shown: ${n}`)
  ]
  return lines.filter((line) => line !== null).join('\n')
}
