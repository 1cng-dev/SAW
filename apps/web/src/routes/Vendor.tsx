import { useParams } from "@tanstack/react-router";
import { useVendorCves } from "../api/hooks";
import { CveCard } from "../components/cves/CveCard";
import { SeverityDonut } from "../components/charts/SeverityDonut";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function VendorPage() {
  const { vendorName } = useParams({ from: "/vendors/$vendorName" });
  const query = useVendorCves(vendorName);

  if (query.isError) return <ErrorState />;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-slate-100">
        {vendorName} <span className="text-slate-400">— {query.data?.total ?? "…"} CVEs</span>
      </h1>

      {query.data && (
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4 md:w-96">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Severity Breakdown</h3>
          <SeverityDonut breakdown={query.data.severityBreakdown} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {query.isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : query.data?.data.map((cve) => <CveCard key={cve.id} cve={cve} />)}
      </div>
    </div>
  );
}
