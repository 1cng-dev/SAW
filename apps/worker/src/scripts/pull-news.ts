import "../lib/env";
import { createDbClient } from "@sec1cng/db";
import { runNewsIngestion } from "../ingestion/newsFeeds";
import { logger } from "../lib/logger";

async function main() {
  const { db, pool } = createDbClient();
  try {
    const result = await runNewsIngestion(db);
    logger.info(result, "[news] manual pull complete");
    if (result.errors.length > 0) {
      logger.warn({ errors: result.errors }, "[news] one or more feeds failed — see errors above");
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "[news] manual pull crashed");
  process.exit(1);
});
