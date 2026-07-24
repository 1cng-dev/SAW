import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
});

export interface IngestionSummary {
  source: string;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  durationMs: number;
  errors: string[];
  skipped?: boolean;
}

export function logIngestionSummary(summary: IngestionSummary) {
  logger.info(summary, `[${summary.source}] ingestion run complete`);
}
