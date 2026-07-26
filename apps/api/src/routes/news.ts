import { and, desc, eq, gte, isNotNull, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { newsArticles } from "@sec1cng/db";
import { newsQuerySchema } from "@sec1cng/shared";

export function registerNewsRoutes(app: FastifyInstance) {
  app.get("/api/news", async (request, reply) => {
    const query = newsQuerySchema.parse(request.query);
    const conditions = [];
    if (query.source) conditions.push(eq(newsArticles.sourceName, query.source));
    if (query.category) conditions.push(eq(newsArticles.category, query.category));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ count }]] = await Promise.all([
      app.db
        .select()
        .from(newsArticles)
        .where(where)
        .orderBy(desc(newsArticles.publishedDate))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      app.db.select({ count: sql<number>`count(*)::int` }).from(newsArticles).where(where),
    ]);

    return reply.send({ data: rows, page: query.page, pageSize: query.pageSize, total: count });
  });

  // Real category breakdown (all-time) + real per-day-per-category counts for
  // the last N days, both computed from news_articles.category (keyword-
  // inferred at ingestion time — see packages/shared/src/constants.ts).
  app.get("/api/news/categories", async (request, reply) => {
    const days = Math.min(Number((request.query as { days?: string }).days ?? 14), 90);
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);
    since.setUTCHours(0, 0, 0, 0);

    const [breakdown, dailyRows] = await Promise.all([
      app.db
        .select({ category: newsArticles.category, count: sql<number>`count(*)::int` })
        .from(newsArticles)
        .where(isNotNull(newsArticles.category))
        .groupBy(newsArticles.category)
        .orderBy(desc(sql`count(*)`)),
      app.db
        .select({
          date: sql<string>`to_char(${newsArticles.publishedDate}, 'YYYY-MM-DD')`,
          category: newsArticles.category,
          count: sql<number>`count(*)::int`,
        })
        .from(newsArticles)
        .where(and(isNotNull(newsArticles.category), gte(newsArticles.publishedDate, since)))
        .groupBy(sql`to_char(${newsArticles.publishedDate}, 'YYYY-MM-DD')`, newsArticles.category)
        .orderBy(sql`to_char(${newsArticles.publishedDate}, 'YYYY-MM-DD')`),
    ]);

    const trendByDate = new Map<string, Record<string, number>>();
    for (const row of dailyRows) {
      if (!row.category) continue;
      const entry = trendByDate.get(row.date) ?? {};
      entry[row.category] = row.count;
      trendByDate.set(row.date, entry);
    }
    const trend = Array.from(trendByDate.entries()).map(([date, categories]) => ({ date, categories }));

    return reply.send({ breakdown, trend });
  });
}
