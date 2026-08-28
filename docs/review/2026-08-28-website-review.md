# Website Review — 2026-08-28

Scope: full working tree at `c28f084` on `main` — every page, band and component
in `src/`, `index.html`, `public/`, the docs tree, and a production build + lint
run. The live Vercel deployment could **not** be reached from the review
environment (outbound proxy blocks `vercel.app`, and the connected Vercel
account is the Mindset team, not `aniket-s1`), so everything below is verified
against the code, not the served site.

## Verdict

The engineering is in genuinely good shape: the build passes, lint is clean,
the bundle is small, accessibility is above par for a portfolio, and the
copy is unusually honest and buyer-directed. What holds the site back is not
code — it is the same short list of real-world inputs the repo already tracks
as "Blocked on Aniket", plus a handful of buildable items that punch above
their apparent size. The single most damaging one for *this* audience:
**sharing the site on WhatsApp produces no preview image**, because the OG
image is an SVG.

## Verified healthy

- **Build & lint** — `npm run build` passes in ~1.4s; `eslint .` reports
  nothing. JS bundle is 214KB (68KB gzip), CSS 44KB (8KB gzip). Fine for a
  content site.
- **Performance fundamentals** — hero is a 63KB JPEG (19KB at 960w) with a
  `srcset`, preloaded from `index.html` with `fetchpriority="high"`, and a
  designed CSS ramp behind it as fallback. Explicit `width`/`height` prevent
  layout shift. All below-fold images are `loading="lazy"`.
- **Accessibility** — visible-focus styles (`:focus-visible`) in all three
  stylesheets; `prefers-reduced-motion` honoured in `index.css`,
  `HomePage.css` and the gallery arc's JS; the contact form has a polite
  live region for status and `role="alert"` for errors; FAQ disclosures use
  real buttons with `aria-expanded`; the flow diagram (`SystemVisual`) carries
  a `role="img"` label; decorative images have empty `alt`.
- **Conversion structure** — the nine-band home page reads in a sensible
  buying order; every number renders with its directional note (the house
  rule holds everywhere `outcome` appears, including the hero proof); the
  WhatsApp-first CTA logic degrades cleanly to the contact route when
  `site.whatsapp` is empty; the pricing cards prefill the offer name into
  the chat opener; the contact form's fallback and error states never lose
  what the visitor typed.
- **Defensive rendering** — `ProjectsPage`/`ProjectDetailPage` treat every
  data field as optional; `Media` renders a labelled placeholder well instead
  of collapsing; empty social entries and the empty WhatsApp number render
  nothing rather than dead links.
- **Routing hygiene** — real 404 page wired to `*`, SPA rewrite present in
  `vercel.json`, deep-link slugs all present in `sitemap.xml`.

## Findings

### P0 — the site cannot do its job until these land

Both are known and blocked on Aniket; they lead the review because every other
improvement is downstream of them.

1. **No lead is captured.** `VITE_LEAD_WEBHOOK_URL` is unset, so a visitor who
   fills the form gets the honest "That didn't send" panel and a mailto
   fallback — to `hello@aniketbuilds.com`, a placeholder address on an
   unpurchased domain. So even the fallback path dead-ends: a diligent buyer
   who emails it reaches nobody. Until the webhook (or at minimum a real
   email) exists, the contact page is a demo.
2. **The primary CTA does not exist.** `site.whatsapp` is `''`, so the
   WhatsApp buttons the whole CTA system is designed around render nowhere —
   hero, nav, pricing, CTA band, footer and contact all fall back to the
   secondary path. The site's stated thesis is that this buyer lives on
   WhatsApp; right now the site cannot be contacted there.

### High — buildable, disproportionate impact

3. **OG image is SVG — WhatsApp link previews will not show it.**
   `og:image` points at `og.svg`; WhatsApp, iMessage, Slack, LinkedIn and X
   do not reliably render SVG previews. For a business whose leads move
   through WhatsApp, the link a happy client forwards to a friend arrives
   with no image. Export a 1200×630 PNG and point `og:image` at it (already
   on the gap list; it deserves its priority raised).
4. **Canonical and sitemap point at a domain nobody owns yet.** `index.html`
   sets `rel=canonical` to `https://aniketbuilds.com/`, and `robots.txt` +
   all seven `sitemap.xml` URLs use the same placeholder — while the site is
   live and indexable at the Vercel URL. Canonicalising a live site to an
   unregistered domain is worse than no canonical: if the name is ever taken
   by someone else, the site is telling search engines their site is the
   real one. Until the domain is bought, either canonicalise to the Vercel
   URL or drop the tag.
