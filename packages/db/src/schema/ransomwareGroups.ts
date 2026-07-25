import { pgTable, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const ransomwareGroups = pgTable("ransomware_groups", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  victims: integer("victims").default(0),
  active: boolean("active").default(true),
  lastSeen: timestamp("last_seen"),
  location: text("location"),
  // Cached MITRE ATT&CK tactic/technique mapping from ransomware.live's
  // /group/{name} endpoint — fetched lazily on first view, refreshed when stale.
  attackTechniques: jsonb("attack_techniques"),
  attackSyncedAt: timestamp("attack_synced_at"),
  syncedAt: timestamp("synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
