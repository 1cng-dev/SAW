import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
  Flex,
  useColorModeValue,
  Divider,
  Wrap,
  WrapItem,
  Skeleton,
} from "@chakra-ui/react";
import { Search, Globe2, Network, Fingerprint, Radar, Download, MapPin } from "lucide-react";
import { useOsintAggregate } from "../hooks/useOsintAggregate";
import { AdditionalSourcesPanel } from "../components/osint/AdditionalSourcesPanel";

const EXAMPLES: { type: string; value: string; hint: string }[] = [
  { type: "DOMAIN", value: "anthropic.com", hint: "Registrar, DNS, certs, subdomains, Wayback history" },
  { type: "DOMAIN", value: "cisa.gov", hint: "Government domain WHOIS + DNS" },
  { type: "IP", value: "8.8.8.8", hint: "Network range, reverse DNS, reputation" },
  { type: "IP", value: "1.1.1.1", hint: "APNIC-allocated range" },
  { type: "ASN", value: "AS15169", hint: "Google LLC autonomous system + prefixes" },
  { type: "ASN", value: "AS13335", hint: "Cloudflare autonomous system" },
];

function freshnessColor(responded: number, total: number) {
  if (total === 0) return "gray";
  const ratio = responded / total;
  if (ratio >= 0.75) return "green";
  if (ratio >= 0.4) return "orange";
  return "red";
}

