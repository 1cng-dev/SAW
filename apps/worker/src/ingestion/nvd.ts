import { inArray, sql } from "drizzle-orm";
import { cves, syncState, type Db, type NewCve } from "@sec1cng/db";
import { NVD_API_BASE_URL, type Severity } from "@sec1cng/shared";
import { createNvdRateLimiter, type SlidingWindowRateLimiter } from "../lib/rateLimiter";
import { withRetry, HttpError, parseRetryAfter } from "../lib/retry";
import { withSyncLog } from "../lib/syncLogger";
import { logger } from "../lib/logger";

const RESULTS_PER_PAGE = 2000;
const MAX_WINDOW_DAYS = 120; // NVD API hard limit on lastMod date range per request
const JOB_NAME = "sync-nvd-cves";

export interface NvdSyncResult {
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
}

function mapSeverityFromScore(score: number | null): Severity {
  if (score == null) return "unknown";
  if (score >= 9) return "critical";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  if (score > 0) return "low";
  return "unknown";
}

interface CvssData {
  baseScore?: number;
  baseSeverity?: string;
  vectorString?: string;
}

function extractBestMetric(metrics: Record<string, Array<{ cvssData: CvssData }>> | undefined): {
  score: number | null;
  vector: string | null;
  severity: Severity;
} {
  const best =
    metrics?.cvssMetricV31?.[0]?.cvssData ??
    metrics?.cvssMetricV30?.[0]?.cvssData ??
    metrics?.cvssMetricV2?.[0]?.cvssData;
  if (!best) return { score: null, vector: null, severity: "unknown" };
  const score = typeof best.baseScore === "number" ? best.baseScore : null;
  // NVD's baseSeverity can be "NONE" (score 0.0) or absent (CVSSv2-only records)
  // — neither maps onto our severity enum, so fall back to score-based mapping.
  const KNOWN_SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
  const normalized = best.baseSeverity?.toLowerCase() as Severity | undefined;
  const severity =
    normalized && KNOWN_SEVERITIES.includes(normalized) ? normalized : mapSeverityFromScore(score);
  return { score, vector: best.vectorString ?? null, severity };
}

function extractCwe(weaknesses: Array<{ description: Array<{ value: string }> }> | undefined): string | null {
  for (const w of weaknesses ?? []) {
    for (const d of w.description ?? []) {
      if (typeof d.value === "string" && d.value.startsWith("CWE-")) return d.value;
    }
  }
  return null;
}

interface NvdConfiguration {
  nodes: Array<{ cpeMatch: Array<{ criteria: string; vulnerable: boolean }> }>;
}

function extractVendorAndProducts(configurations: NvdConfiguration[] | undefined): {
  vendor: string | null;
  products: string[];
} {
  const products = new Set<string>();
  let vendor: string | null = null;
  for (const config of configurations ?? []) {
    for (const node of config.nodes ?? []) {
      for (const match of node.cpeMatch ?? []) {
        if (!match.criteria) continue;
        const parts = match.criteria.split(":"); // cpe:2.3:a:<vendor>:<product>:<version>:...
        const v = parts[3];
        const p = parts[4];
        if (!vendor && v && v !== "*") vendor = v;
        if (v && p && p !== "*") products.add(`${v}:${p}`);
      }
    }
  }
  return { vendor, products: Array.from(products) };
}

interface NvdReference {
  url: string;
  source?: string;
  tags?: string[];
}

interface NvdCveItem {
  cve: {
    id: string;
    published?: string;
    lastModified?: string;
    descriptions?: Array<{ lang: string; value: string }>;
    metrics?: Record<string, Array<{ cvssData: CvssData }>>;
    weaknesses?: Array<{ description: Array<{ value: string }> }>;
    configurations?: NvdConfiguration[];
    references?: NvdReference[];
    cisaExploitAdd?: string;
  };
}

function mapCveItem(item: NvdCveItem): NewCve {
  const cve = item.cve;
  const description = cve.descriptions?.find((d) => d.lang === "en")?.value ?? null;
  const { score, vector, severity } = extractBestMetric(cve.metrics);
  const cweId = extractCwe(cve.weaknesses);
  const { vendor, products } = extractVendorAndProducts(cve.configurations);
  const references = (cve.references ?? []).map((r) => ({
    url: r.url,
    source: r.source ?? null,
    tags: r.tags ?? [],
  }));
  const hasPoc = references.some((r) => (r.tags ?? []).includes("Exploit"));
  const isExploitedInWild = Boolean(cve.cisaExploitAdd);

  return {
    id: cve.id,
    description,
    cvssScore: score != null ? String(score) : null,
    cvssVector: vector,
    severity,
    cweId,
    publishedDate: cve.published ? new Date(cve.published) : null,
    lastModifiedDate: cve.lastModified ? new Date(cve.lastModified) : null,
    vendor,
    affectedProducts: products,
    references,
    isExploitedInWild,
    hasPoc,
    source: "NVD",
  };
}

interface NvdApiResponse {
  totalResults: number;
  vulnerabilities: NvdCveItem[];
}

async function fetchNvdPage(
  params: URLSearchParams,
  rateLimiter: SlidingWindowRateLimiter,
  apiKey: string | undefined,
): Promise<NvdApiResponse> {
  return withRetry(
    async () => {
      const url = `${NVD_API_BASE_URL}?${params.toString()}`;
      const res = await rateLimiter.schedule(() =>
        fetch(url, { headers: apiKey ? { apiKey } : {} }),
      );
      if (!res.ok) {
        const retryAfterMs = parseRetryAfter(res.headers.get("retry-after"));
        throw new HttpError(`NVD request failed with status ${res.status}`, res.status, retryAfterMs);
      }
      return (await res.json()) as NvdApiResponse;
    },
    { label: "NVD", maxAttempts: 5 },
  );
}

