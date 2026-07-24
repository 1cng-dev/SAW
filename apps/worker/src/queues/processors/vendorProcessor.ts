import type { Job } from "bullmq";
import type { Db } from "@sec1cng/db";
import { runVendorAdvisoryIngestion } from "../../ingestion/vendorAdvisories";
import { logger } from "../../lib/logger";

export function createVendorProcessor(db: Db) {
  return async (_job: Job) => {
    const result = await runVendorAdvisoryIngestion(db);
    logger.info(result, "[vendor] scheduled sync complete");
    return result;
  };
}
