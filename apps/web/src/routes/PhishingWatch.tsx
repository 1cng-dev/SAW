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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Alert,
  AlertIcon,
  useToast,
  Tag,
  TagLabel,
  IconButton,
} from "@chakra-ui/react";
import { Plus, RefreshCw, Trash2, ShieldAlert } from "lucide-react";
import {
  usePhishingWatches,
  usePhishingResults,
  useCreatePhishingWatch,
  useRescanPhishingWatch,
  useDeletePhishingWatch,
} from "../api/hooks";

const VARIATION_LABELS: Record<string, string> = {
  character_swap: "Char Swap",
  hyphenation: "Hyphenation",
  tld_swap: "TLD Swap",
  homoglyph: "Homoglyph",
};

function WatchResults({ watchId }: { watchId: string }) {
  const results = usePhishingResults(watchId);
  const rescan = useRescanPhishingWatch();

  if (results.isLoading) return <Skeleton h="150px" />;
  if (results.isError) {
    return (
      <Alert status="error" fontSize="sm">
        <AlertIcon />
        Failed to load scan results.
        <Button size="xs" ml={3} onClick={() => results.refetch()}>Retry</Button>
      </Alert>
    );
  }
  const rows = results.data?.data ?? [];
  const registered = rows.filter((r) => r.isRegistered);
  const lastSynced = rows.length > 0 ? rows.map((r) => r.scannedAt).sort().at(-1) : null;

  if (rows.length === 0) {
    return (
      <Box>
        <Text fontSize="sm" color="text.muted" mb={3}>No scan results yet.</Text>
        <Button size="xs" leftIcon={<RefreshCw size={12} />} variant="outline" onClick={() => rescan.mutate(watchId)} isLoading={rescan.isPending}>
          Scan Now
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={1}>
        <Text fontSize="sm" color="text.muted">
          {rows.length} variation{rows.length === 1 ? "" : "s"} checked via RDAP &middot; {registered.length} registered
        </Text>
        <Button size="xs" leftIcon={<RefreshCw size={12} />} variant="outline" onClick={() => rescan.mutate(watchId)} isLoading={rescan.isPending}>
          Rescan
        </Button>
      </HStack>
      {lastSynced && (
        <Text fontSize="xs" color="text.muted" mb={3}>
          Last synced: {new Date(lastSynced).toLocaleString()}
        </Text>
      )}
      {registered.length > 0 && (
        <Alert status="error" mb={3} fontSize="sm">
          <AlertIcon />
          {registered.length} look-alike domain{registered.length === 1 ? " is" : "s are"} registered &mdash; review for impersonation risk.
        </Alert>
      )}
      <Table size="sm">
        <Thead bg="charcoal.800">
          <Tr><Th>Variation</Th><Th>Type</Th><Th>Status</Th><Th>Registrar</Th><Th>Registered</Th></Tr>
        </Thead>
        <Tbody>
          {rows.filter((r) => r.isRegistered).concat(rows.filter((r) => !r.isRegistered)).map((r) => (
            <Tr key={r.id} _hover={{ bg: "charcoal.800" }}>
              <Td fontFamily="mono" fontSize="sm">{r.variation}</Td>
              <Td><Badge fontSize="9px">{VARIATION_LABELS[r.variationType]}</Badge></Td>
              <Td>
                {r.isRegistered ? (
                  <Badge colorScheme="red" fontSize="9px" display="inline-flex" alignItems="center" gap={1}>
                    <ShieldAlert size={10} /> Registered
                  </Badge>
                ) : (
                  <Badge colorScheme="gray" fontSize="9px">Available</Badge>
                )}
              </Td>
              <Td fontSize="xs" color="text.muted">{r.registrar ?? "—"}</Td>
              <Td fontSize="xs" color="text.muted">{r.registeredDate ? new Date(r.registeredDate).toLocaleDateString() : "—"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

export function PhishingWatchPage() {
  const watches = usePhishingWatches();
  const createWatch = useCreatePhishingWatch();
  const deleteWatch = useDeletePhishingWatch();
  const [input, setInput] = useState("");
  const toast = useToast();

  const handleAdd = () => {
    if (!input.trim()) return;
    createWatch.mutate(input.trim(), {
      onSuccess: () => {
        toast({ title: "Domain added, scan complete", status: "success", duration: 2500 });
        setInput("");
      },
      onError: (e) => toast({ title: "Failed to add watch", description: (e as Error).message, status: "error", duration: 3000 }),
    });
  };

  return (
    <Box>
      <Heading size="lg" mb={1}>Phishing / Domain Impersonation Alert</Heading>
      <Text color="text.muted" fontSize="sm" mb={4}>
        Generate typosquat/homoglyph variations of your brand domain and check real registration status via RDAP
        (the same integration used by OSINT / Network Search).
      </Text>

      <HStack mb={6}>
        <Input
          placeholder="e.g. 1cloudng.com"
          fontFamily="mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button leftIcon={<Plus size={16} />} colorScheme="orange" onClick={handleAdd} isLoading={createWatch.isPending}>
          Monitor Domain
        </Button>
      </HStack>
      {createWatch.isPending && (
        <Text fontSize="xs" color="text.muted" mb={4}>
          Generating variations and checking each via RDAP &mdash; this takes ~15-20 seconds since real registry lookups run in small batches.
        </Text>
      )}

      {watches.isLoading ? (
        <Skeleton h="100px" />
      ) : !watches.data || watches.data.data.length === 0 ? (
        <Box p={12} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Text color="text.muted">No domains monitored yet. Add your brand domain above.</Text>
        </Box>
      ) : (
        <VStack align="stretch" spacing={6}>
          {watches.data.data.map((watch) => (
            <Box key={watch.id} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5}>
              <HStack justify="space-between" mb={3}>
                <Tag size="lg" colorScheme="orange" borderRadius="full"><TagLabel fontFamily="mono">{watch.domain}</TagLabel></Tag>
                <IconButton aria-label="Delete" icon={<Trash2 size={14} />} size="sm" variant="ghost" colorScheme="red" onClick={() => deleteWatch.mutate(watch.id)} />
              </HStack>
              <WatchResults watchId={watch.id} />
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
