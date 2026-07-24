import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Center, Text } from "@chakra-ui/react";

export interface TrendPoint {
  date: string;
  count: number;
}

export function TrendLineChart({ data, color = "#f97316" }: { data: TrendPoint[]; color?: string }) {
  const gridColor = "#2a2a2a";
  const axisColor = "#64748b";
  const tooltipBg = "#1a1a1a";
  const tooltipBorder = "#2a2a2a";
  const tooltipText = "#e2e8f0";

  if (data.length === 0) {
    return (
      <Center h="256px">
        <Text fontSize="sm" color="text.muted">
          No data yet
        </Text>
      </Center>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" stroke={axisColor} fontSize={12} tickLine={false} />
        <YAxis stroke={axisColor} fontSize={12} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: tooltipText }}
        />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
