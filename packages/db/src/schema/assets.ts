import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const assetTypeEnum = pgEnum("asset_type", ["ip", "domain", "software"]);

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  assetType: assetTypeEnum("asset_type").notNull(),
  name: text("name").notNull(),
  value: text("value").notNull(), // the IP address, domain, or vendor/product name
  version: text("version"), // software assets only
  notes: text("notes"),
  // cached at cross-match time so the dashboard summary doesn't recompute on every load
  matchedCveIds: jsonb("matched_cve_ids").notNull().default([]),
  lastMatchedAt: timestamp("last_matched_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
