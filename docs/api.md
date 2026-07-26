# API

Fastify server, `apps/api`. Base URL in local dev: `http://localhost:4000` (or proxied through
Vite at `http://localhost:5173/api/*` for the frontend — see `apps/web/vite.config.ts`).

All routes are registered in `apps/api/src/routes/index.ts`, one file per resource. The API is
**read-only against ingested data** — it never fetches from NVD/RSS/ransomware.live itself except
for the two on-demand "live proxy" ransomware endpoints noted below, and the two sync-trigger
endpoints. There is currently no authentication on any route — this is a local/internal tool, not
exposed publicly.

## Health

`GET /api/health` → `{ status: "ok" }`

## CVEs (`routes/cves.ts`)

### `GET /api/cves`

Server-side filtered, sorted, paginated CVE list.

Query params: `severity` (comma-separated), `vendor` (comma-separated), `dateFrom`, `dateTo`,
`minCvss`, `maxCvss`, `hasPoc` (bool), `isExploited` (bool), `search` (matches `id`, `description`,
`vendor` via `ILIKE`), `page`, `pageSize`, `sortBy` (`publishedDate` | `lastModifiedDate` |
`cvssScore` | `trendingScore` | `id`), `sortDir` (`asc` | `desc`). Validated by
`cveQuerySchema` in `packages/shared/src/validation.ts`.

Response: `{ data: Cve[], page, pageSize, total }`

### `GET /api/cves/trending`

`?limit=` (default 20, max 100). Returns CVEs ordered by `trending_score` descending.
Response: `{ data: Cve[] }`

### `GET /api/cves/export`

Same filters as `GET /api/cves` (page/sort ignored — this streams the **entire filtered result
set**, not just one page). Streams `text/csv` in batches of 1,000 rows so memory stays flat
regardless of result size. Columns: `id, severity, cvss_score, cwe_id, vendor, published_date,
last_modified_date, is_exploited_in_wild, has_poc, source`.

### `GET /api/cves/:id`

Increments `view_count` on every call (feeds the trending-score calculation), then returns the
row plus any news articles whose `related_cve_ids` contains this CVE ID.

Response: `{ data: Cve, relatedNews: NewsArticle[] }` · `404` if the CVE doesn't exist.

## News (`routes/news.ts`)

### `GET /api/news`

Query: `source`, `category`, `page`, `pageSize`. Validated by `newsQuerySchema`.
Response: `{ data: NewsArticle[], page, pageSize, total }`

## Vendors (`routes/vendors.ts`)

### `GET /api/vendors`

Real `GROUP BY vendor` aggregation over `cves`. Response: `{ data: [{ vendor, cveCount,
criticalCount, highCount }] }`, ordered by `cveCount` descending.

### `GET /api/vendors/:name/cves`

Query: `page`, `pageSize` (max 100). Response: `{ data: Cve[], page, pageSize, total,
severityBreakdown: { critical, high, medium, low, unknown } }` for that vendor.

## Stats (`routes/stats.ts`)

### `GET /api/stats`

Homepage/dashboard headline numbers, computed fresh on every call (no caching).
Response:
```json
{
  "totalCves": 13399,
  "todayCriticalCves": 12,
  "totalNewsArticles": 84,
  "totalVendorAdvisories": 4,
  "severityBreakdown": { "critical": 998, "high": 4181, "medium": 3588, "low": 374, "unknown": 4258 }
}
```

### `GET /api/stats/cve-breakdown`

No params. Response: `{ exploitedInWild, hasPublicPoc, avgCvssScore, newThisWeek }` (all real
aggregate counts over `cves`).

### `GET /api/stats/stat-trend`

Query: `statType` (`total_cves` | `critical_today` | `high_severity` | `news_articles` |
`vendor_advisories`, default `total_cves`), `days` (default 7). Powers the dashboard stat-card
sparklines. Response: `{ data: [{ date: "YYYY-MM-DD", count }] }`.

### `GET /api/stats/disclosure-trend`

No params — fixed 30-day window. Response: `{ data: [{ date, count }] }`, real per-day CVE
publish counts. Backs the Trending page's chart.

> Two frontend hooks (`useSeverityTrend`, `useNewsVolumeTrend` in `apps/web/src/api/hooks.ts`)
> reference `/api/stats/severity-trend` and `/api/stats/news-volume-trend`, which **do not exist**
> as routes. Neither hook is currently called from any page, so this is dead code rather than a
> live bug — flagging it here so it doesn't surprise anyone wiring a new page to them.

## Admin (`routes/admin.ts`)

### `GET /api/admin/sync-status`

