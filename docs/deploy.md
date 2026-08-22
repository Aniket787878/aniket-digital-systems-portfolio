# Deploy — Cloudflare Pages

## One-time setup

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the repo `Aniket787878/aniket-digital-systems-portfolio`.
3. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (leave blank)
   - **Node version:** 20
4. Environment variables (Production):
   - `VITE_LEAD_WEBHOOK_URL` = your n8n production webhook URL (from `specs/n8n-lead-webhook.md`)
5. Save → first build runs automatically.

## SPA routing

`public/_redirects` contains `/*  /index.html  200` — this is what makes deep links like `/projects/<slug>` work on Cloudflare Pages. Do not remove it.

## Custom domain

1. Cloudflare Pages project → **Custom domains** → **Set up a custom domain**.
2. Enter the domain (e.g. `aniket.build` or subdomain).
3. If the domain is already on Cloudflare, DNS is auto-configured. If not, add the CNAME Cloudflare shows.
4. Wait for the SSL cert to issue (usually < 2 min).

## Deploys

- Every push to `main` triggers a production build.
- Every push to any other branch creates a preview URL — good for reviewing PRs before merge.
- Rollback: Pages dashboard → **Deployments** → click any prior build → **Rollback to this deployment**.

## Health check

After first deploy:
- Load the root URL → homepage renders.
- Navigate to `/projects` → project index renders.
- Directly paste a deep URL like `https://<your-domain>/projects/team-operations-system` in a new tab → project detail page renders (this proves `_redirects` is working).
- Open the contact page and inspect the network tab on submit — should POST to `VITE_LEAD_WEBHOOK_URL`.

## Troubleshooting

- **404 on deep links:** `_redirects` missing from `dist/` — check the file exists in `public/` and rebuild.
- **Env var not read:** must be prefixed `VITE_` (Vite only exposes those to the client). Re-deploy after adding.
- **Old cached version:** Cloudflare caches aggressively. Purge cache from the Pages project settings.
