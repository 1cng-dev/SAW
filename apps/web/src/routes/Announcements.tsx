import { Box, Heading, Text } from "@chakra-ui/react";
import { Megaphone } from "lucide-react";

export function AnnouncementsPage() {
  return (
    <Box>
      <Heading size="lg" mb={2}>
        1CNG Security Announcements
      </Heading>
      <Text color="text.muted">
        Internal security bulletins and announcements from the site admin.
      </Text>
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Security Announcements page</Text>
      </Box>
    </Box>
  );
}
