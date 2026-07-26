import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Only the tracked keywords are real/persisted. Match *results* are not —
// there's no real breach-feed/paste-site integration wired in yet, so the
// API returns clearly-labeled sample data until a real source is plugged
// into the pluggable data-source interface in lib/darkweb-sources/.
export const darkWebKeywords = pgTable("dark_web_keywords", {
  id: uuid("id").primaryKey().defaultRandom(),
  keyword: text("keyword").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DarkWebKeyword = typeof darkWebKeywords.$inferSelect;
export type NewDarkWebKeyword = typeof darkWebKeywords.$inferInsert;
