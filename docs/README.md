# docs

Everything written about this site lives here. The code is in `src/`, the
importable n8n workflow is in `n8n/`, and nothing else sits at the repo root.

| Path | Holds |
|---|---|
| `deploy.md` | Vercel runbook — setup, env vars, custom domain, rollback, health check |
| `system/` | Strategy and the site's own map. `01-website-map.md` is the one to keep in sync with the code. |
| `specs/` | Build specs handed to agents — contact form, n8n lead webhook |
| `review/` | Dated review reports — findings against the working tree, by priority |
| `reference/folioblox.html` | Saved copy of the Framer template the header and footer are modelled on |

## The reference copy

`reference/folioblox.html` is a saved snapshot of
<https://extended-experiences-754918.framer.app/>. It is here so the reference
survives the live URL going away, and so measurements can be taken offline.

When a visual difference gets reported in loose terms — "compressed", "the
structure is different" — open the reference and measure both at matching
viewports before changing anything. Guessing has cost a full cycle of work
before.

## Where the code lives

| Path | Holds |
|---|---|
| `src/pages/HomePage.jsx` | Composition only — the nine bands, in render order |
| `src/pages/home/` | One file per band, matching the bands in `HomePage.css` |
| `src/pages/HomePage.css` | All nine bands' styles, deliberately one file — see the note in `HomePage.jsx` |
| `src/index.css` | Tokens, reset, nav, footer, buttons, page shells. Loads first, on purpose. |
| `src/data.js` | Every string and number the site renders |
