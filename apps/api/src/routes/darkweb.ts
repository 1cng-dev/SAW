import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { darkWebKeywords } from "@sec1cng/db";
import { getDarkWebSources, type DarkWebSourceStatus } from "../lib/darkweb-sources";

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
    const sources = getDarkWebSources(app);

    if (keywords.length === 0) {
      return reply.send({
        data: [],
        keywordCount: 0,
        sources: sources.map((s) => ({ source: s.name, isSample: s.isSample, status: "ok" as const, lastSyncedAt: new Date().toISOString(), matches: [] })),
      });
    }

    const keywordStrings = keywords.map((k) => k.keyword);
    const settled = await Promise.allSettled(sources.map((source) => source.search(keywordStrings)));

    const sourceStatuses: DarkWebSourceStatus[] = settled.map((result, i) => {
      const source = sources[i];
      const lastSyncedAt = new Date().toISOString();
      if (result.status === "rejected") {
        return {
          source: source.name,
          isSample: source.isSample,
          status: "unavailable",
          lastSyncedAt,
          matches: [],
          error: result.reason instanceof Error ? result.reason.message : "Source unavailable",
        };
      }
      if (result.value.notConfigured) {
        return {
          source: source.name,
          isSample: source.isSample,
          status: "not_configured",
          lastSyncedAt,
          matches: [],
          error: result.value.notConfiguredMessage,
        };
      }
      return { source: source.name, isSample: source.isSample, status: "ok", lastSyncedAt, matches: result.value.matches };
    });

    const allMatches = sourceStatuses.flatMap((s) => s.matches).sort((a, b) => new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime());

    return reply.send({
      data: allMatches,
      keywordCount: keywords.length,
      sources: sourceStatuses.map((s) => ({ source: s.source, isSample: s.isSample, status: s.status, lastSyncedAt: s.lastSyncedAt, error: s.error })),
    });
  });
}
