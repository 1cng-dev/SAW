# Database

PostgreSQL, schema-managed with [Drizzle ORM](https://orm.drizzle.team/). Schema lives in
`packages/db/src/schema/`, one file per table, barrel-exported from `packages/db/src/schema/index.ts`.
Both `apps/api` and `apps/worker` import the schema and a `createDbClient()` factory from
`@sec1cng/db` — each process opens its own `pg.Pool`, but there is exactly one schema definition
and one migration history shared by both.

Every row in every table below is populated from a real, live external source (NVD, MITRE,
GitHub Security Advisories, RSS feeds, or the ransomware.live API) — nothing is seeded or faked.
See [api.md](./api.md) for the endpoints that read this data and [setup.md](./setup.md) for how
ingestion is triggered.

## Enums (`schema/enums.ts`)

| Enum | Values |
|---|---|
| `severity` | `critical`, `high`, `medium`, `low`, `unknown` |
| `sync_status` | `success`, `partial`, `failed` |

## Tables

### `cves`

The core CVE record table. Populated by NVD (primary), MITRE (gap-fill when NVD lacks a record),
GHSA (cross-referenced by CVE ID, currently inert without `GITHUB_TOKEN`), and vendor advisory
feeds (MSRC/Ubuntu/Cisco) when they reference a CVE ID.

| Column | Type | Notes |
|---|---|---|
| `id` | `text` PK | e.g. `"CVE-2026-12345"` |
| `description` | `text` | |
| `cvss_score` | `numeric` | nullable |
| `cvss_vector` | `text` | nullable |
| `severity` | `severity` enum | default `unknown` |
| `cwe_id` | `text` | nullable |
| `published_date` | `timestamptz` | |
| `last_modified_date` | `timestamptz` | |
| `vendor` | `text` | nullable; free text, not normalized (case varies by source — see caveat below) |
| `affected_products` | `jsonb` | array of strings, default `[]` |
| `references` | `jsonb` | array of `{ url, source, tags }`, default `[]` |
| `is_exploited_in_wild` | `boolean` | default `false`; set when NVD's CISA KEV flag (`cisaExploitAdd`) is present |
| `has_poc` | `boolean` | default `false`; set when an NVD reference is tagged `"Exploit"` |
| `source` | `text` | **not** a DB enum — free text: `"NVD"`, `"MITRE"`, `"GHSA"`, or a vendor name (`"MSRC"`, `"Ubuntu"`, `"Cisco"`, ...) |
| `view_count` | `integer` | default `0`; incremented on every `GET /api/cves/:id` |
| `trending_score` | `numeric` | default `0`; recomputed by the `recalculate-trending` job |
| `created_at` / `updated_at` | `timestamptz` | |

Indexes: `trending_score`, `severity`, `vendor`, `published_date`.

> **Known data quirk**: `vendor` values are inconsistent in case/format across sources (NVD's
> CPE-derived values are lowercase, e.g. `"google"`, `"microsoft"`; vendor-feed-derived values are
> capitalized, e.g. `"Cisco"`, `"MSRC"`). `GET /api/vendors` reflects this — no normalization has
> been applied.

### `news_articles`

RSS-derived security news (The Hacker News, BleepingComputer, Krebs on Security, The Record;
SecurityWeek is wired but currently blocked with HTTP 403 for automated traffic).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `title` | `text` | |
| `excerpt` | `text` | truncated to 300 chars at ingestion |
| `source_name` | `text` | |
| `source_url` | `text` | **unique** — dedup key |
| `category` | `text` | keyword-inferred: Ransomware / Data Breach / Malware / Vulnerability / APT / Phishing / Other |
| `published_date` | `timestamptz` | |
| `related_cve_ids` | `jsonb` | CVE IDs regex-extracted from title/excerpt, default `[]` |
| `related_ransomware_groups` | `jsonb` | known ransomware group names (from `ransomware_groups.name`) whole-word-matched in title/excerpt at ingestion time, default `[]` |
| `fetched_at` | `timestamptz` | |

### `vendor_advisories`

Vendor RSS items that do **not** reference a CVE ID (items that do are merged into `cves` instead).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `vendor_name` | `text` | |
| `title` | `text` | |
| `url` | `text` | **unique** — dedup key |
| `related_cve_ids` | `jsonb` | default `[]` (empty by construction — rows with CVE IDs go to `cves`) |
| `published_date` | `timestamptz` | |
| `fetched_at` | `timestamptz` | |

### `sync_log`

Append-only audit trail — one row per ingestion run, across every job. Backs
`GET /api/admin/sync-status`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `job_name` | `text` | e.g. `"sync-nvd-cves"` |
| `started_at` / `finished_at` | `timestamptz` | `finished_at` null while running |
| `records_fetched` / `records_inserted` / `records_updated` | `integer` | |
| `status` | `sync_status` enum | |
| `error_message` | `text` | nullable |

### `sync_state`

One row per job — the incremental-sync cursor. Deliberately separate from `sync_log` (an
append-only audit log) so a `partial` run never ambiguously advances or fails to advance the
cursor: `sync_state` is only updated after a clean window.

| Column | Type | Notes |
|---|---|---|
| `job_name` | `text` PK | |
| `last_sync_timestamp` | `timestamptz` | nullable |
| `updated_at` | `timestamptz` | |

### `ransomware_groups`

Synced from ransomware.live's `/groups` endpoint (~364 groups). ATT&CK data is fetched lazily,
not in the bulk sync — see below.

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` PK (identity) | |
| `name` | `text` | original name as returned by ransomware.live (lowercase in most cases) |
| `slug` | `text` | **unique** — slugified `name`, used in API/frontend routes |
| `description` | `text` | nullable; currently just `"Also known as: {altname}"` when ransomware.live provides one |
| `victims` | `integer` | default `0` |
| `active` | `boolean` | default `true` (not populated by the `/groups` list endpoint — this stays at its default) |
| `last_seen` | `timestamptz` | nullable (not populated by `/groups` — would need the per-group detail endpoint) |
| `location` | `text` | nullable, unused currently |
| `attack_techniques` | `jsonb` | cached MITRE ATT&CK tactic/technique mapping (ransomware.live's `ttps` field from `/group/{name}`) — fetched on first view of a group, not during bulk sync |
| `attack_synced_at` | `timestamptz` | cache staleness marker; refetched after 24h |
| `synced_at` / `created_at` / `updated_at` | `timestamptz` | |

### `ransomware_victims`

Synced from ransomware.live's `/victims/recent` endpoint (last 100 claimed victims).

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` PK (identity) | |
| `external_id` | `text` | ransomware.live's own victim `id` — **unique**, dedup key |
| `group_name` | `text` | |
| `name` | `text` | victim/company name (maps from ransomware.live's `victim` field) |
| `description` | `text` | nullable |
| `published_date` | `timestamptz` | nullable; from ransomware.live's `discovered`, falling back to `attackdate` |
| `website` | `text` | nullable |
| `country` | `text` | nullable, ISO country code |
| `synced_at` / `created_at` / `updated_at` | `timestamptz` | |

### `ransomware_iocs`

Synced from ransomware.live's `/iocs` + `/iocs/{group}` endpoints (~80 groups have IOC data;
~1,600 individual indicators as of the last sync). Backs the Threat Intel / IOC Lookup feature's
cross-reference — this is why it's a local table rather than a live per-request API call: a
single lookup would otherwise require ~80 live API calls to check every group.

| Column | Type | Notes |
|---|---|---|
| `id` | `integer` PK (identity) | |
| `group_name` | `text` | |
| `ioc_type` | `text` | `md5`, `sha256`, `ip`, `btc`, `tox`, `email`, `telegram`, `session`, `xmr`, `pgp`, `twitter`, etc. — whatever ransomware.live returns per group |
| `ioc_value` | `text` | the actual indicator value, lowercased at write time |
| `synced_at` | `timestamptz` | |

Unique constraint on `(group_name, ioc_type, ioc_value)`.

## Migrations

Generated with `drizzle-kit generate` from the schema files, written to `packages/db/drizzle/*.sql`,
and applied with a small custom runner (`packages/db/src/migrate.ts`, wraps
`drizzle-orm/node-postgres/migrator`). See [setup.md](./setup.md#migrations) for commands.

Migration history so far:

| File | Adds |
|---|---|
| `0000_known_sir_ram.sql` | `cves`, `news_articles`, `vendor_advisories`, `sync_log`, `sync_state` |
| `0001_talented_stellaris.sql` | `ransomware_groups`, `ransomware_victims` |
| `0002_lazy_polaris.sql` | `ransomware_iocs`, `attack_techniques`/`attack_synced_at` on `ransomware_groups` |
| `0003_uneven_maria_hill.sql` | `related_ransomware_groups` on `news_articles` |

Never hand-edit a generated migration file or the schema without regenerating — run
`npm run db:generate` after any change under `packages/db/src/schema/`, then `npm run db:migrate`
to apply it.
