import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const alertChannelEnum = pgEnum("alert_channel", ["email", "slack_webhook", "generic_webhook"]);

export const alertRules = pgTable("alert_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  triggerType: text("trigger_type").notNull(), // e.g. "new_critical_cve_watchlist_match"
  channel: alertChannelEnum("channel").notNull(),
  destination: text("destination").notNull(), // email address or webhook URL
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AlertRule = typeof alertRules.$inferSelect;
export type NewAlertRule = typeof alertRules.$inferInsert;
