import { inArray } from "drizzle-orm";
import { cves, type Db, type NewCve } from "@sec1cng/db";
import { GITHUB_GRAPHQL_URL, type Severity } from "@sec1cng/shared";
import { logger } from "../lib/logger";
import { withRetry, HttpError } from "../lib/retry";
import { withSyncLog } from "../lib/syncLogger";

const JOB_NAME = "sync-ghsa-advisories";
const PAGE_SIZE = 50;

const QUERY = `
  query($cursor: String) {
    securityAdvisories(first: ${PAGE_SIZE}, after: $cursor, orderBy: { field: UPDATED_AT, direction: DESC }) {
      nodes {
        ghsaId
        summary
        description
        severity
        publishedAt
        updatedAt
        references { url }
        identifiers { type value }
        vulnerabilities(first: 10) {
          nodes {
            package { name ecosystem }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

interface GhsaNode {
  ghsaId: string;
  summary: string;
  description: string;
  severity: string; // CRITICAL | HIGH | MODERATE | LOW
  publishedAt: string;
  updatedAt: string;
  references: Array<{ url: string }>;
  identifiers: Array<{ type: string; value: string }>;
  vulnerabilities: { nodes: Array<{ package: { name: string; ecosystem: string } }> };
}

interface GhsaResponse {
  data?: {
    securityAdvisories: {
      nodes: GhsaNode[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
  errors?: Array<{ message: string }>;
}

function mapSeverity(ghsaSeverity: string): Severity {
  switch (ghsaSeverity) {
    case "CRITICAL":
      return "critical";
    case "HIGH":
      return "high";
    case "MODERATE":
      return "medium";
    case "LOW":
      return "low";
    default:
      return "unknown";
  }
}

function mapGhsaNode(node: GhsaNode): NewCve | null {
  const cveId = node.identifiers.find((i) => i.type === "CVE")?.value;
  if (!cveId) return null; // GHSA-only advisory, no CVE to cross-link

  const products = node.vulnerabilities.nodes.map((v) => `${v.package.ecosystem}:${v.package.name}`);

  return {
    id: cveId,
    description: node.description || node.summary,
    cvssScore: null,
    cvssVector: null,
    severity: mapSeverity(node.severity),
    cweId: null,
    publishedDate: node.publishedAt ? new Date(node.publishedAt) : null,
    lastModifiedDate: node.updatedAt ? new Date(node.updatedAt) : null,
    vendor: null,
    affectedProducts: Array.from(new Set(products)),
    references: node.references.map((r) => ({ url: r.url, source: "GHSA", tags: [] })),
    isExploitedInWild: false,
    hasPoc: false,
    source: "GHSA",
  };
}

export interface GhsaSyncResult {
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
  skipped?: boolean;
}

async function fetchGhsaPage(token: string, cursor: string | null): Promise<GhsaResponse> {
  return withRetry(
    async () => {
      const res = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: QUERY, variables: { cursor } }),
      });
      if (!res.ok) {
        throw new HttpError(`GitHub GraphQL request failed with status ${res.status}`, res.status);
      }
      return (await res.json()) as GhsaResponse;
    },
    { label: "GHSA", maxAttempts: 4 },
  );
}

/**
 * GHSA ingestion is fully wired but requires GITHUB_TOKEN (GitHub's GraphQL
 * API has no anonymous read access). Without it, this cleanly no-ops and
 * logs why, rather than crashing the worker or the BullMQ job.
 */
export async function runGhsaIngestion(db: Db, options: { maxPages?: number } = {}): Promise<GhsaSyncResult> {
  return withSyncLog(db, JOB_NAME, async () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      logger.warn({ source: "GHSA" }, "skipped: no GITHUB_TOKEN configured");
      return { recordsFetched: 0, recordsInserted: 0, recordsUpdated: 0, errors: [], skipped: true };
    }

    const errors: string[] = [];
    let recordsFetched = 0;
    let recordsInserted = 0;
    let recordsUpdated = 0;
    let cursor: string | null = null;
    let page = 0;
    const maxPages = options.maxPages ?? 20;

    do {
      try {
        const response = await fetchGhsaPage(token, cursor);
        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join("; "));
        }
        const block = response.data?.securityAdvisories;
        if (!block) break;

        const mapped = block.nodes.map(mapGhsaNode).filter((n): n is NewCve => n !== null);
        recordsFetched += block.nodes.length;

        if (mapped.length > 0) {
          const ids = mapped.map((m) => m.id);
          const existing = await db.select({ id: cves.id }).from(cves).where(inArray(cves.id, ids));
          const existingIds = new Set(existing.map((e) => e.id));

          for (const row of mapped) {
            await db
              .insert(cves)
              .values(row)
              .onConflictDoUpdate({
                target: cves.id,
                set: {
                  description: row.description,
                  severity: row.severity,
                  affectedProducts: row.affectedProducts,
                  references: row.references,
                  updatedAt: new Date(),
                },
              });
          }
          recordsInserted += mapped.filter((m) => !existingIds.has(m.id)).length;
          recordsUpdated += mapped.filter((m) => existingIds.has(m.id)).length;
        }

        cursor = block.pageInfo.hasNextPage ? block.pageInfo.endCursor : null;
        page++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(message);
        logger.error({ err: message }, "[GHSA] page fetch failed, stopping");
        break;
      }
    } while (cursor && page < maxPages);

    return { recordsFetched, recordsInserted, recordsUpdated, errors };
  });
}

export { JOB_NAME as GHSA_JOB_NAME };
