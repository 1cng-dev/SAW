import { asc, desc, eq, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { cves, newsArticles } from "@sec1cng/db";
import { cveQuerySchema } from "@sec1cng/shared";
import { buildCveWhereClause } from "../lib/cveFilters";
import { toCsvRow } from "../lib/csv";

const SORT_COLUMNS = {
  publishedDate: cves.publishedDate,
  lastModifiedDate: cves.lastModifiedDate,
  cvssScore: cves.cvssScore,
  trendingScore: cves.trendingScore,
  id: cves.id,
} as const;

const CSV_HEADER = [
  "id",
  "severity",
  "cvss_score",
  "cwe_id",
  "vendor",
  "published_date",
  "last_modified_date",
  "is_exploited_in_wild",
  "has_poc",
  "source",
];

const EXPORT_BATCH_SIZE = 1000;

export function registerCveRoutes(app: FastifyInstance) {
  app.get("/api/cves", async (request, reply) => {
    const query = cveQuerySchema.parse(request.query);
    const where = buildCveWhereClause(query);
    const sortColumn = SORT_COLUMNS[query.sortBy];
    const orderFn = query.sortDir === "asc" ? asc : desc;

    const [rows, [{ count }]] = await Promise.all([
      app.db
        .select()
        .from(cves)
        .where(where)
        .orderBy(orderFn(sortColumn))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      app.db.select({ count: sql<number>`count(*)::int` }).from(cves).where(where),
    ]);

    return reply.send({ data: rows, page: query.page, pageSize: query.pageSize, total: count });
  });

  app.get("/api/cves/trending", async (request, reply) => {
    const limit = Number((request.query as { limit?: string }).limit ?? 20);
    const rows = await app.db
      .select()
      .from(cves)
      .orderBy(desc(cves.trendingScore))
      .limit(Math.min(limit, 100));
    return reply.send({ data: rows });
  });

  app.get("/api/cves/export", async (request, reply) => {
    const query = cveQuerySchema.parse({ ...(request.query as Record<string, unknown>), page: 1, pageSize: 1 });
    const where = buildCveWhereClause(query);

    reply.raw.setHeader("Content-Type", "text/csv");
    reply.raw.setHeader("Content-Disposition", 'attachment; filename="cves-export.csv"');
    reply.raw.write(toCsvRow(CSV_HEADER));

    let offset = 0;
    for (;;) {
      const rows = await app.db
        .select()
        .from(cves)
        .where(where)
        .orderBy(desc(cves.publishedDate))
        .limit(EXPORT_BATCH_SIZE)
        .offset(offset);

      if (rows.length === 0) break;

      for (const row of rows) {
        reply.raw.write(
          toCsvRow([
            row.id,
            row.severity,
            row.cvssScore,
            row.cweId,
            row.vendor,
            row.publishedDate?.toISOString() ?? "",
            row.lastModifiedDate?.toISOString() ?? "",
            row.isExploitedInWild,
            row.hasPoc,
            row.source,
          ]),
        );
      }

      offset += EXPORT_BATCH_SIZE;
      if (rows.length < EXPORT_BATCH_SIZE) break;
    }

    reply.raw.end();
    return reply;
  });

  app.get("/api/cves/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const [updated] = await app.db
      .update(cves)
      .set({ viewCount: sql`${cves.viewCount} + 1` })
      .where(eq(cves.id, id))
      .returning();

    if (!updated) {
      return reply.status(404).send({ error: "CVE not found" });
    }

    const relatedNews = await app.db
      .select()
      .from(newsArticles)
      .where(sql`${newsArticles.relatedCveIds} @> ${JSON.stringify([id])}::jsonb`)
      .limit(10);

    return reply.send({ data: updated, relatedNews });
  });
}
