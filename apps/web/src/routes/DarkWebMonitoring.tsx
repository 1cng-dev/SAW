import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Input,
  Button,
  Badge,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { Plus, Eye, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import { useDarkWebKeywords, useDarkWebMatches, useAddDarkWebKeyword, useDeleteDarkWebKeyword } from "../api/hooks";

const RISK_COLORS: Record<string, string> = { critical: "red", high: "orange", medium: "yellow", low: "gray" };

function SourceStatusBar() {
  const matches = useDarkWebMatches();
  if (!matches.data) return null;

  return (
    <Wrap spacing={2} mb={6}>
      {matches.data.sources.map((s) => (
        <WrapItem key={s.source}>
          <HStack
            fontSize="xs"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="full"
            px={3}
            py={1}
            bg="bg.surface"
            title={s.error ?? `Last synced ${new Date(s.lastSyncedAt).toLocaleString()}`}
          >
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg={s.status === "ok" ? "green.400" : s.status === "unavailable" ? "red.400" : "gray.500"}
            />
            <Text color="text.muted">{s.source}</Text>
            {s.status === "unavailable" && <Badge colorScheme="red" fontSize="8px">Unavailable</Badge>}
            {s.status === "not_configured" && <Badge colorScheme="gray" fontSize="8px">Not Configured</Badge>}
          </HStack>
        </WrapItem>
      ))}
    </Wrap>
  );
}

export function DarkWebMonitoringPage() {
  const keywords = useDarkWebKeywords();
  const matches = useDarkWebMatches();
  const addKeyword = useAddDarkWebKeyword();
  const deleteKeyword = useDeleteDarkWebKeyword();
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (!input.trim()) return;
    addKeyword.mutate(input.trim(), { onSuccess: () => setInput("") });
  };

  const unavailableSources = matches.data?.sources.filter((s) => s.status === "unavailable") ?? [];
  const mostRecentSync = matches.data?.sources.reduce<string | null>((latest, s) => {
    if (s.status !== "ok") return latest;
    return !latest || s.lastSyncedAt > latest ? s.lastSyncedAt : latest;
  }, null);

  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Heading size="lg">Dark Web Monitoring</Heading>
        <Button size="sm" leftIcon={<RefreshCw size={14} />} variant="outline" onClick={() => matches.refetch()} isLoading={matches.isFetching}>
          Refresh
        </Button>
      </HStack>
      <Text color="text.muted" fontSize="sm" mb={4}>
        Track organization keywords (company name, domains, executive emails) against real breach-notification
        feeds, paste-site news, and this platform's own ransomware tracker data.
      </Text>

      {mostRecentSync && (
        <HStack fontSize="xs" color="text.muted" mb={2}>
          <Clock size={12} />
          <Text>Last synced: {new Date(mostRecentSync).toLocaleString()}</Text>
        </HStack>
      )}
      <SourceStatusBar />

      {unavailableSources.length > 0 && (
        <Alert status="warning" mb={6} fontSize="sm">
          <AlertIcon />
          {unavailableSources.map((s) => s.source).join(", ")} {unavailableSources.length === 1 ? "is" : "are"} temporarily unavailable — results may be incomplete.
        </Alert>
      )}

      <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5} mb={6}>
        <Text fontSize="sm" fontWeight="medium" mb={3}>Tracked Keywords</Text>
        <HStack mb={3}>
          <Input
            placeholder="e.g. 1cloudng.com, exec@1cloudng.com"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button leftIcon={<Plus size={16} />} colorScheme="orange" onClick={handleAdd} isLoading={addKeyword.isPending}>Add</Button>
        </HStack>
        {keywords.isLoading ? (
          <Skeleton h="32px" />
        ) : keywords.isError ? (
          <Alert status="error" fontSize="sm"><AlertIcon />Failed to load keywords.</Alert>
        ) : keywords.data && keywords.data.data.length > 0 ? (
          <Wrap spacing={2}>
            {keywords.data.data.map((k) => (
              <WrapItem key={k.id}>
                <Tag size="lg" variant="solid" colorScheme="orange" borderRadius="full">
                  <TagLabel>{k.keyword}</TagLabel>
                  <TagCloseButton onClick={() => deleteKeyword.mutate(k.id)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Text fontSize="sm" color="text.muted">No keywords tracked yet.</Text>
        )}
      </Box>

      <Heading size="md" mb={3}>Matches</Heading>
      {matches.isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="120px" borderRadius="xl" />)}
        </SimpleGrid>
      ) : matches.isError ? (
        <Alert status="error"><AlertIcon />Failed to load matches. <Button size="xs" ml={3} onClick={() => matches.refetch()}>Retry</Button></Alert>
      ) : !matches.data || matches.data.data.length === 0 ? (
        <Box p={12} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Eye size={32} color="#64748b" style={{ margin: "0 auto 12px" }} />
          <Text color="text.muted">
            {keywords.data && keywords.data.data.length > 0 ? "No matches found for tracked keywords across active sources." : "Add a keyword above to start monitoring."}
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {matches.data.data.map((match, i) => (
            <Box key={i} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" fontFamily="mono" color="text.muted">{match.source}</Text>
                <Badge colorScheme={RISK_COLORS[match.riskLevel]} fontSize="9px" display="flex" alignItems="center" gap={1}>
                  {match.riskLevel === "critical" && <AlertTriangle size={10} />}
                  {match.riskLevel}
                </Badge>
              </HStack>
              <Text fontSize="sm" mb={2}>{match.snippet}</Text>
              <HStack justify="space-between" fontSize="xs" color="text.muted">
                <Text>Keyword: <Text as="span" fontFamily="mono">{match.matchedKeyword}</Text></Text>
                <Text>{new Date(match.dateFound).toLocaleDateString()}</Text>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
