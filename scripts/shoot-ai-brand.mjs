/*
  Screenshots and text checks of the AI brand pages (docs/work/ai-brand/
  spec.md slice 1, docs/work/ai-brand-2/spec.md slices 2 to 6). Run after
  `npm run build`:

    node scripts/shoot-ai-brand.mjs

  Serves dist/ with `vite preview` on a free port, opens every page in
  PAGES at 1440x900 and 390x844, saves a viewport shot at the top and a
  full-page shot of each to docs/work/ai-brand-2/shots/, and exits 1 if a
  page is missing its key text or its primary button does not reach
  /ai-check. It also walks the leak check end to end with the lead POST
  stubbed (nothing is sent) and prints the JSON body it would have sent.

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
const out = join(root, 'docs/work/ai-brand-2/shots')
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
const fail = (msg) => failures.push(msg)

/* Each page: its path, a selector that means it has rendered, the text it
   must carry, and whether its primary button (data-primary) must lead to
   /ai-check. */
const PAGES = [
  { name: 'ai', path: '/ai', ready: '#svc-brand-title', want: ['Map', 'Build', 'Train and stay', 'Hand over', 'You own everything'], primary: true },
  { name: 'ai-check', path: '/ai-check', ready: '#ac-title', want: ['Free enquiry leak check', 'Two minutes. Where enquiries, bookings and follow-ups leak'] },
  {
    name: 'ai-try',
    path: '/ai/try',
    ready: '#aip-try-title',
    want: ['Try it before you talk to anyone.', 'Working demos', 'Demo screens', 'What you are seeing', 'Appointment Desk', 'Trial Class Desk'],
    primary: true,
    extra: async (page, size) => {
      const n = await page.locator('.aip-cards .pc').count()
      if (n !== 6) fail(`ai-try ${size.name}: ${n} demo cards, not 6`)
      const first = await page.locator('.aip-cards .pc').first().getAttribute('href')
      if (first !== '/projects/appointment-desk') fail(`ai-try ${size.name}: first card goes to ${first}`)
    }
  }
]

const sizes = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 }
]

async function revealAll(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 120))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(800)
}

async function shootPage(browser, size, spec) {
  const page = await browser.newPage({ viewport: { width: size.width, height: size.height } })
  await page.goto(base + spec.path, { waitUntil: 'networkidle' })
  await page.waitForSelector(spec.ready, { state: 'visible' })
  await page.waitForTimeout(1500) // entrances settle
  await page.screenshot({ path: join(out, `${spec.name}-${size.name}-top.png`) })
  await revealAll(page)
  await page.screenshot({ path: join(out, `${spec.name}-${size.name}-full.png`), fullPage: true })

  const text = await page.locator('main').innerText()
  for (const want of spec.want) if (!text.includes(want)) fail(`${spec.name} ${size.name}: missing "${want}"`)
  if (/\u2014/.test(text)) fail(`${spec.name} ${size.name}: an em dash in visible text`)
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (wide) fail(`${spec.name} ${size.name}: page scrolls sideways`)

  if (spec.primary) {
    const href = await page.locator('main [data-primary]').first().getAttribute('href')
    if (href !== '/ai-check') fail(`${spec.name} ${size.name}: first primary button goes to ${href}`)
  }
  if (spec.extra) await spec.extra(page, size)
  await page.close()
}

/* The leak check, end to end, with the lead POST caught before it leaves. */
async function walkCheck(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  let body = null
  await page.route('**/*', (route) => {
    const req = route.request()
    if (req.method() === 'POST' && (req.postData() || '').includes('workflow_broken')) {
      body = JSON.parse(req.postData())
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
    }
    return route.continue()
  })
  await page.goto(base + '/ai-check', { waitUntil: 'networkidle' })
  const pick = async (label) => {
    await page.locator('.ac-option', { hasText: label }).first().click()
  }
  const next = () => page.click('.ac-next')
  await pick('Clinic or health practice')
  await page.waitForSelector('text=How many new enquiries')
  await pick('10 to 30')
  await page.waitForSelector('text=How fast does a new enquiry')
  await pick('The same day')
  await page.waitForSelector('text=Where does the time go')
  await pick('Replying to enquiries')
  await pick('Booking and rescheduling')
  await next()
  await page.waitForSelector('text=What do you use to run things')
  await pick('WhatsApp')
  await next()
  await page.waitForSelector('text=How many people are on the team')
  await pick('3 to 10 people')
  await page.waitForSelector('text=Want a one-page leak report in 48 hours?')
  await page.screenshot({ path: join(out, 'ai-check-desktop-report-question.png') })
  await pick('Yes')
  await page.waitForSelector('#ac-name')
  await page.fill('#ac-name', 'Test Visitor')
  await page.fill('#ac-email', 'test@example.com')
  await next()
  await page.waitForSelector('.ac-result-title')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: join(out, 'ai-check-desktop-result.png'), fullPage: true })
  const text = await page.locator('main').innerText()
  if (!text.includes('One page back within 48 hours')) fail('ai-check: result is missing the 48h report line after a yes')
  if (!body) fail('ai-check: no lead POST was made')
  else {
    console.log('POST body:\n' + JSON.stringify(body, null, 2))
    if (!String(body.source).startsWith('ai-brand-check · ')) fail(`ai-check: source is "${body.source}"`)
    if (!/Wants 48h leak report: yes/.test(body.workflow_broken)) fail('ai-check: workflow_broken is missing "Wants 48h leak report: yes"')
  }
  await page.close()
}

let browser
try {
  await waitFor(base + '/')
  mkdirSync(out, { recursive: true })
  browser = await chromium.launch()

  for (const size of sizes) {
    for (const spec of PAGES) await shootPage(browser, size, spec)

    // /ai: hero must-sees above the fold, the four steps, the own-it points, the nav name.
    const page = await browser.newPage({ viewport: { width: size.width, height: size.height } })
    await page.goto(base + '/ai', { waitUntil: 'networkidle' })
    await page.waitForSelector('#svc-brand-title', { state: 'visible' })
    await page.waitForTimeout(1500)
    if (size.name === 'desktop') {
      for (const sel of ['.svc-brand-actions', '.svc-brand-promise']) {
        const box = await page.locator(sel).boundingBox()
        if (!box || box.y + box.height > size.height) fail(`ai ${size.name}: ${sel} is below the fold`)
      }
    }
    await revealAll(page)
    const steps = await page.locator('.svc-method-step h3').allInnerTexts()
    if (steps.join('|') !== 'Map|Build|Train and stay|Hand over') fail(`ai ${size.name}: steps read ${steps.join(', ')}`)
    const points = await page.locator('.svc-own-point').count()
    if (points !== 4) fail(`ai ${size.name}: own-it band has ${points} points, not 4`)
    if (size.name === 'phone') await page.click('.nav-toggle')
    const nav = await page.locator(size.name === 'phone' ? '.nav-panel' : '.nav-links').innerText()
    if (!nav.includes(brand.name)) fail(`ai ${size.name}: nav is missing "${brand.name}"`)
    await page.close()
  }
  await walkCheck(browser)
} finally {
  if (browser) await browser.close()
  server.kill()
}

if (failures.length) {
  console.error('FAIL\n' + failures.map((f) => '  ' + f).join('\n'))
  process.exit(1)
}
console.log(`PASS: shots in ${out}`)
