import { Link } from "@tanstack/react-router";
import { Box, Heading, Text, VStack, HStack, Badge, IconButton, Button, Divider } from "@chakra-ui/react";
import { Trash2, RotateCcw } from "lucide-react";
import { useSearchHistory, type SearchModule } from "../hooks/useSearchHistory";

const MODULE_LABELS: Record<SearchModule, string> = { cves: "CVE Database", "threat-intel": "Threat Intel", osint: "OSINT Search" };
const MODULE_COLORS: Record<SearchModule, string> = { cves: "purple", "threat-intel": "orange", osint: "cyan" };

function rerunLink(module: SearchModule, query: string) {
  if (module === "cves") return { to: "/cves" as const, search: { search: query } };
  if (module === "threat-intel") return { to: "/threat-intel" as const, search: { q: query } };
  return { to: "/osint" as const, search: { q: query } };
}

export function SearchHistoryPage() {
  const { history, saved, removeSaved, clearHistory } = useSearchHistory();

  return (
    <Box>
      <Heading size="lg" mb={1}>Search History / Saved Searches</Heading>
      <Text color="text.muted" fontSize="sm" mb={6}>
        Real queries logged as you search the CVE Database, Threat Intel / IOC Lookup, and OSINT / Network Search.
      </Text>

      <Heading size="md" mb={3}>Saved Searches</Heading>
      {saved.length === 0 ? (
        <Box p={6} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" mb={8}>
          <Text color="text.muted" fontSize="sm">No saved searches yet. Use the "Save" button on Threat Intel or OSINT Search results.</Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={2} mb={8}>
          {saved.map((s) => (
            <HStack key={s.id} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="lg" p={3} justify="space-between">
              <HStack>
                <Badge colorScheme={MODULE_COLORS[s.module]} fontSize="9px">{MODULE_LABELS[s.module]}</Badge>
                <Text fontFamily="mono" fontSize="sm">{s.query}</Text>
              </HStack>
              <HStack>
                <Link {...rerunLink(s.module, s.query)}>
                  <Button size="xs" leftIcon={<RotateCcw size={12} />} variant="outline">Rerun</Button>
                </Link>
                <IconButton aria-label="Remove" icon={<Trash2 size={14} />} size="xs" variant="ghost" colorScheme="red" onClick={() => removeSaved(s.id)} />
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}

      <Divider mb={6} />

      <HStack justify="space-between" mb={3}>
        <Heading size="md">Recent Searches</Heading>
        {history.length > 0 && <Button size="xs" variant="ghost" onClick={clearHistory}>Clear</Button>}
      </HStack>
      {history.length === 0 ? (
        <Box p={6} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Text color="text.muted" fontSize="sm">No search history yet.</Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={1}>
          {history.map((h) => (
            <HStack key={h.id} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="lg" px={3} py={2} justify="space-between">
              <HStack>
                <Badge colorScheme={MODULE_COLORS[h.module]} fontSize="9px">{MODULE_LABELS[h.module]}</Badge>
                <Text fontFamily="mono" fontSize="sm">{h.query}</Text>
              </HStack>
              <HStack>
                <Text fontSize="xs" color="text.muted">{new Date(h.timestamp).toLocaleString()}</Text>
                <Link {...rerunLink(h.module, h.query)}>
                  <IconButton aria-label="Rerun" icon={<RotateCcw size={12} />} size="xs" variant="ghost" />
                </Link>
              </HStack>
            </HStack>
          ))}
        </VStack>
      )}
    </Box>
  );
}
