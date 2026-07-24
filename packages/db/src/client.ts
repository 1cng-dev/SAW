import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";

export function createDbClient(options?: { connectionString?: string; max?: number }) {
  const connectionString = options?.connectionString ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    max: options?.max ?? 10,
  });

  const db = drizzle(pool, { schema });

  return { db, pool };
}

export type Db = NodePgDatabase<typeof schema>;
