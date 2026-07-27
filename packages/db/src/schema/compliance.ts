import { pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const complianceStatusEnum = pgEnum("compliance_status", ["incomplete", "complete", "not_applicable"]);

// Tracks only completion state + notes; the actual control lists (ISO 27001,
// NIST CSF, CIS Controls) are static reference data in packages/shared, not
// user-editable rows.
export const complianceControlStatus = pgTable(
  "compliance_control_status",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    framework: text("framework").notNull(), // "iso27001" | "nist_csf" | "cis_controls"
    controlId: text("control_id").notNull(),
    status: complianceStatusEnum("status").notNull().default("incomplete"),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("compliance_control_status_unique_idx").on(table.framework, table.controlId)],
);

export type ComplianceControlStatus = typeof complianceControlStatus.$inferSelect;
export type NewComplianceControlStatus = typeof complianceControlStatus.$inferInsert;
