import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accentClassName = "text-slate-100",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div className={`mt-2 text-2xl font-semibold font-mono-cve ${accentClassName}`}>{value}</div>
    </div>
  );
}
