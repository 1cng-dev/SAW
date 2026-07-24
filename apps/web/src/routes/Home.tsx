import { AlertOctagon, FileWarning, Newspaper, ShieldCheck, Skull, Search, TrendingUp, Activity, Clock, AlertCircle } from "lucide-react";
import { Box, Heading, HStack, SimpleGrid, Skeleton, Stack, Text, Wrap, VStack } from "@chakra-ui/react";
import { useCves, useNews, useStats, useTrendingCves, useVendors, useDisclosureTrend, useStatTrend } from "../api/hooks";
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
    <Stack spacing={10}>
      {/* Header with live indicator and date filter */}
      <HStack justify="space-between" align="center">
        <HStack spacing={3}>
          <Heading size="lg">Dashboard</Heading>
          <LiveIndicator lastUpdated={lastUpdated} />
        </HStack>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </HStack>

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
          </SimpleGrid>
        ) : null}
      </Box>

      {/* Charts Row: Trend Line and Severity Donut */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* CVE Disclosure Trend Chart */}
        <Box>
          <Heading size="md" mb={3}>
            CVE Disclosure Trend
          </Heading>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
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
          <Heading size="md" mb={3}>
            Severity Distribution
          </Heading>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
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
          <Heading size="md" mb={3}>
            News Volume Trend
          </Heading>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
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
          <Heading size="md" mb={3}>
            Vendor Advisory Trend
          </Heading>
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
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

      <VStack spacing={8} align="stretch">
        {/* Today's Critical CVEs */}
        <Box>
          <Heading size="md" mb={3}>
            Today's Critical CVEs
          </Heading>
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
            <Text fontSize="sm" color="text.muted">
              No new critical CVEs published today yet.
            </Text>
          )}
        </Box>

        {/* Trending CVEs */}
        <Box>
          <Heading size="md" mb={3}>
            Trending CVEs
          </Heading>
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
            <Text fontSize="sm" color="text.muted">
              Trending scores haven't been calculated yet.
            </Text>
          )}
        </Box>

        {/* Latest Security News */}
        <Box>
          <Heading size="md" mb={3}>
            Latest Security News
          </Heading>
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
            <Text fontSize="sm" color="text.muted">
              No news articles ingested yet.
            </Text>
          )}
        </Box>

        {/* Browse by Vendor */}
        <Box>
          <Heading size="md" mb={3}>
            Browse by Vendor
          </Heading>
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
            <Text fontSize="sm" color="text.muted">
              No vendor data available yet.
            </Text>
          )}
        </Box>
      </VStack>
    </Stack>
  );
}
