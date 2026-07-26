import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { cves } from "./cves";
import { assets } from "./assets";

export const patchStatusEnum = pgEnum("patch_status", [
  "not_started",
  "in_progress",
  "patched",
  "not_applicable",
  "risk_accepted",
]);

export const patchTasks = pgTable("patch_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  cveId: text("cve_id").references(() => cves.id, { onDelete: "cascade" }),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "cascade" }),
  status: patchStatusEnum("status").notNull().default("not_started"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PatchTask = typeof patchTasks.$inferSelect;
export type NewPatchTask = typeof patchTasks.$inferInsert;
