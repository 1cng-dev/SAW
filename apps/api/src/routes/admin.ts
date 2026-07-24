import { desc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { syncLog, syncState } from "@sec1cng/db";
import type { SyncStatusEntry } from "@sec1cng/shared";

const KNOWN_JOBS = [
  "sync-nvd-cves",
  "sync-news-feeds",
  "sync-vendor-advisories",
  "sync-ghsa-advisories",
  "recalculate-trending",
];

export function registerAdminRoutes(app: FastifyInstance) {
  app.get("/api/admin/sync-status", async (_request, reply) => {
    const entries: SyncStatusEntry[] = [];

    for (const jobName of KNOWN_JOBS) {
      const [lastRun] = await app.db
        .select()
        .from(syncLog)
        .where(eq(syncLog.jobName, jobName))
        .orderBy(desc(syncLog.startedAt))
        .limit(1);

      const [state] = await app.db.select().from(syncState).where(eq(syncState.jobName, jobName));

      entries.push({
        jobName,
        lastRunStartedAt: lastRun?.startedAt?.toISOString() ?? null,
        lastRunFinishedAt: lastRun?.finishedAt?.toISOString() ?? null,
        lastRunStatus: lastRun?.status ?? null,
        lastSyncTimestamp: state?.lastSyncTimestamp?.toISOString() ?? null,
        recordsFetched: lastRun?.recordsFetched ?? 0,
        recordsInserted: lastRun?.recordsInserted ?? 0,
        recordsUpdated: lastRun?.recordsUpdated ?? 0,
        errorMessage: lastRun?.errorMessage ?? null,
      });
    }

    return reply.send({ data: entries });
  });
}
