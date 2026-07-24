import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDbClient } from "./client";

config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

async function main() {
  const { db, pool } = createDbClient();
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)) });
  console.log("Migrations complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
