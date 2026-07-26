import type { FastifyInstance } from "fastify";
import { desc, eq, gte, isNotNull, sql, count } from "drizzle-orm";
import { ransomwareGroups, ransomwareVictims, ransomwareIocs } from "@sec1cng/db";
import {
  syncRansomwareData,
  ransomwareApiHeaders,
  isRansomwareApiConfigured,
  RANSOMWARE_LIVE_API_URL,
} from "../lib/ransomwareSync";

const ATTACK_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // refresh cached ATT&CK data once a day

async function fetchRansomwareLive(path: string) {
  const response = await fetch(`${RANSOMWARE_LIVE_API_URL}${path}`, { headers: ransomwareApiHeaders() });
  if (!response.ok) {
    throw new Error(`Ransomware.live API error (${path}): ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function registerRansomwareRoutes(app: FastifyInstance) {
  // Trigger sync from Ransomware.live API
  app.post("/api/ransomware/sync", async (request, reply) => {
    try {
      await syncRansomwareData(app);
      return reply.send({ success: true, message: "Ransomware data synced successfully" });
    } catch (error) {
      app.log.error({ error: String(error) }, "Failed to sync ransomware data");
      return reply.status(500).send({ success: false, error: "Failed to sync ransomware data" });
    }
  });

  // Schedule automatic sync every 15 minutes
  setInterval(async () => {
    try {
      app.log.info("Running scheduled ransomware data sync...");
      await syncRansomwareData(app);
      app.log.info("Scheduled ransomware data sync completed");
    } catch (error) {
      app.log.error({ error: String(error) }, "Scheduled ransomware data sync failed");
    }
  }, 15 * 60 * 1000); // 15 minutes

  // Initial sync on startup
  setTimeout(async () => {
    try {
      app.log.info("Running initial ransomware data sync...");
      await syncRansomwareData(app);
      app.log.info("Initial ransomware data sync completed");
    } catch (error) {
      app.log.error({ error: String(error) }, "Initial ransomware data sync failed");
    }
  }, 5000); // 5 seconds after startup

  // Fetch active ransomware groups from database
  app.get("/api/ransomware/groups", async (request, reply) => {
    try {
      const groups = await app.db
        .select({
          id: ransomwareGroups.id,
          name: ransomwareGroups.name,
          slug: ransomwareGroups.slug,
          description: ransomwareGroups.description,
          victims: ransomwareGroups.victims,
          active: ransomwareGroups.active,
          lastSeen: ransomwareGroups.lastSeen,
          location: ransomwareGroups.location,
        })
        .from(ransomwareGroups)
        .orderBy(desc(ransomwareGroups.syncedAt));

      return reply.send({ data: groups });
    } catch (error) {
      app.log.error({ error: String(error) }, 'Failed to fetch ransomware groups from database');
      return reply.send({ data: [] });
    }
  });

  // Fetch recent victims from database
  app.get("/api/ransomware/victims", async (request, reply) => {
    try {
      const victims = await app.db
        .select({
          id: ransomwareVictims.id,
          externalId: ransomwareVictims.externalId,
          groupName: ransomwareVictims.groupName,
          name: ransomwareVictims.name,
          description: ransomwareVictims.description,
          publishedDate: ransomwareVictims.publishedDate,
          website: ransomwareVictims.website,
          country: ransomwareVictims.country,
        })
        .from(ransomwareVictims)
        .orderBy(desc(ransomwareVictims.publishedDate))
        .limit(50);

      return reply.send({ data: victims });
    } catch (error) {
      app.log.error({ error: String(error) }, 'Failed to fetch ransomware victims from database');
      return reply.send({ data: [] });
    }
  });

  // Fetch statistics from database
  app.get("/api/ransomware/stats", async (request, reply) => {
    try {
      const [[totalGroups], [activeGroups], [totalVictims]] = await Promise.all([
        app.db.select({ count: count() }).from(ransomwareGroups),
        app.db.select({ count: count() }).from(ransomwareGroups).where(eq(ransomwareGroups.active, true)),
        app.db.select({ count: count() }).from(ransomwareVictims),
      ]);

      // Calculate new this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const [newThisWeek] = await app.db
        .select({ count: count() })
        .from(ransomwareVictims)
        .where(gte(ransomwareVictims.publishedDate, weekAgo));

      // Calculate new this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const [newThisMonth] = await app.db
        .select({ count: count() })
        .from(ransomwareVictims)
        .where(gte(ransomwareVictims.publishedDate, monthAgo));

      return reply.send({
        totalGroups: Number(totalGroups.count),
        activeGroups: Number(activeGroups.count),
        totalVictims: Number(totalVictims.count),
        newVictimsThisWeek: Number(newThisWeek.count),
        newVictimsThisMonth: Number(newThisMonth.count),
      });
    } catch (error) {
      app.log.error({ error: String(error) }, 'Failed to fetch ransomware stats from database');
      return reply.send({
        totalGroups: 0,
        activeGroups: 0,
        totalVictims: 0,
        newVictimsThisWeek: 0,
        newVictimsThisMonth: 0,
      });
    }
  });

  // Fetch daily trend data from database
  app.get("/api/ransomware/trends", async (request, reply) => {
    try {
      const days = 30;
      const since = new Date();
      since.setDate(since.getDate() - days);

      const trends = await app.db
        .select({
          date: sql<string>`DATE(${ransomwareVictims.publishedDate})`,
          victims: sql<number>`COUNT(*)`,
        })
        .from(ransomwareVictims)
        .where(gte(ransomwareVictims.publishedDate, since))
        .groupBy(sql`DATE(${ransomwareVictims.publishedDate})`)
        .orderBy(sql`DATE(${ransomwareVictims.publishedDate})`);

      return reply.send({ data: trends });
    } catch (error) {
      app.log.error({ error: String(error) }, 'Failed to fetch ransomware trends from database');
      return reply.send({ data: [] });
    }
  });

  // MITRE ATT&CK tactic/technique matrix for a group — fetched live from
  // ransomware.live's /group/{name} endpoint, cached in ransomware_groups
  // and refreshed once the cache is older than a day.
  app.get("/api/ransomware/groups/:slug/attack", async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const [group] = await app.db.select().from(ransomwareGroups).where(eq(ransomwareGroups.slug, slug));
    if (!group) return reply.status(404).send({ error: "Unknown group" });

    const isStale = !group.attackSyncedAt || Date.now() - group.attackSyncedAt.getTime() > ATTACK_CACHE_MAX_AGE_MS;

    if (!isStale && group.attackTechniques) {
      return reply.send({ group: group.name, ttps: group.attackTechniques, cached: true });
    }

    if (!isRansomwareApiConfigured()) {
      // No key: serve whatever's cached (possibly stale), or empty.
      return reply.send({ group: group.name, ttps: group.attackTechniques ?? [], cached: true });
    }

    try {
      const detail = (await fetchRansomwareLive(`/group/${encodeURIComponent(group.name)}`)) as {
        ttps?: unknown;
        description?: string;
      };

      await app.db
        .update(ransomwareGroups)
        .set({ attackTechniques: detail.ttps ?? [], attackSyncedAt: new Date(), updatedAt: new Date() })
        .where(eq(ransomwareGroups.slug, slug));

      return reply.send({ group: group.name, ttps: detail.ttps ?? [], cached: false });
    } catch (error) {
      app.log.error({ error: String(error), slug }, "Failed to fetch ATT&CK data, serving cache if any");
      return reply.send({ group: group.name, ttps: group.attackTechniques ?? [], cached: true, stale: true });
    }
  });

  // Real ransom note names for a group (live, ransomware.live /ransomnotes/{group})
  app.get("/api/ransomware/groups/:slug/notes", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    if (!isRansomwareApiConfigured()) return reply.send({ data: [], configured: false });

    const [group] = await app.db.select().from(ransomwareGroups).where(eq(ransomwareGroups.slug, slug));
    if (!group) return reply.status(404).send({ error: "Unknown group" });

    try {
      const data = (await fetchRansomwareLive(`/ransomnotes/${encodeURIComponent(group.name)}`)) as {
        ransomnotes?: string[];
      };
      return reply.send({ data: data.ransomnotes ?? [], configured: true });
    } catch (error) {
      app.log.error({ error: String(error), slug }, "Failed to fetch ransom notes list");
      return reply.send({ data: [], configured: true });
    }
  });

  // Real ransom note content
  app.get("/api/ransomware/groups/:slug/notes/:noteName", async (request, reply) => {
    const { slug, noteName } = request.params as { slug: string; noteName: string };

    const [group] = await app.db.select().from(ransomwareGroups).where(eq(ransomwareGroups.slug, slug));
    if (!group) return reply.status(404).send({ error: "Unknown group" });

    try {
      const data = await fetchRansomwareLive(
        `/ransomnotes/${encodeURIComponent(group.name)}/${encodeURIComponent(noteName)}`,
      );
      return reply.send(data);
    } catch (error) {
      app.log.error({ error: String(error), slug, noteName }, "Failed to fetch ransom note content");
      return reply.status(502).send({ error: "Failed to fetch ransom note from ransomware.live" });
    }
  });

  // Real negotiation chat list for a group (live, /negotiations/{group})
  app.get("/api/ransomware/groups/:slug/negotiations", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    if (!isRansomwareApiConfigured()) return reply.send({ data: [], configured: false });

    const [group] = await app.db.select().from(ransomwareGroups).where(eq(ransomwareGroups.slug, slug));
    if (!group) return reply.status(404).send({ error: "Unknown group" });

    try {
      const data = (await fetchRansomwareLive(`/negotiations/${encodeURIComponent(group.name)}`)) as {
        chats?: unknown[];
      };
      return reply.send({ data: data.chats ?? [], configured: true });
    } catch (error) {
      app.log.error({ error: String(error), slug }, "Failed to fetch negotiation chat list");
      return reply.send({ data: [], configured: true });
    }
  });

  // Real negotiation chat transcript
  app.get("/api/ransomware/groups/:slug/negotiations/:chatId", async (request, reply) => {
    const { slug, chatId } = request.params as { slug: string; chatId: string };

    const [group] = await app.db.select().from(ransomwareGroups).where(eq(ransomwareGroups.slug, slug));
    if (!group) return reply.status(404).send({ error: "Unknown group" });

    try {
      const data = await fetchRansomwareLive(
        `/negotiations/${encodeURIComponent(group.name)}/${encodeURIComponent(chatId)}`,
      );
      return reply.send(data);
    } catch (error) {
      app.log.error({ error: String(error), slug, chatId }, "Failed to fetch negotiation transcript");
      return reply.status(502).send({ error: "Failed to fetch negotiation transcript from ransomware.live" });
    }
  });

  // Real per-country victim-claim counts from ransomware_victims (country is an
  // ISO code from ransomware.live, e.g. "US", "IN" — no fabricated trend/threat data).
  app.get("/api/ransomware/geo", async (_request, reply) => {
    const rows = await app.db
      .select({
        country: ransomwareVictims.country,
        count: sql<number>`count(*)::int`,
      })
      .from(ransomwareVictims)
      .where(isNotNull(ransomwareVictims.country))
      .groupBy(ransomwareVictims.country)
      .orderBy(desc(sql`count(*)`));

    return reply.send({ data: rows });
  });

  // Aggregates whatever MITRE ATT&CK data is currently cached in
  // ransomware_groups.attack_techniques (populated lazily per-group on first
  // view — see GET /api/ransomware/groups/:slug/attack). Honest about partial
  // coverage: groupsWithData tells the caller how much of the real dataset
  // this aggregate actually reflects.
  app.get("/api/ransomware/attack-coverage", async (_request, reply) => {
    const groups = await app.db
      .select({ slug: ransomwareGroups.slug, ttps: ransomwareGroups.attackTechniques })
      .from(ransomwareGroups)
      .where(isNotNull(ransomwareGroups.attackTechniques));

    const tacticCounts = new Map<string, { tacticId: string; groupCount: number; techniqueIds: Set<string> }>();

    for (const group of groups) {
      const ttps = group.ttps as Array<{ tactic_id: string; tactic_name: string; techniques: Array<{ technique_id: string }> }> | null;
      if (!ttps) continue;
      for (const tactic of ttps) {
        const entry = tacticCounts.get(tactic.tactic_name) ?? {
          tacticId: tactic.tactic_id,
          groupCount: 0,
          techniqueIds: new Set<string>(),
        };
        entry.groupCount += 1;
        for (const technique of tactic.techniques ?? []) {
          entry.techniqueIds.add(technique.technique_id);
        }
        tacticCounts.set(tactic.tactic_name, entry);
      }
    }

    const data = Array.from(tacticCounts.entries())
      .map(([tacticName, entry]) => ({
        tactic: tacticName,
        tacticId: entry.tacticId,
        groupsObserved: entry.groupCount,
        distinctTechniques: entry.techniqueIds.size,
      }))
      .sort((a, b) => b.groupsObserved - a.groupsObserved);

    return reply.send({ data, groupsWithData: groups.length });
  });

  // Real, most-recently-synced IOCs from ransomware.live (see ransomware_iocs table).
  app.get("/api/ransomware/iocs/recent", async (request, reply) => {
    const limit = Math.min(Number((request.query as { limit?: string }).limit ?? 20), 100);
    const rows = await app.db
      .select()
      .from(ransomwareIocs)
      .orderBy(desc(ransomwareIocs.syncedAt))
      .limit(limit);

    return reply.send({ data: rows });
  });
}
