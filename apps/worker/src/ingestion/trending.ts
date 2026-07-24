import { sql } from "drizzle-orm";
import type { Db } from "@sec1cng/db";
import { withSyncLog } from "../lib/syncLogger";

const JOB_NAME = "recalculate-trending";

/**
 * trending_score = recency weight (decays over 30 days since last modified)
 *                + log-scaled view_count weight (so hot pages don't runaway-dominate)
 *                + is_exploited_in_wild boost
 *                + has_poc boost
 */
export async function runTrendingRecalculation(db: Db) {
  return withSyncLog(db, JOB_NAME, async () => {
    const result = await db.execute(sql`
      UPDATE cves
      SET trending_score = (
          GREATEST(0, 30 - EXTRACT(DAY FROM (now() - COALESCE(last_modified_date, published_date, now()))))::numeric * 2
          + LN(1 + view_count) * 5
          + (CASE WHEN is_exploited_in_wild THEN 50 ELSE 0 END)
          + (CASE WHEN has_poc THEN 20 ELSE 0 END)
        ),
        updated_at = now()
    `);

    const recordsUpdated = result.rowCount ?? 0;
    return { recordsFetched: recordsUpdated, recordsInserted: 0, recordsUpdated, errors: [] as string[] };
  });
}

export { JOB_NAME as TRENDING_JOB_NAME };
