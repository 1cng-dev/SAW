# GitHub Actions: Daily Data Sync

`.github/workflows/daily-sync.yml` runs once a day (`06:00 UTC` cron, plus a manual "Run
workflow" button) and executes the exact same ingestion code as `npm run sync:*` locally —
directly against a real Postgres, with no BullMQ worker or deployed API required for the
CVE/news/vendor/GHSA/trending steps.

**This page is the step-by-step fix for the failure shown after first enabling the workflow:**

```
Migration failed: Error: DATABASE_URL is not set
```

That is not a bug in the workflow — it means the required repository secret hasn't been added
yet. GitHub Actions secrets are per-repo and have to be entered once through the GitHub UI; there
is no way to set them from a commit. The steps below fix it.

## 1. Get a Postgres the workflow can actually reach

The workflow runs on GitHub-hosted runners, so `DATABASE_URL=postgres://...@localhost:5432/...`
(the value used for local Docker Compose dev) **will not work** — `localhost` on the runner isn't
your machine. You need a Postgres reachable over the public internet. Any of these work and have
a free tier:

- [Neon](https://neon.tech) — serverless Postgres, generous free tier, gives you a ready-to-use
  connection string immediately
- [Supabase](https://supabase.com) — Postgres + extras, free tier
- [Railway](https://railway.app) — one-click Postgres, free trial credit

Whichever you pick, copy its connection string. It should look like:

```
postgres://<user>:<password>@<host>:5432/<database>?sslmode=require
```

Keep `?sslmode=require` (or whatever your provider's docs specify) — most hosted Postgres
providers reject unencrypted connections, and `pg` (the driver this project uses) honors
`sslmode` in the connection string automatically, no code changes needed.

> If you'd rather point this workflow at the **same** database your local dev setup / production
> deployment already uses, just use that connection string instead of provisioning a new one —
> as long as it's reachable from the internet (not `localhost`).

### Using Supabase specifically

This project's dev database has been migrated onto Supabase. Three gotchas we actually hit
getting it working, so you don't have to re-discover them:

1. **The "direct connection" host is IPv6-only.** Supabase's dashboard shows a connection string
   like `db.<project-ref>.supabase.co:5432` — this only resolves an `AAAA` (IPv6) record, no `A`
   record. GitHub-hosted runners (and plenty of other networks) don't have outbound IPv6, so this
   host will fail with `could not translate host name` or just hang. **Use a pooler connection
   instead** (below), not the direct host.
2. **The pooler hostname is regional and not shown until you find it.** The pattern is
   `aws-0-<region>.pooler.supabase.com`, username `postgres.<project-ref>` — but the dashboard's
   connection-string panel (Project Settings → Database → Connection Pooling) tells you the exact
   region for your project; use that rather than guessing.
3. **Recent `pg`/`pg-connection-string` versions changed what `sslmode=require` means** (it now
   implies full certificate-chain verification, which fails against Supabase's pooler with
   `self-signed certificate in certificate chain`). Add `uselibpqcompat=true` to the query string
   to get the traditional "encrypt but don't verify the chain" behavior:

   ```
   postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?uselibpqcompat=true&sslmode=require
   ```

   Port `5432` here is the **session pooler** (behaves like a normal Postgres connection — use
   this for `DATABASE_URL`, migrations, and everyday app traffic). Port `6543` is the
   **transaction pooler** (pgbouncer transaction mode) — faster for serverless/edge functions
   making single quick queries, but can misbehave with multi-statement transactions or prepared
   statements, so it's not what this project's migrator uses.

## 2. Add repository secrets

In the GitHub UI: **Settings → Secrets and variables → Actions → Secrets tab → New repository
secret.**

| Name | Value | Required? |
|---|---|---|
| `DATABASE_URL` | the connection string from step 1 | **yes** — the workflow fails immediately with a clear error if this is missing |
| `NVD_API_KEY` | your NVD key, if you have one | no — falls back to the slower unauthenticated NVD rate limit |
| `GHSA_PAT` | a GitHub personal access token (no special scopes needed) | no — the GHSA sync step just logs "skipped" and does nothing without it |

For `GHSA_PAT`: create one at **Settings → Developer settings → Personal access tokens →
Generate new token** (classic or fine-grained both work; the GHSA GraphQL query only needs public
read access). This is intentionally a separate secret name from GitHub's own auto-provided
`secrets.GITHUB_TOKEN` — that name is reserved by GitHub Actions and can't be repurposed, and its
default scope isn't guaranteed sufficient for this query.

## 3. (Optional) Add the ransomware sync variable

Ransomware.live ingestion currently lives inside `apps/api` (triggered via its own
`POST /api/ransomware/sync` route), not as a standalone worker script — see
[api.md](./api.md#ransomware-routesransomwarets) for why. To include it in the daily run, add a
repository **variable** (not secret, since it's just a URL — **Settings → Secrets and variables →
Actions → Variables tab → New repository variable**):

| Name | Value |
|---|---|
| `API_BASE_URL` | the base URL of your deployed API, e.g. `https://sec1cng.example.com` |

If you haven't deployed the API anywhere reachable yet, leave this unset — the workflow skips
that one step cleanly (`if: vars.API_BASE_URL != ''`) and every other sync still runs.

## 4. Re-run the workflow

**Actions tab → Daily Data Sync → Run workflow** (or just wait for the next `06:00 UTC` cron
tick). With `DATABASE_URL` set, the "Verify required secrets are configured" step should pass
immediately, migrations apply, and each sync step runs — check the job log for real
fetched/inserted/updated counts per source, same as a local `npm run sync:*` run.

## Troubleshooting

- **Still fails at "Verify required secrets are configured"**: the secret name must be exactly
  `DATABASE_URL` (case-sensitive) and must be a **repository** secret, not an **environment**
  secret (unless you've also scoped this workflow's job to that environment, which it isn't).
- **Fails at "Apply pending migrations" with a connection error** (not "not set"): `DATABASE_URL`
  is present but the runner can't reach that host/port, or the credentials/SSL mode are wrong —
  double check the connection string works from your own machine first (`psql "$DATABASE_URL"`).
- **`Sync GitHub Security Advisories` step logs `skipped: no GITHUB_TOKEN configured`**: expected
  if you haven't added `GHSA_PAT` — not a failure, that step still reports success with 0 records.
- **`Sync ransomware.live data` doesn't appear in the job at all**: expected if `API_BASE_URL`
  isn't set — it's conditionally skipped, not failed.
