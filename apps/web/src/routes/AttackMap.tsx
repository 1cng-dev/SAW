import { Box, Heading, Text } from "@chakra-ui/react";
import { Globe } from "lucide-react";

export function AttackMapPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        Global Attack/Advisory Map
      </Heading>
      <Text color="text.muted">
        Visualize security threats and advisories across the world.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Global Attack/Advisory Map page</Text>
      </Box>
    </Box>
  );
}
