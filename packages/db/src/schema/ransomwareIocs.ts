import { pgTable, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

// Synced from ransomware.live's /iocs/{group} endpoint. Backs the Threat
// Intel / IOC Lookup feature's cross-reference against real IOC data.
export const ransomwareIocs = pgTable(
  "ransomware_iocs",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    groupName: text("group_name").notNull(),
    iocType: text("ioc_type").notNull(), // md5 | sha256 | ip | btc | tox | email | ...
    iocValue: text("ioc_value").notNull(),
    syncedAt: timestamp("synced_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.groupName, table.iocType, table.iocValue)],
);

export type RansomwareIoc = typeof ransomwareIocs.$inferSelect;
export type NewRansomwareIoc = typeof ransomwareIocs.$inferInsert;
