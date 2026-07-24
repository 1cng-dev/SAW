import { Box, Heading, Text } from "@chakra-ui/react";
import { FileDown } from "lucide-react";

export function DigestPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        Weekly Security Digest
      </Heading>
      <Text color="text.muted">
        Generate and download weekly security summary reports.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Weekly Security Digest page</Text>
      </Box>
    </Box>
  );
}
