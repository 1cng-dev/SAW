import { useState } from "react";
import { Box, Button, HStack, Skeleton, Stack, Text, Wrap } from "@chakra-ui/react";
import { FileWarning } from "lucide-react";
import { useRansomwareNoteContent, useRansomwareNotes } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

export function RansomNotesPanel({ slug }: { slug: string }) {
  const [selectedNote, setSelectedNote] = useState<string | undefined>();
  const notes = useRansomwareNotes(slug);
  const content = useRansomwareNoteContent(slug, selectedNote);

  if (notes.isLoading) return <Skeleton height="120px" borderRadius="lg" />;
  if (notes.isError) return <ErrorState message="Failed to load ransom notes, retrying..." />;

  if (!notes.data?.configured) {
    return (
      <Text fontSize="sm" color="text.muted">
        Connect a RANSOMWARE_LIVE_API_KEY to enable ransom note lookup.
      </Text>
    );
  }

  if (notes.data.data.length === 0) {
    return (
      <Text fontSize="sm" color="text.muted">
        No ransom notes on file for this group.
      </Text>
    );
  }

  return (
    <Stack spacing={3}>
      <Wrap spacing={2}>
        {notes.data.data.map((noteName) => (
          <Button
            key={noteName}
            size="xs"
            leftIcon={<FileWarning size={14} />}
            variant={selectedNote === noteName ? "solid" : "outline"}
            onClick={() => setSelectedNote(noteName)}
          >
            {noteName}
          </Button>
        ))}
      </Wrap>

      {selectedNote && (
        <Box borderWidth="1px" borderColor="border.default" bg="charcoal.900" borderRadius="lg" p={4}>
          {content.isLoading ? (
            <Skeleton height="200px" />
          ) : content.isError ? (
            <ErrorState message="Failed to load note content, retrying..." />
          ) : (
            <HStack align="start" spacing={3}>
              <Box flex={1}>
                <Text
                  as="pre"
                  fontSize="xs"
                  fontFamily="mono"
                  whiteSpace="pre-wrap"
                  color="gray.300"
                  maxH="400px"
                  overflowY="auto"
                >
                  {content.data?.content}
                </Text>
              </Box>
            </HStack>
          )}
        </Box>
      )}
    </Stack>
  );
}
