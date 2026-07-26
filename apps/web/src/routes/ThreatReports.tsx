import { Box, Heading, Text, Flex, HStack, Badge, useColorModeValue, Divider } from "@chakra-ui/react";
import { FileText, Shield, FileSearch, Zap, Clock } from "lucide-react";

export function ThreatReportsPage() {
  return (
    <Box>
      {/* Enhanced Header Section */}
      <Box mb={8}>
        <Flex align="center" justify="space-between" mb={4}>
          <HStack spacing={3}>
            <Box 
              p={3} 
              borderRadius="xl" 
              bg={useColorModeValue("purple.50", "purple.900/20")}
              borderWidth="1px"
              borderColor={useColorModeValue("purple.200", "purple.700")}
            >
              <FileSearch size={24} color="#a78bfa" />
            </Box>
            <Box>
              <Heading size="lg" mb={1}>
                Threat Reports
              </Heading>
              <HStack spacing={2}>
                <Badge colorScheme="purple" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Shield size={10} />
                    <Text>Comprehensive Analysis</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="cyan" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                  <HStack spacing={1}>
                    <Zap size={10} />
                    <Text>Deep Insights</Text>
                  </HStack>
                </Badge>
              </HStack>
            </Box>
          </HStack>
          <HStack spacing={3} display={{ base: "none", md: "flex" }}>
            <Box textAlign="right">
              <Text fontSize="xs" color="text.muted" fontWeight="medium">Report Features</Text>
              <HStack spacing={2} mt={1} justify="flex-end">
                <Badge variant="outline" fontSize="xs" colorScheme="gray">IOC Analysis</Badge>
                <Badge variant="outline" fontSize="xs" colorScheme="gray">Trend Analysis</Badge>
                <Badge variant="outline" fontSize="xs" colorScheme="gray">Risk Assessment</Badge>
              </HStack>
            </Box>
          </HStack>
        </Flex>
        <Text color="text.muted" fontSize="md">
          Comprehensive threat intelligence reports and analysis for security professionals.
        </Text>
        <Divider mt={6} borderColor="border.default" />
      </Box>
      
      <Box mt={8} p={8} borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
        <Text color="text.muted">Coming soon - Threat Reports page</Text>
      </Box>
    </Box>
  );
}
