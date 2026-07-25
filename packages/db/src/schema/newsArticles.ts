import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const newsArticles = pgTable("news_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  excerpt: text("excerpt"), // max 300 chars, enforced at ingestion time
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull().unique(),
  category: text("category"), // Ransomware | Data Breach | Malware | Vulnerability | APT | Phishing | Other
  publishedDate: timestamp("published_date", { withTimezone: true }),
  relatedCveIds: jsonb("related_cve_ids").notNull().default([]),
  // Known ransomware group names (from ransomware_groups) mentioned in
  // title/excerpt, detected at ingestion time — same pattern as relatedCveIds.
  relatedRansomwareGroups: jsonb("related_ransomware_groups").notNull().default([]),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NewsArticle = typeof newsArticles.$inferSelect;
export type NewNewsArticle = typeof newsArticles.$inferInsert;
