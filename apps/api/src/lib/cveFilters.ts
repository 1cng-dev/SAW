import { and, eq, gte, ilike, inArray, lte, or, type SQL } from "drizzle-orm";
import { cves } from "@sec1cng/db";
import type { CveQuery } from "@sec1cng/shared";

export function buildCveWhereClause(query: CveQuery): SQL | undefined {
  const conditions: SQL[] = [];

  if (query.severity) {
    const values = query.severity.split(",").map((s) => s.trim()).filter(Boolean);
    if (values.length > 0) conditions.push(inArray(cves.severity, values as never[]));
  }

  if (query.vendor) {
    const values = query.vendor.split(",").map((v) => v.trim()).filter(Boolean);
    if (values.length > 0) conditions.push(inArray(cves.vendor, values));
  }

  if (query.dateFrom) conditions.push(gte(cves.publishedDate, new Date(query.dateFrom)));
  if (query.dateTo) conditions.push(lte(cves.publishedDate, new Date(query.dateTo)));

  if (query.minCvss !== undefined) conditions.push(gte(cves.cvssScore, String(query.minCvss)));
  if (query.maxCvss !== undefined) conditions.push(lte(cves.cvssScore, String(query.maxCvss)));

  if (query.hasPoc !== undefined) conditions.push(eq(cves.hasPoc, query.hasPoc));
  if (query.isExploited !== undefined) conditions.push(eq(cves.isExploitedInWild, query.isExploited));

  if (query.search) {
    const term = `%${query.search}%`;
    const searchClause = or(ilike(cves.id, term), ilike(cves.description, term), ilike(cves.vendor, term));
    if (searchClause) conditions.push(searchClause);
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
