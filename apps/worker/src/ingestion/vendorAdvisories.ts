import Parser from "rss-parser";
import { eq, inArray } from "drizzle-orm";
import { cves, vendorAdvisories, type Db, type NewCve, type NewVendorAdvisory } from "@sec1cng/db";
import { CVE_ID_REGEX, VENDOR_FEEDS } from "@sec1cng/shared";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";
import { withSyncLog } from "../lib/syncLogger";
import { fillCveGapFromMitre } from "./mitre";

const JOB_NAME = "sync-vendor-advisories";
const parser = new Parser({ timeout: 15_000 });

// Some vendor feeds (MSRC in particular) enumerate their entire historical
// catalog rather than just recent items, referencing thousands of distinct
// CVE IDs per fetch. A live MITRE lookup per missing CVE doesn't scale to
// that volume on a job meant to run every 6h, so gap-filling is capped and
// concurrent; anything beyond the cap still gets a minimal cves row built
// directly from the vendor advisory data (no extra network round trip).
const MITRE_GAP_FILL_CAP = 25;
const MITRE_CONCURRENCY = 5;

function extractCveIds(text: string): string[] {
  const matches = text.match(CVE_ID_REGEX);
  return matches ? Array.from(new Set(matches.map((m) => m.toUpperCase()))) : [];
}

interface FeedItemInfo {
  title: string;
  link: string;
  publishedDate: Date | null;
  cveIds: string[];
}

export interface VendorIngestionResult {
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function buildMinimalCveRecord(cveId: string, vendorName: string, item: FeedItemInfo): NewCve {
  return {
    id: cveId,
    description: item.title,
    cvssScore: null,
    cvssVector: null,
    severity: "unknown",
    cweId: null,
    publishedDate: item.publishedDate,
    lastModifiedDate: item.publishedDate,
    vendor: vendorName,
    affectedProducts: [],
    references: [{ url: item.link, source: vendorName, tags: [] }],
    isExploitedInWild: false,
    hasPoc: false,
    source: vendorName,
  };
}

async function ingestOneVendorFeed(db: Db, vendorName: string, feedUrl: string): Promise<VendorIngestionResult> {
  const errors: string[] = [];
  let recordsFetched = 0;
  let recordsInserted = 0;
  let recordsUpdated = 0;

  try {
    const feed = await withRetry(() => parser.parseURL(feedUrl), {
      label: `vendor:${vendorName}`,
      maxAttempts: 3,
      baseDelayMs: 2000,
    });

    const items: FeedItemInfo[] = (feed.items ?? [])
      .filter((item) => item.link)
      .map((item) => {
        const title = item.title ?? "(untitled)";
        const content = item.contentSnippet ?? item.content ?? item.summary ?? "";
        return {
          title,
          link: item.link as string,
          publishedDate: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
          cveIds: extractCveIds(`${title} ${content}`),
        };
      });

    recordsFetched = items.length;

    // First occurrence of each CVE ID wins (feeds are newest-first).
    const firstItemByCveId = new Map<string, FeedItemInfo>();
    for (const item of items) {
      for (const cveId of item.cveIds) {
        if (!firstItemByCveId.has(cveId)) firstItemByCveId.set(cveId, item);
      }
    }
    const allCveIds = Array.from(firstItemByCveId.keys());

    const noCveRows: NewVendorAdvisory[] = items
      .filter((item) => item.cveIds.length === 0)
      .map((item) => ({
        vendorName,
        title: item.title,
        url: item.link,
        relatedCveIds: [],
        publishedDate: item.publishedDate,
      }));

    if (allCveIds.length > 0) {
      const existingRows = (
        await Promise.all(chunk(allCveIds, 500).map((idsChunk) => db.select().from(cves).where(inArray(cves.id, idsChunk))))
      ).flat();
      const existingById = new Map(existingRows.map((r) => [r.id, r]));

      const missingIds = allCveIds.filter((id) => !existingById.has(id));
      const gapFillIds = missingIds.slice(0, MITRE_GAP_FILL_CAP);
      const directInsertIds = missingIds.slice(MITRE_GAP_FILL_CAP);

      if (gapFillIds.length > 0) {
        const filled = await mapWithConcurrency(gapFillIds, MITRE_CONCURRENCY, (id) => fillCveGapFromMitre(db, id));
        // Anything MITRE also didn't have falls through to a direct minimal insert.
        gapFillIds.forEach((id, i) => {
          if (!filled[i]) directInsertIds.push(id);
        });
      }

      if (directInsertIds.length > 0) {
        const minimalRows = directInsertIds.map((id) => buildMinimalCveRecord(id, vendorName, firstItemByCveId.get(id)!));
        for (const rowsChunk of chunk(minimalRows, 500)) {
          await db.insert(cves).values(rowsChunk).onConflictDoNothing({ target: cves.id });
        }
      }

      recordsInserted += missingIds.length;

      // Merge advisory URL into references for CVEs we already had.
      const alreadyPresentIds = allCveIds.filter((id) => existingById.has(id));
      for (const cveId of alreadyPresentIds) {
        const existing = existingById.get(cveId)!;
        const item = firstItemByCveId.get(cveId)!;
        const currentRefs = (existing.references as Array<{ url: string }>) ?? [];
        if (!currentRefs.some((r) => r.url === item.link)) {
          await db
            .update(cves)
            .set({
              references: [...currentRefs, { url: item.link, source: vendorName, tags: [] }],
              vendor: existing.vendor ?? vendorName,
              updatedAt: new Date(),
            })
            .where(eq(cves.id, cveId));
          recordsUpdated++;
        }
      }

      if (missingIds.length > MITRE_GAP_FILL_CAP) {
        logger.info(
          { vendorName, capped: missingIds.length - MITRE_GAP_FILL_CAP },
          `[vendor] ${vendorName}: MITRE gap-fill capped at ${MITRE_GAP_FILL_CAP}, remaining CVEs inserted directly from advisory data`,
        );
      }
    }

    if (noCveRows.length > 0) {
      for (const rowsChunk of chunk(noCveRows, 500)) {
        const inserted = await db
          .insert(vendorAdvisories)
          .values(rowsChunk)
          .onConflictDoNothing({ target: vendorAdvisories.url })
          .returning({ id: vendorAdvisories.id });
        recordsInserted += inserted.length;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`${vendorName}: ${message}`);
    logger.error({ vendorName, feedUrl, err: message }, "[vendor] feed fetch failed, continuing to next source");
  }

  return { recordsFetched, recordsInserted, recordsUpdated, errors };
}

export async function runVendorAdvisoryIngestion(db: Db): Promise<VendorIngestionResult> {
  return withSyncLog(db, JOB_NAME, async () => {
    let recordsFetched = 0;
    let recordsInserted = 0;
    let recordsUpdated = 0;
    const errors: string[] = [];

    for (const feed of VENDOR_FEEDS) {
      logger.info({ feed: feed.name, url: feed.url }, "[vendor] fetching feed");
      const result = await ingestOneVendorFeed(db, feed.name, feed.url);
      recordsFetched += result.recordsFetched;
      recordsInserted += result.recordsInserted;
      recordsUpdated += result.recordsUpdated;
      errors.push(...result.errors);
      logger.info(
        { feed: feed.name, fetched: result.recordsFetched, inserted: result.recordsInserted, updated: result.recordsUpdated },
        `[vendor] ${feed.name} done`,
      );
    }

    return { recordsFetched, recordsInserted, recordsUpdated, errors };
  });
}

export { JOB_NAME as VENDOR_JOB_NAME };
