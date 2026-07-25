import { AlertOctagon, FileWarning, Newspaper, ShieldCheck, Skull, TrendingUp, Activity, AlertCircle, Bug, Radar, Server, Database, Globe, Lock, Zap } from "lucide-react";
import { Box, Heading, HStack, SimpleGrid, Skeleton, Stack, Text, Wrap, VStack, Flex, Badge, useColorModeValue } from "@chakra-ui/react";
import { useCves, useCveBreakdown, useNews, useRansomwareStats, useStats, useTrendingCves, useVendors, useDisclosureTrend, useStatTrend } from "../api/hooks";
import { StatCard } from "../components/ui/StatCard";
import { SkeletonCard } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { CveCard } from "../components/cves/CveCard";
import { NewsCard } from "../components/news/NewsCard";
import { VendorChip } from "../components/vendors/VendorChip";
import { Sparkline } from "../components/charts/Sparkline";
import { TrendLineChart } from "../components/charts/TrendLineChart";
import { SeverityDonut } from "../components/charts/SeverityDonut";
import { DateRangeFilter, DateRangeOption } from "../components/ui/DateRangeFilter";
import { LiveIndicator } from "../components/ui/LiveIndicator";
import { ActivityTimeline } from "../components/dashboard/ActivityTimeline";
import { useDateRange } from "../contexts/DateRangeContext";

function todayIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function HomePage() {
  const { dateRange, setDateRange, getDateRangeParams } = useDateRange();
  const stats = useStats();
  const { dateFrom, dateTo } = getDateRangeParams();
  const cardBg = useColorModeValue("white", "charcoal.800");
  const accentColor = "#f97316";
  
  const criticalToday = useCves({ 
    severity: "critical", 
    dateFrom: todayIso(), 
    pageSize: 8, 
    sortBy: "publishedDate", 
    sortDir: "desc" 
  });
  const trending = useTrendingCves(10);
  const news = useNews({ pageSize: 6 });
  const vendors = useVendors();
  const cveBreakdown = useCveBreakdown();
  const ransomwareStats = useRansomwareStats();
  const disclosureTrend = useDisclosureTrend(
    dateRange === "today" ? 1 : 
    dateRange === "7d" ? 7 : 
    dateRange === "30d" ? 30 : 
    dateRange === "90d" ? 90 : 30
  );
  
  // Sparkline data for stat cards (last 7 days)
  const totalCvesTrend = useStatTrend("total_cves", 7);
  const criticalTrend = useStatTrend("critical_today", 7);
  const highTrend = useStatTrend("high_severity", 7);
  const newsTrend = useStatTrend("news_articles", 7);
  const advisoryTrend = useStatTrend("vendor_advisories", 7);

  const lastUpdated = stats.dataUpdatedAt ? new Date(stats.dataUpdatedAt).toISOString() : null;

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Box 
        bgGradient="linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
        borderRadius="2xl"
        p={8}
        borderWidth="1px"
        borderColor="border.default"
      >
        <Flex justify="space-between" align="center" mb={6}>
          <VStack align="start" spacing={2}>
            <Heading size="3xl" fontWeight="bold">Security Dashboard</Heading>
            <Text color="text.muted" fontSize="lg">Real-time threat intelligence and CVE tracking</Text>
          </VStack>
          <HStack spacing={4}>
            <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="full">
              <HStack spacing={2}>
                <Box width="8px" height="8px" borderRadius="full" bg="green.500" />
                <Text fontSize="sm">Live</Text>
              </HStack>
            </Badge>
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
          </HStack>
        </Flex>
        <Text fontSize="sm" color="text.muted">
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Loading...'}
        </Text>
      </Box>

      {/* Extended Stat Cards with Sparklines */}
      <Box>
        {stats.isError && <ErrorState />}
        {stats.isLoading ? (
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </SimpleGrid>
        ) : stats.data ? (
          <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
            <StatCard 
              label="Total CVEs" 
              value={stats.data.totalCves.toLocaleString()} 
              icon={ShieldCheck}
              sparkline={totalCvesTrend.data?.data ? <Sparkline data={totalCvesTrend.data.data} color="#a78bfa" /> : undefined}
            />
            <StatCard
              label="Critical Today"
              value={stats.data.todayCriticalCves}
              icon={AlertOctagon}
              accentColor="severity.critical.500"
              sparkline={criticalTrend.data?.data ? <Sparkline data={criticalTrend.data.data} color="#dc2626" /> : undefined}
            />
            <StatCard 
              label="High Severity" 
              value={stats.data.severityBreakdown.high.toLocaleString()} 
              icon={AlertCircle}
              accentColor="severity.high.500"
              sparkline={highTrend.data?.data ? <Sparkline data={highTrend.data.data} color="#ea580c" /> : undefined}
            />
            <StatCard 
              label="News Articles" 
              value={stats.data.totalNewsArticles.toLocaleString()} 
              icon={Newspaper}
              sparkline={newsTrend.data?.data ? <Sparkline data={newsTrend.data.data} color="#22d3ee" /> : undefined}
            />
            <StatCard 
              label="Vendor Advisories" 
              value={stats.data.totalVendorAdvisories.toLocaleString()} 
              icon={FileWarning}
              sparkline={advisoryTrend.data?.data ? <Sparkline data={advisoryTrend.data.data} color="#f97316" /> : undefined}
            />
            <StatCard
              label="Medium Severity"
              value={stats.data.severityBreakdown.medium.toLocaleString()}
              icon={Activity}
              accentColor="severity.medium.500"
            />
            <StatCard
              label="Exploited in Wild"
              value={cveBreakdown.data?.exploitedInWild?.toLocaleString() ?? "—"}
              icon={Bug}
              accentColor="severity.critical.500"
            />
            <StatCard
              label="Has Public PoC"
              value={cveBreakdown.data?.hasPublicPoc?.toLocaleString() ?? "—"}
              icon={Radar}
              accentColor="severity.high.500"
            />
            <StatCard
              label="Active Ransomware Groups"
              value={ransomwareStats.data?.activeGroups?.toLocaleString() ?? "—"}
              icon={Skull}
              accentColor="severity.critical.500"
            />
            <StatCard
              label="Ransomware Victims (7d)"
              value={ransomwareStats.data?.newVictimsThisWeek?.toLocaleString() ?? "—"}
              icon={AlertOctagon}
              accentColor="accent.400"
            />
            <StatCard
              label="Avg CVSS Score"
              value={cveBreakdown.data?.avgCvssScore?.toFixed(1) ?? "—"}
              icon={TrendingUp}
              accentColor="accent.400"
            />
            <StatCard
              label="New CVEs This Week"
              value={cveBreakdown.data?.newThisWeek?.toLocaleString() ?? "—"}
              icon={Zap}
              accentColor="accent.400"
            />
          </SimpleGrid>
        ) : null}
      </Box>

      {/* Charts Row: Trend Line and Severity Donut */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* CVE Disclosure Trend Chart */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">CVE Disclosure Trend</Heading>
            <Badge colorScheme="purple" variant="subtle">30 Days</Badge>
          </HStack>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="2xl" bg={cardBg} p={6} boxShadow="sm">
            {disclosureTrend.isError && <ErrorState />}
            {disclosureTrend.isLoading ? (
              <Box h="256px">
                <Skeleton h="full" />
              </Box>
            ) : disclosureTrend.data ? (
              <TrendLineChart data={disclosureTrend.data.data} />
            ) : (
              <Text color="text.muted">No trend data available</Text>
            )}
          </Box>
        </Box>

        {/* Severity Breakdown Donut Chart */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">Severity Distribution</Heading>
            <Badge colorScheme="orange" variant="subtle">All Time</Badge>
          </HStack>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="2xl" bg={cardBg} p={6} boxShadow="sm">
            {stats.isError && <ErrorState />}
            {stats.isLoading ? (
              <Box h="256px">
                <Skeleton h="full" />
              </Box>
            ) : stats.data ? (
              <SeverityDonut breakdown={stats.data.severityBreakdown} />
            ) : (
              <Text color="text.muted">No severity data available</Text>
            )}
          </Box>
        </Box>
      </SimpleGrid>

      {/* Additional Trend Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* News Volume Trend */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">News Volume Trend</Heading>
            <Badge colorScheme="cyan" variant="subtle">7 Days</Badge>
          </HStack>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="2xl" bg={cardBg} p={6} boxShadow="sm">
            {newsTrend.isLoading ? (
              <Box h="200px">
                <Skeleton h="full" />
              </Box>
            ) : newsTrend.data ? (
              <TrendLineChart data={newsTrend.data.data} color="#22d3ee" />
            ) : (
              <Text color="text.muted">No news trend data available</Text>
            )}
          </Box>
        </Box>

        {/* Vendor Advisory Trend */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">Vendor Advisory Trend</Heading>
            <Badge colorScheme="orange" variant="subtle">7 Days</Badge>
          </HStack>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="2xl" bg={cardBg} p={6} boxShadow="sm">
            {advisoryTrend.isLoading ? (
              <Box h="200px">
                <Skeleton h="full" />
              </Box>
            ) : advisoryTrend.data ? (
              <TrendLineChart data={advisoryTrend.data.data} color="#f97316" />
            ) : (
              <Text color="text.muted">No advisory trend data available</Text>
            )}
          </Box>
        </Box>
      </SimpleGrid>

      {/* Real-time Activity Timeline: merges latest CVEs, news, and ransomware victim claims */}
      <Box>
        <HStack spacing={2} mb={3}>
          <Heading size="md" fontWeight="semibold">Recent Activity</Heading>
          <LiveIndicator lastUpdated={lastUpdated} />
        </HStack>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="2xl" bg={cardBg} p={6} boxShadow="sm">
          <ActivityTimeline />
        </Box>
      </Box>

      <VStack spacing={8} align="stretch">
        {/* Today's Critical CVEs */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">Today's Critical CVEs</Heading>
            <Badge colorScheme="red" variant="subtle">{criticalToday.data?.data?.length || 0} Critical</Badge>
          </HStack>
          {criticalToday.isError && <ErrorState />}
          {criticalToday.isLoading ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </SimpleGrid>
          ) : criticalToday.data && criticalToday.data.data.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
              {criticalToday.data.data.map((cve) => (
                <CveCard key={cve.id} cve={cve} />
              ))}
            </SimpleGrid>
          ) : (
            <Box p={8} textAlign="center" bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor="border.default">
              <Text fontSize="sm" color="text.muted">
                No new critical CVEs published today yet.
              </Text>
            </Box>
          )}
        </Box>

        {/* Trending CVEs */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">Trending CVEs</Heading>
            <Badge colorScheme="purple" variant="subtle">Top 10</Badge>
          </HStack>
          {trending.isError && <ErrorState />}
          {trending.isLoading ? (
            <HStack spacing={4} overflowX="auto" pb={2} align="stretch">
              {Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} w="288px" flexShrink={0}>
                  <SkeletonCard />
                </Box>
              ))}
            </HStack>
          ) : trending.data && trending.data.data.length > 0 ? (
            <HStack spacing={4} overflowX="auto" pb={2} align="stretch">
              {trending.data.data.map((cve) => (
                <Box key={cve.id} w="288px" flexShrink={0}>
                  <CveCard cve={cve} />
                </Box>
              ))}
            </HStack>
          ) : (
            <Box p={8} textAlign="center" bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor="border.default">
              <Text fontSize="sm" color="text.muted">
                Trending scores haven't been calculated yet.
              </Text>
            </Box>
          )}
        </Box>

        {/* Latest Security News */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">Latest Security News</Heading>
            <Badge colorScheme="cyan" variant="subtle">{news.data?.data?.length || 0} Articles</Badge>
          </HStack>
          {news.isError && <ErrorState />}
          {news.isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </SimpleGrid>
          ) : news.data && news.data.data.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {news.data.data.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </SimpleGrid>
          ) : (
            <Box p={8} textAlign="center" bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor="border.default">
              <Text fontSize="sm" color="text.muted">
                No news articles ingested yet.
              </Text>
            </Box>
          )}
        </Box>

        {/* Browse by Vendor */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Heading size="md" fontWeight="semibold">Browse by Vendor</Heading>
            <Badge colorScheme="blue" variant="subtle">{vendors.data?.data?.length || 0} Vendors</Badge>
          </HStack>
          {vendors.isError && <ErrorState />}
          {vendors.isLoading ? (
            <Wrap spacing={2}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height="36px" width="96px" borderRadius="full" />
              ))}
            </Wrap>
          ) : vendors.data && vendors.data.data.length > 0 ? (
            <Wrap spacing={2}>
              {vendors.data.data.map((vendor) => (
                <VendorChip key={vendor.vendor} vendor={vendor} />
              ))}
            </Wrap>
          ) : (
            <Box p={8} textAlign="center" bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor="border.default">
              <Text fontSize="sm" color="text.muted">
                No vendor data available yet.
              </Text>
            </Box>
          )}
        </Box>
      </VStack>
    </Stack>
  );
}
