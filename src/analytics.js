/* ------------------------------------------------------------------
   Custom events for Vercel Web Analytics, without the npm package.

   The tracking script (/_vercel/insights/script.js) and its `va` queue
   are added to index.html by the vercelAnalytics plugin in
   vite.config.js, on production builds only. The queue is what the
   official package calls too: window.va('event', { name, data }).
   Until the script loads, calls wait in window.vaq; in dev, or with
   Analytics switched off in the Vercel dashboard, there is no `va` and
   this does nothing. It never throws: a lost event must not cost a lead.

   Events in use:
     cta_click        { placement }  the "Get your free AI check" buttons
     ai_check_start   {}             the first answer on /ai-check
     ai_check_submit  { business, enquiries }  the check sent
   ------------------------------------------------------------------ */
export function track(name, data) {
  try {
    if (typeof window === 'undefined' || typeof window.va !== 'function') return
    window.va('event', data ? { name, data } : { name })
  } catch {
    /* Analytics is never worth an error on the page. */
  }
}
