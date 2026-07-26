import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { assets, cves } from "@sec1cng/db";

// Cross-matching only applies to "software" assets, matched against the real
// ingested vendor/product fields (cves.vendor, cves.affectedProducts). NVD
// data doesn't give us per-version CPE ranges in a structured form here, so
// this is a vendor/product-name match, not a precise version-range match —
// the UI is explicit about that limitation rather than implying more
// precision than the underlying data supports. IP/domain assets have no
// direct relationship to CVE records in this schema, so they're tracked as
// inventory only (no fabricated matches).
async function crossMatchAsset(app: FastifyInstance, asset: { assetType: string; value: string }) {
  if (asset.assetType !== "software") return [];
  const term = asset.value.trim().toLowerCase();
  if (!term) return [];

  const rows = await app.db
    .select({ id: cves.id })
    .from(cves)
    .where(or(ilike(cves.vendor, `%${term}%`), sql`${cves.affectedProducts}::text ilike ${"%" + term + "%"}`))
    .limit(500);

  return rows.map((r) => r.id);
}

export function registerAssetRoutes(app: FastifyInstance) {
  app.get("/api/assets", async (_request, reply) => {
    const rows = await app.db.select().from(assets).orderBy(desc(assets.createdAt));
    return reply.send({ data: rows });
  });

  app.get("/api/assets/summary", async (_request, reply) => {
    const rows = await app.db.select().from(assets);
    const totalAssets = rows.length;

    const matchedCveIds = new Set<string>();
    let assetsWithMatches = 0;
    for (const row of rows) {
      const ids = (row.matchedCveIds as string[]) ?? [];
      if (ids.length > 0) {
        assetsWithMatches += 1;
        for (const id of ids) matchedCveIds.add(id);
      }
    }

    let severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 };
    if (matchedCveIds.size > 0) {
      const [breakdown] = await app.db
        .select({
          critical: sql<number>`count(*) filter (where ${cves.severity} = 'critical')::int`,
          high: sql<number>`count(*) filter (where ${cves.severity} = 'high')::int`,
          medium: sql<number>`count(*) filter (where ${cves.severity} = 'medium')::int`,
          low: sql<number>`count(*) filter (where ${cves.severity} = 'low')::int`,
          unknown: sql<number>`count(*) filter (where ${cves.severity} = 'unknown')::int`,
        })
        .from(cves)
        .where(inArray(cves.id, Array.from(matchedCveIds)));
      severityBreakdown = breakdown;
    }

    return reply.send({
      totalAssets,
      assetsWithMatches,
      totalUniqueMatchedCves: matchedCveIds.size,
      severityBreakdown,
    });
  });

  app.get("/api/assets/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const [asset] = await app.db.select().from(assets).where(eq(assets.id, id));
    if (!asset) return reply.status(404).send({ error: "Asset not found" });

    const matchedIds = (asset.matchedCveIds as string[]) ?? [];
    const matchedCves = matchedIds.length > 0
      ? await app.db.select().from(cves).where(inArray(cves.id, matchedIds)).orderBy(desc(cves.cvssScore))
      : [];

    return reply.send({ data: asset, matchedCves });
  });

  app.post("/api/assets", async (request, reply) => {
    const body = request.body as { assetType: "ip" | "domain" | "software"; name: string; value: string; version?: string; notes?: string };
    if (!body.assetType || !body.name?.trim() || !body.value?.trim()) {
      return reply.status(400).send({ error: "assetType, name, and value are required" });
    }

    const matchedCveIds = await crossMatchAsset(app, body);

    const [created] = await app.db
      .insert(assets)
      .values({
        assetType: body.assetType,
        name: body.name.trim(),
        value: body.value.trim(),
        version: body.version?.trim() || null,
        notes: body.notes?.trim() || null,
        matchedCveIds,
        lastMatchedAt: new Date(),
      })
      .returning();

    return reply.status(201).send({ data: created });
  });

  app.post("/api/assets/:id/rematch", async (request, reply) => {
    const { id } = request.params as { id: string };
    const [asset] = await app.db.select().from(assets).where(eq(assets.id, id));
    if (!asset) return reply.status(404).send({ error: "Asset not found" });

    const matchedCveIds = await crossMatchAsset(app, asset);
    const [updated] = await app.db
      .update(assets)
      .set({ matchedCveIds, lastMatchedAt: new Date(), updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();

    return reply.send({ data: updated });
  });

  app.delete("/api/assets/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(assets).where(eq(assets.id, id));
    return reply.status(204).send();
  });
}
