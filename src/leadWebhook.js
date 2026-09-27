/* The contact form's inbox (the n8n webhook in docs/specs/). VITE_* is
   baked in at build time, so `formConnected` is fixed for the life of a
   deploy: set VITE_LEAD_WEBHOOK_URL in Vercel and redeploy to turn the
   form on. Plain data, so ContactPage can read it without importing a
   component module's constants. */
/* The fallback is same-origin: vercel.json rewrites /api/lead to the live
   "Portfolio — Lead intake" workflow on n8n (Sheet + Gmail alert +
   auto-reply, see n8n/README.md). Proxying keeps the n8n host out of the
   visitor's browser and makes CORS a non-issue. The rewrite exists only on
   Vercel, so `npm run dev` / `preview` need VITE_LEAD_WEBHOOK_URL set to
   the n8n URL for a submit to go anywhere. The env var always wins. */
const FALLBACK_WEBHOOK = '/api/lead'
export const WEBHOOK_URL = import.meta.env.VITE_LEAD_WEBHOOK_URL || FALLBACK_WEBHOOK
export const formConnected = WEBHOOK_URL.length > 0
