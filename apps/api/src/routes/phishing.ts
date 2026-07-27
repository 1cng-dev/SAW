import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { phishingWatches, phishingScanResults } from "@sec1cng/db";
import { fetchRdap, normalizeRdap } from "../lib/osint-sources/rdap";
import { generateTypoVariations, type TypoVariation } from "../lib/typosquat";

const BATCH_SIZE = 5;

// Reuses the same RDAP integration as OSINT / Network Search — batched to
// avoid hammering the free rdap.org service with dozens of concurrent
// requests for one "add watch" action.
async function scanVariations(app: FastifyInstance, watchId: string, variations: TypoVariation[]) {
  const rows: (typeof phishingScanResults.$inferInsert)[] = [];

  for (let i = 0; i < variations.length; i += BATCH_SIZE) {
    const batch = variations.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (v) => {
        try {
          const raw = await fetchRdap(`domain/${v.domain}`);
          if (!raw) {
            return { watchId, variation: v.domain, variationType: v.variationType, isRegistered: false, registrar: null, registeredDate: null };
          }
          const normalized = normalizeRdap("domain", v.domain, raw);
          return {
            watchId,
            variation: v.domain,
            variationType: v.variationType,
            isRegistered: true,
            registrar: normalized.registrar?.name ?? null,
            registeredDate: normalized.events.registered ? new Date(normalized.events.registered) : null,
          };
        } catch {
          return { watchId, variation: v.domain, variationType: v.variationType, isRegistered: false, registrar: null, registeredDate: null };
        }
      })
    );
    rows.push(...batchResults);
  }

  if (rows.length === 0) return [];
  return app.db.insert(phishingScanResults).values(rows).returning();
}

export function registerPhishingRoutes(app: FastifyInstance) {
  app.get("/api/phishing/watches", async (_request, reply) => {
    const rows = await app.db.select().from(phishingWatches).orderBy(desc(phishingWatches.createdAt));
    return reply.send({ data: rows });
  });

  app.post("/api/phishing/watches", async (request, reply) => {
    const body = request.body as { domain?: string };
    const domain = body.domain?.trim().toLowerCase();
    if (!domain) return reply.status(400).send({ error: "domain is required" });

    const [watch] = await app.db.insert(phishingWatches).values({ domain }).returning();
    const variations = generateTypoVariations(domain);
    const results = await scanVariations(app, watch.id, variations);

    return reply.status(201).send({ data: watch, results });
  });

  app.get("/api/phishing/watches/:id/results", async (request, reply) => {
    const { id } = request.params as { id: string };
    const results = await app.db
      .select()
      .from(phishingScanResults)
      .where(eq(phishingScanResults.watchId, id))
      .orderBy(desc(phishingScanResults.scannedAt));
    return reply.send({ data: results });
  });

  app.post("/api/phishing/watches/:id/rescan", async (request, reply) => {
    const { id } = request.params as { id: string };
    const [watch] = await app.db.select().from(phishingWatches).where(eq(phishingWatches.id, id));
    if (!watch) return reply.status(404).send({ error: "Watch not found" });

    // A watch shows its current snapshot, not accumulated scan history —
    // clear prior results before inserting the fresh batch so rescans don't
    // pile up duplicate rows indefinitely.
    await app.db.delete(phishingScanResults).where(eq(phishingScanResults.watchId, id));

    const variations = generateTypoVariations(watch.domain);
    const results = await scanVariations(app, id, variations);
    return reply.send({ data: results });
  });

  app.delete("/api/phishing/watches/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await app.db.delete(phishingWatches).where(eq(phishingWatches.id, id));
    return reply.status(204).send();
  });
}
