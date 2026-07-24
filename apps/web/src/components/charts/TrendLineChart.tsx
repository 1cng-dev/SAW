import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface TrendPoint {
  date: string;
  count: number;
}

export function TrendLineChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#e2e8f0" }}
        />
        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