Joins `sync_log` (most recent run) with `sync_state` (cursor) per known job name
(`sync-nvd-cves`, `sync-news-feeds`, `sync-vendor-advisories`, `sync-ghsa-advisories`,
`recalculate-trending`). Response: `{ data: SyncStatusEntry[] }` — see
[setup.md](./setup.md#scheduled-ingestion) for what each job does and how often it runs.

## Threat Intel (`routes/threatIntel.ts`)

### `GET /api/threat-intel/lookup`

Query: `indicator` (required — an IP, domain, hash, or URL). Detects the indicator type via
regex, then checks it against, in priority order:

1. **`ransomware_iocs`** (local table, synced from ransomware.live) — exact match on
   `ioc_value`. Highest-confidence signal; if matched, sets `verdict: "malicious"`,
   `confidence: "high"` and this is **not** overridden by weaker CVE/news matches below.
2. **`cves.description`** (`ILIKE`) and **`news_articles`** (title/excerpt/URL, `ILIKE`) — only
   consulted if no ransomware IOC match. Critical/high CVE matches → `malicious`/`high`; any
   other CVE match → `suspicious`/`medium`; news-only match → `suspicious`/`low`.
3. **AbuseIPDB** (`ABUSEIPDB_API_KEY`, IP indicators only) — live call to
   `api.abuseipdb.com/api/v2/check`, gated behind the env var; silently skipped without it.
4. **VirusTotal** (`VIRUSTOTAL_API_KEY`, all four indicator types) — live calls to VT's v3
   `files/`, `ip_addresses/`, `domains/`, or `urls/{base64url-id}` endpoints depending on
   indicator type; gated behind the env var.

Response:
```json
{
  "indicator": "...", "indicatorType": "ip|domain|hash|url|unknown",
  "verdict": "malicious|suspicious|clean|unknown", "confidence": "high|medium|low",
  "sources": ["..."],
  "cveMatches": [...], "newsMatches": [...], "ransomwareIocMatches": [...],
  "externalResults": [{ "source": "AbuseIPDB|VirusTotal", "data": {...} }],
  "hasExternalAPI": true
}
```

Without either external key set, `externalResults` is empty and `hasExternalAPI: false` — the
frontend is expected to show "Connect API key to enable this feature" rather than fabricate a
result (per the no-mock-data rule).

## Ransomware (`routes/ransomware.ts`)

All data originates from the [ransomware.live Pro API](https://api-pro.ransomware.live/docs)
(`RANSOMWARE_LIVE_API_KEY`, header `X-Api-Key`). Without a key, sync cleanly no-ops (logs
`skipped: no RANSOMWARE_LIVE_API_KEY configured`) and the group/attack/notes/negotiations routes
return empty data with `configured: false` rather than erroring.

### `POST /api/ransomware/sync`

Manually triggers a full sync (groups → victims → IOCs, ~80 extra API calls for IOCs with a
150ms delay between each). Also runs automatically every 15 minutes via a `setInterval` in this
same file (not BullMQ — see [setup.md](./setup.md#scheduled-ingestion) for why this job's
scheduling lives in the API process rather than the worker). Response: `{ success, message }` or
`500` on failure.

### `GET /api/ransomware/groups`

All synced groups. Response: `{ data: [{ id, name, slug, description, victims, active, lastSeen,
location }] }`, ordered by most-recently synced.

### `GET /api/ransomware/victims`

Most recent 50 synced victims. Response: `{ data: [...] }`.

### `GET /api/ransomware/stats`

Response: `{ totalGroups, activeGroups, totalVictims, newVictimsThisWeek, newVictimsThisMonth }`.

### `GET /api/ransomware/trends`

Fixed 30-day window. Response: `{ data: [{ date, victims }] }` — real per-day victim-claim counts.

### `GET /api/ransomware/groups/:slug/attack`

MITRE ATT&CK tactic/technique matrix for one group. Cached in `ransomware_groups.attack_techniques`
and refetched live from ransomware.live's `/group/{name}` only when the cache is empty or older
than 24h (`attack_synced_at`). `404` if `slug` isn't a known group. Response: `{ group, ttps,
cached, stale? }` where `ttps` is ransomware.live's real tactic→technique array (tactic_id,
tactic_name, techniques: [{ technique_id, technique_name, technique_details }]).

### `GET /api/ransomware/groups/:slug/notes`

Live list of ransom-note filenames for the group (`ransomware.live` `/ransomnotes/{name}`, not
cached — this is a lightweight list call). Response: `{ data: string[], configured }`.

### `GET /api/ransomware/groups/:slug/notes/:noteName`

Live fetch of one ransom note's actual content. Proxies ransomware.live's raw response through
(includes `content`, `extension`, etc.). `502` if the live call fails.

### `GET /api/ransomware/groups/:slug/negotiations`

Live list of negotiation chat summaries for the group (id, message_count, initial/negotiated
ransom amounts, paid status). Response: `{ data: [...], configured }`.

### `GET /api/ransomware/groups/:slug/negotiations/:chatId`

Live fetch of one full negotiation chat transcript (`messages: [{ party, content, timestamp }]`).
`502` if the live call fails.
