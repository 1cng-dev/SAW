import { Queue } from "bullmq";
import { getRedisConnection } from "../lib/redis";
import { QUEUE_NAMES, REPEAT_INTERVALS_MS, type QueueName } from "./definitions";
import { logger } from "../lib/logger";

/**
 * Registers a repeatable job per queue (BullMQ's `every` scheduler) and also
 * enqueues one immediate run so ingestion visibly starts working right away
 * rather than waiting out the first interval.
 */
export async function registerRepeatableJobs(): Promise<Queue[]> {
  const connection = getRedisConnection();
  const queues: Queue[] = [];

  for (const queueName of Object.values(QUEUE_NAMES) as QueueName[]) {
    const queue = new Queue(queueName, { connection });
    queues.push(queue);

    await queue.add(
      queueName,
      {},
      { repeat: { every: REPEAT_INTERVALS_MS[queueName] }, removeOnComplete: 20, removeOnFail: 50 },
    );
    await queue.add(queueName, { immediate: true }, { removeOnComplete: 20, removeOnFail: 50 });

    logger.info(
      { queue: queueName, intervalMs: REPEAT_INTERVALS_MS[queueName] },
      `[scheduler] registered repeatable job for ${queueName}`,
    );
  }

  return queues;
}
