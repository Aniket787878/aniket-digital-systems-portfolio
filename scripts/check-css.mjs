/*
  Fails the build if any stylesheet in src/ has unbalanced braces.

  Why: on 2026-09-27 a merge dropped the `}` closing a
  `@media (max-width: 640px)` block in index.css. Vite built it without a
  word, and every rule after it (the rest of index.css and all the page
  sheets bundled behind it) silently applied to phones only: perfect on
  mobile, broken on every desktop. Comments and strings are stripped
  first so a brace inside either does not count.
*/
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const files = []
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (p.endsWith('.css')) files.push(p)
  }
}
walk(process.argv[2] || 'src')

let bad = 0
for (const file of files) {
  const src = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, '""')
  let line = 1
  const open = []
  for (const ch of src) {
    if (ch === '\n') line++
    else if (ch === '{') open.push(line)
    else if (ch === '}' && open.pop() === undefined) {
      console.error(`${file}:${line}: stray "}"`)
      bad++
      break
    }
  }
  if (open.length) {
    console.error(`${file}: ${open.length} unclosed "{" (outermost opened at line ${open[0]})`)
    bad++
  }
}
if (bad) process.exit(1)
console.log(`check-css: ${files.length} stylesheets, braces balanced`)
