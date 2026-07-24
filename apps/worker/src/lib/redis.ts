import IORedis from "ioredis";

let connection: IORedis | null = null;

/** Single shared ioredis connection reused by every BullMQ Queue/Worker in this process. */
export function getRedisConnection(): IORedis {
  if (!connection) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL is not set");
    // BullMQ requires this for blocking commands used by Workers.
    connection = new IORedis(url, { maxRetriesPerRequest: null });
  }
  return connection;
}
