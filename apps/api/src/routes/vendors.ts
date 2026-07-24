import { desc, eq, isNotNull, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { cves } from "@sec1cng/db";

export function registerVendorRoutes(app: FastifyInstance) {
  app.get("/api/vendors", async (_request, reply) => {
    const rows = await app.db
      .select({
        vendor: cves.vendor,
        cveCount: sql<number>`count(*)::int`,
        criticalCount: sql<number>`count(*) filter (where ${cves.severity} = 'critical')::int`,
        highCount: sql<number>`count(*) filter (where ${cves.severity} = 'high')::int`,
      })
      .from(cves)
      .where(isNotNull(cves.vendor))
      .groupBy(cves.vendor)
      .orderBy(desc(sql`count(*)`));

    return reply.send({ data: rows });
  });

  app.get("/api/vendors/:name/cves", async (request, reply) => {
    const { name } = request.params as { name: string };
    const page = Number((request.query as { page?: string }).page ?? 1);
    const pageSize = Math.min(Number((request.query as { pageSize?: string }).pageSize ?? 20), 100);

    const [rows, [{ count }]] = await Promise.all([
      app.db
        .select()
        .from(cves)
        .where(eq(cves.vendor, name))
        .orderBy(desc(cves.publishedDate))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      app.db.select({ count: sql<number>`count(*)::int` }).from(cves).where(eq(cves.vendor, name)),
    ]);

    const [severityBreakdown] = await app.db
      .select({
        critical: sql<number>`count(*) filter (where ${cves.severity} = 'critical')::int`,
        high: sql<number>`count(*) filter (where ${cves.severity} = 'high')::int`,
        medium: sql<number>`count(*) filter (where ${cves.severity} = 'medium')::int`,
        low: sql<number>`count(*) filter (where ${cves.severity} = 'low')::int`,
        unknown: sql<number>`count(*) filter (where ${cves.severity} = 'unknown')::int`,
      })
      .from(cves)
      .where(eq(cves.vendor, name));

    return reply.send({ data: rows, page, pageSize, total: count, severityBreakdown });
  });
}
