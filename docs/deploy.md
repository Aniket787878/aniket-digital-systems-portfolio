# Deploy — Vercel

Production lives on Vercel. There is no Cloudflare Pages project any more, and
`public/_redirects` has been deleted — it was a Cloudflare-only file that Vercel
silently ignores.

## SPA routing — `vercel.json`

This is a React Router SPA. Every route is served by one `index.html`, so without
a rewrite a deep link like `/projects/team-operations-system` would 404 on a hard
refresh (the browser asks the server for a file that does not exist).

`vercel.json` at the repo root is what prevents that:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Rewrites run **after** static files are matched, so `/assets/*.js` and
`/favicon.svg` still serve normally — only unmatched paths fall through to
`index.html`. **Do not remove this file.**

Note that `buildCommand` / `outputDirectory` / `framework` in `vercel.json`
override whatever the dashboard shows. Change them here, not there.

## Current setup — done

- **Live at** <https://aniket-portfolio-six-bice.vercel.app>
- Team `aniket-s1`, project `aniket-portfolio`
- **GitHub integration is connected**, so deploying is just `git push`:
  - push to `main` → production build
  - push any other branch, or open a PR → preview URL only

The bare `aniket-portfolio.vercel.app` was already taken by an unrelated site,
which is why the production alias carries a suffix. A custom domain replaces it
once Aniket buys one.

Nothing below needs doing again — it is kept because it is what to repeat if the
project is ever recreated.

## Recreating the project from scratch

1. vercel.com → **Add New** → **Project** → **Import Git Repository**.
2. Pick `Aniket787878/aniket-digital-systems-portfolio`.
3. **Project name must be lowercase** — `aniket-portfolio`, not `Aniket-Portfolio`.
   Vercel rejects capitals with a 400.
4. Framework preset, build command and output dir come from `vercel.json`; leave
   the dashboard fields alone.
5. Environment variables (Production):
   - `VITE_LEAD_WEBHOOK_URL` = the n8n production webhook URL (see
     `docs/specs/n8n-lead-webhook.md`)
6. **Deploy.**

## Deploying from the CLI instead

Only needed if the Git integration is off. From the repo root, not your home
folder:

```
npm i -g vercel
vercel login
vercel --prod
```

Two traps:

- A CLI `--prod` uploads **your working directory**, not `origin/main` —
  including uncommitted work, and whatever branch you happen to be on. It also
  creates deployments outside the Git record.
- `.vercel/project.json` silently pins the folder to the project it was last
  linked to, regardless of which account you are logged in as. Delete the
  `.vercel` folder to reset, then `vercel link`.

Prefer `git push`.

## Environment variables

`VITE_*` values are **inlined into the JS bundle at build time**, not read at
runtime. Two consequences:

- Changing one in the dashboard does nothing until you **redeploy**.
- Anything you put in a `VITE_` var ships in publicly readable source. The n8n
  webhook URL is fine (it is a write-only endpoint); an API key would not be.

## Custom domain

1. Project → **Settings** → **Domains** → add the domain.
2. Vercel shows the records to add at your registrar — an `A` record to
   `76.76.21.21` for the apex, or a `CNAME` to `cname.vercel-dns.com` for a
   subdomain. Follow what the dashboard actually prints; it is authoritative.
3. The TLS cert issues automatically once DNS resolves.

## Deploys

- Push to `main` → production build.
- Push to any other branch, or open a PR → preview URL. **A push to
  `feat/*` never moves production.**
- Rollback: **Deployments** → pick a previous production build → **Instant
  Rollback** (or **Promote to Production**).

## Health check

After a deploy:

- Root URL renders the homepage, and the WebGL hero animates (a black or flat
  rectangle means the shader failed — check the browser console).
- `/projects` renders the index.
- **Paste `https://<domain>/projects/team-operations-system` into a fresh tab.**
  This is the one that proves the rewrite works; clicking through from the nav
  does not test it, because that is client-side routing.
- `/nothing-here` renders the 404 page rather than a Vercel 404.
- Submit the contact form with the network tab open → it should POST to
  `VITE_LEAD_WEBHOOK_URL`.

## Troubleshooting

- **404 on a deep link (but nav links work):** `vercel.json` is missing from the
  deployed commit, or the rewrite was edited.
- **`Project names ... must be lowercase`:** rename to `aniket-portfolio`.
- **Env var not read:** it must be prefixed `VITE_`, and you must redeploy — the
  value is baked in at build time.
- **CLI deployed the wrong thing:** `vercel --prod` uploads your working
  directory, not `origin/main`. Check you are in the repo root and your tree is
  clean.
