import { Link } from "@tanstack/react-router";
import type { VendorSummary } from "../../api/types";

export function VendorChip({ vendor }: { vendor: VendorSummary }) {
  return (
    <Link
      to="/vendors/$vendorName"
      params={{ vendorName: vendor.vendor }}
      className="flex items-center gap-2 rounded-full border border-surface-border bg-surface-raised px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
    >
      <span className="font-medium">{vendor.vendor}</span>
      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{vendor.cveCount}</span>
    </Link>
  );
}
