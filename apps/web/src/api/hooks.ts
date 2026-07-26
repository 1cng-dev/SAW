import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StatsResponse, SyncStatusEntry } from "@sec1cng/shared";
import { apiFetch, apiMutate } from "./client";
import type {
  AlertRule,
  Asset,
  AssetSummary,
  ComplianceFrameworkStatus,
  Cve,
  DarkWebKeyword,
  DarkWebMatch,
  Incident,
  IncidentComment,
  NewsArticle,
  Paginated,
  PatchTask,
  PhishingScanResult,
  PhishingWatch,
  TeamUser,
  VendorSummary,
} from "./types";

export interface CveFilters {
  ids?: string;
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

export function useCves(filters: CveFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["cves", filters],
    queryFn: () => apiFetch<Paginated<Cve>>("/api/cves", filters as Record<string, string | number | boolean | undefined>),
    placeholderData: (prev) => prev,
    refetchInterval: 60_000,
    enabled: options?.enabled,
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
    refetchInterval: 60_000, // 1 minute for real-time updates
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
    refetchInterval: 5 * 60_000, // 5 minutes for vendor data updates
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

export interface IngestionActivityPoint {
  hour: string;
  cves: number;
  news: number;
  ransomware: number;
}

export function useIngestionActivity(hours = 24) {
  return useQuery({
    queryKey: ["ingestion-activity", hours],
    queryFn: () => apiFetch<{ data: IngestionActivityPoint[] }>("/api/stats/ingestion-activity", { hours }),
    refetchInterval: 60_000,
  });
}

export interface MalwareLookupResult {
  hash: string;
  status: "malicious" | "unknown" | "not_configured";
  source: string;
  message?: string;
  data?: { fileType: string; fileName: string; signature: string; tags: string[]; firstSeen: string; fileSize: number } | null;
}

export function useMalwareLookup(hash: string) {
  return useQuery({
    queryKey: ["malware-lookup", hash],
    queryFn: () => apiFetch<MalwareLookupResult>("/api/malware/lookup", { hash }),
    enabled: hash.length > 0,
    retry: false,
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

export function useRansomwareGeo() {
  return useQuery({
    queryKey: ["ransomware-geo"],
    queryFn: () => apiFetch<{ data: Array<{ country: string; count: number }> }>("/api/ransomware/geo"),
    refetchInterval: 5 * 60_000,
  });
}

export function useNewsCategories(days = 14) {
  return useQuery({
    queryKey: ["news-categories", days],
    queryFn: () =>
      apiFetch<{
        breakdown: Array<{ category: string; count: number }>;
        trend: Array<{ date: string; categories: Record<string, number> }>;
      }>("/api/news/categories", { days }),
    refetchInterval: 60_000,
  });
}

export function useRansomwareAttackCoverage() {
  return useQuery({
    queryKey: ["ransomware-attack-coverage"],
    queryFn: () =>
      apiFetch<{
        data: Array<{ tactic: string; tacticId: string; groupsObserved: number; distinctTechniques: number }>;
        groupsWithData: number;
      }>("/api/ransomware/attack-coverage"),
    refetchInterval: 5 * 60_000,
  });
}

export function useRecentRansomwareIocs(limit = 20) {
  return useQuery({
    queryKey: ["recent-ransomware-iocs", limit],
    queryFn: () =>
      apiFetch<{ data: Array<{ id: number; groupName: string; iocType: string; iocValue: string; syncedAt: string }> }>(
        "/api/ransomware/iocs/recent",
        { limit },
      ),
    refetchInterval: 60_000,
  });
}

export function useAssets() {
  return useQuery({
    queryKey: ["assets"],
    queryFn: () => apiFetch<{ data: Asset[] }>("/api/assets"),
    refetchInterval: 60_000,
  });
}

export function useAssetSummary() {
  return useQuery({
    queryKey: ["assets-summary"],
    queryFn: () => apiFetch<AssetSummary>("/api/assets/summary"),
    refetchInterval: 60_000,
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => apiFetch<{ data: Asset; matchedCves: Cve[] }>(`/api/assets/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { assetType: string; name: string; value: string; version?: string; notes?: string }) =>
      apiMutate<{ data: Asset }>("/api/assets", "POST", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets-summary"] });
    },
  });
}

export function useDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/assets/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets-summary"] });
    },
  });
}

export function useRematchAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<{ data: Asset }>(`/api/assets/${id}/rematch`, "POST"),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assets-summary"] });
      queryClient.invalidateQueries({ queryKey: ["asset", id] });
    },
  });
}

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: () => apiFetch<{ data: Incident[] }>("/api/incidents"),
    refetchInterval: 60_000,
  });
}

export function useIncident(id: string | undefined) {
  return useQuery({
    queryKey: ["incident", id],
    queryFn: () => apiFetch<{ data: Incident; comments: IncidentComment[] }>(`/api/incidents/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; description?: string; severity?: string; assignee?: string }) =>
      apiMutate<{ data: Incident }>("/api/incidents", "POST", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<Incident>) =>
      apiMutate<{ data: Incident }>(`/api/incidents/${id}`, "PATCH", body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incident", variables.id] });
    },
  });
}

export function useDeleteIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/incidents/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useAddIncidentComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentId, author, body }: { incidentId: string; author?: string; body: string }) =>
      apiMutate<{ data: IncidentComment }>(`/api/incidents/${incidentId}/comments`, "POST", { author, body }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["incident", variables.incidentId] });
    },
  });
}

