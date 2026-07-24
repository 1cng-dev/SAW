export const QUEUE_NAMES = {
  NVD: "sync-nvd-cves",
  NEWS: "sync-news-feeds",
  VENDOR: "sync-vendor-advisories",
  GHSA: "sync-ghsa-advisories",
  TRENDING: "recalculate-trending",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// Repeat intervals in ms, per the spec's ingestion/scheduling requirements.
export const REPEAT_INTERVALS_MS: Record<QueueName, number> = {
  [QUEUE_NAMES.NVD]: 2 * 60 * 60 * 1000,
  [QUEUE_NAMES.NEWS]: 15 * 60 * 1000,
  [QUEUE_NAMES.VENDOR]: 6 * 60 * 60 * 1000,
  // Not in the user's original 4-job list; added so GHSA (fully wired, no-ops
  // without GITHUB_TOKEN) has a real recurring trigger like every other source.
  [QUEUE_NAMES.GHSA]: 6 * 60 * 60 * 1000,
  [QUEUE_NAMES.TRENDING]: 30 * 60 * 1000,
};