5. **Every route shares one `<title>` and description.** There is no per-route
   head management, so `/projects/consent-approval-system` and the 404 page
   all present the homepage title in tabs, history, search results and shares
   — despite each case study being individually listed in the sitemap. A
   ~15-line `useEffect`-based title setter (no new dependency) would cover
   the five route shapes.
6. **All 16 content images are hotlinked Unsplash stock.** Known, marked, and
   correctly excluded from any screenshot claim — but it remains the biggest
   credibility gap on the buyer side: four case studies about real systems,
   illustrated by offices nobody works in. Real screenshots (even cropped or
   redacted ones) beat everything else on this list except items 1–3.

### Medium

7. **Favicon contradicts the brand accent.** `public/favicon.svg` is still the
   sage-green mark while the site accent is orange (`--accent: #ff5c00`).
   Already on the gap list as P0 #4; still open.
8. **`docs/system/01-website-map.md` is stale on the hero.** The doc that
   promises "code state verified 2026-08-27" still describes the raw-WebGL
   shader (`HeroCanvas.jsx`, its cleanup and resize traps, "there is no
   `images.hero`: the hero ground is the WebGL shader") — but commit
   `5f041a8` replaced the hero with a photograph and deleted `HeroCanvas.jsx`.
   CLAUDE.md rule 3 has the current truth. Three sections need rewriting:
   *Stack*, *Images*, and row 1 of the *Home page composition* table.
9. **The sprint price is now stated in three places, the docs say two.**
   `site.pricingAnchor`, `packages[0].price` and the FAQ answer "The sprint
   starts at ₹40,000" all carry the number; `data.js`'s own comment and the
   website map only bind the first two. If the band ever moves, the FAQ is
   the copy that will be missed. Extend the comment (or derive the FAQ line).
10. **Soft 404s.** The SPA rewrite returns HTTP 200 for every path, so bad
    URLs serve the 404 *page* with a success *status*. Search engines treat
    these as soft-404s. Low priority pre-domain; worth a
    `<meta name="robots" content="noindex">` on the 404 route when per-route
    head management (finding 5) lands.
11. **No analytics.** Still open from the gap list. Once the webhook goes
    live there will be no way to see which band converts. Vercel Web
    Analytics or Plausible — cookieless either way — closes it.
12. **The future webhook has no abuse protection.** The form posts JSON to a
    public URL with no honeypot field, no timing check, no rate limit. Not
    urgent while the URL is unset; the day it goes live, a honeypot input
    is ~10 lines in the form and one filter node in n8n, and stops the
    lead sheet filling with bot noise.

### Low / polish

13. **FAQ `aria-controls` dangles while closed.** The answer region only
    mounts when open, so the button references a non-existent id in the
    collapsed state. Harmless in practice; rendering the region hidden
    instead would satisfy validators.
14. **Three arrow-icon implementations.** `components/ArrowIcon.jsx`, a
    private `ArrowIcon` in `Nav.jsx`, and an inline copy in `Footer.jsx` are
    the same path. One import serves all three.
15. **"Aniket®" claims a registered trademark.** The `®` in the nav brand and
    footer watermark is a legal assertion of a *registered* mark. If nothing
    is registered, use ™ or drop it — a buyer's lawyer is the only person who
    will notice, but that is the wrong person to be noticed by.
16. **Nine font-weight imports.** `main.jsx` loads 4 Inter + 5 Archivo
    weights (~250KB of woff2 across the set, cached after first load). If any
    weight is unused in the stylesheets, dropping it is free; worth an audit,
    not urgent.
17. **`/about` still does not exist.** The jobs half of "both,
    client-leaning" has no destination and no CV. Known-blocked on the CV
    PDF; noted for completeness.

## Suggested order of attack

Unblockable by Aniket only: **1, 2** (webhook env var + redeploy; WhatsApp
number), then real screenshots (6), domain (unlocks 4 properly), CV.

Buildable now, highest return first: **3** (PNG OG image), **5** (per-route
titles + 10's noindex), **4** (interim canonical decision), **7** (favicon),
**8/9** (doc sync), **11** (analytics), **12** (honeypot, alongside the
webhook), then the polish items.
