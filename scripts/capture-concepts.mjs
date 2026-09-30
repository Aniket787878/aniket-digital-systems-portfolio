#!/usr/bin/env node
/*
  Captures the five concept sites for the /websites showpiece.

    node scripts/capture-concepts.mjs http://localhost:5173

  For each concept in src/concepts/registry.js (slugs read from the file, so
  the list never drifts) it writes to public/showcase/websites/:
    <slug>-hero.webp   the first screen, 1440x900
    <slug>-strip.webp  six viewport shots down the page, stacked, 960px wide

  Viewport shots, not fullPage: the concepts pin fixed WebGL canvases, which
  a fullPage capture smears. Re-runnable; overwrites its own outputs only.
*/
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '/tmp/pw/node_modules/playwright/index.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/showcase/websites')
const FFMPEG = '/usr/bin/ffmpeg'
const W = 1440
const H = 900
const SHOTS = 6
const HERO_MAX = 180 * 1024
const STRIP_MAX = 600 * 1024

const base = (process.argv[2] || 'http://localhost:5173').replace(/\/$/, '')
const only = process.argv.slice(3)

// The registry uses lazy() imports, so it cannot be imported from plain
// Node; the slugs are simple literals, so read them from the source.
const registry = readFileSync(join(ROOT, 'src/concepts/registry.js'), 'utf8')
const slugs = [...registry.matchAll(/slug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1])
  .filter((s) => !only.length || only.includes(s))
if (!slugs.length) throw new Error('No concept slugs found in registry.js')

const HIDE = `
  .concept-badge { display: none !important; }
  [data-capture-hidden] { display: none !important; }
  html { scroll-behavior: auto !important; }
  * { cursor: none !important; caret-color: transparent !important; }
`

function ffmpeg(args) {
  execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
}

// Encode to webp, stepping quality down until the file fits its budget.
function encode(inputArgs, filter, out, quality, maxBytes) {
  for (let q = quality; q >= 40; q -= 6) {
    ffmpeg([...inputArgs, ...(filter ? ['-filter_complex', filter] : []),
      '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '6', '-frames:v', '1', out])
    const size = statSync(out).size
    if (size <= maxBytes) return { q, size }
  }
  return { q: 40, size: statSync(out).size }
}

async function settle(page, ms) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(ms)
  // Custom cursors: decorative elements with a class token ending in
  // "-cursor". Matched per token (a root can carry "has-cursor"), and
  // re-run each time because the concept mounts lazily.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[aria-hidden="true"][class]')) {
      if ([...el.classList].some((c) => /-cursor$/.test(c))) el.setAttribute('data-capture-hidden', '')
    }
  })
}

async function captureOne(browser, slug, tmp) {
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  // Park the pointer in a corner so hover states never catch a frame.
  await page.goto(`${base}/concepts/${slug}`, { waitUntil: 'load', timeout: 60000 })
  await page.addStyleTag({ content: HIDE })
  await page.mouse.move(W - 2, H - 2)
  await settle(page, 4000)

  const frames = []
  for (let i = 0; i < SHOTS; i++) {
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
    const y = Math.round((max * i) / (SHOTS - 1))
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
    await settle(page, i === 0 ? 500 : 2500)
    const file = join(tmp, `${slug}-${i}.png`)
    await page.screenshot({ path: file })
    frames.push(file)
  }
  await context.close()

  const hero = join(OUT, `${slug}-hero.webp`)
  const h = encode(['-i', frames[0]], null, hero, 80, HERO_MAX)

  const strip = join(OUT, `${slug}-strip.webp`)
  const inputs = frames.flatMap((f) => ['-i', f])
  const stack = frames.map((_, i) => `[${i}:v]`).join('') + `vstack=inputs=${frames.length},scale=960:-2:flags=lanczos`
  const s = encode(inputs, stack, strip, 72, STRIP_MAX)

  console.log(`${slug}: hero ${(h.size / 1024).toFixed(0)}KB q${h.q}, strip ${(s.size / 1024).toFixed(0)}KB q${s.q}`)
}

mkdirSync(OUT, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'concepts-'))
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
})
try {
  for (const slug of slugs) await captureOne(browser, slug, tmp)
} finally {
  await browser.close()
  rmSync(tmp, { recursive: true, force: true })
}
