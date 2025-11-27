## Render Deployment Guide

This document explains how to host the Viewesta API on [Render](https://render.com) using the supplied `render.yaml` blueprint plus a managed PostgreSQL instance.

### 1. Prerequisites
- Render account with GitHub access.
- Repo pushed to GitHub (public or private with access tokens configured in Render).
- Production-ready `.env` values (database, JWT secrets, payment keys, SMTP credentials, etc.).

### 2. One-click blueprint (recommended)
1. Commit and push the `render.yaml` file to the repo root.
2. In Render, click **New > Blueprint** and point to the repo.
3. Render will detect `render.yaml` and propose:
   - `viewesta-db`: managed Postgres (Starter tier by default).
   - `viewesta-api`: Node web service that runs `npm run start`.
4. Review and adjust the plan/region before clicking **Apply**.

`render.yaml` already wires the following:
- Health checks pointed at `/health`.
- Build command (`npm install`) and start command (`npm run start`).
- Automatic deploys from `main`.
- Database credentials injected into the custom env vars the app expects (`DB_HOST`, `DB_PORT`, etc.).
- Auto-generated JWT secrets plus sensible defaults for rate limiting and SMTP host metadata.

### 3. Required environment variables
Render fills in most fields, but you must set the following **manually** in the `viewesta-api` dashboard (or edit the blueprint before applying):

| Variable | Description |
| --- | --- |
| `FRONTEND_URL` | URL allowed for CORS (e.g., `https://app.viewesta.com`). |
| `EMAIL_FROM`, `EMAIL_FROM_NAME` | Verified sender in SendGrid (already defaulted but update if needed). |
| `SMTP_PASSWORD` | SendGrid API key. |
| `FLUTTERWAVE_*` | Production/public/secret/encryption keys (blank by default). |
| `STRIPE_*` | Stripe publishable, secret, and webhook signing secrets. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` | Only if media uploads are needed now. |

> Tip: use Render’s **Environment Groups** if multiple services share the same secrets.

### 4. Database initialization
Render databases start empty. After the first deploy:
1. Open the `viewesta-api` service → **Shell** tab (or use `render connect viewesta-api` via CLI).
2. Run the schema bootstrap:
   ```bash
   npm run db:schema
   npm run db:seed   # optional sample data
   ```
   These commands use the env vars already injected, so they target Render Postgres automatically.
3. Confirm tables exist via `npm run test:db`.

If you prefer SQL migrations directly in the Render DB dashboard, copy the SQL from `database/schema.sql` and `database/seeds.sql`.

### 5. Deployment lifecycle
1. Every push to `main` triggers a new build (`npm install`) and deploy (`npm run start`).
2. Use Render’s **Pull Request Previews** (toggle in service settings) to spin up ephemeral copies for review branches.
3. Check the **Events** tab for build logs and the **Metrics** tab for CPU/memory usage.
4. Add alerts/webhooks (Settings → Notifications) for failed deploys or restarts.

### 6. Post-deploy verification
- Hit `https://<service-name>.onrender.com/health` to confirm the container is healthy.
- Use the provided smoke scripts from your laptop (point them at the Render base URL):
  ```bash
  BASE_URL=https://<service>.onrender.com npm run test:api
  ```
- Exercise payment/webhook endpoints from the provider sandboxes and double-check logs.

### 7. Custom domain & TLS
1. Go to **Settings → Custom Domains** on the service.
2. Add `api.viewesta.com`, follow Render’s DNS instructions (CNAME to `onrender.com` host).
3. Wait for TLS certificate provisioning and verify the health check again once DNS propagates.

### 8. Zero-downtime data changes
- For future schema updates, add versioned migration scripts (e.g., `database/migrations/*`) and run them via the Render shell or scripted job.
- Consider a `cron` job in Render if you need recurring tasks (backup, cleanup, etc.).

### 9. Troubleshooting
- **App boot fails**: check that Postgres is reachable (security groups are open by default on Render) and secrets are present.
- **Request timeouts**: increase plan size or raise the `DB_POOL_MAX` env var; monitor query logs for slow statements.
- **Webhook signature errors**: confirm `STRIPE_WEBHOOK_SECRET` or Flutterwave credentials are set in the Render dashboard and not blank.

Following the steps above gets the API running on Render with a managed database, health checks, SSL, and automatic deploys tied to your Git workflow.

