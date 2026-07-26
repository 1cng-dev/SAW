import { Box, Heading, HStack, Text, Badge, useColorModeValue, VStack, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { Shield, AlertTriangle, Bug, Lock } from "lucide-react";
import { useNewsCategories } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

const CATEGORY_COLORS: Record<string, string> = {
  Ransomware: "#dc2626",
  Phishing: "#f97316",
  Malware: "#eab308",
  "Data Breach": "#8b5cf6",
  Vulnerability: "#22c55e",
  APT: "#3b82f6",
  Other: "#64748b",
};

export function ThreatCategories() {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const gridColor = "#2a2a2a";
  const axisColor = "#64748b";
  const tooltipBg = "#1a1a1a";
  const tooltipBorder = "#2a2a2a";
  const tooltipText = "#e2e8f0";

  const { data, isLoading, isError } = useNewsCategories(14);
  const breakdown = data?.breakdown ?? [];
  const trend = (data?.trend ?? []).map((row) => ({ date: row.date.slice(5), ...row.categories }));
  const totalArticles = breakdown.reduce((sum, d) => sum + d.count, 0);
  const seriesNames = Array.from(new Set(breakdown.map((b) => b.category)));

  return (
    <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" p={6}>
      <HStack justify="space-between" mb={6}>
        <HStack spacing={3}>
          <Shield size={20} color="#f97316" />
          <Heading size="md" fontWeight="semibold">News Categories</Heading>
        </HStack>
        <Badge colorScheme="purple" variant="subtle">Last 14 days</Badge>
      </HStack>

      {isError && <ErrorState message="Failed to load category data, retrying..." />}
      {isLoading ? (
        <Skeleton height="300px" borderRadius="lg" />
      ) : breakdown.length === 0 ? (
        <Text fontSize="sm" color="text.muted">No categorized news articles yet.</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={3}>Articles by Category (all-time)</Text>
            <Box height="220px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdown} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="category" stroke={axisColor} fontSize={11} tickLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke={axisColor} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: tooltipText }}
                    formatter={(value: number) => [value.toLocaleString(), "Articles"]}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {trend.length > 0 && (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={3}>Daily Articles by Category (14 days)</Text>
              <Box height="200px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis dataKey="date" stroke={axisColor} fontSize={10} tickLine={false} />
                    <YAxis stroke={axisColor} fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 11 }} labelStyle={{ color: tooltipText }} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                    {seriesNames.map((name) => (
                      <Area
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stackId="1"
                        stroke={CATEGORY_COLORS[name] ?? "#64748b"}
                        fill={CATEGORY_COLORS[name] ?? "#64748b"}
                        fillOpacity={0.6}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {breakdown.slice(0, 4).map((cat) => (
              <Box key={cat.category} p={3} borderRadius="lg" bg="charcoal.800">
                <HStack spacing={2} mb={2}>
                  {cat.category === "Ransomware" && <Shield size={14} color={CATEGORY_COLORS[cat.category]} />}
                  {cat.category === "Phishing" && <AlertTriangle size={14} color={CATEGORY_COLORS[cat.category]} />}
                  {cat.category === "Malware" && <Bug size={14} color={CATEGORY_COLORS[cat.category]} />}
                  {cat.category === "Vulnerability" && <Lock size={14} color={CATEGORY_COLORS[cat.category]} />}
                  <Text fontSize="xs" fontWeight="medium">{cat.category}</Text>
                </HStack>
                <Text fontSize="lg" fontWeight="bold" color={CATEGORY_COLORS[cat.category] ?? "#64748b"} fontFamily="mono">
                  {cat.count.toLocaleString()}
                </Text>
                <Text fontSize="xs" color="text.muted">
                  {totalArticles > 0 ? ((cat.count / totalArticles) * 100).toFixed(1) : "0"}% of total
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      )}
    </Box>
  );
}
