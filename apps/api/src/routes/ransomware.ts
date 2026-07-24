import type { FastifyInstance } from "fastify";
import { desc, eq, gte, sql, count } from "drizzle-orm";
import { ransomwareGroups, ransomwareVictims } from "@sec1cng/db";
import { syncRansomwareData } from "../lib/ransomwareSync";

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
}
