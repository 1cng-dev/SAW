import { pgEnum } from "drizzle-orm/pg-core";

export const severityEnum = pgEnum("severity", [
  "critical",
  "high",
  "medium",
  "low",
  "unknown",
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "success",
  "partial",
  "failed",
]);
