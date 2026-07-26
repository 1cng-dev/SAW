import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const phishingWatches = pgTable("phishing_watches", {
  id: uuid("id").primaryKey().defaultRandom(),
  domain: text("domain").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const phishingScanResults = pgTable("phishing_scan_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  watchId: uuid("watch_id")
    .notNull()
    .references(() => phishingWatches.id, { onDelete: "cascade" }),
  variation: text("variation").notNull(),
  variationType: text("variation_type").notNull(), // "character_swap" | "hyphenation" | "tld_swap" | "homoglyph"
  isRegistered: boolean("is_registered").notNull(),
  registrar: text("registrar"),
  registeredDate: timestamp("registered_date", { withTimezone: true }),
  scannedAt: timestamp("scanned_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PhishingWatch = typeof phishingWatches.$inferSelect;
export type NewPhishingWatch = typeof phishingWatches.$inferInsert;
export type PhishingScanResult = typeof phishingScanResults.$inferSelect;
export type NewPhishingScanResult = typeof phishingScanResults.$inferInsert;
