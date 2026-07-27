export interface DarkWebMatch {
  source: string;
  isSample: boolean;
  dateFound: string;
  matchedKeyword: string;
  snippet: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface DarkWebSourceOutcome {
  matches: DarkWebMatch[];
  notConfigured?: boolean;
  notConfiguredMessage?: string;
}

export interface DarkWebSource {
  name: string;
  isSample: boolean;
  search: (keywords: string[]) => Promise<DarkWebSourceOutcome>;
}

export interface DarkWebSourceStatus {
  source: string;
  isSample: boolean;
  status: "ok" | "unavailable" | "not_configured";
  lastSyncedAt: string;
  matches: DarkWebMatch[];
  error?: string;
}
