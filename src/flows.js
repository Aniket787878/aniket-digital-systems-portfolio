/* ------------------------------------------------------------------
   Where each primary button goes (components/FunnelCta.jsx). Plain
   data, so pages can read it without importing a component module.
   ------------------------------------------------------------------ */
export const CHECK_PATH = '/ai-check'
export const CHECK_LABEL = 'Get your free AI check'
export const START_PATH = '/start'
export const START_LABEL = 'Get started'

/* Each area's free first step. */
export const FLOW = {
  websites: { to: '/start/website', label: 'Plan your website', name: 'Free website plan' },
  software: { to: '/start/software', label: 'Plan your software', name: 'Free software plan' },
  ai: { to: CHECK_PATH, label: CHECK_LABEL, name: 'Free AI check' }
}

