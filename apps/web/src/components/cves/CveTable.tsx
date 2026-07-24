import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import type { Cve } from "../../api/types";

const columns: ColumnDef<Cve>[] = [
  {
    accessorKey: "id",
    header: "CVE ID",
    cell: (info) => (
      <Link to="/cves/$cveId" params={{ cveId: info.getValue<string>() }} className="font-mono-cve text-blue-400 hover:underline">
        {info.getValue<string>()}
      </Link>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: (info) => <SeverityBadge severity={info.getValue<string>()} />,
  },
  {
    accessorKey: "cvssScore",
    header: "CVSS",
    cell: (info) => <span className="font-mono-cve">{info.getValue<string | null>() ?? "—"}</span>,
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: (info) => info.getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "publishedDate",
    header: "Published",
    cell: (info) => {
      const value = info.getValue<string | null>();
      return value ? new Date(value).toLocaleDateString() : "—";
    },
  },
  {
    id: "flags",
    header: "Flags",
    cell: ({ row }) => (
      <div className="flex gap-1 text-xs">
        {row.original.isExploitedInWild && <span className="rounded bg-red-950 px-1.5 py-0.5 text-red-400">Exploited</span>}
        {row.original.hasPoc && <span className="rounded bg-amber-950 px-1.5 py-0.5 text-amber-400">PoC</span>}
      </div>
    ),
  },
];

interface CveTableProps {
  data: Cve[];
  total: number;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
}

export function CveTable({ data, total, page, pageSize, sorting, onSortingChange, onPageChange }: CveTableProps) {
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-raised">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-surface-border text-xs uppercase text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none px-4 py-3 hover:text-slate-200"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <ChevronsUpDown className="h-3 w-3" />}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-surface-border">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-800/40">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No CVEs match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-surface-border px-4 py-3 text-sm text-slate-400">
        <span>
          Page {page} of {totalPages} · {total.toLocaleString()} results
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 rounded border border-surface-border px-2 py-1 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 rounded border border-surface-border px-2 py-1 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
