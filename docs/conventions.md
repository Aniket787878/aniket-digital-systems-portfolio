# Conventions and working notes

Moved verbatim from CLAUDE.md.


- Files are mixed CRLF/LF. Match the file you are editing; don't reflow it.
- Comments explain *why*, especially where the code looks wrong but isn't.
- **Web scraping: Crawl4AI is the default** (Aniket's choice, 2026-09-30). Run
  `bash scripts/setup-crawl4ai.sh` once per container, then `crawl <url>`
  (clean markdown; `--out FILE`, `--raw`, and `--undetected` for sites that
  block a normal headless browser). It runs inside the sandbox, so it only
  reaches hosts the environment's network policy allows; for a host that
  policy blocks, fall back to the Firecrawl connector and say so.
- **Subagents: pick the cheapest model that can do the job** (Aniket's
  choice, 2026-09-30). Pass `model` on every launch: `haiku` for read-only
  reviews of prepared material, `sonnet` for code, audits and research,
  `opus` (Opus 5.5) only for one-off hard review or design questions. The
  Remotion films (`remotion/`) follow the model rules in `remotion/CLAUDE.md`
  (Sonnet builds; Opus only for shot list, complex timing and final review). Capture shared inputs (the
  site, docs) once with a script and hand agents the path, so no two agents
  crawl the same thing; code-writing agents work in a worktree and never
  push.
- Verify before claiming. Screenshots may be unavailable — use geometry probes
  (`getBoundingClientRect`), `gl.readPixels`, computed-style diffs.
- **Two traps in that probe environment.** Both have produced false bug reports:
  the browser pane runs with `document.hidden === true` even when fronted, so
  **`requestAnimationFrame` never fires** and anything scroll-driven through it
  (the gallery arc's `--open`) looks frozen; and a computed-style baseline taken
  on the *first* load measures fallback font metrics, inventing hundreds of
  phantom diffs. Check `document.fonts.status === 'loaded'` on both sides, and
  test rAF-driven code by setting the custom property directly.

## Design feedback history


`docs/design-system.md` is the source of truth. It is derived from
**getstage.co**, the reference Aniket approved twice (PRs #14, #15), rebuilt in
his saffron: a dusk hero with parallax ridges, a warm light "paper" ground for
the explaining bands, a dark "night" ground for the cinematic ones, Inter only
at weight 500, saffron as punctuation, motion that explains a mechanism.

What he has rejected, in his words: "too simple", then "looks like a kids
website, jumbled". Heavy display type, stacked effects (glows, chips, grids and
marquees at once) and walls of tags read as jumbled; bare text-only bands read
as too simple. One idea per band, with the real product films carrying the
visuals. **No em dashes in visible copy.**

The older Framer references (`docs/reference/folioblox.html`) are superseded.
When a visual difference is reported in loose terms, open getstage.co and
measure both at matching viewports before changing anything.
