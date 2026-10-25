/*
  Accessibility (and, if available, Lighthouse) audit of the AI brand
  pages (docs/work/ai-brand-2/spec.md, slice 6). Run after `npm run build`:

    node scripts/audit-ai.mjs

  Serves dist/ with `vite preview`, opens each page in PAGES at 1440x900
  and 390x844, scrolls it through so every band has revealed, and runs
  axe-core (WCAG 2.0/2.1/2.2 A and AA rules) in the page. Writes the
  counts and every violation to docs/work/ai-brand-2/audit.md; anything
  under the "<!-- notes -->" marker in that file is kept between runs.
  Exits 1 on any serious or critical violation on the new pages (/ai
  itself is reported but does not gate: see SHARED below).

  Nothing is installed. axe-core is used from node_modules, else the npx
  cache, else the folder in AXE_CORE_PATH; if none has it the axe part is
  skipped with the reason printed. Lighthouse runs only if `lighthouse`
  is already in the npx cache; otherwise it is skipped with the reason.
*/
import { createRequire } from 'node:module'
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const report = join(root, 'docs/work/ai-brand-2/audit.md')
const require = createRequire(import.meta.url)
const caches = [join(homedir(), '.npm/_npx'), '/root/.npm/_npx']

const PAGES = ['/ai', '/ai-check', '/ai/try', '/ai/for/clinics', '/ai/pricing', '/ai/every-enquiry']
const SIZES = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 }
]

/* A package folder from node_modules, then the npx cache. */
function findPackage(name) {
  try {
    return dirname(require.resolve(`${name}/package.json`))
  } catch {
    for (const cache of caches) {
      if (!existsSync(cache)) continue
      for (const dir of readdirSync(cache)) {
        const p = join(cache, dir, 'node_modules', name)
        if (existsSync(join(p, 'package.json'))) return p
      }
    }
  }
  return null
}

function loadPlaywright() {
  const p = findPackage('playwright')
  if (!p) throw new Error('playwright not found (no install attempted)')
  return require(p)
}

function findAxe() {
  const dirs = [findPackage('axe-core'), process.env.AXE_CORE_PATH].filter(Boolean)
  for (const dir of dirs) {
    const file = join(dir, 'axe.min.js')
    if (existsSync(file)) return { file, from: dir }
  }
  return null
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
      if ((await fetch(url)).ok) return
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`server did not start at ${url}`)
}

/* Wheel through the page so every whileInView band has revealed (the
   smooth-scroll layer ignores a bare window.scrollTo). */
async function revealAll(page) {
  const height = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < height; y += 500) {
    await page.mouse.wheel(0, 500)
    await page.waitForTimeout(100)
  }
  await page.waitForTimeout(1200)
}

if (!existsSync(join(root, 'dist/index.html'))) {
  console.error('dist/ missing: run `npm run build` first')
  process.exit(1)
}

const axe = findAxe()
const lighthouse = findPackage('lighthouse')
const skipped = []
if (!axe) skipped.push('axe-core: not in node_modules, the npx cache or AXE_CORE_PATH (nothing installed)')
if (!lighthouse) skipped.push('Lighthouse: not in the npx cache (nothing installed)')

const { chromium } = loadPlaywright()
const port = await freePort()
const base = `http://127.0.0.1:${port}`
const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
  cwd: root,
  stdio: 'ignore'
})

