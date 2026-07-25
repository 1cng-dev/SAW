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
    refetchInterval: 60_000,
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
    refetchInterval: 60_000,
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

export function useThreatIntelLookup(indicator: string) {
  return useQuery({
    queryKey: ["threat-intel", indicator],
    queryFn: () => apiFetch<any>("/api/threat-intel/lookup", { indicator }),
    enabled: indicator.length > 0,
  });
}

export function useCveBreakdown() {
  return useQuery({
    queryKey: ["cve-breakdown"],
    queryFn: () => apiFetch<{ exploitedInWild: number; hasPublicPoc: number; avgCvssScore: number; newThisWeek: number }>("/api/stats/cve-breakdown"),
    refetchInterval: 60_000,
  });
}

export function useRansomwareGroups() {
  return useQuery({
    queryKey: ["ransomware-groups"],
    queryFn: () => apiFetch<{ data: Array<{ name: string; slug: string; description?: string; victims?: number; active?: boolean }> }>("/api/ransomware/groups"),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRansomwareVictims() {
  return useQuery({
    queryKey: ["ransomware-victims"],
    queryFn: () => apiFetch<{ data: Array<{ id: string; groupName: string; name: string; publishedDate: string; country?: string }> }>("/api/ransomware/victims"),
    refetchInterval: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRansomwareStats() {
  return useQuery({
    queryKey: ["ransomware-stats"],
    queryFn: () => apiFetch<{ totalGroups: number; activeGroups: number; totalVictims: number; newVictimsThisWeek: number; newVictimsThisMonth: number }>("/api/ransomware/stats"),
    refetchInterval: 60_000, // 1 minute
  });
}

export function useRansomwareTrends(days = 30) {
  return useQuery({
    queryKey: ["ransomware-trends", days],
    queryFn: () => apiFetch<{ data: Array<{ date: string; victims: number; groups: number }> }>("/api/ransomware/trends"),
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export interface AttackTechnique {
  technique_name: string;
  technique_id: string;
  technique_details: string;
}

export interface AttackTactic {
  tactic_name: string;
  tactic_id: string;
  techniques: AttackTechnique[];
}

export function useRansomwareAttack(slug: string | undefined) {
  return useQuery({
    queryKey: ["ransomware-attack", slug],
    queryFn: () => apiFetch<{ group: string; ttps: AttackTactic[]; cached: boolean }>(`/api/ransomware/groups/${slug}/attack`),
    enabled: Boolean(slug),
    staleTime: 60 * 60 * 1000,
  });
}

export function useRansomwareNotes(slug: string | undefined) {
  return useQuery({
    queryKey: ["ransomware-notes", slug],
    queryFn: () => apiFetch<{ data: string[]; configured: boolean }>(`/api/ransomware/groups/${slug}/notes`),
    enabled: Boolean(slug),
  });
}

export function useRansomwareNoteContent(slug: string | undefined, noteName: string | undefined) {
  return useQuery({
    queryKey: ["ransomware-note", slug, noteName],
    queryFn: () =>
      apiFetch<{ note_name: string; extension: string; content: string }>(
        `/api/ransomware/groups/${slug}/notes/${noteName}`,
      ),
    enabled: Boolean(slug && noteName),
  });
}

export interface NegotiationChatSummary {
  id: string;
  message_count: number;
  initialransom: string;
  negotiatedransom: string;
  paid: boolean;
}

export function useRansomwareNegotiations(slug: string | undefined) {
  return useQuery({
    queryKey: ["ransomware-negotiations", slug],
    queryFn: () => apiFetch<{ data: NegotiationChatSummary[]; configured: boolean }>(`/api/ransomware/groups/${slug}/negotiations`),
    enabled: Boolean(slug),
  });
}

export interface NegotiationMessage {
  party: string;
  content: string;
  timestamp: string;
}

export function useRansomwareNegotiationChat(slug: string | undefined, chatId: string | undefined) {
  return useQuery({
    queryKey: ["ransomware-negotiation-chat", slug, chatId],
    queryFn: () =>
      apiFetch<{
        chat_id: string;
        initialransom: string;
        negotiatedransom: string;
        paid: boolean;
        messages: NegotiationMessage[];
      }>(`/api/ransomware/groups/${slug}/negotiations/${chatId}`),
    enabled: Boolean(slug && chatId),
  });
}
