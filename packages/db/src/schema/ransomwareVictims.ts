import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const ransomwareVictims = pgTable("ransomware_victims", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  externalId: text("external_id").notNull().unique(),
  groupName: text("group_name").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  publishedDate: timestamp("published_date"),
  website: text("website"),
  country: text("country"),
  syncedAt: timestamp("synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
