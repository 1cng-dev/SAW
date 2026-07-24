const SEVERITY_COLOR: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  unknown: "#64748b",
};

export function CvssGauge({ score, severity }: { score: number | null; severity: string }) {
  const clamped = Math.max(0, Math.min(10, score ?? 0));
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - clamped / 10);
  const color = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.unknown;

  return (
    <div className="relative flex h-[140px] w-[140px] items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={score == null ? circumference : offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-mono-cve text-3xl font-bold text-slate-100">{score != null ? score.toFixed(1) : "—"}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500">CVSS</div>
      </div>
    </div>
  );
}
