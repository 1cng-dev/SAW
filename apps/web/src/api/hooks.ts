import { useQuery } from "@tanstack/react-query";
import type { StatsResponse, SyncStatusEntry } from "@sec1cng/shared";
import { apiFetch } from "./client";
import type { Cve, NewsArticle, Paginated, VendorSummary } from "./types";

export interface CveFilters {
  severity?: string;
  vendor?: string;
  dateFrom?: string;
  dateTo?: string;
  minCvss?: number;
  maxCvss?: number;
  hasPoc?: boolean;
  isExploited?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => apiFetch<StatsResponse>("/api/stats"),
    refetchInterval: 60_000,
  });
}

export function useCves(filters: CveFilters) {
  return useQuery({
    queryKey: ["cves", filters],
    queryFn: () => apiFetch<Paginated<Cve>>("/api/cves", filters as Record<string, string | number | boolean | undefined>),
    placeholderData: (prev) => prev,
  });
}

export function useCve(id: string | undefined) {
  return useQuery({
    queryKey: ["cve", id],
    queryFn: () => apiFetch<{ data: Cve; relatedNews: NewsArticle[] }>(`/api/cves/${id}`),
    enabled: Boolean(id),
  });
}

export function useTrendingCves(limit = 20) {
  return useQuery({
    queryKey: ["cves-trending", limit],
    queryFn: () => apiFetch<{ data: Cve[] }>("/api/cves/trending", { limit }),
  });
}

export function useNews(filters: { source?: string; category?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ["news", filters],
    queryFn: () => apiFetch<Paginated<NewsArticle>>("/api/news", filters),
    placeholderData: (prev) => prev,
  });
}

export function useVendors() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: () => apiFetch<{ data: VendorSummary[] }>("/api/vendors"),
  });
}

export function useVendorCves(vendorName: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["vendor-cves", vendorName, page, pageSize],
    queryFn: () =>
      apiFetch<Paginated<Cve> & { severityBreakdown: Record<string, number> }>(`/api/vendors/${vendorName}/cves`, {
        page,
        pageSize,
      }),
    enabled: Boolean(vendorName),
  });
}

export function useDisclosureTrend(days = 30) {
  return useQuery({
    queryKey: ["disclosure-trend", days],
    queryFn: () => apiFetch<{ data: Array<{ date: string; count: number }> }>("/api/stats/disclosure-trend", { days }),
  });
}

export function useSeverityTrend(days = 30) {
  return useQuery({
    queryKey: ["severity-trend", days],
    queryFn: () => apiFetch<{ data: Array<{ date: string; critical: number; high: number; medium: number; low: number }> }>("/api/stats/severity-trend", { days }),
  });
}

export function useNewsVolumeTrend(days = 30) {
  return useQuery({
    queryKey: ["news-volume-trend", days],
    queryFn: () => apiFetch<{ data: Array<{ date: string; source: string; count: number }> }>("/api/stats/news-volume-trend", { days }),
  });
}

export function useStatTrend(statType: string, days = 7) {
  return useQuery({
    queryKey: ["stat-trend", statType, days],
    queryFn: () => apiFetch<{ data: Array<{ date: string; count: number }> }>("/api/stats/stat-trend", { statType, days }),
  });
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ["sync-status"],
    queryFn: () => apiFetch<{ data: SyncStatusEntry[] }>("/api/admin/sync-status"),
    refetchInterval: 30_000,
  });
}
