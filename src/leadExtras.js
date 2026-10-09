/* ------------------------------------------------------------------
   The structured fields every lead carries on top of the original ones
   (docs/outreach/2026-10-09-funnel-strategy.md, sections 4 and 6). The
   original fields (name, email, company, workflow_broken, service,
   budget_band, source, submitted_at) are untouched, so the live n8n
   intake keeps working; these are extra keys it can ignore until the
   v2 workflow (n8n/UPGRADE-2026-10.md) files them in their own columns.

     phone          WhatsApp number, normalised to +<digits> where the
                    country is clear ('' when none was given)
     timing         the "When do you need it?" answer, in words
     package        the package and the price shown on the result screen
     lead_temp      hot / warm / cold, by the strategy's rule (below)
     utm_source, utm_medium, utm_campaign, landing_page
                    where the visit started, kept for the session
   ------------------------------------------------------------------ */

const LANDING_KEY = 'lead-landing'

const EMPTY_LANDING = { utm_source: '', utm_medium: '', utm_campaign: '', landing_page: '' }

/* Called once in main.jsx, before the first render: the first page of a
   visit is the landing page, and its UTM tags are the ones that count.
   `?src=` (the outreach links, strategy item 7) stands in for
   utm_source when there is none. Later pages in the same tab never
   overwrite it. */
export function captureLanding() {
  try {
    if (sessionStorage.getItem(LANDING_KEY)) return
    const params = new URLSearchParams(window.location.search)
    const pick = (key) => (params.get(key) || '').trim().slice(0, 100)
    const landing = {
      utm_source: pick('utm_source') || pick('src'),
      utm_medium: pick('utm_medium'),
      utm_campaign: pick('utm_campaign'),
      landing_page: (window.location.pathname + window.location.search).slice(0, 300)
    }
    sessionStorage.setItem(LANDING_KEY, JSON.stringify(landing))
  } catch {
    /* Storage blocked: the lead simply goes without these. */
  }
}

export function landingFields() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(LANDING_KEY) || 'null')
    if (saved && typeof saved === 'object') return { ...EMPTY_LANDING, ...saved }
  } catch {
    /* Fall through. */
  }
  return { ...EMPTY_LANDING }
}

/* A typed WhatsApp number as +<country><number>, ready for a wa.me link.
   An Indian mobile typed without the country code (10 digits from 6 to
   9, with or without a leading 0) gets +91. Anything else without a +
   or 00 is kept as the digits typed, because guessing a country would
   send the reply link to a stranger. */
export function normalisePhone(raw) {
  const text = (raw || '').trim()
  if (!text) return ''
  const digits = text.replace(/\D/g, '')
  if (digits.length < 7) return text
  if (text.startsWith('+')) return `+${digits}`
  if (digits.startsWith('00')) return `+${digits.slice(2)}`
  const local = digits.replace(/^0/, '')
  if (/^[6-9]\d{9}$/.test(local)) return `+91${local}`
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`
  return digits
}

/* Hot / warm / cold for the website and software plans (strategy,
   section 4):
     cold  the budget is below where the package starts, or "no fixed
           date yet"
     hot   the budget fits, it is wanted within a month, and a WhatsApp
           number was given
     warm  everything in between: the budget fits but later, the budget
           is "not sure", or no number was given
   `budgetBelow` is true / false, or null when the band is "not sure". */
export function planTemp({ budgetBelow, when, phone }) {
  if (budgetBelow === true || when === 'open') return 'cold'
  if (budgetBelow === false && (when === 'asap' || when === 'month') && phone) return 'hot'
  return 'warm'
}

/* The AI check asks no budget or date, so its rule is the strategy's
   AI-only part: hot needs a number plus 30+ enquiries a week or a team
   of 3+; a team of 1 or 2 with fewer than 10 enquiries is cold. */
export function aiTemp({ enquiries, team, phone }) {
  const small = team === '1-2' && enquiries === 'lt10'
  if (small) return 'cold'
  const busy = enquiries === '30-100' || enquiries === '100+' || (team && team !== '1-2')
  if (busy && phone) return 'hot'
  return 'warm'
}