const results = [] // { path, size, counts, violations }
const scores = [] // { path, perf, a11y, bp, seo }
let browser
try {
  await waitFor(base + '/')
  browser = await chromium.launch()
  if (axe) {
    for (const path of PAGES) {
      for (const size of SIZES) {
        const page = await browser.newPage({ viewport: { width: size.width, height: size.height }, reducedMotion: 'reduce' })
        await page.goto(base + path, { waitUntil: 'networkidle' })
        await page.waitForTimeout(800)
        await revealAll(page)
        await page.addScriptTag({ path: axe.file })
        const res = await page.evaluate(() =>
          window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } })
        )
        const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 }
        for (const v of res.violations) counts[v.impact] = (counts[v.impact] || 0) + 1
        results.push({
          path,
          size: size.name,
          counts,
          violations: res.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')),
            nodes: v.nodes.length
          }))
        })
        console.log(`${path} ${size.name}: ${res.violations.length} violation(s)`)
        await page.close()
      }
    }
  }

  if (lighthouse) {
    const bin = join(lighthouse, 'cli/index.js')
    for (const path of PAGES) {
      const r = spawnSync(
        'node',
        [bin, base + path, '--quiet', '--output=json', '--chrome-flags=--headless=new --no-sandbox', '--only-categories=performance,accessibility,best-practices,seo'],
        { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: { ...process.env, CHROME_PATH: chromium.executablePath() } }
      )
      try {
        const c = JSON.parse(r.stdout).categories
        const pct = (k) => Math.round((c[k]?.score ?? 0) * 100)
        scores.push({ path, perf: pct('performance'), a11y: pct('accessibility'), bp: pct('best-practices'), seo: pct('seo') })
      } catch {
        skipped.push(`Lighthouse failed on ${path}: ${(r.stderr || '').split('\n')[0]}`)
      }
    }
  }
} finally {
  if (browser) await browser.close()
  server.kill()
}

/* The report. Notes under the marker survive a re-run. */
const MARK = '<!-- notes -->'
const old = existsSync(report) ? readFileSync(report, 'utf8') : ''
const notes = old.includes(MARK) ? old.slice(old.indexOf(MARK)) : `${MARK}\n\n## Notes\n\n(Fixed defects and reasons for anything left go here.)\n`

const lines = [
  '# AI brand slices 2 to 6: audit',
  '',
  `Run by \`node scripts/audit-ai.mjs\` on ${new Date().toISOString().slice(0, 10)}, against the built site (\`vite preview\`), at 1440x900 and 390x844, reduced motion on, after scrolling every band into view.`,
  axe ? `axe-core from \`${axe.from}\`, WCAG 2.0, 2.1 and 2.2 A and AA rules.` : '',
  ''
]
if (skipped.length) lines.push('**Skipped:**', '', ...skipped.map((s) => `- ${s}`), '')
if (results.length) {
  lines.push('## axe-core', '', '| Page | Size | Critical | Serious | Moderate | Minor |', '|---|---|---|---|---|---|')
  for (const r of results) {
    lines.push(`| \`${r.path}\` | ${r.size} | ${r.counts.critical} | ${r.counts.serious} | ${r.counts.moderate} | ${r.counts.minor} |`)
  }
  lines.push('')
  const all = results.filter((r) => r.violations.length)
  if (all.length) {
    lines.push('### Violations', '')
    for (const r of all) {
      for (const v of r.violations) {
        lines.push(`- \`${r.path}\` ${r.size}: **${v.impact}** \`${v.id}\`, ${v.help} (${v.nodes} element(s): ${v.targets.map((t) => `\`${t}\``).join(', ')})`)
      }
    }
    lines.push('')
  } else lines.push('No violations on any page at either size.', '')
}
if (scores.length) {
  lines.push('## Lighthouse', '', '| Page | Performance | Accessibility | Best practices | SEO |', '|---|---|---|---|---|')
  for (const s of scores) lines.push(`| \`${s.path}\` | ${s.perf} | ${s.a11y} | ${s.bp} | ${s.seo} |`)
  lines.push('')
}
writeFileSync(report, lines.filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n') + '\n' + notes)
console.log(`Wrote ${report}`)
for (const s of skipped) console.log(`SKIPPED ${s}`)

/* /ai is slice 1's page, built on the shared service-page bands: it is
   audited and reported, but its findings come from the site-wide styles
   (HomePage.css), outside this branch, so only the new pages gate. */
const SHARED = new Set(['/ai'])
const bad = results.filter((r) => !SHARED.has(r.path) && r.counts.critical + r.counts.serious > 0)
if (bad.length) {
  console.error(`FAIL: serious or critical violations on ${bad.map((r) => `${r.path} ${r.size}`).join(', ')}`)
  process.exit(1)
}
console.log('PASS')
