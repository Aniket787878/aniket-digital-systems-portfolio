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
     cta_click        { placement }  the primary buttons (StartCta: "Get
                                     started", "Plan your website", "Plan
                                     your software", "Get your free AI
                                     check") and rehooks into them
     start_choose     { choice }     a pick on /start: websites, software,
                                     ai, not-sure (the AI check link) or talk
     flow_start       { service }    the first answer in a plan or the
                                     AI check: websites, software or ai
     flow_submit      { service }    a plan or the AI check sent
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
