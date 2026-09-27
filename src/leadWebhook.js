/* The contact form's inbox (the n8n webhook in docs/specs/). VITE_* is
   baked in at build time, so `formConnected` is fixed for the life of a
   deploy: set VITE_LEAD_WEBHOOK_URL in Vercel and redeploy to turn the
   form on. Plain data, so ContactPage can read it without importing a
   component module's constants. */
export const WEBHOOK_URL = import.meta.env.VITE_LEAD_WEBHOOK_URL || ''
export const formConnected = WEBHOOK_URL.length > 0
