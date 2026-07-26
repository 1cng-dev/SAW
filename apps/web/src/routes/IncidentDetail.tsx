import { useState } from "react";
import { useParams } from "@tanstack/react-router";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  Select,
  Button,
  Textarea,
  Input,
  Skeleton,
  Alert,
  AlertIcon,
  Divider,
} from "@chakra-ui/react";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { useIncident, useUpdateIncident, useAddIncidentComment } from "../api/hooks";
import type { IncidentStatus } from "../api/types";

export function IncidentDetailPage() {
  const { incidentId } = useParams({ strict: false }) as { incidentId: string };
  const { data, isLoading, isError } = useIncident(incidentId);
  const updateIncident = useUpdateIncident();
  const addComment = useAddIncidentComment();
  const [author, setAuthor] = useState("");
  const [comment, setComment] = useState("");

  if (isLoading) return <Skeleton h="300px" />;
  if (isError || !data) return <Alert status="error"><AlertIcon />Incident not found.</Alert>;

  const { data: incident, comments } = data;

  const handleComment = () => {
    if (!comment.trim()) return;
    addComment.mutate(
      { incidentId, author: author.trim() || "Anonymous", body: comment.trim() },
      { onSuccess: () => setComment("") }
    );
  };

  return (
    <Box>
      <HStack justify="space-between" align="start" mb={4}>
        <Box>
          <Heading size="lg">{incident.title}</Heading>
          <HStack mt={2} spacing={2}>
            <SeverityBadge severity={incident.severity} />
            <Badge textTransform="capitalize">{incident.status}</Badge>
            {incident.assignee && <Text fontSize="sm" color="text.muted">Assigned to {incident.assignee}</Text>}
          </HStack>
        </Box>
        <Select
          w="180px"
          value={incident.status}
          onChange={(e) => updateIncident.mutate({ id: incidentId, status: e.target.value as IncidentStatus })}
        >
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
        </Select>
      </HStack>

      {incident.description && (
        <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4} mb={6}>
          <Text color="text.muted" fontSize="sm">{incident.description}</Text>
        </Box>
      )}

      <Heading size="md" mb={3}>Activity Log</Heading>
      <VStack align="stretch" spacing={3} mb={4}>
        {comments.length === 0 ? (
          <Text fontSize="sm" color="text.muted">No comments yet.</Text>
        ) : (
          comments.map((c) => (
            <Box key={c.id} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="lg" p={3}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" fontWeight="medium">{c.author}</Text>
                <Text fontSize="xs" color="text.muted">{new Date(c.createdAt).toLocaleString()}</Text>
              </HStack>
              <Text fontSize="sm" color="text.muted">{c.body}</Text>
            </Box>
          ))
        )}
      </VStack>

      <Divider mb={4} />

      <VStack align="stretch" spacing={2}>
        <Input placeholder="Your name" size="sm" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <Textarea placeholder="Add a comment or activity note..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button alignSelf="flex-end" colorScheme="orange" size="sm" onClick={handleComment} isLoading={addComment.isPending}>
          Add Comment
        </Button>
      </VStack>
    </Box>
  );
}
