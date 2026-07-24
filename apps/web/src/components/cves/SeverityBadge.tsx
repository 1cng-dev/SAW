const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/40",
  high: "bg-severity-high/15 text-severity-high border-severity-high/40",
  medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/40",
  low: "bg-severity-low/15 text-severity-low border-severity-low/40",
  unknown: "bg-severity-unknown/15 text-severity-unknown border-severity-unknown/40",
};

export function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.unknown;
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium uppercase ${style}`}>
      {severity}
    </span>
  );
}
