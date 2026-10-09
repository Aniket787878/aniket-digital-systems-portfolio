import { funnelPath } from '../../../../data.js'

/* "How it works", told as one loop: the path every client takes, from
   the free AI check to the Care Plan, and around again for the next job
   (funnelPath in data.js, 2026-10-09). Each stop says what the client
   gets at that step; `note` says what it costs in plain words (no package
   prices on the pages since 2026-10-09). */

export const TITLE = { lead: 'Check it. Plan it. Build it. Then keep it', serif: 'running' }

export const LEDE =
  'Four steps, and you can stop after any of them. The first is free, the second is credited to the third, and the price and the live date are fixed before anything is built.'

export const STOPS = funnelPath

export const REHOOK = 'Step one takes about three minutes.'
export const AGAIN = 'then the next job'
