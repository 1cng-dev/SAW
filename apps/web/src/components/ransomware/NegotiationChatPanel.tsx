import { useState } from "react";
import { Badge, Box, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { MessageSquare } from "lucide-react";
import { useRansomwareNegotiationChat, useRansomwareNegotiations } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

export function NegotiationChatPanel({ slug, groupName }: { slug: string; groupName: string }) {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const chats = useRansomwareNegotiations(slug);
  const chat = useRansomwareNegotiationChat(slug, selectedChatId);

  if (chats.isLoading) return <Skeleton height="120px" borderRadius="lg" />;
  if (chats.isError) return <ErrorState message="Failed to load negotiation chats, retrying..." />;

  if (!chats.data?.configured) {
    return (
      <Text fontSize="sm" color="text.muted">
        Connect a RANSOMWARE_LIVE_API_KEY to enable negotiation chat lookup.
      </Text>
    );
  }

  if (chats.data.data.length === 0) {
    return (
      <Text fontSize="sm" color="text.muted">
        No leaked negotiation chats on file for this group.
      </Text>
    );
  }

  return (
    <HStack align="start" spacing={4}>
      <Stack spacing={2} minW="220px" maxH="500px" overflowY="auto">
        {chats.data.data.map((c) => (
          <Box
            key={c.id}
            p={2}
            borderWidth="1px"
            borderColor={selectedChatId === c.id ? "accent.solid" : "border.default"}
            bg="charcoal.800"
            borderRadius="md"
            cursor="pointer"
            onClick={() => setSelectedChatId(c.id)}
            _hover={{ borderColor: "accent.solid" }}
          >
            <HStack justify="space-between">
              <HStack spacing={1}>
                <MessageSquare size={12} />
                <Text fontSize="xs" fontFamily="mono">
                  {c.id}
                </Text>
              </HStack>
              <Badge colorScheme={c.paid ? "green" : "gray"} fontSize="9px">
                {c.paid ? "Paid" : "Unpaid"}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="text.muted" mt={1}>
              {c.initialransom} → {c.negotiatedransom} · {c.message_count} msgs
            </Text>
          </Box>
        ))}
      </Stack>

      <Box flex={1} borderWidth="1px" borderColor="border.default" bg="charcoal.900" borderRadius="lg" p={4} minH="200px">
        {!selectedChatId ? (
          <Text fontSize="sm" color="text.muted">
            Select a negotiation to view the leaked chat transcript.
          </Text>
        ) : chat.isLoading ? (
          <Skeleton height="200px" />
        ) : chat.isError ? (
          <ErrorState message="Failed to load transcript, retrying..." />
        ) : (
          <Stack spacing={3} maxH="450px" overflowY="auto">
            {chat.data?.messages.map((msg, i) => {
              const isGroup = msg.party.toLowerCase() === groupName.toLowerCase() || msg.party.toLowerCase() !== "victim";
              return (
                <HStack key={i} justify={isGroup ? "flex-start" : "flex-end"}>
                  <Box
                    maxW="80%"
                    bg={isGroup ? "red.900" : "charcoal.700"}
                    borderRadius="lg"
                    px={3}
                    py={2}
                  >
                    <Text fontSize="10px" fontWeight="semibold" color={isGroup ? "red.300" : "teal.300"} mb={0.5}>
                      {msg.party}
                    </Text>
                    <Text fontSize="xs" whiteSpace="pre-wrap" color="gray.200">
                      {msg.content}
                    </Text>
                  </Box>
                </HStack>
              );
            })}
          </Stack>
        )}
      </Box>
    </HStack>
  );
}
