import { and, desc, eq, sql } from "drizzle-orm";
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
}