export function usePatchTasks() {
  return useQuery({
    queryKey: ["patch-tasks"],
    queryFn: () => apiFetch<{ data: PatchTask[] }>("/api/patch-tasks"),
    refetchInterval: 60_000,
  });
}

export function useCreatePatchTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { cveId?: string; assetId?: string; status?: string; dueDate?: string; notes?: string }) =>
      apiMutate<{ data: PatchTask }>("/api/patch-tasks", "POST", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patch-tasks"] }),
  });
}

export function useUpdatePatchTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; status?: string; dueDate?: string | null; notes?: string }) =>
      apiMutate<{ data: PatchTask }>(`/api/patch-tasks/${id}`, "PATCH", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patch-tasks"] }),
  });
}

export function useDeletePatchTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/patch-tasks/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patch-tasks"] }),
  });
}

export function useDarkWebKeywords() {
  return useQuery({
    queryKey: ["darkweb-keywords"],
    queryFn: () => apiFetch<{ data: DarkWebKeyword[] }>("/api/darkweb/keywords"),
  });
}

export function useDarkWebMatches() {
  return useQuery({
    queryKey: ["darkweb-matches"],
    queryFn: () =>
      apiFetch<{ data: DarkWebMatch[]; keywordCount: number; sourcesUsed: { name: string; isSample: boolean }[] }>(
        "/api/darkweb/matches"
      ),
    refetchInterval: 60_000,
  });
}

export function useAddDarkWebKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (keyword: string) => apiMutate<{ data: DarkWebKeyword }>("/api/darkweb/keywords", "POST", { keyword }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-keywords"] });
      queryClient.invalidateQueries({ queryKey: ["darkweb-matches"] });
    },
  });
}

export function useDeleteDarkWebKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/darkweb/keywords/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["darkweb-keywords"] });
      queryClient.invalidateQueries({ queryKey: ["darkweb-matches"] });
    },
  });
}

export function usePhishingWatches() {
  return useQuery({
    queryKey: ["phishing-watches"],
    queryFn: () => apiFetch<{ data: PhishingWatch[] }>("/api/phishing/watches"),
  });
}

export function usePhishingResults(watchId: string | undefined) {
  return useQuery({
    queryKey: ["phishing-results", watchId],
    queryFn: () => apiFetch<{ data: PhishingScanResult[] }>(`/api/phishing/watches/${watchId}/results`),
    enabled: Boolean(watchId),
  });
}

export function useCreatePhishingWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) =>
      apiMutate<{ data: PhishingWatch; results: PhishingScanResult[] }>("/api/phishing/watches", "POST", { domain }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phishing-watches"] }),
  });
}

export function useRescanPhishingWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<{ data: PhishingScanResult[] }>(`/api/phishing/watches/${id}/rescan`, "POST"),
    onSuccess: (_data, id) => queryClient.invalidateQueries({ queryKey: ["phishing-results", id] }),
  });
}

export function useDeletePhishingWatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/phishing/watches/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phishing-watches"] }),
  });
}

export function useCompliance() {
  return useQuery({
    queryKey: ["compliance"],
    queryFn: () => apiFetch<{ data: ComplianceFrameworkStatus[] }>("/api/compliance"),
  });
}

export function useSetComplianceControl() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ framework, controlId, completed }: { framework: string; controlId: string; completed: boolean }) =>
      apiMutate(`/api/compliance/${framework}/${controlId}`, "PUT", { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compliance"] }),
  });
}

export function useAlertRules() {
  return useQuery({
    queryKey: ["alert-rules"],
    queryFn: () => apiFetch<{ data: AlertRule[] }>("/api/alert-rules"),
  });
}

export function useCreateAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { triggerType: string; channel: string; destination: string }) =>
      apiMutate<{ data: AlertRule }>("/api/alert-rules", "POST", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
}

export function useToggleAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiMutate<{ data: AlertRule }>(`/api/alert-rules/${id}`, "PATCH", { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
}

export function useDeleteAlertRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/alert-rules/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
}

export function useTeamUsers() {
  return useQuery({
    queryKey: ["team-users"],
    queryFn: () => apiFetch<{ data: TeamUser[] }>("/api/team-users"),
  });
}

export function useCreateTeamUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; role: string }) =>
      apiMutate<{ data: TeamUser }>("/api/team-users", "POST", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-users"] }),
  });
}

export function useUpdateTeamUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiMutate<{ data: TeamUser }>(`/api/team-users/${id}`, "PATCH", { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-users"] }),
  });
}

export function useDeleteTeamUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiMutate<void>(`/api/team-users/${id}`, "DELETE"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-users"] }),
  });
}
