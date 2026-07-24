import { useState } from "react";
import { Box, Heading, Text, VStack, HStack, SimpleGrid, Badge, Input, Select, Alert, AlertIcon, AlertTitle, AlertDescription, Table, Thead, Tbody, Tr, Th, Td, Link, Code, Skeleton, Stack } from "@chakra-ui/react";
import { Skull, TrendingUp, ExternalLink, AlertTriangle, Search, Calendar, Activity, Clock } from "lucide-react";
import { useNews, useRansomwareGroups, useRansomwareVictims, useRansomwareStats, useRansomwareTrends } from "../api/hooks";
import { TrendLineChart } from "../components/charts/TrendLineChart";
import { LiveIndicator } from "../components/ui/LiveIndicator";

export function RansomwareTrackerPage() {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  // Fetch ransomware data from API
  const groups = useRansomwareGroups();
  const victims = useRansomwareVictims();
  const stats = useRansomwareStats();
  const trends = useRansomwareTrends(30);
  const ransomwareNews = useNews({ pageSize: 10 });

  const lastUpdated = groups.dataUpdatedAt ? new Date(groups.dataUpdatedAt).toISOString() : null;

  const filteredGroups = selectedGroup === "all" 
    ? (groups.data?.data || [])
    : (groups.data?.data || []).filter(g => g.name.toLowerCase().includes(selectedGroup.toLowerCase()));

  const filteredVictims = (victims.data?.data || []).filter(v => 
    (selectedGroup === "all" || v.groupName === selectedGroup) &&
    (searchTerm === "" || v.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Ransomware Group Tracker
      </Heading>
      <Text color="text.muted" mb={6}>
        Real-time ransomware threat intelligence powered by Ransomware.live API
      </Text>

      {/* Live Status */}
      <HStack spacing={3} mb={6}>
        <LiveIndicator lastUpdated={lastUpdated} />
        <Text fontSize="sm" color="text.muted">
          Data syncs every 2-5 minutes
        </Text>
      </HStack>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">Total Groups</Text>
          <Text fontSize="2xl" fontFamily="mono">{stats.data?.totalGroups || "—"}</Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">Active Groups</Text>
          <Text fontSize="2xl" fontFamily="mono" color="severity.critical.500">{stats.data?.activeGroups || "—"}</Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">Total Victims</Text>
          <Text fontSize="2xl" fontFamily="mono">{stats.data?.totalVictims?.toLocaleString() || "—"}</Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">New This Week</Text>
          <Text fontSize="2xl" fontFamily="mono" color="accent.400">{stats.data?.newVictimsThisWeek || "—"}</Text>
        </Box>
      </SimpleGrid>

      {/* API Notice */}
      <Alert status="info" mb={8}>
        <AlertIcon />
        <Box>
          <AlertTitle>Real-time API Integration</AlertTitle>
          <AlertDescription>
            This tracker uses the <Code fontSize="xs">Ransomware.live API</Code> for real-time threat intelligence. 
            API Key: <Code fontSize="xs">be0ace70-30ff-4158-9a58-567ad29ddaf6</Code>
          </AlertDescription>
        </Box>
      </Alert>

      {/* Trend Chart */}
      <Box mb={8}>
        <Heading size="md" mb={3}>
          30-Day Attack Trend
        </Heading>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          {trends.isLoading ? (
            <Box h="256px">
              <Skeleton h="full" />
            </Box>
          ) : trends.data ? (
            <TrendLineChart data={trends.data.data.map(d => ({ date: d.date, count: d.victims }))} color="#dc2626" />
          ) : (
            <Text color="text.muted">No trend data available</Text>
          )}
        </Box>
      </Box>

      <VStack spacing={8} align="stretch">
        {/* Active Groups Grid */}
        <Box>
          <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
            <Skull size={20} color="#dc2626" />
            Known Ransomware Groups
          </Heading>
          {groups.isLoading ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} height="120px" borderRadius="md" />
              ))}
            </SimpleGrid>
          ) : filteredGroups.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {filteredGroups.map((group) => (
                <Box 
                  key={group.slug} 
                  p={4} 
                  borderWidth="1px" 
                  borderColor={group.active ? "severity.critical.500" : "border.default"} 
                  borderRadius="md" 
                  bg="charcoal.800"
                  cursor="pointer"
                  onClick={() => setSelectedGroup(group.name)}
                  _hover={{ bg: "charcoal.700" }}
                >
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">{group.name}</Text>
                    <Badge colorScheme={group.active ? "red" : "gray"} variant="solid">
                      {group.active ? "Active" : "Inactive"}
                    </Badge>
                  </HStack>
                  {group.description && (
                    <Text fontSize="sm" color="text.muted" mb={2} noOfLines={2}>
                      {group.description}
                    </Text>
                  )}
                  <HStack spacing={1} mt={2}>
                    <TrendingUp size={14} color="accent.400" />
                    <Text fontSize="xs" color="text.muted" fontFamily="mono">
                      {group.victims || 0} victims
                    </Text>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="text.muted">No ransomware groups data available.</Text>
          )}
        </Box>

        {/* Recent Victims Table */}
        <Box>
          <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
            <AlertTriangle size={20} color="#ea580c" />
            Recent Victim Claims
          </Heading>
          
          {/* Filters */}
          <HStack spacing={4} mb={4}>
            <Select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              maxW="200px"
              size="sm"
              bg="charcoal.800"
              borderColor="border.default"
            >
              <option value="all">All Groups</option>
              {(groups.data?.data || []).map(g => (
                <option key={g.slug} value={g.name}>{g.name}</option>
              ))}
            </Select>
            <Input
              placeholder="Search victim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              maxW="250px"
              size="sm"
              bg="charcoal.800"
              borderColor="border.default"
            />
          </HStack>

          {victims.isLoading ? (
            <Stack spacing={2}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} height="48px" borderRadius="md" />
              ))}
            </Stack>
          ) : filteredVictims.length > 0 ? (
            <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" overflow="hidden">
              <Table size="sm" variant="simple">
                <Thead bg="charcoal.800">
                  <Tr>
                    <Th color="text.muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Victim</Th>
                    <Th color="text.muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Group</Th>
                    <Th color="text.muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Country</Th>
                    <Th color="text.muted" fontSize="xs" textTransform="uppercase" letterSpacing="wide">Published</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredVictims.slice(0, 10).map((victim) => (
                    <Tr key={victim.id} _hover={{ bg: "charcoal.800" }}>
                      <Td fontWeight="medium">{victim.name}</Td>
                      <Td>
                        <Badge colorScheme="red" variant="solid" size="sm">
                          {victim.groupName}
                        </Badge>
                      </Td>
                      <Td color="text.muted">{victim.country || "—"}</Td>
                      <Td fontFamily="mono" fontSize="xs" color="text.muted">
                        {new Date(victim.publishedDate).toLocaleDateString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Text color="text.muted">No victim claims available.</Text>
          )}
        </Box>

        {/* Related News */}
        <Box>
          <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
            <Activity size={20} color="#22d3ee" />
            Ransomware News
          </Heading>
          {ransomwareNews.isLoading ? (
            <Stack spacing={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height="48px" borderRadius="md" />
              ))}
            </Stack>
          ) : ransomwareNews.data && ransomwareNews.data.data.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {ransomwareNews.data.data.slice(0, 5).map((article) => (
                <Box key={article.id} p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="medium">{article.sourceName}</Text>
                    {article.publishedDate && (
                      <Text fontSize="xs" color="text.muted">
                        {new Date(article.publishedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </HStack>
                  <Text fontSize="sm" color="text.muted" mb={2} noOfLines={2}>
                    {article.title}
                  </Text>
                  {article.sourceUrl && (
                    <HStack spacing={1}>
                      <ExternalLink size={12} color="accent.400" />
                      <Link href={article.sourceUrl} isExternal color="accent.400" fontSize="xs">
                        Read more
                      </Link>
                    </HStack>
                  )}
                </Box>
              ))}
            </VStack>
          ) : (
            <Text color="text.muted">No news articles available.</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
