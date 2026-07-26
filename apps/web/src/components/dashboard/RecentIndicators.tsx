import { Box, Heading, HStack, Text, Badge, useColorModeValue, VStack, Code, Button, Skeleton } from "@chakra-ui/react";
import { AlertTriangle, Clock, RefreshCw, Skull } from "lucide-react";
import { useRecentRansomwareIocs } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

const TYPE_COLORS: Record<string, string> = {
  md5: "cyan",
  sha256: "cyan",
  ip: "blue",
  btc: "yellow",
  email: "purple",
  telegram: "pink",
  tox: "orange",
  session: "gray",
  pgp: "green",
  twitter: "blue",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentIndicators() {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const { data, isLoading, isError, refetch, isFetching } = useRecentRansomwareIocs(20);
  const indicators = data?.data ?? [];

  return (
    <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" p={6}>
      <HStack justify="space-between" mb={6}>
        <HStack spacing={3}>
          <AlertTriangle size={20} color="#f97316" />
          <Heading size="md" fontWeight="semibold">Recent Ransomware IOCs</Heading>
          <Badge colorScheme="red" variant="subtle">{indicators.length} shown</Badge>
        </HStack>
        <Button size="sm" variant="ghost" onClick={() => refetch()} isLoading={isFetching} leftIcon={<RefreshCw size={14} />}>
          Refresh
        </Button>
      </HStack>

      {isError && <ErrorState message="Failed to load indicators, retrying..." />}
      {isLoading ? (
        <Skeleton height="240px" borderRadius="lg" />
      ) : indicators.length === 0 ? (
        <Text fontSize="sm" color="text.muted">No IOCs synced yet.</Text>
      ) : (
        <VStack spacing={3} align="stretch">
          {indicators.map((indicator) => (
            <Box
              key={indicator.id}
              p={4}
              borderRadius="lg"
              bg="charcoal.800"
              borderWidth="1px"
              borderColor="transparent"
              _hover={{ borderColor: "accent.solid" }}
              transition="all 0.2s ease"
            >
              <HStack justify="space-between" mb={2}>
                <HStack spacing={2} flex={1} overflow="hidden">
                  <Code fontSize="sm" fontFamily="mono" color="accent.400" noOfLines={1} wordBreak="break-all">
                    {indicator.iocValue}
                  </Code>
                  <Badge colorScheme={TYPE_COLORS[indicator.iocType] ?? "gray"} variant="outline" fontSize="xs">
                    {indicator.iocType}
                  </Badge>
                </HStack>
              </HStack>

              <HStack justify="space-between" fontSize="xs" color="text.muted">
                <HStack spacing={1}>
                  <Skull size={12} />
                  <Text>{indicator.groupName}</Text>
                </HStack>
                <HStack spacing={1}>
                  <Clock size={12} />
                  <Text>synced {timeAgo(indicator.syncedAt)}</Text>
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      <HStack fontSize="xs" color="text.muted" justify="center" mt={4}>
        <AlertTriangle size={12} />
        <Text>Real indicators of compromise synced from ransomware.live per tracked group</Text>
      </HStack>
    </Box>
  );
}
