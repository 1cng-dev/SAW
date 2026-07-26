# Setup

See also: [database.md](./database.md) (schema reference), [api.md](./api.md) (endpoint reference).

## Prerequisites

- Node.js >= 20
- Docker (for Postgres + Redis, or the full `docker compose up`)

## Environment variables

Copy `.env.example` to `.env` at the repo root and fill in what you have. Every key below is
optional except `DATABASE_URL`/`REDIS_URL`/`PORT` — anything else missing causes that specific
feature to cleanly no-op (logged explicitly) rather than fail or fall back to fake data.

| Variable | Required? | Used by | Effect if unset |
|---|---|---|---|
| `DATABASE_URL` | yes | `apps/api`, `apps/worker`, `packages/db` migrations | nothing works without it |
| `REDIS_URL` | yes | `apps/worker` (BullMQ) | worker can't start |
| `PORT` | yes (has a default) | `apps/api` | defaults to `4000` |
| `NVD_API_KEY` | no | NVD ingestion (`apps/worker`) | unauthenticated NVD rate limit: 5 req/30s instead of 50 req/30s |
| `NVD_PULL_DAYS` | no | `npm run sync:nvd` one-off script only | defaults to 7 (days of `lastModified` history to pull) |
| `GITHUB_TOKEN` | no | GHSA ingestion (`apps/worker`) | GHSA sync logs `skipped: no GITHUB_TOKEN configured`, 0 records, not an error |
| `RANSOMWARE_LIVE_API_KEY` | no | ransomware.live sync + all `/api/ransomware/*` live-proxy routes (`apps/api`) | sync logs `skipped: no RANSOMWARE_LIVE_API_KEY configured`; group/attack/notes/negotiations routes return empty data with `configured: false` |
| `ABUSEIPDB_API_KEY` | no | Threat Intel lookup, IP indicators (`apps/api`) | that source is simply omitted from `externalResults` |
| `VIRUSTOTAL_API_KEY` | no | Threat Intel lookup, all indicator types (`apps/api`) | same as above |
| `LOG_LEVEL` | no | pino loggers in `apps/api`, `apps/worker` | defaults to `info` |
| `VITE_API_PROXY_TARGET` | no | `apps/web` Vite dev server | defaults to `http://localhost:4000` |

Getting the optional keys:
- NVD: <https://nvd.nist.gov/developers/request-an-api-key> (free, instant)
- GitHub: any PAT with no special scopes needed (public GraphQL read access)
- Ransomware.live Pro: <https://api-pro.ransomware.live/docs> (auth header `X-Api-Key`)
- AbuseIPDB: <https://www.abuseipdb.com/account/api> (free tier)
- VirusTotal: <https://www.virustotal.com/gui/my-apikey> (free tier)

## Install & first-time database setup

```bash
cp .env.example .env
# edit .env: fill in whichever API keys you have

npm install

# Start Postgres + Redis only (for running api/worker/web directly on the host)
docker compose up -d postgres redis
```

### Migrations

```bash
npm run db:generate   # regenerate migration SQL after a schema change under packages/db/src/schema/
npm run db:migrate    # apply pending migrations to the running Postgres
npm run db:studio     # open Drizzle Studio against the running database
```

## Running the app

`apps/api` and `apps/worker` are **separate processes** — run them in separate terminals, or use
Docker Compose (below) which does this for you.

```bash
npm run dev:api      # Fastify API — http://localhost:4000
npm run dev:worker    # BullMQ worker: scheduled ingestion + trending recalculation
npm run dev:web       # Vite dev server — http://localhost:5173, proxies /api to :4000
```

