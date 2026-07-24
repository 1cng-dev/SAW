import "../lib/env";
import { createDbClient } from "@sec1cng/db";
import { runNvdIngestion } from "../ingestion/nvd";
import { logger } from "../lib/logger";

async function main() {
  const days = Number(process.env.NVD_PULL_DAYS ?? 7);
  const windowEnd = new Date();
  const windowStart = new Date(windowEnd.getTime() - days * 24 * 60 * 60 * 1000);

  logger.info(
    { windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), hasApiKey: Boolean(process.env.NVD_API_KEY) },
    `[NVD] starting manual pull for the last ${days} day(s)`,
  );

  const { db, pool } = createDbClient();
  try {
    const result = await runNvdIngestion(db, { windowStart, windowEnd });
    logger.info(result, "[NVD] manual pull complete");
    if (result.errors.length > 0) {
      logger.error({ errors: result.errors }, "[NVD] pull finished with errors");
      process.exitCode = 1;
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "[NVD] manual pull crashed");
  process.exit(1);
});
