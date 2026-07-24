import type { Job } from "bullmq";
import type { Db } from "@sec1cng/db";
import { runTrendingRecalculation } from "../../ingestion/trending";
import { logger } from "../../lib/logger";

export function createTrendingProcessor(db: Db) {
  return async (_job: Job) => {
    const result = await runTrendingRecalculation(db);
    logger.info(result, "[trending] recalculation complete");
    return result;
  };
}
