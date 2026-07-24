import { Box, Heading, Text } from "@chakra-ui/react";
import { Star } from "lucide-react";

export function WatchlistPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        CVE Watchlist
      </Heading>
      <Text color="text.muted">
        Track and monitor CVEs and vendors of interest to you.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - CVE Watchlist page</Text>
      </Box>
    </Box>
  );
}
