import { Box, Container, HStack, Image, Text, VStack } from "@chakra-ui/react";

export function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border.default" bg="bg.panel" mt="auto">
      <Container maxW="7xl" px={4} py={5}>
        <VStack spacing={1}>
          <HStack spacing={2}>
            <Image src="https://1cloudng.com/assets/logo-FdfyqxLo.png" alt="1CNG" h="16px" w="auto" />
            <Text fontSize="xs" color="text.muted">
              Powered by 1Cloud Next Generation &mdash; 1CNG
            </Text>
          </HStack>
          <Text fontSize="xs" color="text.muted">
            1CNG Software Engineering &amp; Security Team
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
