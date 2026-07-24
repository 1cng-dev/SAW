import { Box, Heading, Text } from "@chakra-ui/react";
import { FileText } from "lucide-react";

export function ThreatReportsPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        Threat Reports
      </Heading>
      <Text color="text.muted">
        Comprehensive threat intelligence reports and analysis.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Threat Reports page</Text>
      </Box>
    </Box>
  );
}
