import { and, eq, gte, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { cves, newsArticles, vendorAdvisories } from "@sec1cng/db";

export function registerStatsRoutes(app: FastifyInstance) {
  app.get("/api/stats", async (_request, reply) => {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [[totals], [todayCritical], [newsTotal], [vendorAdvisoryTotal]] = await Promise.all([
      app.db
        .select({
          total: sql<number>`count(*)::int`,
          critical: sql<number>`count(*) filter (where ${cves.severity} = 'critical')::int`,
          high: sql<number>`count(*) filter (where ${cves.severity} = 'high')::int`,
          medium: sql<number>`count(*) filter (where ${cves.severity} = 'medium')::int`,
          low: sql<number>`count(*) filter (where ${cves.severity} = 'low')::int`,
          unknown: sql<number>`count(*) filter (where ${cves.severity} = 'unknown')::int`,
        })
        .from(cves),
      app.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cves)
        .where(and(eq(cves.severity, "critical"), gte(cves.publishedDate, startOfToday))),
      app.db.select({ count: sql<number>`count(*)::int` }).from(newsArticles),
      app.db.select({ count: sql<number>`count(*)::int` }).from(vendorAdvisories),
    ]);

    return reply.send({
      totalCves: totals.total,
      todayCriticalCves: todayCritical.count,
      totalNewsArticles: newsTotal.count,
      totalVendorAdvisories: vendorAdvisoryTotal.count,
      severityBreakdown: {
        critical: totals.critical,
        high: totals.high,
        medium: totals.medium,
        low: totals.low,
        unknown: totals.unknown,
      },
    });
  });

  // Backs the Trending page's 30-day disclosure chart: real per-day counts
  // of CVEs published in the last 30 days, grouped by publish date.
  app.get("/api/stats/disclosure-trend", async (_request, reply) => {
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 30);
    since.setUTCHours(0, 0, 0, 0);

    const rows = await app.db
      .select({
        date: sql<string>`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(cves)
      .where(gte(cves.publishedDate, since))
      .groupBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`);

    return reply.send({ data: rows });
  });
}
