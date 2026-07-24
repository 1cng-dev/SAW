import { Box, Heading, Text } from "@chakra-ui/react";
import { Search } from "lucide-react";

export function ThreatIntelPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        Threat Intel / IOC Lookup
      </Heading>
      <Text color="text.muted">
        Search and analyze indicators of compromise (IPs, domains, hashes, URLs).
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Threat Intel / IOC Lookup page</Text>
      </Box>
    </Box>
  );
}
