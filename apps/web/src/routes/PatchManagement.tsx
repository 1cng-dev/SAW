import { useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  HStack,
  VStack,
  Button,
  Input,
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
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Divider,
  Tooltip,
  IconButton,
  Progress,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { Plus, AlertTriangle, Package, Clock, CheckCircle, Grid, List, Wrench, Calendar, Trash2 } from "lucide-react";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { usePatchTasks, useCreatePatchTask, useUpdatePatchTask, useDeletePatchTask, useAssets } from "../api/hooks";
import type { PatchStatus } from "../api/types";

const STATUS_LABELS: Record<PatchStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  patched: "Patched",
  not_applicable: "Not Applicable",
  risk_accepted: "Risk Accepted",
};

const STATUS_COLORS: Record<PatchStatus, string> = {
  not_started: "red",
  in_progress: "orange",
  patched: "green",
  not_applicable: "gray",
  risk_accepted: "purple",
};

const OPEN_STATUSES: PatchStatus[] = ["not_started", "in_progress"];

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export function PatchManagementPage() {
  const patchTasks = usePatchTasks();
  const assets = useAssets();
  const createTask = useCreatePatchTask();
  const updateTask = useUpdatePatchTask();
  const deleteTask = useDeletePatchTask();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "disclosure">("dueDate");
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const cardBg = useColorModeValue("white", "charcoal.800");

  const [form, setForm] = useState({ cveId: "", assetId: "", dueDate: "", notes: "" });

  const rows = patchTasks.data?.data ?? [];

  const filtered = useMemo(() => {
    let out = rows;
    if (severityFilter !== "all") out = out.filter((r) => r.cveSeverity === severityFilter);
    if (statusFilter !== "all") out = out.filter((r) => r.status === statusFilter);
    return [...out].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return (daysSince(b.cvePublishedDate) ?? 0) - (daysSince(a.cvePublishedDate) ?? 0);
    });
  }, [rows, severityFilter, statusFilter, sortBy]);

  const completionRate = Math.round(
    (rows.filter((r) => r.status === "patched").length / rows.length) * 100
  );
  const criticalCount = rows.filter((r) => r.cveSeverity === "critical").length;
  const overdueCount = rows.filter((r) => {
    if (!r.dueDate || !OPEN_STATUSES.includes(r.status)) return false;
    return new Date(r.dueDate) < new Date();
  }).length;

  const handleCreate = () => {
    if (!form.cveId.trim() && !form.assetId) {
      toast({ title: "Enter a CVE ID or select an asset", status: "warning", duration: 2500 });
      return;
    }
    createTask.mutate(
      { cveId: form.cveId.trim() || undefined, assetId: form.assetId || undefined, dueDate: form.dueDate || undefined, notes: form.notes },
      {
        onSuccess: () => {
          toast({ title: "Patch task created", status: "success", duration: 2000 });
          setForm({ cveId: "", assetId: "", dueDate: "", notes: "" });
          onClose();
        },
        onError: (e) => toast({ title: "Failed to create task", description: (e as Error).message, status: "error", duration: 3000 }),
      }
    );
  };

  return (
    <Box>
      {/* Enhanced Header */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Box 
              p={3} 
              borderRadius="xl" 
              bg={useColorModeValue("orange.50", "orange.900/20")}
              borderWidth="1px"
              borderColor={useColorModeValue("orange.200", "orange.700")}
            >
              <Wrench size={24} color="#ea580c" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>Patch Management Tracker</Heading>
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <CheckCircle size={10} />
                    <Text>{completionRate}% Complete</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="red" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <AlertTriangle size={10} />
                    <Text>{criticalCount} Critical</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="orange" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Package size={10} />
                    <Text>{rows.length} Tasks</Text>
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
                colorScheme="orange"
                onClick={() => setViewMode('table')}
              />
            </Tooltip>
            <Tooltip label="Card View">
              <IconButton
                aria-label="Card view"
                icon={<Grid size={18} />}
                variant={viewMode === 'card' ? 'solid' : 'outline'}
                colorScheme="orange"
                onClick={() => setViewMode('card')}
              />
            </Tooltip>
            <Button leftIcon={<Plus size={16} />} colorScheme="orange" onClick={onOpen}>
              New Task
            </Button>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="sm">Track remediation status for CVEs and assets with deadline management.</Text>
        <Divider mt={4} borderColor="border.default" />
      </Box>

      {/* Progress Overview */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg}>
          <HStack spacing={2} mb={2}>
            <CheckCircle size={16} color="#22c55e" />
            <Text fontSize="sm" fontWeight="medium">Completion Rate</Text>
          </HStack>
          <Progress value={completionRate} colorScheme="green" size="md" borderRadius="md" mb={2} />
          <Text fontSize="lg" fontWeight="bold" color="green.500">{completionRate}%</Text>
        </Box>
        <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg}>
          <HStack spacing={2} mb={2}>
            <AlertTriangle size={16} color="#dc2626" />
            <Text fontSize="sm" fontWeight="medium">Overdue Tasks</Text>
          </HStack>
          <Text fontSize="lg" fontWeight="bold" color="red.500">{overdueCount}</Text>
        </Box>
        <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg}>
          <HStack spacing={2} mb={2}>
            <Package size={16} color="#ea580c" />
            <Text fontSize="sm" fontWeight="medium">Total Tasks</Text>
          </HStack>
          <Text fontSize="lg" fontWeight="bold" color="orange.500">{rows.length}</Text>
        </Box>
      </SimpleGrid>

      {/* Filters */}
      <HStack mb={6} spacing={3}>
        <Select size="sm" w="160px" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select size="sm" w="180px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select size="sm" w="200px" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
          <option value="dueDate">Sort by Due Date</option>
          <option value="disclosure">Sort by Days Since Disclosure</option>
        </Select>
      </HStack>

      <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" overflow="hidden">
        {patchTasks.isLoading ? (
          <Box p={6}><Skeleton h="400px" /></Box>
        ) : patchTasks.isError ? (
          <Box p={6}><Alert status="error"><AlertIcon />Failed to load patch tasks.</Alert></Box>
        ) : filtered.length === 0 ? (
          <Box p={12} textAlign="center">
            <Box mb={4}>
              <Package size={48} color="#64748b" />
            </Box>
            <Text fontSize="lg" fontWeight="medium" color="text.muted" mb={2}>
              No patch tasks found
            </Text>
            <Text fontSize="sm" color="text.muted">
              Create your first patch task to get started
            </Text>
          </Box>
        ) : viewMode === 'table' ? (
          <Table size="md">
            <Thead bg={useColorModeValue("gray.50", "charcoal.900")}>
              <Tr>
                <Th>CVE / Asset</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Days Since Disclosure</Th>
                <Th>Due Date</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((task) => {
                const disclosureDays = daysSince(task.cvePublishedDate);
                const overdue = task.dueDate && OPEN_STATUSES.includes(task.status) && new Date(task.dueDate) < new Date();
                const criticalOverdue =
                  !task.dueDate && OPEN_STATUSES.includes(task.status) && (task.cveSeverity === "critical" || task.cveSeverity === "high") && (disclosureDays ?? 0) > 30;
                return (
                  <Tr key={task.id} _hover={{ bg: useColorModeValue("gray.50", "charcoal.900") }}>
                    <Td>
                      {task.cveId ? (
                        <Link to="/cves/$cveId" params={{ cveId: task.cveId }}>
                          <Text color="accent.400" fontFamily="mono" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: "underline" }}>{task.cveId}</Text>
                        </Link>
                      ) : null}
                      {task.assetName && <Text fontSize="xs" color="text.muted">{task.assetName}</Text>}
                    </Td>
                    <Td>{task.cveSeverity ? <SeverityBadge severity={task.cveSeverity} /> : "—"}</Td>
                    <Td>
                      <Select
                        size="xs"
                        value={task.status}
                        borderColor={`${STATUS_COLORS[task.status]}.500`}
                        onChange={(e) => updateTask.mutate({ id: task.id, status: e.target.value })}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </Select>
                    </Td>
                    <Td fontSize="sm" color="text.muted">{disclosureDays !== null ? `${disclosureDays}d` : "—"}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Text fontSize="sm" color={overdue ? "severity.critical.500" : "text.muted"}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                        </Text>
                        {(overdue || criticalOverdue) && (
                          <Badge colorScheme="red" fontSize="9px" display="flex" alignItems="center" gap={1}>
                            <AlertTriangle size={10} /> Overdue
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td textAlign="right">
                      <HStack spacing={2} justify="flex-end">
                        <IconButton
                          aria-label="Delete task"
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => deleteTask.mutate(task.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} p={4}>
            {filtered.map((task) => {
              const disclosureDays = daysSince(task.cvePublishedDate);
              const overdue = task.dueDate && OPEN_STATUSES.includes(task.status) && new Date(task.dueDate) < new Date();
              const criticalOverdue =
                !task.dueDate && OPEN_STATUSES.includes(task.status) && (task.cveSeverity === "critical" || task.cveSeverity === "high") && (disclosureDays ?? 0) > 30;
              return (
                <Box
                  key={task.id}
                  p={4}
                  borderWidth="1px"
                  borderColor="border.default"
                  borderRadius="xl"
                  bg={cardBg}
                  transition="all 0.2s"
                  _hover={{ 
                    borderColor: "orange.400",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: 'translateY(-2px)'
                  }}
                >
                  <HStack justify="space-between" mb={3}>
                    {task.cveSeverity ? <SeverityBadge severity={task.cveSeverity} /> : <Badge variant="outline">—</Badge>}
                    <Badge colorScheme={STATUS_COLORS[task.status]} variant="subtle" px={2} py={1} borderRadius="full" fontSize="xs">
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </HStack>
                  {task.cveId ? (
                    <Link to="/cves/$cveId" params={{ cveId: task.cveId }}>
                      <Text color="accent.400" fontFamily="mono" fontSize="md" fontWeight="semibold" mb={1} _hover={{ textDecoration: "underline" }}>{task.cveId}</Text>
                    </Link>
                  ) : null}
                  {task.assetName && <Text fontSize="xs" color="text.muted" mb={3}>{task.assetName}</Text>}
                  <Divider mb={3} borderColor="border.default" />
                  <HStack spacing={2} mb={2}>
                    <Clock size={12} color="#64748b" />
                    <Text fontSize="xs" color="text.muted">Days since disclosure: {disclosureDays !== null ? `${disclosureDays}d` : "—"}</Text>
                  </HStack>
                  <HStack spacing={2} mb={3}>
                    <Calendar size={12} color="#64748b" />
                    <Text fontSize="xs" color={overdue ? "severity.critical.500" : "text.muted"}>
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </Text>
                    {(overdue || criticalOverdue) && (
                      <Badge colorScheme="red" fontSize="9px" display="flex" alignItems="center" gap={1}>
                        <AlertTriangle size={10} /> Overdue
                      </Badge>
                    )}
                  </HStack>
                  <Divider mb={3} borderColor="border.default" />
                  <Select 
                    size="xs" 
                    w="full" 
                    value={task.status} 
                    borderColor={`${STATUS_COLORS[task.status]}.500`} 
                    onChange={(e) => updateTask.mutate({ id: task.id, status: e.target.value })}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="bg.surface">
          <ModalHeader>New Patch Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">CVE ID</FormLabel>
                <Input placeholder="e.g. CVE-2026-12345" fontFamily="mono" value={form.cveId} onChange={(e) => setForm({ ...form, cveId: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Asset (optional)</FormLabel>
                <Select placeholder="None" value={form.assetId} onChange={(e) => setForm({ ...form, assetId: e.target.value })}>
                  {assets.data?.data.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Due Date (optional)</FormLabel>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Notes (optional)</FormLabel>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="orange" onClick={handleCreate} isLoading={createTask.isPending}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
