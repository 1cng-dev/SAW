import { Link } from "@tanstack/react-router";
import { Box, Heading, HStack, SimpleGrid, Skeleton, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { useDisclosureTrend, useStats, useTrendingCves } from "../api/hooks";
import { TrendLineChart } from "../components/charts/TrendLineChart";
import { SeverityDonut } from "../components/charts/SeverityDonut";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function TrendingPage() {
  const trend = useDisclosureTrend();
  const stats = useStats();
  const trending = useTrendingCves(20);
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  return (
    <Stack spacing={6}>
      <Heading size="md">Trending</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
        <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4}>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={2}>
            30-Day Disclosure Trend
          </Heading>
          {trend.isError && <ErrorState />}
          {trend.isLoading ? (
            <Skeleton height="256px" borderRadius="md" />
          ) : (
            <TrendLineChart data={trend.data?.data.map((d) => ({ date: d.date.slice(5), count: d.count })) ?? []} />
          )}
        </Box>

        <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4}>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={2}>
            Severity Distribution
          </Heading>
          {stats.isError && <ErrorState />}
          {stats.isLoading ? (
            <Skeleton height="224px" borderRadius="md" />
          ) : (
            <SeverityDonut breakdown={stats.data?.severityBreakdown ?? {}} />
          )}
        </Box>
      </SimpleGrid>

      <Box>
        <Heading size="md" mb={3}>
          Ranked Trending CVEs
        </Heading>
        {trending.isError && <ErrorState />}
        {trending.isLoading ? (
          <Stack spacing={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Stack>
        ) : trending.data && trending.data.data.length > 0 ? (
          <Stack
            spacing={0}
            borderWidth="1px"
            borderColor="border.default"
            bg="bg.surface"
            borderRadius="xl"
            divider={<Box borderBottomWidth="1px" borderColor="border.default" />}
          >
            {trending.data.data.map((cve, i) => (
              <Link key={cve.id} to="/cves/$cveId" params={{ cveId: cve.id }}>
                <HStack px={4} py={3} spacing={4} _hover={{ bg: hoverBg }}>
                  <Text w={6} textAlign="center" fontSize="sm" fontWeight="semibold" color="text.muted">
                    {i + 1}
                  </Text>
                  <Text fontFamily="mono" fontSize="sm">
                    {cve.id}
                  </Text>
                  <SeverityBadge severity={cve.severity} />
                  <Text ml="auto" fontFamily="mono" fontSize="xs" color="text.muted">
                    score {Number(cve.trendingScore).toFixed(1)}
                  </Text>
                </HStack>
              </Link>
            ))}
          </Stack>
        ) : (
          <Text fontSize="sm" color="text.muted">
            Trending scores haven't been calculated yet.
          </Text>
        )}
      </Box>
    </Stack>
  );
}
