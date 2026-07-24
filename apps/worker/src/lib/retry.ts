import { logger } from "./logger";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  label?: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exponential backoff with jitter. Honors a `Retry-After` header (seconds or
 * HTTP-date) if the thrown error carries one via `err.retryAfterMs`.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 5, baseDelayMs = 1000, maxDelayMs = 30_000, label = "request" } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;

      const retryAfterMs = (err as { retryAfterMs?: number })?.retryAfterMs;
      const exponential = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const jitter = Math.random() * exponential * 0.2;
      const delay = retryAfterMs ?? exponential + jitter;

      logger.warn(
        { label, attempt, maxAttempts, delayMs: Math.round(delay), error: (err as Error)?.message },
        `[${label}] attempt ${attempt} failed, retrying in ${Math.round(delay)}ms`,
      );
      await sleep(delay);
    }
  }
  throw lastError;
}

export class HttpError extends Error {
  status: number;
  retryAfterMs?: number;

  constructor(message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = new Date(header).getTime();
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}
