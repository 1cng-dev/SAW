import type { Job } from "bullmq";
import type { Db } from "@sec1cng/db";
import { runGhsaIngestion } from "../../ingestion/ghsa";
import { logger } from "../../lib/logger";

export function createGhsaProcessor(db: Db) {
  return async (_job: Job) => {
    const result = await runGhsaIngestion(db);
    if (result.skipped) {
      logger.info("[GHSA] scheduled sync skipped: no GITHUB_TOKEN configured");
    } else {
      logger.info(result, "[GHSA] scheduled sync complete");
    }
    return result;
  };
}
