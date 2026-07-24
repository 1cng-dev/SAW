import { Box, Heading, Text } from "@chakra-ui/react";
import { Info } from "lucide-react";

export function AboutPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        About 1CNG
      </Heading>
      <Text color="text.muted">
        Learn about our platform, mission, and data sources.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - About page</Text>
      </Box>
    </Box>
  );
}
