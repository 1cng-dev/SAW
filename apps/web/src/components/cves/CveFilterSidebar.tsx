import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import { SEVERITIES } from "@sec1cng/shared";
import type { CveFilters } from "../../api/hooks";

interface FormValues {
  severity: string[];
  dateFrom: string;
  dateTo: string;
  vendor: string;
  minCvss: number;
  maxCvss: number;
  hasPoc: boolean;
  isExploited: boolean;
}

const DEFAULT_VALUES: FormValues = {
  severity: [],
  dateFrom: "",
  dateTo: "",
  vendor: "",
  minCvss: 0,
  maxCvss: 10,
  hasPoc: false,
  isExploited: false,
};

export function CveFilterSidebar({ onChange }: { onChange: (filters: Partial<CveFilters>) => void }) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: () => undefined,
  });

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.state.values;
      onChange({
        severity: values.severity.length > 0 ? values.severity.join(",") : undefined,
        vendor: values.vendor || undefined,
        dateFrom: values.dateFrom || undefined,
        dateTo: values.dateTo || undefined,
        minCvss: values.minCvss > 0 ? values.minCvss : undefined,
        maxCvss: values.maxCvss < 10 ? values.maxCvss : undefined,
        hasPoc: values.hasPoc || undefined,
        isExploited: values.isExploited || undefined,
      });
    });
    return () => unsubscribe.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-lg border border-surface-border bg-surface-raised p-4 md:w-64">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Severity</h3>
        <form.Field name="severity" mode="array">
          {(field) => (
            <div className="space-y-1.5">
              {SEVERITIES.filter((s) => s !== "unknown").map((severity) => (
                <label key={severity} className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={field.state.value.includes(severity)}
                    onChange={(e) => {
                      if (e.target.checked) field.pushValue(severity);
                      else field.removeValue(field.state.value.indexOf(severity));
                    }}
                    className="rounded border-surface-border bg-surface accent-blue-600"
                  />
                  <span className="capitalize">{severity}</span>
                </label>
              ))}
            </div>
          )}
        </form.Field>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Date range</h3>
        <div className="space-y-2">
          <form.Field name="dateFrom">
            {(field) => (
              <input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-sm text-slate-200"
              />
            )}
          </form.Field>
          <form.Field name="dateTo">
            {(field) => (
              <input
                type="date"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-sm text-slate-200"
              />
            )}
          </form.Field>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Vendor</h3>
        <form.Field name="vendor">
          {(field) => (
            <input
              type="text"
              placeholder="e.g. cisco"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded border border-surface-border bg-surface px-2 py-1 text-sm text-slate-200"
            />
          )}
        </form.Field>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">CVSS range</h3>
        <form.Field name="minCvss">
          {(minField) => (
            <form.Field name="maxCvss">
              {(maxField) => (
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{minField.state.value.toFixed(1)}</span>
                    <span>{maxField.state.value.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={minField.state.value}
                    onChange={(e) => minField.handleChange(Math.min(Number(e.target.value), maxField.state.value))}
                    className="w-full accent-blue-600"
                  />
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.1}
                    value={maxField.state.value}
                    onChange={(e) => maxField.handleChange(Math.max(Number(e.target.value), minField.state.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              )}
            </form.Field>
          )}
        </form.Field>
      </div>

      <div className="space-y-1.5">
        <form.Field name="hasPoc">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="rounded border-surface-border bg-surface accent-blue-600"
              />
              Has PoC
            </label>
          )}
        </form.Field>
        <form.Field name="isExploited">
          {(field) => (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="rounded border-surface-border bg-surface accent-blue-600"
              />
              Exploited in the wild
            </label>
          )}
        </form.Field>
      </div>
    </aside>
  );
}
