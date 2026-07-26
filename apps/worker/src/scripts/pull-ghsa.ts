import "../lib/env";
import { createDbClient } from "@sec1cng/db";
import { runGhsaIngestion } from "../ingestion/ghsa";
import { logger } from "../lib/logger";

async function main() {
  const { db, pool } = createDbClient();
  try {
    const result = await runGhsaIngestion(db);
    logger.info(result, "[ghsa] manual pull complete");
    if (result.errors.length > 0) {
      logger.warn({ errors: result.errors }, "[ghsa] pull finished with errors");
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "[ghsa] manual pull crashed");
  process.exit(1);
});
