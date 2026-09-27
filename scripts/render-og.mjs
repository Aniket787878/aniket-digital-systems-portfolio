/* ------------------------------------------------------------------
   Renders public/og.png, the 1200x630 share card, from the headline in
   src/data.js, in the hero's dusk style (same sky stops, same seeded
   ridges from components/dusk/terrain.js, Inter 500).

   Playwright is not a project dependency; point PLAYWRIGHT at any install:
     PLAYWRIGHT=/tmp/pw/node_modules/playwright/index.mjs node scripts/render-og.mjs
   Re-run it whenever site.headline changes.
   ------------------------------------------------------------------ */
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { site } from '../src/data.js'
import { ridge, starField } from '../src/components/dusk/terrain.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright')
const font = pathToFileURL(resolve(root, 'node_modules/@fontsource/inter/files/inter-latin-500-normal.woff2')).href

const FAR = ridge({ seed: 11, base: 150, amp: 60, detail: 0.8 })
const MID = ridge({ seed: 29, base: 210, amp: 70 })
const NEAR = ridge({ seed: 53, base: 300, amp: 44, detail: 1.2 })
const stars = starField(60, 5)
  .map((s) => `<i style="left:${s.x}%;top:${s.y}%;width:${s.r}px;height:${s.r}px;opacity:${s.o}"></i>`)
  .join('')
const [line1, line2] = site.headline
const svg = (d, fill, h) =>
  `<svg viewBox="0 0 1440 400" preserveAspectRatio="none" style="position:absolute;left:-2%;right:-2%;bottom:0;width:104%;height:${h}px">${fill.defs || ''}<path d="${d}" fill="${fill.c}"/></svg>`

const html = `<!doctype html><html><head><style>
@font-face { font-family: Inter; font-weight: 500; src: url('${font}') format('woff2'); }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; font-family: Inter, sans-serif; font-weight: 500; }
.card { position: relative; width: 1200px; height: 630px; overflow: hidden;
  background: linear-gradient(180deg, #0b0b0c 0%, #0f0a08 22%, #1d1109 36%, #3d1d0b 50%, #7a3a12 62%, #c8661c 74%, #f0a05a 84%, #f7b578 92%); }
.stars { position: absolute; inset: 0 0 50% 0; }
.stars i { position: absolute; border-radius: 50%; background: #fff4e8; }
.sun { position: absolute; left: 50%; bottom: 4%; width: 1300px; height: 520px; transform: translateX(-50%);
  background: radial-gradient(closest-side, rgba(255,196,130,.6), rgba(245,135,30,.2) 55%, transparent); filter: blur(12px); }
.copy { position: absolute; z-index: 5; left: 0; right: 0; top: 92px; text-align: center; color: #fff; }
.brand { display: inline-flex; align-items: center; gap: 12px; padding: 9px 20px 9px 14px; border-radius: 999px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.16); font-size: 24px; letter-spacing: -0.01em; }
h1 { margin-top: 34px; font-weight: 500; font-size: 76px; line-height: 1.04; letter-spacing: -0.045em; }
h1 span { display: block; }
h1 .warm { color: #ffc89a; }
p { margin-top: 26px; font-size: 25px; color: rgba(255,255,255,.78); letter-spacing: -0.01em; }
</style></head><body><div class="card">
<div class="stars">${stars}</div><div class="sun"></div>
${svg(FAR, { c: 'url(#f)', defs: '<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3812"/><stop offset=".6" stop-color="#3a1b0b"/></linearGradient></defs>' }, 330)}
${svg(MID, { c: 'url(#m)', defs: '<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b1b0c"/><stop offset=".5" stop-color="#1a0e08"/></linearGradient></defs>' }, 210)}
${svg(NEAR, { c: '#0b0b0c' }, 110)}
<div class="copy">
  <span class="brand"><svg width="26" height="26" viewBox="0 0 16 16" fill="none"><path d="M3.5 10.5a4.5 4.5 0 0 1 9 0z" fill="#f5871e"/><path d="M1.5 12.5h13" stroke="#ffc89a" stroke-width="1.4" stroke-linecap="round"/></svg>Aniket</span>
  <h1><span>${line1}</span><span class="warm">${line2}</span></h1>
  <p>Booking, intake, follow-ups and AI notes for clinics and care practices.</p>
</div></div></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: resolve(root, 'public/og.png'), type: 'png' })
await browser.close()
console.log('wrote public/og.png')
