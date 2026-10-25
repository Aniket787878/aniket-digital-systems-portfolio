/*
  Screenshots of /ai, the AI brand home (docs/work/ai-brand/spec.md,
  slice 1), plus text checks. Run after `npm run build`:

    node scripts/shoot-ai-brand.mjs

  Serves dist/ with `vite preview` on a free port, opens /ai at 1440x900
  and 390x844, saves a viewport shot at the hero and a full-page shot of
  each to docs/work/ai-brand/shots/, and exits 1 if the page is missing
  the four steps, the own-it band, or the brand name in the nav.

  Playwright is not a project dependency: it is required from wherever
  Node can find it, else from the npx cache. Browsers are never installed.
*/
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { createServer } from 'node:net'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brand } from '../src/data.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'docs/work/ai-brand/shots')
const require = createRequire(import.meta.url)

function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    const caches = [join(homedir(), '.npm/_npx'), '/root/.npm/_npx']
    for (const cache of caches) {
      if (!existsSync(cache)) continue
      for (const dir of readdirSync(cache)) {
        const p = join(cache, dir, 'node_modules/playwright')
        if (existsSync(join(p, 'package.json'))) return require(p)
      }
    }
    throw new Error('playwright not found (no install attempted)')
  }
}

const freePort = () =>
  new Promise((ok, fail) => {
    const srv = createServer()
    srv.unref()
    srv.on('error', fail)
    srv.listen(0, () => {
      const { port } = srv.address()
      srv.close(() => ok(port))
    })
  })

async function waitFor(url, ms = 30000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      const r = await fetch(url)
      if (r.ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`server did not start at ${url}`)
}

if (!existsSync(join(root, 'dist/index.html'))) {
  console.error('dist/ missing: run `npm run build` first')
  process.exit(1)
}

const { chromium } = loadPlaywright()
const port = await freePort()
const base = `http://127.0.0.1:${port}`
const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore'
})

const failures = []
let browser
try {
  await waitFor(base + '/')
  mkdirSync(out, { recursive: true })
  browser = await chromium.launch()

  const sizes = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'phone', width: 390, height: 844 }
  ]
  for (const size of sizes) {
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height } })
    await page.goto(base + '/ai', { waitUntil: 'networkidle' })
    await page.waitForSelector('#svc-brand-title', { state: 'visible' })
    await page.waitForTimeout(1500) // the hero's entrance settles
    await page.screenshot({ path: join(out, `ai-${size.name}-hero.png`) })

    // Hero must-sees above the fold on the desktop size.
    if (size.name === 'desktop') {
      for (const sel of ['.svc-brand-actions', '.svc-brand-promise']) {
        const box = await page.locator(sel).boundingBox()
        if (!box || box.y + box.height > size.height) failures.push(`${size.name}: ${sel} is below the fold`)
      }
    }

    // Scroll through so every whileInView band reveals, then shoot it all.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 120))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(800)
    await page.screenshot({ path: join(out, `ai-${size.name}-full.png`), fullPage: true })

    const text = await page.locator('main, body').first().innerText()
    for (const want of ['Map', 'Build', 'Train and stay', 'Hand over', 'You own everything']) {
      if (!text.includes(want)) failures.push(`${size.name}: page text is missing "${want}"`)
    }
    const steps = await page.locator('.svc-method-step h3').allInnerTexts()
    if (steps.join('|') !== 'Map|Build|Train and stay|Hand over') failures.push(`${size.name}: steps read ${steps.join(', ')}`)
    const points = await page.locator('.svc-own-point').count()
    if (points !== 4) failures.push(`${size.name}: own-it band has ${points} points, not 4`)

    if (size.name === 'phone') await page.click('.nav-toggle')
    const nav = await page.locator(size.name === 'phone' ? '.nav-panel' : '.nav-links').innerText()
    if (!nav.includes(brand.name)) failures.push(`${size.name}: nav is missing "${brand.name}"`)
    await page.close()
  }
} finally {
  if (browser) await browser.close()
  server.kill()
}

if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  ' + f).join('\n'))
  process.exit(1)
}
console.log(`PASS: shots in ${out}`)
