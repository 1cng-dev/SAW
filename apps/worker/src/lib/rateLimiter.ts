/**
 * In-memory sliding-window rate limiter for the NVD API. Only the worker
 * process talks to NVD, so a per-process in-memory window (no Redis) is
 * sufficient. NVD allows 5 requests/30s unauthenticated, 50 requests/30s
 * with an API key.
 */
export class SlidingWindowRateLimiter {
  private timestamps: number[] = [];

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  async schedule<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    this.timestamps.push(Date.now());
    return fn();
  }

  private async waitForSlot(): Promise<void> {
    for (;;) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
      if (this.timestamps.length < this.maxRequests) return;

      const oldest = this.timestamps[0];
      const waitMs = this.windowMs - (now - oldest) + 50; // small buffer
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

export function createNvdRateLimiter(hasApiKey: boolean): SlidingWindowRateLimiter {
  return hasApiKey
    ? new SlidingWindowRateLimiter(50, 30_000)
    : new SlidingWindowRateLimiter(5, 30_000);
}
