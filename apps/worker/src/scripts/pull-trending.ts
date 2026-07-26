import "../lib/env";
import { createDbClient } from "@sec1cng/db";
import { runTrendingRecalculation } from "../ingestion/trending";
import { logger } from "../lib/logger";

async function main() {
  const { db, pool } = createDbClient();
  try {
    const result = await runTrendingRecalculation(db);
    logger.info(result, "[trending] manual recalculation complete");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "[trending] manual recalculation crashed");
  process.exit(1);
});
