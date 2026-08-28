import { useEffect } from 'react'

/* ------------------------------------------------------------------
   Per-route head management, without a dependency.

   index.html ships one static <title>, description, robots meta and
   canonical link — correct for the home page and for the first paint
   of any deep link. This hook retargets those same elements on route
   change, so each page presents its own title in tabs, history,
   search results and shares.

   Two limits, both accepted on purpose:
   - og:* tags are NOT touched. Social scrapers do not run JS, so
     dynamic og tags would be theatre; every share carries the home
     card until the site is prerendered. That is fine — the card sells
     the whole site, not one route.
   - The static tags in index.html stay authoritative for crawlers
     that skip JS. Google runs it; the canonical this sets is what
     Google indexes per route.
   ------------------------------------------------------------------ */

/* TODO: replace with the real domain when it is bought. The same origin
   also appears statically in index.html, public/robots.txt and
   public/sitemap.xml — move all four together. */
export const SITE_ORIGIN = 'https://aniket-portfolio-six-bice.vercel.app'

function set(selector, attr, value) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attr, value)
}

/**
 * @param {object} meta
 * @param {string} meta.title       Full document title, brand included.
 * @param {string} meta.description Meta description for this route.
 * @param {string} meta.path        Route path ('/', '/projects', …) — becomes the canonical.
 * @param {boolean} [meta.noindex]  True on the 404 page: the SPA rewrite answers
 *                                  every URL with HTTP 200, so this meta is the
 *                                  only thing keeping bad URLs out of the index.
 */
export function usePageMeta({ title, description, path, noindex = false }) {
  useEffect(() => {
    document.title = title
    set('meta[name="description"]', 'content', description)
    set('link[rel="canonical"]', 'href', SITE_ORIGIN + path)
    set('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow')
  }, [title, description, path, noindex])
}
