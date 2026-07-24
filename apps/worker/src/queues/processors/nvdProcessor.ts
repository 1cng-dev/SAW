import type { Job } from "bullmq";
import type { Db } from "@sec1cng/db";
import { runNvdIngestion } from "../../ingestion/nvd";
import { logger } from "../../lib/logger";

export function createNvdProcessor(db: Db) {
  return async (_job: Job) => {
    const result = await runNvdIngestion(db);
    logger.info(result, "[NVD] scheduled sync complete");
    return result;
  };
}
