import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  ButtonGroup,
  Badge,
  Select,
  Input,
  Textarea,
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
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { useIncidents, useCreateIncident, useUpdateIncident } from "../api/hooks";
import type { Incident, IncidentStatus } from "../api/types";

const STATUS_COLUMNS: { key: IncidentStatus; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "investigating", label: "Investigating" },
  { key: "contained", label: "Contained" },
  { key: "resolved", label: "Resolved" },
];

function IncidentCard({ incident, onStatusChange }: { incident: Incident; onStatusChange: (s: IncidentStatus) => void }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="lg" p={3} mb={3}>
      <Link to="/incidents/$incidentId" params={{ incidentId: incident.id }}>
        <Text fontWeight="medium" fontSize="sm" color="accent.400" mb={2} _hover={{ textDecoration: "underline" }}>
          {incident.title}
        </Text>
      </Link>
      <HStack justify="space-between" mb={2}>
        <SeverityBadge severity={incident.severity} />
        {incident.assignee && <Text fontSize="xs" color="text.muted">{incident.assignee}</Text>}
      </HStack>
      <Select size="xs" value={incident.status} onChange={(e) => onStatusChange(e.target.value as IncidentStatus)}>
        {STATUS_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
      </Select>
    </Box>
  );
}

export function IncidentsPage() {
  const incidents = useIncidents();
  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [form, setForm] = useState({ title: "", description: "", severity: "medium", assignee: "" });

  const handleCreate = () => {
    if (!form.title.trim()) {
      toast({ title: "Title is required", status: "warning", duration: 2000 });
      return;
    }
    createIncident.mutate(form, {
      onSuccess: () => {
        toast({ title: "Incident created", status: "success", duration: 2000 });
        setForm({ title: "", description: "", severity: "medium", assignee: "" });
        onClose();
      },
    });
  };

  const rows = incidents.data?.data ?? [];

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Box>
          <Heading size="lg">Incident Response / Case Tracker</Heading>
          <Text color="text.muted" fontSize="sm" mt={1}>Track and manage security incidents from detection to resolution.</Text>
        </Box>
        <HStack>
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button leftIcon={<LayoutGrid size={14} />} isActive={view === "kanban"} onClick={() => setView("kanban")}>Board</Button>
            <Button leftIcon={<List size={14} />} isActive={view === "table"} onClick={() => setView("table")}>Table</Button>
          </ButtonGroup>
          <Button colorScheme="orange" leftIcon={<Plus size={16} />} onClick={onOpen}>New Incident</Button>
        </HStack>
      </HStack>

      {incidents.isLoading ? (
        <Skeleton h="300px" />
      ) : incidents.isError ? (
        <Alert status="error"><AlertIcon />Failed to load incidents.</Alert>
      ) : rows.length === 0 ? (
        <Box p={12} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Text color="text.muted">No incidents yet. Click "New Incident" to open a case.</Text>
        </Box>
      ) : view === "kanban" ? (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          {STATUS_COLUMNS.map((col) => (
            <Box key={col.key}>
              <HStack mb={3}>
                <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide">{col.label}</Text>
                <Badge fontSize="9px">{rows.filter((r) => r.status === col.key).length}</Badge>
              </HStack>
              <Box minH="100px" bg="charcoal.900" borderRadius="lg" p={2}>
                {rows.filter((r) => r.status === col.key).map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onStatusChange={(status) => updateIncident.mutate({ id: incident.id, status })}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" overflow="hidden">
          <Table size="sm">
            <Thead bg="charcoal.800">
              <Tr><Th>Title</Th><Th>Severity</Th><Th>Status</Th><Th>Assignee</Th><Th>Created</Th></Tr>
            </Thead>
            <Tbody>
              {rows.map((incident) => (
                <Tr key={incident.id} _hover={{ bg: "charcoal.800" }}>
                  <Td>
                    <Link to="/incidents/$incidentId" params={{ incidentId: incident.id }}>
                      <Text color="accent.400" fontSize="sm" _hover={{ textDecoration: "underline" }}>{incident.title}</Text>
                    </Link>
                  </Td>
                  <Td><SeverityBadge severity={incident.severity} /></Td>
                  <Td><Badge textTransform="capitalize">{incident.status}</Badge></Td>
                  <Td fontSize="sm" color="text.muted">{incident.assignee ?? "—"}</Td>
                  <Td fontSize="xs" color="text.muted">{new Date(incident.createdAt).toLocaleDateString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="bg.surface">
          <ModalHeader>New Incident</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm">Title</FormLabel>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Description</FormLabel>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel fontSize="sm">Severity</FormLabel>
                  <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Assignee</FormLabel>
                  <Input value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="orange" onClick={handleCreate} isLoading={createIncident.isPending}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
