import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Box, Heading, Text, Input, Button, VStack, HStack, Badge, SimpleGrid, Alert, AlertIcon, AlertTitle, AlertDescription, Code, Link, Flex, useColorModeValue, Divider, Wrap, WrapItem, useToast } from "@chakra-ui/react";
import { Search, Shield, AlertTriangle, CheckCircle, HelpCircle, ExternalLink, Radar, Globe, Lock, Activity, Bookmark } from "lucide-react";
import { useThreatIntelLookup } from "../api/hooks";
import { useSearchHistory } from "../hooks/useSearchHistory";
import { ExternalApiResultTable } from "../components/threatintel/ExternalApiResultTable";

const EXAMPLES: { type: string; value: string }[] = [
  { type: "IP", value: "185.220.101.45" },
  { type: "DOMAIN", value: "anthropic.com" },
  { type: "SHA-256", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
  { type: "URL", value: "https://example.com/path" },
];

export function ThreatIntelPage() {
  const search = useSearch({ strict: false }) as { q?: string };
  const navigate = useNavigate();
  const toast = useToast();
  const { logSearch, saveSearch } = useSearchHistory();
  const [indicator, setIndicator] = useState(search.q ?? "");
  const [searchQuery, setSearchQuery] = useState(search.q ?? "");
  const { data, isLoading, isError, error } = useThreatIntelLookup(searchQuery);

  const runSearch = (value: string) => {
    setSearchQuery(value);
    logSearch("threat-intel", value);
    navigate({ to: "/threat-intel", search: { q: value } });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (indicator.trim()) runSearch(indicator.trim());
  };

  const runExample = (value: string) => {
    setIndicator(value);
    runSearch(value);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "malicious": return "red";
      case "suspicious": return "orange";
      case "clean": return "green";
      default: return "gray";
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "malicious": return AlertTriangle;
      case "suspicious": return AlertTriangle;
      case "clean": return CheckCircle;
      default: return HelpCircle;
    }
  };

  return (
    <Box>
      {/* Enhanced Header Section */}
      <Box mb={8}>
        <Flex align="center" justify="space-between" mb={4}>
          <HStack spacing={3}>
            <Box 
              p={3} 
              borderRadius="xl" 
              bg={useColorModeValue("orange.50", "orange.900/20")}
              borderWidth="1px"
              borderColor={useColorModeValue("orange.200", "orange.700")}
            >
              <Radar size={24} color="#ea580c" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>
                Threat Intel / IOC Lookup
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="orange" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Globe size={10} />
                    <Text>Global Intelligence</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Shield size={10} />
                    <Text>Real-time Analysis</Text>
                  </HStack>
                </Badge>
              </HStack>
            </Box>
          </HStack>
          <HStack spacing={3} display={{ base: "none", md: "flex" }}>
            <Box textAlign="right">
              <Text fontSize="xs" color="text.muted" fontWeight="medium">Supported Indicators</Text>
              <HStack spacing={2} mt={1} justify="flex-end">
                <Badge variant="outline" fontSize="xs" colorScheme="gray">IP Addresses</Badge>
                <Badge variant="outline" fontSize="xs" colorScheme="gray">Domains</Badge>
                <Badge variant="outline" fontSize="xs" colorScheme="gray">Hashes</Badge>
                <Badge variant="outline" fontSize="xs" colorScheme="gray">URLs</Badge>
              </HStack>
            </Box>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="md">
          Search and analyze indicators of compromise (IPs, domains, hashes, URLs) across multiple threat intelligence sources.
        </Text>
        <Divider mt={6} borderColor="border.default" />
      </Box>

      <Box as="form" onSubmit={handleSearch} mb={8}>
        <HStack>
          <Input
            value={indicator}
            onChange={(e) => setIndicator(e.target.value)}
            placeholder="Enter IP, domain, hash, or URL..."
            size="lg"
            fontFamily="mono"
          />
          <Button type="submit" size="lg" colorScheme="orange" isLoading={isLoading}>
            <Search size={18} />
          </Button>
          {searchQuery && (
            <Button
              size="lg"
              variant="outline"
              leftIcon={<Bookmark size={16} />}
              onClick={() => {
                saveSearch("threat-intel", searchQuery);
                toast({ title: "Search saved", status: "success", duration: 1500 });
              }}
            >
              Save
            </Button>
          )}
        </HStack>
      </Box>

      <Box mb={8}>
        <Text fontSize="sm" color="text.muted" mb={3} fontWeight="medium">
          Example lookups &mdash; click to run
        </Text>
        <Wrap spacing={3}>
          {EXAMPLES.map((ex) => (
            <WrapItem key={ex.value}>
              <Button variant="outline" size="sm" borderColor="border.default" onClick={() => runExample(ex.value)}>
                <Badge mr={2} fontSize="9px" colorScheme="gray" variant="solid">{ex.type}</Badge>
                <Text fontFamily="mono" fontSize="xs" noOfLines={1} maxW="240px">{ex.value}</Text>
              </Button>
            </WrapItem>
          ))}
        </Wrap>
        <Text fontSize="xs" color="text.muted" mt={3} fontFamily="mono">
          Tip: paste any IPv4 address, domain name, MD5/SHA-1/SHA-256 hash, or full URL &mdash; the lookup checks
          real ransomware.live IOC data, CVE/news mentions, and (if configured) VirusTotal/AbuseIPDB.
        </Text>
      </Box>

      {isError && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message || "Failed to lookup indicator"}
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <VStack spacing={6} align="stretch">
          {/* Verdict Card */}
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
            <HStack justify="space-between" mb={4}>
              <HStack spacing={3}>
                <Code fontSize="lg" fontFamily="mono" color="accent.400">
                  {data.indicator}
                </Code>
                <Badge colorScheme={getVerdictColor(data.verdict)} fontSize="sm" px={3} py={1}>
                  {data.indicatorType?.toUpperCase()}
                </Badge>
              </HStack>
              <HStack spacing={2}>
                {(() => {
                  const Icon = getVerdictIcon(data.verdict);
                  return <Icon size={20} color={getVerdictColor(data.verdict) === "red" ? "#dc2626" : getVerdictColor(data.verdict) === "orange" ? "#ea580c" : getVerdictColor(data.verdict) === "green" ? "#22c55e" : "#64748b"} />;
                })()}
                <Badge colorScheme={getVerdictColor(data.verdict)} fontSize="md" px={3} py={1} textTransform="capitalize">
                  {data.verdict}
                </Badge>
              </HStack>
            </HStack>
            <HStack spacing={4}>
              <Text fontSize="sm" color="text.muted">
                Confidence: <Text as="span" fontWeight="medium" textTransform="capitalize">{data.confidence}</Text>
              </Text>
              {data.hasExternalAPI && (
                <Badge colorScheme="purple" variant="outline" fontSize="xs">
                  External APIs Enabled
                </Badge>
              )}
            </HStack>
          </Box>

          {/* Sources */}
          {data.sources && data.sources.length > 0 && (
            <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
              <Heading size="md" mb={4}>Sources</Heading>
              <VStack spacing={2} align="stretch">
                {data.sources.map((source: string, idx: number) => (
                  <Text key={idx} fontSize="sm" fontFamily="mono" color="text.muted">
                    {source}
                  </Text>
                ))}
              </VStack>
            </Box>
          )}

          {/* CVE Matches */}
          {data.cveMatches && data.cveMatches.length > 0 && (
            <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
              <Heading size="md" mb={4}>Related CVEs ({data.cveMatches.length})</Heading>
              <VStack spacing={3} align="stretch">
                {data.cveMatches.map((cve: any) => (
                  <Box key={cve.id} p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                    <HStack justify="space-between" mb={2}>
                      <Code fontSize="sm" fontFamily="mono" color="accent.400">{cve.id}</Code>
                      <Badge colorScheme={cve.severity === "critical" ? "red" : cve.severity === "high" ? "orange" : cve.severity === "medium" ? "yellow" : "blue"} fontSize="xs">
                        {cve.severity}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="text.muted" noOfLines={2}>
                      {cve.description}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* News Matches */}
          {data.newsMatches && data.newsMatches.length > 0 && (
            <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
              <Heading size="md" mb={4}>Related News ({data.newsMatches.length})</Heading>
              <VStack spacing={3} align="stretch">
                {data.newsMatches.map((news: any) => (
                  <Box key={news.id} p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">{news.sourceName}</Text>
                      <Text fontSize="xs" color="text.muted">
                        {news.publishedDate ? new Date(news.publishedDate).toLocaleDateString() : "Unknown date"}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="text.muted" mb={2} noOfLines={2}>
                      {news.title}
                    </Text>
                    {news.sourceUrl && (
                      <Link href={news.sourceUrl} isExternal color="accent.400" fontSize="xs">
                        <HStack spacing={1}>
                          <ExternalLink size={12} />
                          <Text>View source</Text>
                        </HStack>
                      </Link>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {/* External API Results */}
          {data.externalResults && data.externalResults.length > 0 && (
            <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" p={6}>
              <Heading size="md" mb={4}>External API Results</Heading>
              <VStack spacing={3} align="stretch">
                {data.externalResults.map((result: any, idx: number) => (
                  <Box key={idx} p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                    <HStack spacing={2} mb={3}>
                      <Shield size={16} color="accent.400" />
                      <Text fontSize="sm" fontWeight="medium">{result.source}</Text>
                    </HStack>
                    <ExternalApiResultTable source={result.source} data={result.data ?? {}} />
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          {!data.hasExternalAPI && (
            <Alert status="info">
              <AlertIcon />
              <Box>
                <AlertTitle>External APIs Not Configured</AlertTitle>
                <AlertDescription>
                  To enable enhanced threat intelligence, add the following environment variables:
                  <Code display="block" mt={2} p={2} bg="charcoal.800" fontSize="xs">
                    ABUSEIPDB_API_KEY=your_key_here<br />
                    VIRUSTOTAL_API_KEY=your_key_here
                  </Code>
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </VStack>
      )}
    </Box>
  );
}
