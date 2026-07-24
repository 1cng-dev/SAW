import { eq } from "drizzle-orm";
import { cves, type Db, type NewCve } from "@sec1cng/db";
import { MITRE_API_BASE_URL } from "@sec1cng/shared";
import { logger } from "../lib/logger";
import { withRetry, HttpError, parseRetryAfter } from "../lib/retry";

interface MitreCveRecord {
  cveMetadata: { cveId: string; datePublished?: string; dateUpdated?: string };
  containers: {
    cna: {
      descriptions?: Array<{ lang: string; value: string }>;
      references?: Array<{ url: string }>;
      metrics?: Array<Record<string, { baseScore?: number; vectorString?: string; baseSeverity?: string }>>;
      affected?: Array<{ vendor?: string; product?: string }>;
    };
  };
}

async function fetchMitreRecord(cveId: string): Promise<MitreCveRecord | null> {
  return withRetry(
    async () => {
      const res = await fetch(`${MITRE_API_BASE_URL}/${cveId}`);
      if (res.status === 404) return null;
      if (!res.ok) {
        const retryAfterMs = parseRetryAfter(res.headers.get("retry-after"));
        throw new HttpError(`MITRE request failed with status ${res.status}`, res.status, retryAfterMs);
      }
      return (await res.json()) as MitreCveRecord;
    },
    { label: "MITRE", maxAttempts: 3, baseDelayMs: 1500 },
  );
}

function mapMitreRecord(record: MitreCveRecord): NewCve {
  const cna = record.containers.cna;
  const description = cna.descriptions?.find((d) => d.lang?.startsWith("en"))?.value ?? null;
  const metric = cna.metrics?.find((m) => Object.keys(m).some((k) => k.startsWith("cvssV3")));
  const cvssData = metric ? Object.values(metric)[0] : undefined;
  const vendor = cna.affected?.[0]?.vendor ?? null;
  const products = (cna.affected ?? [])
    .filter((a) => a.vendor && a.product)
    .map((a) => `${a.vendor}:${a.product}`);
  const references = (cna.references ?? []).map((r) => ({ url: r.url, source: "MITRE", tags: [] }));

  return {
    id: record.cveMetadata.cveId,
    description,
    cvssScore: cvssData?.baseScore != null ? String(cvssData.baseScore) : null,
    cvssVector: cvssData?.vectorString ?? null,
    severity: cvssData?.baseSeverity ? (cvssData.baseSeverity.toLowerCase() as NewCve["severity"]) : "unknown",
    cweId: null,
    publishedDate: record.cveMetadata.datePublished ? new Date(record.cveMetadata.datePublished) : null,
    lastModifiedDate: record.cveMetadata.dateUpdated ? new Date(record.cveMetadata.dateUpdated) : null,
    vendor,
    affectedProducts: Array.from(new Set(products)),
    references,
    isExploitedInWild: false,
    hasPoc: false,
    source: "MITRE",
  };
}

/**
 * Fills a gap left by NVD: if `cveId` isn't already in our `cves` table,
 * fetch the record from MITRE's CVE.org API and insert it with source
 * "MITRE". No-ops (returns false) if the CVE already exists or MITRE
 * doesn't have a record either.
 */
export async function fillCveGapFromMitre(db: Db, cveId: string): Promise<boolean> {
  const [existing] = await db.select({ id: cves.id }).from(cves).where(eq(cves.id, cveId));
  if (existing) return false;

  const record = await fetchMitreRecord(cveId);
  if (!record) {
    logger.info({ cveId }, "[MITRE] no record found either, leaving gap unfilled");
    return false;
  }

  await db.insert(cves).values(mapMitreRecord(record)).onConflictDoNothing({ target: cves.id });
  logger.info({ cveId }, "[MITRE] filled gap left by NVD");
  return true;
}
