import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const ransomwareGroups = pgTable("ransomware_groups", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  victims: integer("victims").default(0),
  active: boolean("active").default(true),
  lastSeen: timestamp("last_seen"),
  location: text("location"),
  syncedAt: timestamp("synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
