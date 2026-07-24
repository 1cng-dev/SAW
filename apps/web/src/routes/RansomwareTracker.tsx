import { Box, Heading, Text } from "@chakra-ui/react";
import { Skull } from "lucide-react";

export function RansomwareTrackerPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        Ransomware Group Tracker
      </Heading>
      <Text color="text.muted">
        Track active ransomware groups, victim counts, and recent claims.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Ransomware Group Tracker page</Text>
      </Box>
    </Box>
  );
}
