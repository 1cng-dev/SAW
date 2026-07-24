export type Severity = "critical" | "high" | "medium" | "low" | "unknown";

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface StatsResponse {
  totalCves: number;
  todayCriticalCves: number;
  totalNewsArticles: number;
  totalVendorAdvisories: number;
  severityBreakdown: Record<Severity, number>;
}

export interface SyncStatusEntry {
  jobName: string;
  lastRunStartedAt: string | null;
  lastRunFinishedAt: string | null;
  lastRunStatus: string | null;
  lastSyncTimestamp: string | null;
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errorMessage: string | null;
}
