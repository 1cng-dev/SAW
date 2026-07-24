import { Box, HStack, Text } from "@chakra-ui/react";

export function LiveIndicator({ lastUpdated }: { lastUpdated?: string | null }) {
  const isLive = lastUpdated && Date.now() - new Date(lastUpdated).getTime() < 5 * 60 * 1000; // 5 minutes

  return (
    <HStack spacing={2} align="center">
      <Box
        width="8px"
        height="8px"
        borderRadius="full"
        bg={isLive ? "green.400" : "gray.400"}
        animation={isLive ? "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" : undefined}
      />
      <Text fontSize="xs" color="text.muted">
        {isLive ? "Live" : "Updating..."}
      </Text>
    </HStack>
  );
}
