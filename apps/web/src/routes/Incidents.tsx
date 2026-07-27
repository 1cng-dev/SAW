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
  useColorModeValue,
  Flex,
  Divider,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { LayoutGrid, List, Plus, AlertTriangle, Shield, User, Clock, CheckCircle, Grid as GridIcon } from "lucide-react";
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
  const cardBg = useColorModeValue("white", "charcoal.800");
  return (
    <Box 
      borderWidth="1px" 
      borderColor="border.default" 
      bg={cardBg} 
      borderRadius="xl" 
      p={4} 
      mb={3}
      transition="all 0.2s"
      _hover={{ 
        borderColor: "orange.400",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transform: 'translateY(-2px)'
      }}
    >
      <Link to="/incidents/$incidentId" params={{ incidentId: incident.id }}>
        <Text fontWeight="semibold" fontSize="md" color="accent.400" mb={2} _hover={{ textDecoration: "underline" }}>
          {incident.title}
        </Text>
      </Link>
      <HStack justify="space-between" mb={3}>
        <SeverityBadge severity={incident.severity} />
        {incident.assignee && (
          <HStack spacing={1}>
            <User size={12} color="#64748b" />
            <Text fontSize="xs" color="text.muted">{incident.assignee}</Text>
          </HStack>
        )}
      </HStack>
      <Divider mb={3} borderColor="border.default" />
      <HStack spacing={2} mb={2}>
        <Clock size={12} color="#64748b" />
        <Text fontSize="xs" color="text.muted">
          {new Date(incident.createdAt).toLocaleDateString()}
        </Text>
      </HStack>
      <Select 
        size="xs" 
        value={incident.status} 
        onChange={(e) => onStatusChange(e.target.value as IncidentStatus)}
      >
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
  const cardBg = useColorModeValue("white", "charcoal.800");

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
  const openCount = rows.filter((r) => r.status === "open").length;
  const criticalCount = rows.filter((r) => r.severity === "critical").length;
  const resolvedCount = rows.filter((r) => r.status === "resolved").length;

  return (
    <Box>
      {/* Enhanced Header */}
      <Box mb={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack spacing={3}>
            <Box 
              p={3} 
              borderRadius="xl" 
              bg={useColorModeValue("red.50", "red.900/20")}
              borderWidth="1px"
              borderColor={useColorModeValue("red.200", "red.700")}
            >
              <AlertTriangle size={24} color="#dc2626" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>Incident Response / Case Tracker</Heading>
              <HStack spacing={2}>
                <Badge colorScheme="red" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <AlertTriangle size={10} />
                    <Text>{openCount} Open</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="orange" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Shield size={10} />
                    <Text>{criticalCount} Critical</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <CheckCircle size={10} />
                    <Text>{resolvedCount} Resolved</Text>
                  </HStack>
                </Badge>
              </HStack>
            </Box>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label="Kanban Board">
              <IconButton
                aria-label="Kanban view"
                icon={<LayoutGrid size={18} />}
                variant={view === 'kanban' ? 'solid' : 'outline'}
                colorScheme="red"
                onClick={() => setView("kanban")}
              />
            </Tooltip>
            <Tooltip label="Table View">
              <IconButton
                aria-label="Table view"
                icon={<List size={18} />}
                variant={view === 'table' ? 'solid' : 'outline'}
                colorScheme="red"
                onClick={() => setView("table")}
              />
            </Tooltip>
            <Button leftIcon={<Plus size={16} />} colorScheme="red" onClick={onOpen}>
              New Incident
            </Button>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="sm">Track and manage security incidents from detection to resolution with kanban board.</Text>
        <Divider mt={4} borderColor="border.default" />
      </Box>

      {incidents.isLoading ? (
        <Skeleton h="400px" />
      ) : incidents.isError ? (
        <Alert status="error"><AlertIcon />Failed to load incidents.</Alert>
      ) : rows.length === 0 ? (
        <Box p={12} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg}>
          <Box mb={4}>
            <AlertTriangle size={48} color="#64748b" />
          </Box>
          <Text fontSize="lg" fontWeight="medium" color="text.muted" mb={2}>
            No incidents yet
          </Text>
          <Text fontSize="sm" color="text.muted">
            Create your first incident to start tracking
          </Text>
        </Box>
      ) : view === "kanban" ? (
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
          {STATUS_COLUMNS.map((col) => (
            <Box key={col.key}>
              <HStack mb={3} p={2} bg={useColorModeValue("gray.50", "charcoal.900")} borderRadius="lg">
                <Text fontSize="xs" fontWeight="bold" color="text.muted" textTransform="uppercase" letterSpacing="wide">{col.label}</Text>
                <Badge fontSize="9px" colorScheme="red">{rows.filter((r) => r.status === col.key).length}</Badge>
              </HStack>
              <Box minH="200px" bg={useColorModeValue("gray.50", "charcoal.900")} borderRadius="xl" p={3}>
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
        <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" overflow="hidden">
          <Table size="md">
            <Thead bg={useColorModeValue("gray.50", "charcoal.900")}>
              <Tr><Th>Title</Th><Th>Severity</Th><Th>Status</Th><Th>Assignee</Th><th>Created</th><Th textAlign="right">Actions</Th></Tr>
            </Thead>
            <Tbody>
              {rows.map((incident) => (
                <Tr key={incident.id} _hover={{ bg: useColorModeValue("gray.50", "charcoal.900") }}>
                  <Td>
                    <Link to="/incidents/$incidentId" params={{ incidentId: incident.id }}>
                      <Text color="accent.400" fontSize="sm" fontWeight="medium" _hover={{ textDecoration: "underline" }}>{incident.title}</Text>
                    </Link>
                  </Td>
                  <Td><SeverityBadge severity={incident.severity} /></Td>
                  <Td><Badge textTransform="capitalize" variant="subtle">{incident.status}</Badge></Td>
                  <Td fontSize="sm" color="text.muted">{incident.assignee ?? "—"}</Td>
                  <Td fontSize="xs" color="text.muted">{new Date(incident.createdAt).toLocaleDateString()}</Td>
                  <Td textAlign="right">
                    <Select 
                      size="xs" 
                      w="120px" 
                      value={incident.status} 
                      onChange={(e) => updateIncident.mutate({ id: incident.id, status: e.target.value as IncidentStatus })}
                    >
                      {STATUS_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </Select>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack spacing={2}>
              <Plus size={20} color="#dc2626" />
              <Text>New Incident</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <HStack spacing={2} mb={2}>
                  <AlertTriangle size={14} color="#64748b" />
                  <FormLabel fontSize="sm" fontWeight="medium">Title</FormLabel>
                </HStack>
                <Input 
                  placeholder="Enter incident title" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                />
              </FormControl>
              <FormControl>
                <HStack spacing={2} mb={2}>
                  <GridIcon size={14} color="#64748b" />
                  <FormLabel fontSize="sm" fontWeight="medium">Description</FormLabel>
                </HStack>
                <Textarea 
                  placeholder="Describe the incident" 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  rows={3}
                />
              </FormControl>
              <HStack>
                <FormControl>
                  <HStack spacing={2} mb={2}>
                    <Shield size={14} color="#64748b" />
                    <FormLabel fontSize="sm" fontWeight="medium">Severity</FormLabel>
                  </HStack>
                  <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <HStack spacing={2} mb={2}>
                    <User size={14} color="#64748b" />
                    <FormLabel fontSize="sm" fontWeight="medium">Assignee</FormLabel>
                  </HStack>
                  <Input 
                    placeholder="Assign to" 
                    value={form.assignee} 
                    onChange={(e) => setForm({ ...form, assignee: e.target.value })} 
                  />
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              leftIcon={<Plus size={16} />} 
              colorScheme="red" 
              onClick={handleCreate} 
              isLoading={createIncident.isPending}
              ml={3}
            >
              Create Incident
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
