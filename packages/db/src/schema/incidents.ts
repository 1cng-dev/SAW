import { jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { severityEnum } from "./enums";

export const incidentStatusEnum = pgEnum("incident_status", [
  "open",
  "investigating",
  "contained",
  "resolved",
]);

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  severity: severityEnum("severity").notNull().default("unknown"),
  status: incidentStatusEnum("status").notNull().default("open"),
  assignee: text("assignee"),
  relatedCveIds: jsonb("related_cve_ids").notNull().default([]),
  relatedIocs: jsonb("related_iocs").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const incidentComments = pgTable("incident_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  incidentId: uuid("incident_id")
    .notNull()
    .references(() => incidents.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Incident = typeof incidents.$inferSelect;
export type NewIncident = typeof incidents.$inferInsert;
export type IncidentComment = typeof incidentComments.$inferSelect;
export type NewIncidentComment = typeof incidentComments.$inferInsert;
