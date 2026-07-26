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
} from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
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

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Name and email are required", status: "warning", duration: 2000 });
      return;
    }
    createUser.mutate(form, {
      onSuccess: () => {
        toast({ title: "User added", status: "success", duration: 2000 });
        setForm({ name: "", email: "", role: "viewer" });
      },
      onError: (e) => toast({ title: "Failed to add user", description: (e as Error).message, status: "error", duration: 3000 }),
    });
  };

  return (
    <Box>
      <Heading size="lg" mb={1}>Team / User Management</Heading>
      <Text color="text.muted" fontSize="sm" mb={4}>Manage team roster and role assignments.</Text>

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

      <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5} mb={6}>
        <Text fontSize="sm" fontWeight="medium" mb={3}>Add Team Member</Text>
        <HStack>
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="email@1cloudng.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Select w="140px" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </Select>
          <Button leftIcon={<Plus size={16} />} colorScheme="orange" onClick={handleCreate} isLoading={createUser.isPending}>Add</Button>
        </HStack>
      </Box>

      {users.isLoading ? (
        <Skeleton h="200px" />
      ) : !users.data || users.data.data.length === 0 ? (
        <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Text color="text.muted">No team members yet.</Text>
        </Box>
      ) : (
        <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" overflow="hidden">
          <Table size="sm">
            <Thead bg="charcoal.800">
              <Tr><Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Permissions (stub)</Th><Th></Th></Tr>
            </Thead>
            <Tbody>
              {users.data.data.map((u) => (
                <Tr key={u.id} _hover={{ bg: "charcoal.800" }}>
                  <Td>
                    <HStack>
                      <Avatar size="xs" name={u.name} bg="accent.solid" />
                      <Text fontSize="sm">{u.name}</Text>
                    </HStack>
                  </Td>
                  <Td fontSize="sm" color="text.muted">{u.email}</Td>
                  <Td>
                    <Select size="xs" w="120px" value={u.role} borderColor={`${ROLE_COLORS[u.role]}.500`} onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value })}>
                      <option value="admin">Admin</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </Select>
                  </Td>
                  <Td fontSize="xs" color="text.muted">{ROLE_PERMISSIONS[u.role]}</Td>
                  <Td>
                    <IconButton aria-label="Remove" icon={<Trash2 size={14} />} size="xs" variant="ghost" colorScheme="red" onClick={() => deleteUser.mutate(u.id)} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
