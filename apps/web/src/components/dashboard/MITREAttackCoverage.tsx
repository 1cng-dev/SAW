import { Box, Heading, HStack, Text, Badge, useColorModeValue, VStack, SimpleGrid, Skeleton } from "@chakra-ui/react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Target, Crosshair } from "lucide-react";
import { useRansomwareAttackCoverage } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

export function MITREAttackCoverage() {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const gridColor = "#2a2a2a";
  const axisColor = "#64748b";
  const tooltipBg = "#1a1a1a";
  const tooltipBorder = "#2a2a2a";
  const tooltipText = "#e2e8f0";

  const { data, isLoading, isError } = useRansomwareAttackCoverage();
  const tactics = data?.data ?? [];
  const groupsWithData = data?.groupsWithData ?? 0;
  const maxGroups = tactics.length > 0 ? Math.max(...tactics.map((t) => t.groupsObserved)) : 0;
  const totalTechniques = tactics.reduce((sum, t) => sum + t.distinctTechniques, 0);

  return (
    <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" p={6}>
      <HStack justify="space-between" mb={6}>
        <HStack spacing={3}>
          <Target size={20} color="#f97316" />
          <Heading size="md" fontWeight="semibold">MITRE ATT&CK Coverage</Heading>
        </HStack>
        <Badge colorScheme="blue" variant="subtle">{groupsWithData} groups analyzed</Badge>
      </HStack>

      {isError && <ErrorState message="Failed to load ATT&CK coverage, retrying..." />}
      {isLoading ? (
        <Skeleton height="320px" borderRadius="lg" />
      ) : tactics.length === 0 ? (
        <Text fontSize="sm" color="text.muted">
          No ATT&CK data cached yet — it's fetched live from ransomware.live the first time each
          group's page is viewed. Browse a few groups in the Ransomware Tracker to populate this.
        </Text>
      ) : (
        <VStack spacing={6} align="stretch">
          <Box height="320px">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={tactics} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <PolarGrid stroke={gridColor} strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="tactic" stroke={axisColor} fontSize={10} tick={{ fill: axisColor }} />
                <PolarRadiusAxis angle={90} domain={[0, maxGroups]} stroke={axisColor} fontSize={9} tick={{ fill: axisColor }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: tooltipText }}
                  formatter={(value: number) => [`${value} groups`, "Observed"]}
                />
                <Radar name="Groups Observed" dataKey="groupsObserved" stroke="#f97316" fill="#f97316" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Box>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Groups Analyzed</Text>
              <Text fontSize="xl" fontWeight="bold" color="#f97316" fontFamily="mono">{groupsWithData}</Text>
            </Box>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Tactics Observed</Text>
              <Text fontSize="xl" fontWeight="bold" fontFamily="mono">{tactics.length}</Text>
            </Box>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Distinct Techniques</Text>
              <Text fontSize="xl" fontWeight="bold" fontFamily="mono">{totalTechniques}</Text>
            </Box>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Top Tactic</Text>
              <Text fontSize="xl" fontWeight="bold" fontFamily="mono">{tactics[0]?.tacticId ?? "—"}</Text>
            </Box>
          </SimpleGrid>

          <Box>
            <Text fontSize="sm" fontWeight="semibold" mb={3}>Most-Observed Tactics</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
              {tactics.slice(0, 6).map((tactic) => (
                <Box key={tactic.tacticId} p={3} borderRadius="lg" bg="charcoal.800" borderWidth="1px" borderColor="transparent" _hover={{ borderColor: "accent.solid" }} transition="all 0.2s ease">
                  <HStack justify="space-between">
                    <HStack spacing={2}>
                      <Crosshair size={14} color="#f97316" />
                      <Text fontSize="sm" fontWeight="medium">{tactic.tactic}</Text>
                    </HStack>
                    <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                      {tactic.groupsObserved} groups · {tactic.distinctTechniques} techniques
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <HStack fontSize="xs" color="text.muted" justify="center">
            <Target size={12} />
            <Text>Real MITRE ATT&CK data cached from ransomware.live, per group analyzed so far</Text>
          </HStack>
        </VStack>
      )}
    </Box>
  );
}
