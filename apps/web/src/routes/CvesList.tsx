import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { useCves, type CveFilters } from "../api/hooks";
import { CveFilterSidebar } from "../components/cves/CveFilterSidebar";
import { CveTable } from "../components/cves/CveTable";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";

export function CvesListPage() {
  const search = useSearch({ from: "/cves" });
  const [filters, setFilters] = useState<Partial<CveFilters>>({});
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "publishedDate", desc: true }]);

  const sortBy = sorting[0]?.id ?? "publishedDate";
  const sortDir = sorting[0]?.desc === false ? "asc" : "desc";

  const query = useCves({
    ...filters,
    search: search.search,
    page,
    pageSize: 20,
    sortBy,
    sortDir,
  });

  function handleFilterChange(next: Partial<CveFilters>) {
    setFilters(next);
    setPage(1);
  }

  function handleExport() {
    const params = new URLSearchParams();
    Object.entries({ ...filters, search: search.search, sortBy, sortDir }).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
    });
    window.open(`/api/cves/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      <CveFilterSidebar onChange={handleFilterChange} />

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-100">
            CVE Database {search.search && <span className="text-slate-400">— "{search.search}"</span>}
          </h1>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-md border border-surface-border px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {query.isError && <ErrorState />}
        {query.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : query.data ? (
          <CveTable
            data={query.data.data}
            total={query.data.total}
            page={page}
            pageSize={query.data.pageSize}
            sorting={sorting}
            onSortingChange={(s) => {
              setSorting(s);
              setPage(1);
            }}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    </div>
  );
}
