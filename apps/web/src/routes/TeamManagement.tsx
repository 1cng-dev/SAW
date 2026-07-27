import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { Plus, Trash2, Users, Shield, Mail, UserPlus, Grid, List, Edit } from "lucide-react";
import { useTeamUsers, useCreateTeamUser, useUpdateTeamUserRole, useDeleteTeamUser } from "../api/hooks";

const ROLE_COLORS: Record<string, string> = { admin: "red", analyst: "orange", viewer: "gray" };

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: "Manage users, settings, and all data",
  analyst: "Edit Incidents, Assets, Patch Tasks",
  viewer: "Read-only access to all pages",
};

export function TeamManagementPage() {
  const users = useTeamUsers();
  const createUser = useCreateTeamUser();
  const updateRole = useUpdateTeamUserRole();
  const deleteUser = useDeleteTeamUser();
  const toast = useToast();

  const [form, setForm] = useState({ name: "", email: "", role: "viewer" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const cardBg = useColorModeValue("white", "charcoal.800");

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", status: "warning", duration: 2000 });
      return;
    }
    createUser.mutate(form, {
      onSuccess: () => {
        toast({ title: "User added", status: "success", duration: 2000 });
        setForm({ name: "", email: "", role: "viewer" });
        setIsModalOpen(false);
      },
      onError: (e) => toast({ title: "Failed to add user", description: (e as Error).message, status: "error", duration: 3000 }),
    });
  };

  const handleModalOpen = () => {
    setForm({ name: "", email: "", role: "viewer" });
    setIsModalOpen(true);
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
              bg={useColorModeValue("blue.50", "blue.900/20")}
              borderWidth="1px"
              borderColor={useColorModeValue("blue.200", "blue.700")}
            >
              <Users size={24} color="#3b82f6" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>Team / User Management</Heading>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Shield size={10} />
                    <Text>Role-Based Access</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="green" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Users size={10} />
                    <Text>{users.data?.data.length || 0} Members</Text>
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
            <Button leftIcon={<UserPlus size={16} />} colorScheme="orange" onClick={handleModalOpen}>
              Add Member
            </Button>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="sm">Manage team roster and role assignments with role-based access control.</Text>
        <Divider mt={4} borderColor="border.default" />
      </Box>

      <Alert status="info" mb={6} fontSize="sm">
        <AlertIcon />
        <Box>
          <AlertTitle>No authentication system yet</AlertTitle>
          <AlertDescription>
            This is a real roster with real role assignments, but there's no login/session system in this
            deployment to actually enforce them — role-based UI gating below is a stub showing what each role
            <i> would</i> see.
          </AlertDescription>
        </Box>
      </Alert>

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <UserPlus size={20} color="#f97316" />
              <Text>Add New Team Member</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="full">
                <HStack spacing={2} mb={2}>
                  <UserPlus size={14} color="#64748b" />
                  <Text fontSize="sm" fontWeight="medium">Full Name</Text>
                </HStack>
                <Input 
                  placeholder="Enter full name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </Box>
              <Box w="full">
                <HStack spacing={2} mb={2}>
                  <Mail size={14} color="#64748b" />
                  <Text fontSize="sm" fontWeight="medium">Email Address</Text>
                </HStack>
                <Input 
                  placeholder="email@1cloudng.com" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                />
              </Box>
              <Box w="full">
                <HStack spacing={2} mb={2}>
                  <Shield size={14} color="#64748b" />
                  <Text fontSize="sm" fontWeight="medium">Role</Text>
                </HStack>
                <Select 
                  value={form.role} 
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="analyst">Analyst - Edit access</option>
                  <option value="viewer">Viewer - Read-only</option>
                </Select>
                <Text fontSize="xs" color="text.muted" mt={1}>
                  {ROLE_PERMISSIONS[form.role]}
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              leftIcon={<Plus size={16} />} 
              colorScheme="orange" 
              onClick={handleCreate} 
              isLoading={createUser.isPending}
              ml={3}
            >
              Add Member
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {users.isLoading ? (
        <Skeleton h="400px" />
      ) : !users.data || users.data.data.length === 0 ? (
        <Box p={12} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg={cardBg}>
          <Box mb={4}>
            <Users size={48} color="#64748b" />
          </Box>
          <Text fontSize="lg" fontWeight="medium" color="text.muted" mb={2}>
            No team members yet
          </Text>
          <Text fontSize="sm" color="text.muted">
            Add your first team member to get started
          </Text>
        </Box>
      ) : viewMode === 'table' ? (
        <Box borderWidth="1px" borderColor="border.default" bg={cardBg} borderRadius="xl" overflow="hidden">
          <Table size="md">
            <Thead bg={useColorModeValue("gray.50", "charcoal.900")}>
              <Tr>
                <Th>User</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Permissions</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.data.data.map((u) => (
                <Tr key={u.id} _hover={{ bg: useColorModeValue("gray.50", "charcoal.900") }}>
                  <Td>
                    <HStack>
                      <Avatar size="sm" name={u.name} bg="accent.solid" />
                      <Text fontSize="sm" fontWeight="medium">{u.name}</Text>
                    </HStack>
                  </Td>
                  <Td fontSize="sm" color="text.muted">{u.email}</Td>
                  <Td>
                    <Badge 
                      colorScheme={ROLE_COLORS[u.role]} 
                      variant="subtle" 
                      px={3} 
                      py={1} 
                      borderRadius="full"
                    >
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </Badge>
                  </Td>
                  <Td fontSize="xs" color="text.muted">{ROLE_PERMISSIONS[u.role]}</Td>
                  <Td textAlign="right">
                    <HStack spacing={2} justify="flex-end">
                      <Select 
                        size="xs" 
                        w="120px" 
                        value={u.role} 
                        borderColor={`${ROLE_COLORS[u.role]}.500`} 
                        onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                      >
                        <option value="admin">Admin</option>
                        <option value="analyst">Analyst</option>
                        <option value="viewer">Viewer</option>
                      </Select>
                      <IconButton 
                        aria-label="Remove" 
                        icon={<Trash2 size={14} />} 
                        size="sm" 
                        variant="ghost" 
                        colorScheme="red" 
                        onClick={() => deleteUser.mutate(u.id)} 
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {users.data.data.map((u) => (
            <Box
              key={u.id}
              p={4}
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="xl"
              bg={cardBg}
              transition="all 0.2s"
              _hover={{ 
                borderColor: "blue.400",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transform: 'translateY(-2px)'
              }}
            >
              <HStack spacing={3} mb={3}>
                <Avatar size="lg" name={u.name} bg="accent.solid" />
                <Box flex={1}>
                  <Text fontSize="md" fontWeight="semibold">{u.name}</Text>
                  <Text fontSize="xs" color="text.muted">{u.email}</Text>
                </Box>
              </HStack>
              <Badge 
                colorScheme={ROLE_COLORS[u.role]} 
                variant="subtle" 
                px={3} 
                py={1} 
                borderRadius="full"
                mb={3}
                display="inline-block"
              >
                {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
              </Badge>
              <Text fontSize="xs" color="text.muted" mb={4}>
                {ROLE_PERMISSIONS[u.role]}
              </Text>
              <Divider mb={3} borderColor="border.default" />
              <HStack spacing={2} justify="space-between">
                <Select 
                  size="xs" 
                  w="120px" 
                  value={u.role} 
                  borderColor={`${ROLE_COLORS[u.role]}.500`} 
                  onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                  <option value="viewer">Viewer</option>
                </Select>
                <IconButton 
                  aria-label="Remove" 
                  icon={<Trash2 size={14} />} 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="red" 
                  onClick={() => deleteUser.mutate(u.id)} 
                />
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
