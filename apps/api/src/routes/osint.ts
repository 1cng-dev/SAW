import type { FastifyInstance } from "fastify";
import { OSINT_SOURCES, detectQueryType, type OsintQueryType, type OsintSourceResult } from "../lib/osint-sources";

const CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  results: OsintSourceResult[];
  cachedAt: number;
}

// In-memory cache + in-flight fan-in: repeated/concurrent requests for the
// same query reuse the same round of upstream calls instead of re-hitting
// free third-party APIs, per their fair-use expectations.
const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<OsintSourceResult>[]>();

const VALID_TYPES: OsintQueryType[] = ["domain", "ip", "asn"];

export function registerOsintRoutes(app: FastifyInstance) {
  app.get("/api/osint/aggregate/stream", async (request, reply) => {
    const { type: rawType, value } = request.query as { type?: string; value?: string };
    if (!value || value.trim().length === 0) {
      return reply.status(400).send({ error: "value is required" });
    }
    const trimmed = value.trim();
    const queryType = (VALID_TYPES.includes(rawType as OsintQueryType) ? rawType : detectQueryType(trimmed)) as OsintQueryType | null;
    if (!queryType) {
      return reply.status(400).send({ error: "Could not determine query type; expected a domain, IP address, or ASN" });
    }

    const cacheKey = `${queryType}:${trimmed.toLowerCase()}`;
    const relevantSources = OSINT_SOURCES.filter((s) => s.supports(queryType));
    const startedAt = Date.now();

    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      // @fastify/cors' hooks don't run on a hijacked reply, so this is set manually.
      "Access-Control-Allow-Origin": request.headers.origin ?? "*",
    });

    const send = (event: string, data: unknown) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send("meta", { query: { type: queryType, value: trimmed }, totalSources: relevantSources.length, timestamp: new Date().toISOString() });

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      for (const result of cached.results) send("source", result);
      send("done", {
        cached: true,
        durationMs: Date.now() - startedAt,
        sourcesResponded: cached.results.filter((r) => r.status === "ok").length,
        totalSources: relevantSources.length,
      });
      reply.raw.end();
      return;
    }

    let sourcePromises = inFlight.get(cacheKey);
    const isFreshFetch = !sourcePromises;
    if (!sourcePromises) {
      sourcePromises = relevantSources.map((source) =>
        source.run({ type: queryType, value: trimmed }).catch(
          (error): OsintSourceResult => ({ source: source.name, status: "error", error: error instanceof Error ? error.message : "Unknown error" })
        )
      );
      inFlight.set(cacheKey, sourcePromises);
    }

    const settled: OsintSourceResult[] = [];
    await Promise.all(
      sourcePromises.map(async (p) => {
        const result = await p;
        settled.push(result);
        send("source", result);
      })
    );

    if (isFreshFetch) {
      inFlight.delete(cacheKey);
      cache.set(cacheKey, { results: settled, cachedAt: Date.now() });
    }

    send("done", {
      cached: false,
      durationMs: Date.now() - startedAt,
      sourcesResponded: settled.filter((r) => r.status === "ok").length,
      totalSources: relevantSources.length,
    });
    reply.raw.end();
  });
}
