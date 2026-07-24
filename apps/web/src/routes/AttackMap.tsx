import { useState } from "react";
import { Box, Heading, Text, VStack, HStack, SimpleGrid, Badge, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Select, Link } from "@chakra-ui/react";
import { Globe, MapPin, AlertTriangle, Newspaper, ExternalLink } from 'lucide-react';
import { useNews, useCves } from "../api/hooks";

// Mock geographic data - in production, this would come from geocoded news/CVE data
const GEO_DATA = [
  { country: "United States", count: 45, lat: 37.0902, lng: -95.7129, recent: "Critical infrastructure attacks" },
  { country: "United Kingdom", count: 32, lat: 55.3781, lng: -3.4360, recent: "Financial sector breaches" },
  { country: "Germany", count: 28, lat: 51.1657, lng: 10.4515, recent: "Manufacturing ransomware" },
  { country: "China", count: 25, lat: 35.8617, lng: 104.1954, recent: "Supply chain attacks" },
  { country: "Russia", count: 22, lat: 61.5240, lng: 105.3188, recent: "State-sponsored activity" },
  { country: "Brazil", count: 18, lat: -14.2350, lng: -51.9253, recent: "Banking sector threats" },
  { country: "India", count: 15, lat: 20.5937, lng: 78.9629, recent: "IT services attacks" },
  { country: "France", count: 14, lat: 46.2276, lng: 2.2137, recent: "Government agency breaches" },
  { country: "Japan", count: 12, lat: 36.2048, lng: 138.2529, recent: "Technology sector threats" },
  { country: "Australia", count: 10, lat: -25.2744, lng: 133.7751, recent: "Healthcare data breaches" },
];

export function AttackMapPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  const news = useNews({ pageSize: 20 });
  const cves = useCves({ pageSize: 20 });

  const filteredData = selectedRegion === "all" 
    ? GEO_DATA 
    : GEO_DATA.filter(d => d.country === selectedRegion);

  const totalIncidents = GEO_DATA.reduce((sum, d) => sum + d.count, 0);

  return (
    <Box>
      <Heading size="lg" mb={2}>
        Global Attack/Advisory Map
      </Heading>
      <Text color="text.muted" mb={6}>
        Visualize security threats and advisories across the world.
      </Text>

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={8}>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">Total Incidents</Text>
          <Text fontSize="2xl" fontFamily="mono" color="accent.400">{totalIncidents}</Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">Countries Affected</Text>
          <Text fontSize="2xl" fontFamily="mono">{GEO_DATA.length}</Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">News Articles</Text>
          <Text fontSize="2xl" fontFamily="mono">{news.data?.total || 0}</Text>
        </Box>
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={4}>
          <Text fontSize="xs" color="text.muted" textTransform="uppercase" letterSpacing="wide">Active CVEs</Text>
          <Text fontSize="2xl" fontFamily="mono">{cves.data?.total || 0}</Text>
        </Box>
      </SimpleGrid>

      {/* API Notice */}
      <Alert status="info" mb={8}>
        <AlertIcon />
        <Box>
          <AlertTitle>Interactive Map Integration</AlertTitle>
          <AlertDescription>
            For an interactive world map, integrate <Code fontSize="xs">react-simple-maps</Code> or similar libraries. 
            Currently showing geographic data in a tabular format with incident counts by country.
          </AlertDescription>
        </Box>
      </Alert>

      {/* Filters */}
      <HStack spacing={4} mb={6}>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          maxW="150px"
          size="sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </Select>
        <Select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          maxW="200px"
          size="sm"
        >
          <option value="all">All Regions</option>
          {GEO_DATA.map(d => (
            <option key={d.country} value={d.country}>{d.country}</option>
          ))}
        </Select>
      </HStack>

      <VStack spacing={8} align="stretch">
        {/* Geographic Data */}
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
          <HStack mb={4}>
            <Globe size={20} color="#f97316" />
            <Heading size="md">Incidents by Region</Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {filteredData.map((data) => (
              <Box key={data.country} p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack justify="space-between" mb={2}>
                  <Text fontWeight="medium">{data.country}</Text>
                  <Badge colorScheme="orange">{data.count} incidents</Badge>
                </HStack>
                <Text fontSize="sm" color="text.muted">{data.recent}</Text>
                <HStack spacing={1} mt={2} fontSize="xs" color="text.muted">
                  <MapPin size={12} />
                  <Text>{data.lat.toFixed(2)}, {data.lng.toFixed(2)}</Text>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Recent News by Region */}
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
          <HStack mb={4}>
            <Newspaper size={20} color="#22d3ee" />
            <Heading size="md">Recent Security News</Heading>
          </HStack>
          {news.isLoading ? (
            <Text color="text.muted">Loading news...</Text>
          ) : news.data && news.data.data.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {news.data.data.slice(0, 8).map((article) => (
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
            <Text color="text.muted">No recent news available.</Text>
          )}
        </Box>

        {/* High-Activity Regions */}
        <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
          <HStack mb={4}>
            <AlertTriangle size={20} color="#dc2626" />
            <Heading size="md">High-Activity Regions</Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {GEO_DATA.slice(0, 6).map((data, idx) => (
              <HStack key={data.country} p={3} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <Text fontSize="lg" fontWeight="bold" color="accent.400">#{idx + 1}</Text>
                <Box flex={1}>
                  <Text fontWeight="medium">{data.country}</Text>
                  <Text fontSize="xs" color="text.muted">{data.recent}</Text>
                </Box>
                <Badge colorScheme={idx < 3 ? "red" : "orange"}>{data.count}</Badge>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}
