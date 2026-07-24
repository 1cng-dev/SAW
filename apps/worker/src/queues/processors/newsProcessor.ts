import type { Job } from "bullmq";
import type { Db } from "@sec1cng/db";
import { runNewsIngestion } from "../../ingestion/newsFeeds";
import { logger } from "../../lib/logger";

export function createNewsProcessor(db: Db) {
  return async (_job: Job) => {
    const result = await runNewsIngestion(db);
    logger.info(result, "[news] scheduled sync complete");
    return result;
  };
}
