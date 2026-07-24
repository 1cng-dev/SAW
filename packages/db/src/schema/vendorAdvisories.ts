import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const vendorAdvisories = pgTable("vendor_advisories", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorName: text("vendor_name").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  relatedCveIds: jsonb("related_cve_ids").notNull().default([]),
  publishedDate: timestamp("published_date", { withTimezone: true }),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VendorAdvisory = typeof vendorAdvisories.$inferSelect;
export type NewVendorAdvisory = typeof vendorAdvisories.$inferInsert;
