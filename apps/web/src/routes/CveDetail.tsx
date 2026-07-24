import { useParams } from "@tanstack/react-router";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCve } from "../api/hooks";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { CvssGauge } from "../components/cves/CvssGauge";
import { NewsCard } from "../components/news/NewsCard";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function CveDetailPage() {
  const { cveId } = useParams({ from: "/cves/$cveId" });
  const { data, isLoading, isError } = useCve(cveId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load CVE detail, retrying..." />;
  }

  const { data: cve, relatedNews } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-mono-cve text-2xl font-semibold text-slate-100">{cve.id}</h1>
          <SeverityBadge severity={cve.severity} />
        </div>
        <span className="text-sm text-slate-500">{cve.viewCount.toLocaleString()} views</span>
      </div>

      <p className="max-w-3xl text-slate-300">{cve.description ?? "No description available."}</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center justify-center rounded-lg border border-surface-border bg-surface-raised p-4">
          <CvssGauge score={cve.cvssScore != null ? Number(cve.cvssScore) : null} severity={cve.severity} />
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Key Facts</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">CWE</dt>
              <dd className="font-mono-cve text-slate-200">{cve.cweId ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Vendor</dt>
              <dd className="text-slate-200">{cve.vendor ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Published</dt>
              <dd className="text-slate-200">{cve.publishedDate ? new Date(cve.publishedDate).toLocaleDateString() : "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Last modified</dt>
              <dd className="text-slate-200">
                {cve.lastModifiedDate ? new Date(cve.lastModifiedDate).toLocaleDateString() : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Source</dt>
              <dd className="text-slate-200">{cve.source}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Exploitation Status</h3>
          <div className="space-y-3 text-sm">
            <div className={`flex items-center gap-2 ${cve.isExploitedInWild ? "text-red-400" : "text-slate-400"}`}>
              <ShieldAlert className="h-4 w-4" />
              {cve.isExploitedInWild ? "Exploited in the wild" : "No known exploitation"}
            </div>
            <div className={`flex items-center gap-2 ${cve.hasPoc ? "text-amber-400" : "text-slate-400"}`}>
              <ShieldCheck className="h-4 w-4" />
              {cve.hasPoc ? "Public PoC available" : "No public PoC known"}
            </div>
          </div>
        </div>
      </div>

      {cve.affectedProducts.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Affected Products</h3>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-surface-border">
              {cve.affectedProducts.map((product) => (
                <tr key={product}>
                  <td className="py-1.5 text-slate-300">{product}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cve.references.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">References</h3>
          <ul className="space-y-1.5 text-sm">
            {cve.references.map((ref) => (
              <li key={ref.url}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="break-all">{ref.url}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedNews.length > 0 && (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-slate-100">Related News</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {relatedNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