export function OsintSearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [isLoadingMyIp, setIsLoadingMyIp] = useState(false);
  const [myIpError, setMyIpError] = useState<string | null>(null);
  const state = useOsintAggregate(query);
  const cardBg = useColorModeValue("white", "bg.surface");

  const rdap = state.results.RDAP;
  const rdapData = rdap?.status === "ok" ? (rdap.data as any) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setQuery(input.trim());
  };

  const runExample = (value: string) => {
    setInput(value);
    setQuery(value);
  };

  const handleMyIp = async () => {
    setIsLoadingMyIp(true);
    setMyIpError(null);
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      if (!response.ok) throw new Error(`ipify returned HTTP ${response.status}`);
      const data = (await response.json()) as { ip: string };
      runExample(data.ip);
    } catch (error) {
      setMyIpError(error instanceof Error ? error.message : "Could not determine your public IP");
    } finally {
      setIsLoadingMyIp(false);
    }
  };

  const handleExport = () => {
    const payload = { query: state.query, results: state.results, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `osint-${state.query?.value ?? "lookup"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box mb={8}>
        <Flex align="center" justify="space-between" mb={4}>
          <HStack spacing={3}>
            <Box p={3} borderRadius="xl" bg={useColorModeValue("orange.50", "orange.900/20")} borderWidth="1px" borderColor={useColorModeValue("orange.200", "orange.700")}>
              <Radar size={24} color="#ea580c" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>OSINT / Network Search</Heading>
              <HStack spacing={2}>
                <Badge colorScheme="orange" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}><Globe2 size={10} /><Text>Live Multi-Source Lookup</Text></HStack>
                </Badge>
                <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}><Network size={10} /><Text>No API Key Required</Text></HStack>
                </Badge>
              </HStack>
            </Box>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="md">
          Look up domains, IP addresses, and autonomous systems (ASNs) across RDAP, DNS, certificate transparency logs,
          RIPEstat/BGPView routing data, the Wayback Machine, and public threat-feed reputation &mdash; all free,
          real-time registry/API data, no fabricated results.
        </Text>
        <Divider mt={6} borderColor="border.default" />
      </Box>

      <Box as="form" onSubmit={handleSearch} mb={6}>
        <HStack>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a domain, IP address, or ASN (e.g. AS15169)..."
            size="lg"
            fontFamily="mono"
          />
          <Button type="submit" size="lg" colorScheme="orange" isLoading={state.isStreaming}>
            <Search size={18} />
          </Button>
          <Button size="lg" variant="outline" borderColor="border.default" onClick={handleMyIp} isLoading={isLoadingMyIp} title="Look up your own public IP address">
            <MapPin size={18} />
            <Text ml={2} display={{ base: "none", md: "inline" }}>My IP</Text>
          </Button>
        </HStack>
        {myIpError && <Text fontSize="xs" color="severity.critical.500" mt={2}>{myIpError}</Text>}
      </Box>

      <Box mb={8}>
        <Text fontSize="sm" color="text.muted" mb={3} fontWeight="medium">
          Example lookups &mdash; click to run
        </Text>
        <Wrap spacing={3}>
          {EXAMPLES.map((ex) => (
            <WrapItem key={ex.value}>
              <Button variant="outline" size="sm" borderColor="border.default" onClick={() => runExample(ex.value)} title={ex.hint}>
                <Badge mr={2} fontSize="9px" colorScheme="gray" variant="solid">{ex.type}</Badge>
                <Text fontFamily="mono">{ex.value}</Text>
              </Button>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {state.connectionError && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Lookup failed</AlertTitle>
            <AlertDescription>{state.connectionError}</AlertDescription>
          </Box>
        </Alert>
      )}

      {state.query && (
        <VStack spacing={6} align="stretch">
          {/* Freshness + export bar */}
          <HStack justify="space-between" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg} px={5} py={3}>
            <HStack spacing={2}>
              <Box width="8px" height="8px" borderRadius="full" bg={`${freshnessColor(state.sourcesResponded, state.totalSources)}.500`} />
              <Text fontSize="sm" color="text.muted">
                {state.isStreaming
                  ? `Querying ${state.totalSources} sources...`
                  : `${state.sourcesResponded}/${state.totalSources} sources responded`}
                {state.cached && !state.isStreaming && " (cached)"}
              </Text>
            </HStack>
            <Button size="sm" variant="outline" leftIcon={<Download size={14} />} onClick={handleExport} isDisabled={!state.isDone}>
              Export JSON
            </Button>
          </HStack>

          {/* RDAP-backed registration summary (kept from the original page) */}
          <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg} p={6}>
            {!rdap ? (
              <Skeleton h="24px" w="240px" />
            ) : rdap.status !== "ok" ? (
              <Text fontSize="sm" color="text.muted">No RDAP record found for &quot;{state.query.value}&quot;.</Text>
            ) : (
              <>
                <HStack justify="space-between" mb={4}>
                  <HStack spacing={3}>
                    <Code fontSize="lg" fontFamily="mono" color="accent.400">{rdapData.name}</Code>
                    <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>{rdapData.queryType.toUpperCase()}</Badge>
                  </HStack>
                  <HStack spacing={1}>
                    {rdapData.status.map((s: string) => <Badge key={s} colorScheme="gray" variant="outline" fontSize="xs">{s}</Badge>)}
                  </HStack>
                </HStack>
                <Text fontSize="xs" color="text.muted" fontFamily="mono">Source: {rdapData.source}</Text>
              </>
            )}
          </Box>

          {rdap?.status === "ok" && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg} p={6}>
                <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                  <Fingerprint size={16} /> Registration Details
                </Heading>
                <VStack align="stretch" spacing={2} fontSize="sm">
                  <HStack justify="space-between"><Text color="text.muted">Registrar</Text><Text>{rdapData.registrar?.name ?? "—"}</Text></HStack>
                  <HStack justify="space-between"><Text color="text.muted">Registrant Org</Text><Text>{rdapData.registrant?.name ?? "—"}</Text></HStack>
                  <HStack justify="space-between"><Text color="text.muted">Registered</Text><Text fontFamily="mono">{rdapData.events.registered ? new Date(rdapData.events.registered).toLocaleDateString() : "—"}</Text></HStack>
                  <HStack justify="space-between"><Text color="text.muted">Last Changed</Text><Text fontFamily="mono">{rdapData.events.lastChanged ? new Date(rdapData.events.lastChanged).toLocaleDateString() : "—"}</Text></HStack>
                  <HStack justify="space-between"><Text color="text.muted">Expires</Text><Text fontFamily="mono">{rdapData.events.expires ? new Date(rdapData.events.expires).toLocaleDateString() : "—"}</Text></HStack>
                </VStack>
              </Box>

              <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg} p={6}>
                <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                  <Network size={16} /> {rdapData.queryType === "domain" ? "Nameservers" : "Network Range"}
                </Heading>
                {rdapData.queryType === "domain" ? (
                  rdapData.nameservers.length > 0 ? (
                    <VStack align="stretch" spacing={1}>
                      {rdapData.nameservers.map((ns: string) => <Code key={ns} fontSize="sm" fontFamily="mono">{ns}</Code>)}
                    </VStack>
                  ) : (
                    <Text fontSize="sm" color="text.muted">No nameservers returned.</Text>
                  )
                ) : rdapData.network ? (
                  <VStack align="stretch" spacing={2} fontSize="sm">
                    <HStack justify="space-between"><Text color="text.muted">Start</Text><Code>{rdapData.network.startAddress ?? "—"}</Code></HStack>
                    <HStack justify="space-between"><Text color="text.muted">End</Text><Code>{rdapData.network.endAddress ?? "—"}</Code></HStack>
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="text.muted">No network range returned.</Text>
                )}
              </Box>
            </SimpleGrid>
          )}

          <AdditionalSourcesPanel state={state} />
        </VStack>
      )}

      {!state.query && (
        <Alert status="info">
          <AlertIcon />
          <Box>
            <AlertTitle>Supported lookups</AlertTitle>
            <AlertDescription>
              This page queries live RDAP, DNS, certificate transparency, RIPEstat/BGPView, Wayback Machine, and
              public threat-feed data directly &mdash; no fabricated or cached-forever data. Reverse lookups by name,
              email, phone, or registrant (pivoting across many domains) require a paid WHOIS-history data provider
              that isn&apos;t configured for this deployment, so those modes aren&apos;t offered here.
            </AlertDescription>
          </Box>
        </Alert>
      )}
    </Box>
  );
}
