import { AlertOctagon, FileWarning, Newspaper, ShieldCheck } from "lucide-react";
import { useCves, useNews, useStats, useTrendingCves, useVendors } from "../api/hooks";
import { StatCard } from "../components/ui/StatCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { CveCard } from "../components/cves/CveCard";
import { NewsCard } from "../components/news/NewsCard";
import { VendorChip } from "../components/vendors/VendorChip";

function todayIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function HomePage() {
  const stats = useStats();
  const criticalToday = useCves({ severity: "critical", dateFrom: todayIso(), pageSize: 8, sortBy: "publishedDate", sortDir: "desc" });
  const trending = useTrendingCves(10);
  const news = useNews({ pageSize: 6 });
  const vendors = useVendors();

  return (
    <div className="space-y-10">
      <section>
        {stats.isError && <ErrorState />}
        {stats.isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : stats.data ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total CVEs" value={stats.data.totalCves.toLocaleString()} icon={ShieldCheck} />
            <StatCard
              label="Critical Today"
              value={stats.data.todayCriticalCves}
              icon={AlertOctagon}
              accentClassName="text-severity-critical"
            />
            <StatCard label="News Articles" value={stats.data.totalNewsArticles.toLocaleString()} icon={Newspaper} />
            <StatCard label="Vendor Advisories" value={stats.data.totalVendorAdvisories.toLocaleString()} icon={FileWarning} />
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Today's Critical CVEs</h2>
        {criticalToday.isError && <ErrorState />}
        {criticalToday.isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : criticalToday.data && criticalToday.data.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {criticalToday.data.data.map((cve) => (
              <CveCard key={cve.id} cve={cve} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No new critical CVEs published today yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Trending CVEs</h2>
        {trending.isError && <ErrorState />}
        {trending.isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-72 shrink-0">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : trending.data && trending.data.data.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trending.data.data.map((cve) => (
              <div key={cve.id} className="w-72 shrink-0">
                <CveCard cve={cve} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Trending scores haven't been calculated yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Latest Security News</h2>
        {news.isError && <ErrorState />}
        {news.isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : news.data && news.data.data.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {news.data.data.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No news articles ingested yet.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">Browse by Vendor</h2>
        {vendors.isError && <ErrorState />}
        {vendors.isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-24 skeleton rounded-full bg-slate-700/50" />
            ))}
          </div>
        ) : vendors.data && vendors.data.data.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {vendors.data.data.map((vendor) => (
              <VendorChip key={vendor.vendor} vendor={vendor} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No vendor data available yet.</p>
        )}
      </section>
    </div>
  );
}
