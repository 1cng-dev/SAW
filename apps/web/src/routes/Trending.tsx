import { useDisclosureTrend, useStats, useTrendingCves } from "../api/hooks";
import { TrendLineChart } from "../components/charts/TrendLineChart";
import { SeverityDonut } from "../components/charts/SeverityDonut";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { Link } from "@tanstack/react-router";

export function TrendingPage() {
  const trend = useDisclosureTrend();
  const stats = useStats();
  const trending = useTrendingCves(20);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">Trending</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            30-Day Disclosure Trend
          </h3>
          {trend.isError && <ErrorState />}
          {trend.isLoading ? (
            <div className="h-64 skeleton rounded bg-slate-700/30" />
          ) : (
            <TrendLineChart data={trend.data?.data.map((d) => ({ date: d.date.slice(5), count: d.count })) ?? []} />
          )}
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Severity Distribution</h3>
          {stats.isError && <ErrorState />}
          {stats.isLoading ? (
            <div className="h-56 skeleton rounded bg-slate-700/30" />
          ) : (
            <SeverityDonut breakdown={stats.data?.severityBreakdown ?? {}} />
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-slate-100">Ranked Trending CVEs</h3>
        {trending.isError && <ErrorState />}
        {trending.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : trending.data && trending.data.data.length > 0 ? (
          <ol className="divide-y divide-surface-border rounded-lg border border-surface-border bg-surface-raised">
            {trending.data.data.map((cve, i) => (
              <li key={cve.id}>
                <Link to="/cves/$cveId" params={{ cveId: cve.id }} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/40">
                  <span className="w-6 text-center text-sm font-semibold text-slate-500">{i + 1}</span>
                  <span className="font-mono-cve text-sm text-slate-200">{cve.id}</span>
                  <SeverityBadge severity={cve.severity} />
                  <span className="ml-auto font-mono-cve text-xs text-slate-500">score {Number(cve.trendingScore).toFixed(1)}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-slate-500">Trending scores haven't been calculated yet.</p>
        )}
      </div>
    </div>
  );
}
