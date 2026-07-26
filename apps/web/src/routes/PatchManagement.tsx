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
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { Plus, AlertTriangle } from "lucide-react";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { usePatchTasks, useCreatePatchTask, useUpdatePatchTask, useAssets } from "../api/hooks";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "disclosure">("dueDate");

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
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading size="lg">Patch Management Tracker</Heading>
          <Text color="text.muted" fontSize="sm" mt={1}>Track remediation status for CVEs and assets.</Text>
        </Box>
        <Button colorScheme="orange" leftIcon={<Plus size={16} />} onClick={onOpen}>New Task</Button>
      </HStack>

      <HStack mb={4} spacing={3}>
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

      <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" overflow="hidden">
        {patchTasks.isLoading ? (
          <Box p={6}><Skeleton h="200px" /></Box>
        ) : patchTasks.isError ? (
          <Box p={6}><Alert status="error"><AlertIcon />Failed to load patch tasks.</Alert></Box>
        ) : filtered.length === 0 ? (
          <Box p={12} textAlign="center"><Text color="text.muted">No patch tasks match the current filters.</Text></Box>
        ) : (
          <Table size="sm">
            <Thead bg="charcoal.800">
              <Tr>
                <Th>CVE / Asset</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th>Days Since Disclosure</Th>
                <Th>Due Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filtered.map((task) => {
                const disclosureDays = daysSince(task.cvePublishedDate);
                const overdue = task.dueDate && OPEN_STATUSES.includes(task.status) && new Date(task.dueDate) < new Date();
                const criticalOverdue =
                  !task.dueDate && OPEN_STATUSES.includes(task.status) && (task.cveSeverity === "critical" || task.cveSeverity === "high") && (disclosureDays ?? 0) > 30;
                return (
                  <Tr key={task.id} _hover={{ bg: "charcoal.800" }}>
                    <Td>
                      {task.cveId ? (
                        <Link to="/cves/$cveId" params={{ cveId: task.cveId }}>
                          <Text color="accent.400" fontFamily="mono" fontSize="sm" _hover={{ textDecoration: "underline" }}>{task.cveId}</Text>
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
