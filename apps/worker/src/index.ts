import "./lib/env";
import { Worker } from "bullmq";
import { createDbClient } from "@sec1cng/db";
import { getRedisConnection } from "./lib/redis";
import { QUEUE_NAMES } from "./queues/definitions";
import { registerRepeatableJobs } from "./queues/scheduler";
import { createNvdProcessor } from "./queues/processors/nvdProcessor";
import { createNewsProcessor } from "./queues/processors/newsProcessor";
import { createVendorProcessor } from "./queues/processors/vendorProcessor";
import { createGhsaProcessor } from "./queues/processors/ghsaProcessor";
import { createTrendingProcessor } from "./queues/processors/trendingProcessor";
import { logger } from "./lib/logger";

async function main() {
  const { db } = createDbClient({ max: 5 });
  const connection = getRedisConnection();

  const workers = [
    new Worker(QUEUE_NAMES.NVD, createNvdProcessor(db), { connection }),
    new Worker(QUEUE_NAMES.NEWS, createNewsProcessor(db), { connection }),
    new Worker(QUEUE_NAMES.VENDOR, createVendorProcessor(db), { connection }),
    new Worker(QUEUE_NAMES.GHSA, createGhsaProcessor(db), { connection }),
    new Worker(QUEUE_NAMES.TRENDING, createTrendingProcessor(db), { connection }),
  ];

  for (const worker of workers) {
    worker.on("failed", (job, err) => {
      logger.error({ queue: worker.name, jobId: job?.id, err: err.message }, "job failed");
    });
  }

  await registerRepeatableJobs();
  logger.info("Sec-1CNG worker started — all queues registered");

  async function shutdown() {
    logger.info("shutting down worker...");
    await Promise.all(workers.map((w) => w.close()));
    process.exit(0);
  }
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  logger.error({ err }, "worker failed to start");
  process.exit(1);
});
