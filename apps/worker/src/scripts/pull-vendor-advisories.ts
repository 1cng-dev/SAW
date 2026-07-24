import "../lib/env";
import { createDbClient } from "@sec1cng/db";
import { runVendorAdvisoryIngestion } from "../ingestion/vendorAdvisories";
import { logger } from "../lib/logger";

async function main() {
  const { db, pool } = createDbClient();
  try {
    const result = await runVendorAdvisoryIngestion(db);
    logger.info(result, "[vendor] manual pull complete");
    if (result.errors.length > 0) {
      logger.warn({ errors: result.errors }, "[vendor] one or more feeds failed — see errors above");
    }
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  logger.error({ err }, "[vendor] manual pull crashed");
  process.exit(1);
});
