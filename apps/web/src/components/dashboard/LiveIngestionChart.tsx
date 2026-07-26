import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Box, Center, HStack, Heading, Text, Badge, useColorModeValue } from "@chakra-ui/react";
import { Activity } from "lucide-react";
import { useIngestionActivity } from "../../api/hooks";
import { LiveIndicator } from "../ui/LiveIndicator";

export function LiveIngestionChart() {
  const activity = useIngestionActivity(24);
  const cardBg = useColorModeValue("white", "charcoal.800");
  const gridColor = "#2a2a2a";
  const axisColor = "#64748b";

  const points = activity.data?.data ?? [];
  const chartData = points.map((p) => ({
    ...p,
    label: new Date(p.hour).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  const totalLastHour = points.length > 0 ? points[points.length - 1].cves + points[points.length - 1].news + points[points.length - 1].ransomware : 0;

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2}>
          <Heading size="md" fontWeight="semibold">Live Ingestion Activity</Heading>
          <LiveIndicator lastUpdated={activity.dataUpdatedAt ? new Date(activity.dataUpdatedAt).toISOString() : null} />
        </HStack>
        <Badge colorScheme="green" variant="subtle">Last 24h</Badge>
      </HStack>
      <Box borderWidth="1px" borderColor="border.default" borderRadius="2xl" bg={cardBg} p={4} boxShadow="sm">
        {activity.isLoading ? (
          <Center h="220px"><Text color="text.muted">Loading...</Text></Center>
        ) : chartData.length === 0 ? (
          <Center h="220px" flexDir="column" gap={2}>
            <Activity size={32} color="#64748b" />
            <Text fontSize="sm" color="text.muted">No records ingested in the last 24 hours</Text>
          </Center>
        ) : (
          <>
            <Text fontSize="xs" color="text.muted" mb={2} fontFamily="mono">
              {totalLastHour} record{totalLastHour === 1 ? "" : "s"} ingested in the most recent hour bucket &mdash; real CVE/news/ransomware creation timestamps, refreshed every 60s
            </Text>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="newsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ransomGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" stroke={axisColor} fontSize={11} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e2e8f0" }} />
                <Area type="monotone" dataKey="cves" name="CVEs" stroke="#a78bfa" fill="url(#cveGrad)" strokeWidth={2} stackId="1" />
                <Area type="monotone" dataKey="news" name="News" stroke="#22d3ee" fill="url(#newsGrad)" strokeWidth={2} stackId="1" />
                <Area type="monotone" dataKey="ransomware" name="Ransomware" stroke="#f97316" fill="url(#ransomGrad)" strokeWidth={2} stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </Box>
    </Box>
  );
}
