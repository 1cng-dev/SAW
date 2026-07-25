  import { Box, Heading, Text, VStack, HStack, Link, SimpleGrid, Button, Container, Divider, useColorModeValue } from "@chakra-ui/react";

export function AboutPage() {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const accentColor = "#f97316";

  return (
    <Box minH="100vh" bg="bg.default">
      {/* Hero Section */}
      <Box 
        bg={cardBg}
        borderBottom="1px"
        borderColor="border.default"
        py={20}
      >
        <Container maxW="4xl">
          <VStack spacing={6} align="center" textAlign="center">
            <Heading size="4xl" fontWeight="semibold" color="text.primary">
              About 1CNG
            </Heading>
            <Text fontSize="xl" color="text.muted" lineHeight="relaxed">
              Your trusted local cloud provider for Myanmar businesses.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="4xl" py={16}>
        <VStack spacing={12} align="stretch">
          {/* Who We Are */}
          <Box>
            <Heading size="xl" mb={6} fontWeight="semibold">Who We Are</Heading>
            <Text color="text.muted" lineHeight="relaxed" fontSize="lg">
              One Cloud Next-Gen (1CNG) is a trusted local cloud provider offering reliable, high-performance infrastructure designed to serve businesses across Myanmar. We focus on delivering secure, scalable, and cost-effective cloud solutions backed by dedicated local support. Our platform is designed to support workloads of all sizes, from small development environments to enterprise-grade systems.
            </Text>
          </Box>

          <Divider borderColor="border.default" />

          {/* Our Mission */}
          <Box>
            <Heading size="xl" mb={6} fontWeight="semibold">Our Mission</Heading>
            <Text color="text.muted" lineHeight="relaxed" fontSize="lg">
              At One Cloud Next-Gen (1CNG), our mission is to empower businesses in Myanmar with secure, high-performance, and locally supported cloud infrastructure. We aim to simplify cloud adoption through transparent pricing, easy scalability, and reliable local service, helping organizations of all sizes unlock the power of digital transformation.
            </Text>
          </Box>

          <Divider borderColor="border.default" />

          {/* Why 1CNG */}
          <Box>
            <Heading size="xl" mb={6} fontWeight="semibold">Why Choose 1CNG?</Heading>
            <Text color="text.muted" mb={8} lineHeight="relaxed">
              We stand out by combining enterprise-grade infrastructure with the advantages of local hosting:
            </Text>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <Box width="8px" height="8px" borderRadius="full" bg={accentColor} flexShrink={0} mt={1} />
                <Text color="text.muted" lineHeight="relaxed">Low-latency performance for better speed and responsiveness</Text>
              </HStack>
              <HStack spacing={4}>
                <Box width="8px" height="8px" borderRadius="full" bg={accentColor} flexShrink={0} mt={1} />
                <Text color="text.muted" lineHeight="relaxed">Local data residency for compliance and peace of mind</Text>
              </HStack>
              <HStack spacing={4}>
                <Box width="8px" height="8px" borderRadius="full" bg={accentColor} flexShrink={0} mt={1} />
                <Text color="text.muted" lineHeight="relaxed">Quick deployment and simplified onboarding</Text>
              </HStack>
              <HStack spacing={4}>
                <Box width="8px" height="8px" borderRadius="full" bg={accentColor} flexShrink={0} mt={1} />
                <Text color="text.muted" lineHeight="relaxed">Hands-on, local customer support that understands your needs</Text>
              </HStack>
            </VStack>
          </Box>

          <Divider borderColor="border.default" />

          {/* Partner with Us */}
          <Box>
            <Heading size="xl" mb={6} fontWeight="semibold">Partner with Us</Heading>
            <Text color="text.muted" mb={8} lineHeight="relaxed">
              We offer a powerful Reseller Program that helps partners grow their business through:
            </Text>
            <VStack spacing={4} align="stretch" pl={4}>
              <Text color="text.muted" lineHeight="relaxed">• Wholesale discounts and pricing tiers</Text>
              <Text color="text.muted" lineHeight="relaxed">• Quarterly rebates and incentive programs</Text>
              <Text color="text.muted" lineHeight="relaxed">• Sales and technical support</Text>
            </VStack>
            <Text color="text.muted" mt={6} lineHeight="relaxed">
              Whether you're an IT consultant, software house, or system integrator, you can expand your services with 1CNG cloud.
            </Text>
          </Box>

          <Divider borderColor="border.default" />

          {/* Our Team Structure */}
          <Box>
            <Heading size="xl" mb={6} fontWeight="semibold">Our Team Structure</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="text.primary">Solution Architecture</Text>
                <Text color="text.muted" fontSize="sm">Expert cloud architecture design</Text>
              </VStack>
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="text.primary">Cloud Security Team</Text>
                <Text color="text.muted" fontSize="sm">Enterprise-grade security solutions</Text>
              </VStack>
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="text.primary">Professional Support Team</Text>
                <Text color="text.muted" fontSize="sm">24/7 dedicated local support</Text>
              </VStack>
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="text.primary">Network & System Expert Team</Text>
                <Text color="text.muted" fontSize="sm">Infrastructure optimization</Text>
              </VStack>
              <VStack align="start" spacing={2}>
                <Text fontWeight="medium" color="text.primary">Cloud Architect Team</Text>
                <Text color="text.muted" fontSize="sm">Scalable cloud solutions</Text>
              </VStack>
            </SimpleGrid>
          </Box>

          <Divider borderColor="border.default" />

          {/* Ready to Grow */}
          <Box 
            bg={cardBg}
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="lg"
            p={10}
          >
            <VStack spacing={6} align="center" textAlign="center">
              <Heading size="2xl" fontWeight="semibold">Ready to Grow Your Business?</Heading>
              <Text color="text.muted" fontSize="lg" lineHeight="relaxed" maxW="2xl">
                Joining 1CNG is simple. Just sign up on our platform, choose the cloud services you need, and deploy your first instance in minutes. We're here to help you launch, grow, and scale—all on local infrastructure you can trust.
              </Text>
              <Button 
                size="lg" 
                bg={accentColor} 
                color="white"
                _hover={{ bg: "#ea580c" }}
              >
                Get Started Today
              </Button>
            </VStack>
          </Box>

          <Divider borderColor="border.default" />

          {/* Contact */}
          <Box>
            <Heading size="xl" mb={6} fontWeight="semibold">Contact Us</Heading>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <Text fontWeight="medium" width="120px">Website:</Text>
                <Link href="https://1cloudng.com" isExternal color={accentColor}>
                  1cloudng.com
                </Link>
              </HStack>
              <HStack spacing={4}>
                <Text fontWeight="medium" width="120px">Email:</Text>
                <Link href="mailto:info@1cloudng.com" color={accentColor}>
                  info@1cloudng.com
                </Link>
              </HStack>
            </VStack>
          </Box>

          {/* Footer */}
          <Divider borderColor="border.default" />
          <Text fontSize="sm" color="text.muted" textAlign="center" py={4}>
            © 2026 1CNG. All rights reserved. | Built with security in mind.
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
