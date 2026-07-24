import { and, eq, gte, sql, avg } from "drizzle-orm";
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

  // Additional stats for CVE Database page
  app.get("/api/stats/cve-breakdown", async (request, reply) => {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 7);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const [[exploited], [hasPoc], [avgCvss], [newThisWeek]] = await Promise.all([
      app.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cves)
        .where(eq(cves.isExploitedInWild, true)),
      app.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cves)
        .where(eq(cves.hasPoc, true)),
      app.db
        .select({ avg: sql<number>`avg(${cves.cvssScore})::numeric` })
        .from(cves)
        .where(sql`${cves.cvssScore} is not null`),
      app.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cves)
        .where(gte(cves.publishedDate, startOfWeek)),
    ]);

    return reply.send({
      exploitedInWild: exploited.count,
      hasPublicPoc: hasPoc.count,
      avgCvssScore: avgCvss.avg ? parseFloat(avgCvss.avg.toFixed(1)) : 0,
      newThisWeek: newThisWeek.count,
    });
  });

  // Generic stat trend endpoint for dashboard sparklines
  app.get("/api/stats/stat-trend", async (request, reply) => {
    const { statType = "total_cves", days = "7" } = request.query as { statType?: string; days?: string };
    const daysNum = parseInt(days, 10) || 7;
    
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - daysNum);
    since.setUTCHours(0, 0, 0, 0);

    let query;
    let data;

    switch (statType) {
      case "total_cves":
        query = app.db
          .select({
            date: sql<string>`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(cves)
          .where(gte(cves.publishedDate, since))
          .groupBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`);
        break;
      case "critical_today":
        query = app.db
          .select({
            date: sql<string>`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`,
            count: sql<number>`count(*) filter (where ${cves.severity} = 'critical')::int`,
          })
          .from(cves)
          .where(gte(cves.publishedDate, since))
          .groupBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`);
        break;
      case "high_severity":
        query = app.db
          .select({
            date: sql<string>`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`,
            count: sql<number>`count(*) filter (where ${cves.severity} = 'high')::int`,
          })
          .from(cves)
          .where(gte(cves.publishedDate, since))
          .groupBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${cves.publishedDate}, 'YYYY-MM-DD')`);
        break;
      case "news_articles":
        query = app.db
          .select({
            date: sql<string>`to_char(${newsArticles.publishedDate}, 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(newsArticles)
          .where(gte(newsArticles.publishedDate, since))
          .groupBy(sql`to_char(${newsArticles.publishedDate}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${newsArticles.publishedDate}, 'YYYY-MM-DD')`);
        break;
      case "vendor_advisories":
        query = app.db
          .select({
            date: sql<string>`to_char(${vendorAdvisories.publishedDate}, 'YYYY-MM-DD')`,
            count: sql<number>`count(*)::int`,
          })
          .from(vendorAdvisories)
          .where(gte(vendorAdvisories.publishedDate, since))
          .groupBy(sql`to_char(${vendorAdvisories.publishedDate}, 'YYYY-MM-DD')`)
          .orderBy(sql`to_char(${vendorAdvisories.publishedDate}, 'YYYY-MM-DD')`);
        break;
      default:
        return reply.send({ data: [] });
    }

    data = await query;
    return reply.send({ data });
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
