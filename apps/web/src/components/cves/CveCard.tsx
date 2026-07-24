import { Link } from "@tanstack/react-router";
import { ShieldAlert, Bug } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import type { Cve } from "../../api/types";

export function CveCard({ cve }: { cve: Cve }) {
  return (
    <Link
      to="/cves/$cveId"
      params={{ cveId: cve.id }}
      className="block rounded-lg border border-surface-border bg-surface-raised p-4 transition hover:border-slate-500"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono-cve text-sm font-medium text-slate-200">{cve.id}</span>
        <SeverityBadge severity={cve.severity} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-400">{cve.description ?? "No description available."}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
        {cve.cvssScore && <span className="font-mono-cve">CVSS {cve.cvssScore}</span>}
        {cve.isExploitedInWild && (
          <span className="flex items-center gap-1 text-red-400">
            <ShieldAlert className="h-3 w-3" /> Exploited
          </span>
        )}
        {cve.hasPoc && (
          <span className="flex items-center gap-1 text-amber-400">
            <Bug className="h-3 w-3" /> PoC
          </span>
        )}
        {cve.vendor && <span>{cve.vendor}</span>}
      </div>
    </Link>
  );
}
