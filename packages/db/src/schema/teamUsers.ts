import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "analyst", "viewer"]);

// Named teamUsers (not "users") since this platform has no authentication
// system yet — this is a roster/role-assignment table, not real accounts.
export const teamUsers = pgTable("team_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("viewer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type TeamUser = typeof teamUsers.$inferSelect;
export type NewTeamUser = typeof teamUsers.$inferInsert;
