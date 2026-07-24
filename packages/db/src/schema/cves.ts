import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { severityEnum } from "./enums";

export const cves = pgTable(
  "cves",
  {
    id: text("id").primaryKey(), // e.g. "CVE-2026-XXXXX"
    description: text("description"),
    cvssScore: numeric("cvss_score"),
    cvssVector: text("cvss_vector"),
    severity: severityEnum("severity").notNull().default("unknown"),
    cweId: text("cwe_id"),
    publishedDate: timestamp("published_date", { withTimezone: true }),
    lastModifiedDate: timestamp("last_modified_date", { withTimezone: true }),
    vendor: text("vendor"),
    affectedProducts: jsonb("affected_products").notNull().default([]),
    references: jsonb("references").notNull().default([]),
    isExploitedInWild: boolean("is_exploited_in_wild").notNull().default(false),
    hasPoc: boolean("has_poc").notNull().default(false),
    // "NVD" | "MITRE" | "GHSA" | vendor names ("MSRC", "Red Hat", "Ubuntu", "Cisco") — free text, not a DB enum
    source: text("source").notNull(),
    viewCount: integer("view_count").notNull().default(0),
    trendingScore: numeric("trending_score").notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("cves_trending_score_idx").on(table.trendingScore),
    index("cves_severity_idx").on(table.severity),
    index("cves_vendor_idx").on(table.vendor),
    index("cves_published_date_idx").on(table.publishedDate),
  ],
);

export type Cve = typeof cves.$inferSelect;
export type NewCve = typeof cves.$inferInsert;
