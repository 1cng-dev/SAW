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
  InputGroup,
  InputLeftElement,
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
  useColorModeValue,
  Flex,
  Divider,
  Tooltip,
  Textarea,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { Server, Globe, Package, Plus, Trash2, RefreshCw, ShieldAlert, Grid, List, Search, Eye } from "lucide-react";
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
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  const toast = useToast();
  const cardBg = useColorModeValue("white", "charcoal.800");

  const [form, setForm] = useState({ assetType: "software", name: "", value: "", version: "", notes: "" });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    if (!form.name.trim() || !form.value.trim()) {
      toast({ title: "Name and value are required", status: "warning", duration: 2500 });
      return;
    }
    createAsset.mutate(form, {
      onSuccess: () => {
        toast({ title: "Asset registered", status: "success", duration: 2000 });
        setForm({ assetType: "software", name: "", value: "", version: "", notes: "" });
        onAddModalClose();
      },
      onError: (e) => toast({ title: "Failed to add asset", description: (e as Error).message, status: "error", duration: 3000 }),
    });
  };

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    onDetailModalOpen();
  };

  const filteredAssets = assets.data?.data.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.value.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Box>
      {/* Enhanced Header */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Box 
              p={3} 
              borderRadius="xl" 
              bg={useColorModeValue("blue.50", "blue.900/20")}
              borderWidth="1px"
              borderColor={useColorModeValue("blue.200", "blue.700")}
            >
              <Server size={24} color="#3b82f6" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>Asset Inventory / Vulnerability Scanner</Heading>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Server size={10} />
                    <Text>{summary.data?.totalAssets || 0} Assets</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="red" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <ShieldAlert size={10} />
                    <Text>{summary.data?.assetsWithMatches || 0} Vulnerable</Text>
                  </HStack>
                </Badge>
              </HStack>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label="Table View">
              <IconButton
                aria-label="Table view"
                icon={<List size={18} />}
                variant={viewMode === 'table' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setViewMode('table')}
              />
            </Tooltip>
            <Tooltip label="Card View">
              <IconButton
                aria-label="Card view"
                icon={<Grid size={18} />}
                variant={viewMode === 'card' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setViewMode('card')}
              />
            </Tooltip>
            <Button leftIcon={<Plus size={16} />} colorScheme="blue" onClick={onAddModalOpen}>
              Add Asset
            </Button>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="sm">Register IPs, domains, and software/vendor names to cross-match against the CVE Database.</Text>
        <Divider mt={4} borderColor="border.default" />
      </Box>

      {/* Search Bar */}
      <HStack mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="#64748b" />
          </InputLeftElement>
          <Input
            placeholder="Search assets by name or value..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </HStack>

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

      {/* Add Asset Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack spacing={2}>
              <Plus size={20} color="#3b82f6" />
              <Text>Register Asset</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <HStack spacing={2} mb={2}>
                  <Server size={14} color="#64748b" />
                  <FormLabel fontSize="sm" fontWeight="medium">Type</FormLabel>
                </HStack>
                <Select value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })}>
                  <option value="software">Software / Vendor</option>
                  <option value="ip">IP Address</option>
                  <option value="domain">Domain</option>
                </Select>
              </FormControl>
              <FormControl>
                <HStack spacing={2} mb={2}>
                  <Package size={14} color="#64748b" />
                  <FormLabel fontSize="sm" fontWeight="medium">Name</FormLabel>
                </HStack>
                <Input placeholder="e.g. Production Web Server" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <HStack spacing={2} mb={2}>
                  <Globe size={14} color="#64748b" />
                  <FormLabel fontSize="sm" fontWeight="medium">
                    {form.assetType === "software" ? "Vendor / Product name" : form.assetType === "ip" ? "IP Address" : "Domain"}
                  </FormLabel>
                </HStack>
                <Input
                  fontFamily="mono"
                  placeholder={form.assetType === "software" ? "e.g. adobe" : form.assetType === "ip" ? "e.g. 203.0.113.5" : "e.g. example.com"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </FormControl>
              {form.assetType === "software" && (
                <FormControl>
                  <HStack spacing={2} mb={2}>
                    <Package size={14} color="#64748b" />
                    <FormLabel fontSize="sm" fontWeight="medium">Version (optional)</FormLabel>
                  </HStack>
                  <Input placeholder="e.g. 2021" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
                </FormControl>
              )}
              <FormControl>
                <HStack spacing={2} mb={2}>
                  <Server size={14} color="#64748b" />
                  <FormLabel fontSize="sm" fontWeight="medium">Notes (optional)</FormLabel>
                </HStack>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onAddModalClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleCreate} isLoading={createAsset.isPending} ml={3}>Add Asset</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Asset Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={onDetailModalClose} size="lg">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack spacing={2}>
              <Eye size={20} color="#3b82f6" />
              <Text>Asset Details</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAsset && (
              <VStack spacing={4} align="stretch">
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>Type</Text>
                    <Badge variant="outline">{selectedAsset.assetType}</Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>Name</Text>
                    <Text fontSize="sm" fontWeight="medium">{selectedAsset.name}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>Value</Text>
                    <Text fontSize="sm" fontFamily="mono">{selectedAsset.value}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>Version</Text>
                    <Text fontSize="sm">{selectedAsset.version ?? "—"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>CVE Matches</Text>
                    <Badge colorScheme="red" variant="subtle" px={2} py={1} borderRadius="full" fontSize="xs">
                      {selectedAsset.matchedCveIds.length} CVEs
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>Last Matched</Text>
                    <Text fontSize="sm">{selectedAsset.lastMatchedAt ? new Date(selectedAsset.lastMatchedAt).toLocaleString() : "—"}</Text>
                  </Box>
                </SimpleGrid>
                {selectedAsset.notes && (
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={1}>Notes</Text>
                    <Text fontSize="sm">{selectedAsset.notes}</Text>
                  </Box>
                )}
                {selectedAsset.matchedCveIds.length > 0 && (
                  <Box>
                    <Text fontSize="xs" color="text.muted" mb={2}>Matched CVEs</Text>
                    <VStack spacing={2} align="stretch">
                      {selectedAsset.matchedCveIds.slice(0, 5).map((cveId) => (
                        <Link key={cveId} to="/cves/$cveId" params={{ cveId }}>
                          <Text 
                            color="accent.400" 
                            fontSize="sm" 
                            fontFamily="mono" 
                            p={2} 
                            bg={useColorModeValue("gray.50", "charcoal.900")} 
                            borderRadius="md" 
                            _hover={{ textDecoration: "underline" }}
                          >
                            {cveId}
                          </Text>
                        </Link>
                      ))}
                      {selectedAsset.matchedCveIds.length > 5 && (
                        <Text fontSize="xs" color="text.muted">
                          +{selectedAsset.matchedCveIds.length - 5} more CVEs
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onDetailModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
