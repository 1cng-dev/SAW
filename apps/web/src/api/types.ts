import type { Severity } from "@sec1cng/shared";

export interface CveReference {
  url: string;
  source?: string | null;
  tags?: string[];
}

export interface Cve {
  id: string;
  description: string | null;
  cvssScore: string | null;
  cvssVector: string | null;
  severity: Severity;
  cweId: string | null;
  publishedDate: string | null;
  lastModifiedDate: string | null;
  vendor: string | null;
  affectedProducts: string[];
  references: CveReference[];
  isExploitedInWild: boolean;
  hasPoc: boolean;
  source: string;
  viewCount: number;
  trendingScore: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  assetType: "ip" | "domain" | "software";
  name: string;
  value: string;
  version: string | null;
  notes: string | null;
  matchedCveIds: string[];
  lastMatchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssetSummary {
  totalAssets: number;
  assetsWithMatches: number;
  totalUniqueMatchedCves: number;
  severityBreakdown: { critical: number; high: number; medium: number; low: number; unknown: number };
}

export type IncidentStatus = "open" | "investigating" | "contained" | "resolved";

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: IncidentStatus;
  assignee: string | null;
  relatedCveIds: string[];
  relatedIocs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentComment {
  id: string;
  incidentId: string;
  author: string;
  body: string;
  createdAt: string;
}

export type PatchStatus = "not_started" | "in_progress" | "patched" | "not_applicable" | "risk_accepted";

export interface PatchTask {
  id: string;
  cveId: string | null;
  assetId: string | null;
  status: PatchStatus;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  cveSeverity: Severity | null;
  cvePublishedDate: string | null;
  cveDescription: string | null;
  assetName: string | null;
}

export interface DarkWebKeyword {
  id: string;
  keyword: string;
  createdAt: string;
}

export interface DarkWebMatch {
  source: string;
  isSample: boolean;
  dateFound: string;
  matchedKeyword: string;
  snippet: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

export interface PhishingWatch {
  id: string;
  domain: string;
  createdAt: string;
}

export interface PhishingScanResult {
  id: string;
  watchId: string;
  variation: string;
  variationType: "character_swap" | "hyphenation" | "tld_swap" | "homoglyph";
  isRegistered: boolean;
  registrar: string | null;
  registeredDate: string | null;
  scannedAt: string;
}

export interface ComplianceControl {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface ComplianceFrameworkStatus {
  key: string;
  name: string;
  controls: ComplianceControl[];
  completedCount: number;
  totalCount: number;
  progressPct: number;
}

export type AlertChannel = "email" | "slack_webhook" | "generic_webhook";

export interface AlertRule {
  id: string;
  triggerType: string;
  channel: AlertChannel;
  destination: string;
  enabled: boolean;
  createdAt: string;
}

export type TeamRole = "admin" | "analyst" | "viewer";

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  sourceName: string;
  sourceUrl: string;
  category: string | null;
  publishedDate: string | null;
  relatedCveIds: string[];
  relatedRansomwareGroups: string[];
  fetchedAt: string;
}

export interface VendorAdvisory {
  id: string;
  vendorName: string;
  title: string;
  url: string;
  relatedCveIds: string[];
  publishedDate: string | null;
  fetchedAt: string;
}

export interface VendorSummary {
  vendor: string;
  cveCount: number;
  criticalCount: number;
  highCount: number;
}

export interface SeverityBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}
