import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Center, Text, useColorModeValue } from "@chakra-ui/react";

const COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  unknown: "#64748b",
};

export function SeverityDonut({ breakdown }: { breakdown: Record<string, number> }) {
  const tooltipBg = useColorModeValue("#ffffff", "#1e293b");
  const tooltipBorder = useColorModeValue("#e2e8f0", "#334155");
  const tooltipText = useColorModeValue("#0f172a", "#e2e8f0");

  const data = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .map(([severity, value]) => ({ name: severity, value }));

  if (data.length === 0) {
    return (
      <Center h="224px">
        <Text fontSize="sm" color="text.muted">
          No data yet
        </Text>
      </Center>
    );
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
          contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: tooltipText, textTransform: "capitalize" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
