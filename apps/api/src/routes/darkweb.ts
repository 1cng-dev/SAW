import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { darkWebKeywords } from "@sec1cng/db";
import { DARKWEB_SOURCES } from "../lib/darkweb-sources";

export function registerDarkWebRoutes(app: FastifyInstance) {
  app.get("/api/darkweb/keywords", async (_request, reply) => {
    const rows = await app.db.select().from(darkWebKeywords).orderBy(desc(darkWebKeywords.createdAt));
    return reply.send({ data: rows });
  });

  app.post("/api/darkweb/keywords", async (request, reply) => {
    const body = request.body as { keyword?: string };
    if (!body.keyword?.trim()) return reply.status(400).send({ error: "keyword is required" });

    const [created] = await app.db.insert(darkWebKeywords).values({ keyword: body.keyword.trim() }).returning();
    return reply.status(201).send({ data: created });
  });

  app.delete("/api/darkweb/keywords/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(darkWebKeywords).where(eq(darkWebKeywords.id, id));
    return reply.status(204).send();
  });

  app.get("/api/darkweb/matches", async (_request, reply) => {
    const keywords = await app.db.select().from(darkWebKeywords);
    if (keywords.length === 0) return reply.send({ data: [], keywordCount: 0, sourcesUsed: [] });

    const keywordStrings = keywords.map((k) => k.keyword);
    const resultsBySource = await Promise.all(DARKWEB_SOURCES.map((source) => source.search(keywordStrings)));
    const data = resultsBySource.flat().sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime());

    return reply.send({
      data,
      keywordCount: keywords.length,
      sourcesUsed: DARKWEB_SOURCES.map((s) => ({ name: s.name, isSample: s.isSample })),
    });
  });
}
