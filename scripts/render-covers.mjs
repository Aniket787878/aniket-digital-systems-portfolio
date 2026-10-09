/* ------------------------------------------------------------------
   Renders the project covers: one designed picture per project card
   (scripts/covers/<slug>.html, one shared covers.css) to
   public/covers/<slug>.png at 1600x900 (a 720x405 page at 2.22x).

   The covers are designed pictures, not screenshots. Each one quotes its
   project truthfully and says what it is in its corner tag:
   - working demos quote the words of their real recorded test run
     (scripts/demo-transcripts/, public/walkthroughs/<slug>/)
   - client platforms are illustrations with no client data
   - demo screens quote the made-up business (scripts/demo-screens/)

   Playwright is not a project dependency; point PLAYWRIGHT at any install:
     PLAYWRIGHT=/tmp/pgcheck/node_modules/playwright/index.mjs \
       node scripts/render-covers.mjs [slug]
   Each PNG is then shrunk by scripts/compress-png.py (COMPRESS=0 skips).
   ------------------------------------------------------------------ */
import { readdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'scripts/covers')
const out = resolve(root, 'public/covers')
const only = process.argv[2]
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright')

const slugs = (await readdir(src))
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))
  .filter((s) => !only || s === only)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 720, height: 405 }, deviceScaleFactor: 1600 / 720 })
const files = []
for (const slug of slugs) {
  await page.goto(pathToFileURL(resolve(src, `${slug}.html`)).href)
  await page.evaluate(() => document.fonts.ready)
  // Anything spilling out of the canvas, or text wrapping out of its box,
  // is a layout bug: say so instead of shipping a clipped cover.
  const spill = await page.evaluate(() =>
    [...document.querySelectorAll('.cover *')]
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const text = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
        return r.width && (r.left < 0 || r.top < 0 || r.right > 720 || r.bottom > 405 ||
          (text && el.scrollWidth > el.clientWidth + 1))
      })
      .map((el) => el.className || el.tagName)
  )
  if (spill.length) console.warn(`  ! ${slug}: outside the canvas: ${[...new Set(spill)].join(', ')}`)
  const file = resolve(out, `${slug}.png`)
  await page.screenshot({ path: file })
  files.push(file)
  console.log(`  covers/${slug}.png`)
}
await browser.close()

if (process.env.COMPRESS !== '0' && files.length) {
  execFileSync('python3', [resolve(root, 'scripts/compress-png.py'), ...files], { stdio: 'inherit' })
}
