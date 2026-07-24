import { eq } from "drizzle-orm";
import { syncLog, type Db } from "@sec1cng/db";

interface IngestionOutcome {
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
  skipped?: boolean;
}

/** Wraps an ingestion run with a sync_log row: started_at on entry, finished_at + counts + status on exit. */
export async function withSyncLog<T extends IngestionOutcome>(
  db: Db,
  jobName: string,
  fn: () => Promise<T>,
): Promise<T> {
  const startedAt = new Date();
  const [logRow] = await db
    .insert(syncLog)
    .values({ jobName, startedAt, status: "failed" })
    .returning({ id: syncLog.id });

  try {
    const result = await fn();
    const status = result.skipped
      ? "success"
      : result.errors.length === 0
        ? "success"
        : result.recordsFetched > 0
          ? "partial"
          : "failed";

    await db
      .update(syncLog)
      .set({
        finishedAt: new Date(),
        recordsFetched: result.recordsFetched,
        recordsInserted: result.recordsInserted,
        recordsUpdated: result.recordsUpdated,
        status,
        errorMessage: result.errors.length ? result.errors.join("; ") : null,
      })
      .where(eq(syncLog.id, logRow.id));

    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(syncLog)
      .set({ finishedAt: new Date(), status: "failed", errorMessage: message })
      .where(eq(syncLog.id, logRow.id));
    throw err;
  }
}
