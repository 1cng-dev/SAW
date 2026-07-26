import { Box, Heading, HStack, Text, Badge, SimpleGrid, useColorModeValue, VStack, Skeleton } from "@chakra-ui/react";
import { Globe, MapPin } from "lucide-react";
import { useRansomwareGeo } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

function getVolumeColor(count: number, maxCount: number): string {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  if (percentage >= 80) return "#dc2626";
  if (percentage >= 60) return "#f97316";
  if (percentage >= 40) return "#eab308";
  return "#22c55e";
}

export function GeographicThreatMap() {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const { data, isLoading, isError } = useRansomwareGeo();
  const rows = data?.data ?? [];
  const totalVictims = rows.reduce((sum, r) => sum + r.count, 0);
  const maxCount = rows.length > 0 ? Math.max(...rows.map((r) => r.count)) : 0;

  return (
    <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" p={6}>
      <HStack justify="space-between" mb={6}>
        <HStack spacing={3}>
          <Globe size={20} color="#f97316" />
          <Heading size="md" fontWeight="semibold">Ransomware Victims by Country</Heading>
        </HStack>
        <Badge colorScheme="orange" variant="subtle">Real, cumulative</Badge>
      </HStack>

      {isError && <ErrorState message="Failed to load geographic data, retrying..." />}
      {isLoading ? (
        <Skeleton height="240px" borderRadius="lg" />
      ) : rows.length === 0 ? (
        <Text fontSize="sm" color="text.muted">No country data available yet.</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Total Victims</Text>
              <Text fontSize="xl" fontWeight="bold" color="#f97316" fontFamily="mono">
                {totalVictims.toLocaleString()}
              </Text>
            </Box>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Countries</Text>
              <Text fontSize="xl" fontWeight="bold" fontFamily="mono">{rows.length}</Text>
            </Box>
            <Box p={3} borderRadius="lg" bg="charcoal.800">
              <Text fontSize="xs" color="text.muted" textTransform="uppercase">Top Source</Text>
              <Text fontSize="xl" fontWeight="bold" fontFamily="mono">{rows[0]?.country ?? "—"}</Text>
            </Box>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
            {rows.slice(0, 8).map((row, index) => (
              <Box
                key={row.country}
                p={4}
                borderRadius="lg"
                bg="charcoal.800"
                borderWidth="1px"
                borderColor="transparent"
                _hover={{ borderColor: "accent.solid" }}
                transition="all 0.2s ease"
              >
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Text fontSize="lg" fontWeight="bold" color="accent.400">#{index + 1}</Text>
                    <Badge fontSize="xs" variant="outline">{row.country}</Badge>
                  </HStack>
                  <Text fontSize="lg" fontWeight="bold" color={getVolumeColor(row.count, maxCount)} fontFamily="mono">
                    {row.count.toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>

          <HStack fontSize="xs" color="text.muted" justify="center">
            <MapPin size={12} />
            <Text>Cumulative real victim counts by country, from ransomware.live</Text>
          </HStack>
        </VStack>
      )}
    </Box>
  );
}
