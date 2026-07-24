import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Incremental-sync cursor per job, decoupled from the sync_log audit trail so a
// `partial` run never ambiguously advances (or fails to advance) the cursor.
export const syncState = pgTable("sync_state", {
  jobName: text("job_name").primaryKey(),
  lastSyncTimestamp: timestamp("last_sync_timestamp", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SyncState = typeof syncState.$inferSelect;
export type NewSyncState = typeof syncState.$inferInsert;
