# Sec-1CNG

A security advisory aggregator for security.1cloudng.com. Ingests **real, live**
data only — NVD, MITRE, GitHub Security Advisories, and security news/vendor
RSS feeds. No mock or seeded data anywhere in the pipeline.

## Stack

- **Frontend**: React 18 + TypeScript + Vite, TanStack Query/Router/Table/Virtual/Form, Chakra UI, recharts
- **Backend**: Node.js + TypeScript + Fastify
- **Database**: PostgreSQL via Drizzle ORM
- **Cache/Queue**: Redis + BullMQ
- **Monorepo**: npm workspaces (`apps/api`, `apps/worker`, `apps/web`, `packages/db`, `packages/shared`)

## Prerequisites

- Node.js >= 20
- Docker (for Postgres + Redis, or the full `docker compose up`)
- An NVD API key is optional but recommended — <https://nvd.nist.gov/developers/request-an-api-key>
  (unauthenticated: 5 req/30s, authenticated: 50 req/30s)
- A GitHub personal access token is required for GitHub Security Advisory (GHSA)
  ingestion. Without it, GHSA ingestion is fully wired but cleanly no-ops
  (logs `skipped: no GITHUB_TOKEN configured`) rather than failing.

## Setup

```bash
cp .env.example .env
# edit .env: fill in NVD_API_KEY / GITHUB_TOKEN if you have them

npm install

# Start Postgres + Redis only (for running api/worker/web directly on the host)
docker compose up -d postgres redis

# Run Drizzle migrations
npm run db:migrate
```

`npm run db:generate` regenerates migration SQL from the Drizzle schema in
`packages/db/src/schema/` after a schema change; `npm run db:studio` opens
Drizzle Studio against the running database.

## Running the app

The API server and the ingestion worker are **separate processes** — run them
in separate terminals (or via Docker Compose, see below):

```bash
npm run dev:api      # Fastify API on http://localhost:4000
npm run dev:worker   # BullMQ worker: runs scheduled ingestion + trending jobs
npm run dev:web      # Vite dev server on http://localhost:5173
```

The worker registers repeatable BullMQ jobs on startup and also enqueues one
immediate run of each so ingestion visibly starts working right away:

| Job | Interval |
|---|---|
| `sync-nvd-cves` | every 2h (incremental, via a `sync_state` cursor) |
| `sync-news-feeds` | every 15m |
| `sync-vendor-advisories` | every 6h |
| `sync-ghsa-advisories` | every 6h (no-ops without `GITHUB_TOKEN`) |
| `recalculate-trending` | every 30m |

Check `GET /api/admin/sync-status` (or the browser) at any time to see each
job's last run, status, and record counts.

## Triggering a manual sync

Before the worker/scheduler is running, or any time you want an on-demand
pull outside the schedule, use the one-off CLI scripts (same ingestion code
the BullMQ processors call):

```bash
npm run sync:nvd      # pulls NVD_PULL_DAYS (default 7) days of lastModified CVEs
npm run sync:news     # pulls all 5 news RSS feeds once
npm run sync:vendors  # pulls MSRC/Ubuntu/Cisco vendor advisory feeds once
```

Each prints a summary (records fetched/inserted/updated) and writes a row to
`sync_log`. Any unreachable source is logged explicitly — nothing falls back
to placeholder data.

### Known source caveats

- **SecurityWeek** blocks automated/datacenter traffic (HTTP 403) as of this
  build — logged as a failed feed each run, not faked.
- **Red Hat** has no working plain RSS/Atom feed as of this build; their
  distribution is CSAF/ROLIE JSON. Not included in `VENDOR_FEEDS`
  (`packages/shared/src/constants.ts`) — would need a dedicated CSAF-aware
  ingestion module to add.

## Docker Compose (full stack)

```bash
docker compose up -d
```

Brings up `postgres`, `redis`, a one-off `migrate` service (runs Drizzle
migrations then exits), `api` (port 4000), `worker`, and `web` (port 5173,
Vite dev server proxying `/api` to the `api` container). `NVD_API_KEY` /
`GITHUB_TOKEN` are picked up from your root `.env` automatically.

```bash
docker compose logs -f worker   # watch ingestion jobs run
docker compose down             # stop (add -v to also drop the Postgres volume)
```

## Project layout

```
apps/
  api/      Fastify HTTP API (reads only — never writes/ingests)
  worker/   Ingestion modules, one-off CLI scripts, BullMQ processors/scheduler
  web/      React frontend
packages/
  db/       Drizzle schema, migrations, db client factory
  shared/   Cross-cutting constants (feed URLs, CVE regex, severity colors), zod validation, types
```
