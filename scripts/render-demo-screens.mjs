/* ------------------------------------------------------------------
   Renders the demo screens: designed mock-ups of three flows for
   made-up businesses (scripts/demo-screens/<slug>/*.html, one shared
   screens.css). Not captures of a running system; every screen carries
   the label "Demo screen · made-up business".

   Output, per slug: public/demo-screens/<slug>/NN-name.png (1440x900 at
   2x, the same capture space as public/walkthroughs/) and a steps.json
   with each screen's caption and crop, read by src/walkthroughs.js.
   Captions live in scripts/demo-screens/screens.json, the one place to
   edit them.

   Playwright is not a project dependency; point PLAYWRIGHT at any install:
     PLAYWRIGHT=/tmp/pgcheck/node_modules/playwright/index.mjs \
       node scripts/render-demo-screens.mjs [slug]
   One light job: a single browser, one page at a time.

   Each screenshot is then shrunk by scripts/compress-png.py (Python with
   Pillow and numpy): about 500KB to about 100KB a screen at the same 2x
   size, text untouched. Skip it with COMPRESS=0 to see the raw capture.
   ------------------------------------------------------------------ */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'scripts/demo-screens')
const manifest = JSON.parse(await readFile(resolve(src, 'screens.json'), 'utf8'))
const only = process.argv[2]
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright')

/* The whole content block (x 120..1320), which is exactly 4:3 at full
   height: the case-study step-through shows every screen uncropped. */
const DEFAULT_FOCUS = { x: 120, y: 0, w: 1200, h: 900 }

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })

for (const [slug, screens] of Object.entries(manifest)) {
  if (only && slug !== only) continue
  const out = resolve(root, 'public/demo-screens', slug)
  await mkdir(out, { recursive: true })
  const steps = []
  for (const screen of screens) {
    const html = resolve(src, slug, `${screen.name}.html`)
    await page.goto(pathToFileURL(html).href)
    await page.evaluate(() => document.fonts.ready)
    // Catch overflow early: a reply that no longer fits pushes the top of
    // the thread out of view, which is intended; anything else is a bug.
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('.note, .win-body')]
        .filter((el) => el.scrollHeight > el.clientHeight + 1 || el.getBoundingClientRect().bottom > 850)
        .map((el) => el.className)
    )
    if (overflow.length) console.warn(`  ! ${slug}/${screen.name}: content past the safe area in ${overflow.join(', ')}`)
    const file = `${screen.name}.png`
    await page.screenshot({ path: resolve(out, file) })
    steps.push({ file, caption: screen.caption, focus: screen.focus || DEFAULT_FOCUS })
    console.log(`  ${slug}/${file}`)
  }
  if (process.env.COMPRESS !== '0') {
    execFileSync('python3', [resolve(root, 'scripts/compress-png.py'), ...steps.map((s) => resolve(out, s.file))], {
      stdio: 'inherit'
    })
  }
  await writeFile(resolve(out, 'steps.json'), `${JSON.stringify(steps, null, 2)}\n`)
}

await browser.close()
