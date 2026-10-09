import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { site, seo, packages, projects } from './src/data.js'

/* ------------------------------------------------------------------
   siteMeta: writes everything that depends on the site's address or its
   positioning from ONE place (site.origin, seo, packages in src/data.js):

   - the %…% tokens in index.html (title, description, canonical, og:*,
     twitter:*, and the JSON-LD block)
   - robots.txt and sitemap.xml, emitted into dist/ (and served by the dev
     server), so the sitemap lists exactly the routes and case studies that
     exist and a domain change is one edit.
   ------------------------------------------------------------------ */
const ORIGIN = site.origin.replace(/\/+$/, '')
const abs = (path) => `${ORIGIN}${path}`

const escAttr = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function jsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': abs('/#person'),
        name: 'Aniket',
        url: abs('/'),
        jobTitle: 'Digital systems builder for service businesses',
        description: site.subtitle,
        address: { '@type': 'PostalAddress', addressCountry: 'IN' },
        knowsAbout: [
          'Booking and scheduling systems',
          'Client intake and consent workflows',
          'Payments integration',
          'AI assistants and document drafting',
          'Operations automation',
          'Internal tools and dashboards',
          'n8n',
          'Claude API',
          'React',
          'PostgreSQL'
        ],
        worksFor: { '@id': abs('/#service') }
      },
      {
        '@type': 'ProfessionalService',
        '@id': abs('/#service'),
        name: 'Aniket · Digital Systems Builder',
        url: abs('/'),
        image: abs(seo.ogImage),
        description: seo.description,
        founder: { '@id': abs('/#person') },
        provider: { '@id': abs('/#person') },
        areaServed: { '@type': 'Place', name: 'Worldwide' },
        availableLanguage: ['en', 'hi'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: packages.map((pkg) => ({
            '@type': 'Offer',
            priceCurrency: 'USD',
            description: `${pkg.price.usd}, ${pkg.timeline.toLowerCase()}`,
            itemOffered: {
              '@type': 'Service',
              name: pkg.name,
              description: pkg.deliverable
            }
          }))
        }
      }
    ]
  }
  // Escape "<" so no string in the data can close the script element.
  return JSON.stringify(graph).replace(/</g, '\\u003c')
}

const routes = ['/', '/ai-check', '/websites', '/software', '/ai', '/projects', '/about', '/contact', '/privacy', ...projects.map((p) => `/projects/${p.slug}`)]

function sitemap() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = routes
    .map((r) => `  <url>\n    <loc>${abs(r)}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`

function siteMeta() {
  const tokens = {
    SITE_ORIGIN: ORIGIN,
    SEO_TITLE: escAttr(seo.title),
    SEO_DESCRIPTION: escAttr(seo.description),
    OG_TITLE: escAttr(seo.ogTitle),
    OG_IMAGE: abs(seo.ogImage),
    OG_IMAGE_ALT: escAttr(seo.ogImageAlt),
    JSON_LD: jsonLd()
  }
  const files = { 'robots.txt': robots, 'sitemap.xml': sitemap }

  return {
    name: 'site-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/%([A-Z_]+)%/g, (whole, key) => (key in tokens ? tokens[key] : whole))
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url || '').replace(/^\//, '').split('?')[0]
        if (!files[name]) return next()
        res.setHeader('Content-Type', name.endsWith('.xml') ? 'application/xml' : 'text/plain')
        res.end(files[name]())
      })
    },
    generateBundle() {
      for (const [fileName, make] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source: make() })
      }
    }
  }
}

/* ------------------------------------------------------------------
   Vercel Web Analytics without the @vercel/analytics package: the same
   two pieces it adds at runtime, written into index.html on production
   builds only (in dev the /_vercel path does not exist). The `va` queue
   holds events until the script arrives; src/analytics.js sends to it.
   It records nothing until Analytics is switched on for the project in
   the Vercel dashboard. No cookies; see the privacy note.
   ------------------------------------------------------------------ */
function vercelAnalytics() {
  return {
    name: 'vercel-analytics',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'script',
        children: 'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};',
        injectTo: 'head'
      },
      { tag: 'script', attrs: { defer: true, src: '/_vercel/insights/script.js' }, injectTo: 'head' }
    ]
  }
}

export default defineConfig({
  plugins: [react(), siteMeta(), vercelAnalytics()],
  server: {
    allowedHosts: ['.monkeycode-ai.live']
  }
})
