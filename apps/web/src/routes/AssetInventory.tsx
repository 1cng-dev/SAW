import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  IconButton,
  Input,
  Select,
  HStack,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  Skeleton,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { Server, Globe, Package, Plus, Trash2, RefreshCw, ShieldAlert } from "lucide-react";
import { StatCard } from "../components/ui/StatCard";
import { useAssets, useAssetSummary, useCreateAsset, useDeleteAsset, useRematchAsset } from "../api/hooks";
import type { Asset } from "../api/types";

const TYPE_ICON = { ip: Server, domain: Globe, software: Package } as const;

export function AssetInventoryPage() {
  const assets = useAssets();
  const summary = useAssetSummary();
  const createAsset = useCreateAsset();
  const deleteAsset = useDeleteAsset();
  const rematchAsset = useRematchAsset();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [form, setForm] = useState({ assetType: "software", name: "", value: "", version: "", notes: "" });

  const handleCreate = () => {
    if (!form.name.trim() || !form.value.trim()) {
      toast({ title: "Name and value are required", status: "warning", duration: 2500 });
      return;
    }
    createAsset.mutate(form, {
      onSuccess: () => {
        toast({ title: "Asset registered", status: "success", duration: 2000 });
        setForm({ assetType: "software", name: "", value: "", version: "", notes: "" });
        onClose();
      },
      onError: (e) => toast({ title: "Failed to add asset", description: (e as Error).message, status: "error", duration: 3000 }),
    });
  };

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Box>
          <Heading size="lg">Asset Inventory / Vulnerability Scanner</Heading>
          <Text color="text.muted" fontSize="sm" mt={1}>
            Register IPs, domains, and software/vendor names to cross-match against the CVE Database.
          </Text>
        </Box>
        <Button colorScheme="orange" leftIcon={<Plus size={16} />} onClick={onOpen}>
          Add Asset
        </Button>
      </HStack>

      <Alert status="info" mb={6} fontSize="sm">
        <AlertIcon />
        Cross-matching only applies to <b>software</b> assets, matched against real CVE vendor/product names ingested
        from NVD. It's a vendor/product-name match, not precise per-version CPE matching (that data isn't ingested).
        IP/domain assets are tracked for inventory only.
      </Alert>

      {/* Summary cards */}
      {summary.isLoading ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={6}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="100px" borderRadius="xl" />)}
        </SimpleGrid>
      ) : summary.data ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={6}>
          <StatCard label="Total Assets" value={summary.data.totalAssets} icon={Server} />
          <StatCard label="Assets w/ Known Vulns" value={summary.data.assetsWithMatches} icon={ShieldAlert} accentColor="severity.critical.500" status="critical" />
          <StatCard label="Unique Matched CVEs" value={summary.data.totalUniqueMatchedCves} icon={Package} accentColor="accent.400" />
          <StatCard
            label="Critical + High"
            value={summary.data.severityBreakdown.critical + summary.data.severityBreakdown.high}
            icon={ShieldAlert}
            accentColor="severity.high.500"
            status="high"
          />
        </SimpleGrid>
      ) : null}

      {/* Asset table */}
      <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" overflow="hidden">
        {assets.isLoading ? (
          <Box p={6}><Skeleton h="200px" /></Box>
        ) : assets.isError ? (
          <Box p={6}><Alert status="error"><AlertIcon />Failed to load assets.</Alert></Box>
        ) : !assets.data || assets.data.data.length === 0 ? (
          <Box p={12} textAlign="center">
            <Text color="text.muted">No assets registered yet. Click "Add Asset" to start tracking your inventory.</Text>
          </Box>
        ) : (
          <Table size="sm">
            <Thead bg="charcoal.800">
              <Tr>
                <Th>Type</Th>
                <Th>Name</Th>
                <Th>Value</Th>
                <Th>Version</Th>
                <Th>Matches</Th>
                <Th>Last Matched</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {assets.data.data.map((asset: Asset) => {
                const Icon = TYPE_ICON[asset.assetType];
                return (
                  <Tr key={asset.id} _hover={{ bg: "charcoal.800" }}>
                    <Td><HStack spacing={1}><Icon size={14} /><Badge fontSize="9px">{asset.assetType}</Badge></HStack></Td>
                    <Td>
                      <Link to="/assets/$assetId" params={{ assetId: asset.id }}>
                        <Text color="accent.400" fontWeight="medium" fontSize="sm" _hover={{ textDecoration: "underline" }}>{asset.name}</Text>
                      </Link>
                    </Td>
                    <Td fontFamily="mono" fontSize="sm">{asset.value}</Td>
                    <Td fontSize="sm" color="text.muted">{asset.version ?? "—"}</Td>
                    <Td>
                      {asset.matchedCveIds.length > 0 ? (
                        <Badge colorScheme="red" fontSize="10px">{asset.matchedCveIds.length} CVEs</Badge>
                      ) : (
                        <Text fontSize="xs" color="text.muted">none</Text>
                      )}
                    </Td>
                    <Td fontSize="xs" color="text.muted">{asset.lastMatchedAt ? new Date(asset.lastMatchedAt).toLocaleDateString() : "—"}</Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Rematch"
                          icon={<RefreshCw size={14} />}
                          size="xs"
                          variant="ghost"
                          isLoading={rematchAsset.isPending}
                          onClick={() => rematchAsset.mutate(asset.id)}
                        />
                        <IconButton
                          aria-label="Delete"
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => deleteAsset.mutate(asset.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="bg.surface">
          <ModalHeader>Register Asset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Type</FormLabel>
                <Select value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })}>
                  <option value="software">Software / Vendor</option>
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Name</FormLabel>
                <Input placeholder="e.g. Production Web Server" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">
                  {form.assetType === "software" ? "Vendor / Product name" : form.assetType === "ip" ? "IP Address" : "Domain"}
                </FormLabel>
                <Input
                  fontFamily="mono"
                  placeholder={form.assetType === "software" ? "e.g. adobe" : form.assetType === "ip" ? "e.g. 203.0.113.5" : "e.g. example.com"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </FormControl>
              {form.assetType === "software" && (
                <FormControl>
                  <FormLabel fontSize="sm">Version (optional)</FormLabel>
                  <Input placeholder="e.g. 2021" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
                </FormControl>
              )}
              <FormControl>
                <FormLabel fontSize="sm">Notes (optional)</FormLabel>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="orange" onClick={handleCreate} isLoading={createAsset.isPending}>Add Asset</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