`apps/api` also independently registers its own `setInterval`-based auto-sync for ransomware.live
data (every 15 minutes, with an initial run 5 seconds after boot) — this runs as soon as `apps/api`
is up, with or without `apps/worker` running. See the note in [api.md](./api.md#ransomware-routesransomwarets)
about why this one job is scheduled inside the API process instead of BullMQ.

## Scheduled ingestion

`apps/worker` registers BullMQ repeatable jobs on startup, and also enqueues one immediate run of
each so ingestion visibly starts working right away rather than waiting out the first interval:

| Job | Interval | What it does |
|---|---|---|
| `sync-nvd-cves` | every 2h | incremental NVD pull via a `sync_state` cursor |
| `sync-news-feeds` | every 15m | re-pulls all 5 news RSS feeds |
| `sync-vendor-advisories` | every 6h | re-pulls MSRC/Ubuntu/Cisco feeds |
| `sync-ghsa-advisories` | every 6h | no-ops without `GITHUB_TOKEN` |
| `recalculate-trending` | every 30m | recomputes `trending_score` for every CVE |

Separately, `apps/api` runs its own `setInterval` for the ransomware.live sync (every 15m, not a
BullMQ job — this was added directly in the API route file rather than the worker's scheduler).

Check `GET /api/admin/sync-status` at any time to see each BullMQ job's last run, status, and
record counts (see [api.md](./api.md#admin-routesadmints)).

## Triggering a manual sync

Useful before the worker/scheduler is running, or any time you want an on-demand pull outside the
schedule — these call the exact same ingestion code the BullMQ processors use:

```bash
npm run sync:nvd      # pulls NVD_PULL_DAYS (default 7) days of lastModified CVEs
npm run sync:news     # pulls all 5 news RSS feeds once
npm run sync:vendors  # pulls MSRC/Ubuntu/Cisco vendor advisory feeds once
```

```bash
curl -X POST http://localhost:4000/api/ransomware/sync   # manual ransomware.live sync
```

Each prints/logs a summary (records fetched/inserted/updated) and writes a row to `sync_log`
(except the ransomware sync, which doesn't use `sync_log` — see [database.md](./database.md)).
Any unreachable source is logged explicitly — nothing falls back to placeholder data.

### Known source caveats

- **SecurityWeek** blocks automated/datacenter traffic (HTTP 403) as of this build — logged as a
  failed feed each run, not faked.
- **Red Hat** has no working plain RSS/Atom feed as of this build; their distribution is
  CSAF/ROLIE JSON. Not included in `VENDOR_FEEDS` (`packages/shared/src/constants.ts`) — would
  need a dedicated CSAF-aware ingestion module to add.

## Daily sync via GitHub Actions

`.github/workflows/daily-sync.yml` runs every job once a day (`06:00 UTC` cron, plus a manual
"Run workflow" button) by executing the exact same scripts as `npm run sync:*` above — no BullMQ
worker or deployed API needs to be running for CVEs/news/vendors/GHSA/trending. This is a
complement to, not a replacement for, the continuously-running worker: use it as a safety net for
deployments where `apps/worker` isn't kept running 24/7, or just as a second guarantee.

> **New to this workflow, or seeing it fail with `DATABASE_URL is not set`?** See
> [github-actions.md](./github-actions.md) for the full step-by-step fix (where to get a
> reachable Postgres, exactly which secrets to add and where, troubleshooting). The summary
> below assumes you've already been through that once.

**Required repo secret:**

| Secret | Required? | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Must be reachable from GitHub-hosted runners — a managed/cloud Postgres, not `localhost`. Include `?sslmode=require` (or your provider's equivalent) if it requires TLS. |
| `NVD_API_KEY` | no | Same effect as locally — unauthenticated rate limit if unset. |
| `GHSA_PAT` | no | A GitHub personal access token for the GHSA sync step specifically. **Not** the same as GitHub Actions' own auto-provided `secrets.GITHUB_TOKEN`, whose name is reserved and whose scope isn't guaranteed sufficient for the securityAdvisories GraphQL query — this workflow maps `GHSA_PAT` to the `GITHUB_TOKEN` env var our code actually reads. |

**Optional repo variable** (Settings → Secrets and variables → Actions → Variables, not Secrets,
since it's just a URL):

| Variable | Effect |
|---|---|
| `API_BASE_URL` | If set (e.g. `https://sec1cng.example.com`), the workflow also `POST`s to `{API_BASE_URL}/api/ransomware/sync` on your deployed API. Ransomware ingestion currently only exists as an API-triggered sync (see [api.md](./api.md#ransomware-routesransomwarets)), not a standalone worker script, so this step needs a live, reachable deployment — it's skipped entirely if unset. |

Each sync step runs independently (`continue-on-error: true`) so one failing source (e.g.
SecurityWeek's 403) doesn't block the others; the job as a whole still fails at the end if any
step failed, so CI status stays honest.

## Docker Compose (full stack)

```bash
docker compose up -d
```

Brings up `postgres`, `redis`, a one-off `migrate` service (runs Drizzle migrations then exits),
`api` (port 4000), `worker`, and `web` (port 5173, Vite dev server proxying `/api` to the `api`
container). All env vars in `.env.example` above are picked up from your root `.env`
automatically.

```bash
docker compose logs -f worker   # watch ingestion jobs run
docker compose down             # stop (add -v to also drop the Postgres volume)
```

## Deploying the frontend to Vercel

Only `apps/web` (a static Vite build) belongs on Vercel — it's a serverless/static platform and
can't run `apps/api`'s persistent Fastify `app.listen()` server. Deploy `apps/api` (and run
`apps/worker`) somewhere that supports long-running Node processes instead (Render, Railway,
Fly.io, a VPS, etc.), then point the frontend at it.

The root [`vercel.json`](../vercel.json) already tells Vercel exactly what to build, so **Root
Directory in the Vercel project settings must be left as the repo root** (blank) — not
`apps/web` and not `apps/api` — otherwise `vercel.json`'s paths (relative to Root Directory) won't
resolve and Vercel falls back to guessing, which is what caused it to try type-checking `apps/api`
directly in an earlier build.

**Required Vercel project environment variable:**

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | the base URL of your deployed API, e.g. `https://sec1cng-api.onrender.com` |

Without this, the deployed frontend's `apiFetch` (`apps/web/src/api/client.ts`) falls back to
relative `/api/*` paths against the Vercel domain itself, which has no backend — every page will
correctly show its "Failed to load, retrying..." state (by design — never a fake-data fallback)
rather than actually working.

## Project layout

```
apps/
  api/      Fastify HTTP API — read-only against ingested data, plus live-proxy
            ransomware.live routes and its own ransomware sync interval
  worker/   Ingestion modules, one-off CLI scripts, BullMQ processors/scheduler
  web/      React frontend (Vite, TanStack Query/Router/Table, Chakra UI)
packages/
  db/       Drizzle schema, migrations, db client factory — see database.md
  shared/   Cross-cutting constants (feed URLs, CVE regex, severity colors), zod validation, types
docs/       This directory
```