const UPDATABLE_COLUMNS: Array<keyof NewCve> = [
  "description",
  "cvssScore",
  "cvssVector",
  "severity",
  "cweId",
  "publishedDate",
  "lastModifiedDate",
  "vendor",
  "affectedProducts",
  "references",
  "isExploitedInWild",
  "hasPoc",
  "source",
];

/** Fetch + upsert a single lastMod date window from NVD. Pure ingestion logic — no sync_log/sync_state bookkeeping. */
export async function syncNvdWindow(
  db: Db,
  windowStart: Date,
  windowEnd: Date,
): Promise<NvdSyncResult> {
  const apiKey = process.env.NVD_API_KEY || undefined;
  const rateLimiter = createNvdRateLimiter(Boolean(apiKey));

  const errors: string[] = [];
  let recordsFetched = 0;
  let recordsInserted = 0;
  let recordsUpdated = 0;
  let startIndex = 0;
  let totalResults = Infinity;

  while (startIndex < totalResults) {
    const params = new URLSearchParams({
      resultsPerPage: String(RESULTS_PER_PAGE),
      startIndex: String(startIndex),
      lastModStartDate: windowStart.toISOString(),
      lastModEndDate: windowEnd.toISOString(),
    });

    try {
      const page = await fetchNvdPage(params, rateLimiter, apiKey);
      totalResults = page.totalResults;
      const items = page.vulnerabilities ?? [];
      recordsFetched += items.length;

      if (items.length > 0) {
        const mapped = items.map(mapCveItem);
        const ids = mapped.map((m) => m.id);
        const existing = await db.select({ id: cves.id }).from(cves).where(inArray(cves.id, ids));
        const existingIds = new Set(existing.map((e) => e.id));

        const setClause = Object.fromEntries(
          UPDATABLE_COLUMNS.map((col) => [col, sql.raw(`excluded."${toSnakeCase(col)}"`)]),
        ) as Record<string, ReturnType<typeof sql.raw>>;

        await db
          .insert(cves)
          .values(mapped)
          .onConflictDoUpdate({
            target: cves.id,
            set: { ...setClause, updatedAt: new Date() },
          });

        recordsInserted += mapped.filter((m) => !existingIds.has(m.id)).length;
        recordsUpdated += mapped.filter((m) => existingIds.has(m.id)).length;
      }

      startIndex += RESULTS_PER_PAGE;
      if (items.length === 0) break;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(message);
      logger.error({ err: message, startIndex }, "[NVD] page fetch failed after retries, stopping window");
      break;
    }
  }

  return { recordsFetched, recordsInserted, recordsUpdated, errors };
}

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export async function getNvdCursor(db: Db): Promise<Date | null> {
  const [row] = await db.select().from(syncState).where(sql`${syncState.jobName} = ${JOB_NAME}`);
  return row?.lastSyncTimestamp ?? null;
}

export async function setNvdCursor(db: Db, timestamp: Date): Promise<void> {
  await db
    .insert(syncState)
    .values({ jobName: JOB_NAME, lastSyncTimestamp: timestamp, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: syncState.jobName,
      set: { lastSyncTimestamp: timestamp, updatedAt: new Date() },
    });
}

export interface RunNvdIngestionOptions {
  /** Explicit window override — used by the one-off verification CLI script. */
  windowStart?: Date;
  windowEnd?: Date;
  /**
   * Only consulted when no sync_state cursor exists yet (true "first run").
   * NVD limits lastMod ranges to 120 days/request, so a genuine full
   * historical pull (back to ~1999) is chunked automatically but takes many
   * hours under the unauthenticated rate limit — set NVD_HISTORICAL_START_DATE
   * when you're ready to kick that off. Defaults to 7 days ago otherwise.
   */
  historicalStartDate?: Date;
}

/**
 * Full NVD sync entrypoint: resolves the date window (explicit override,
 * stored cursor, or historical default), chunks it into <=120-day windows,
 * fetches+upserts each, advances the sync_state cursor after each clean
 * window, and records the whole run in sync_log.
 */
export async function runNvdIngestion(db: Db, options: RunNvdIngestionOptions = {}): Promise<NvdSyncResult> {
  return withSyncLog(db, JOB_NAME, async () => {
    const windowEnd = options.windowEnd ?? new Date();
    let windowStart = options.windowStart;

    if (!windowStart) {
      const cursor = await getNvdCursor(db);
      windowStart =
        cursor ??
        options.historicalStartDate ??
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const windows: Array<[Date, Date]> = [];
    let cursorStart = new Date(windowStart);
    while (cursorStart < windowEnd) {
      const chunkEndMs = Math.min(
        cursorStart.getTime() + MAX_WINDOW_DAYS * 24 * 60 * 60 * 1000,
        windowEnd.getTime(),
      );
      const chunkEnd = new Date(chunkEndMs);
      windows.push([new Date(cursorStart), chunkEnd]);
      cursorStart = chunkEnd;
    }

    let recordsFetched = 0;
    let recordsInserted = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    for (const [start, end] of windows) {
      logger.info({ start: start.toISOString(), end: end.toISOString() }, "[NVD] syncing window");
      const result = await syncNvdWindow(db, start, end);
      recordsFetched += result.recordsFetched;
      recordsInserted += result.recordsInserted;
      recordsUpdated += result.recordsUpdated;
      errors.push(...result.errors);

      if (result.errors.length === 0) {
        await setNvdCursor(db, end);
      } else {
        logger.error({ start, end }, "[NVD] window failed, not advancing cursor past this point");
        break;
      }
    }

    return { recordsFetched, recordsInserted, recordsUpdated, errors };
  });
}

export { JOB_NAME as NVD_JOB_NAME };
