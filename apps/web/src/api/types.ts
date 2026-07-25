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
