import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { syncStatusEnum } from "./enums";

export const syncLog = pgTable("sync_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobName: text("job_name").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  recordsFetched: integer("records_fetched").notNull().default(0),
  recordsInserted: integer("records_inserted").notNull().default(0),
  recordsUpdated: integer("records_updated").notNull().default(0),
  status: syncStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
});

export type SyncLog = typeof syncLog.$inferSelect;
export type NewSyncLog = typeof syncLog.$inferInsert;
