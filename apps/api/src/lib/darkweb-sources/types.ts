export interface DarkWebMatch {
  source: string;
  isSample: boolean;
  dateFound: string;
  matchedKeyword: string;
  snippet: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface DarkWebSource {
  name: string;
  isSample: boolean;
  search: (keywords: string[]) => Promise<DarkWebMatch[]>;
}
