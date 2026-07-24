import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  unknown: "#64748b",
};

export function SeverityDonut({ breakdown }: { breakdown: Record<string, number> }) {
  const data = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .map(([severity, value]) => ({ name: severity, value }));

  if (data.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={224}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={COLORS[entry.name] ?? "#64748b"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e2e8f0", textTransform: "capitalize" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
