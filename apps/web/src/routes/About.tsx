import { Box, Heading, Text, VStack, HStack, Link, SimpleGrid, Badge, Button, Container, Divider, useColorModeValue, Flex } from "@chakra-ui/react";
import { Shield, Database, Globe, Mail, ExternalLink, Github, Lock, Zap, Cloud, Users, Handshake, Rocket, CheckCircle, Award, Target, TrendingUp, Star, ArrowRight, Building2, MapPin, Phone } from "lucide-react";

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
        py={16}
      >
        <Container maxW="6xl">
          <VStack spacing={4} align="center" textAlign="center">
            <Cloud size={64} color={accentColor} />
            <Heading size="4xl" fontWeight="bold">About 1CNG</Heading>
            <Text fontSize="xl" color="text.muted" maxW="2xl" mt={4}>
              Your trusted local cloud provider for Myanmar businesses.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="6xl" py={16}>
        <VStack spacing={16} align="stretch">
          {/* Who We Are */}
          <Box>
            <Heading size="2xl" mb={8} textAlign="center">Who We Are</Heading>
            <Box 
              bg={cardBg}
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="2xl"
              p={12}
              boxShadow="sm"
            >
              <Text color="text.muted" lineHeight="tall" fontSize="lg" textAlign="center">
                One Cloud Next-Gen (1CNG) is a trusted local cloud provider offering reliable, high-performance infrastructure designed to serve businesses across Myanmar. We focus on delivering secure, scalable, and cost-effective cloud solutions backed by dedicated local support. Our platform is designed to support workloads of all sizes, from small development environments to enterprise-grade systems.
              </Text>
            </Box>
          </Box>

          {/* Our Mission */}
          <Box>
            <Heading size="2xl" mb={8} textAlign="center">Our Mission</Heading>
            <Box 
              bg={cardBg}
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="2xl"
              p={12}
              boxShadow="sm"
            >
              <Text color="text.muted" lineHeight="tall" fontSize="lg" textAlign="center">
                At One Cloud Next-Gen (1CNG), our mission is to empower businesses in Myanmar with secure, high-performance, and locally supported cloud infrastructure. We aim to simplify cloud adoption through transparent pricing, easy scalability, and reliable local service, helping organizations of all sizes unlock the power of digital transformation.
              </Text>
            </Box>
          </Box>

          {/* Why 1CNG */}
          <Box>
            <Heading size="2xl" mb={8} textAlign="center">Why Choose 1CNG?</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              {[
                { icon: Zap, title: "Low-Latency Performance", desc: "Better speed and responsiveness for your applications" },
                { icon: Shield, title: "Local Data Residency", desc: "Compliance and peace of mind with data stored locally" },
                { icon: Rocket, title: "Quick Deployment", desc: "Simplified onboarding and fast instance provisioning" },
                { icon: Users, title: "Local Support", desc: "Hands-on customer support that understands your needs" }
              ].map((item, index) => (
                <VStack 
                  key={index}
                  p={8}
                  bg={cardBg}
                  borderRadius="2xl"
                  borderWidth="1px"
                  borderColor="border.default"
                  spacing={4}
                  boxShadow="sm"
                  align="center"
                  textAlign="center"
                >
                  <Box 
                    p={4} 
                    borderRadius="xl" 
                    bg="orange.50" 
                    _dark={{ bg: "orange.900" }}
                  >
                    <item.icon size={40} color={accentColor} />
                  </Box>
                  <Heading size="md">{item.title}</Heading>
                  <Text color="text.muted">{item.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>

          {/* Partner with Us */}
          <Box>
            <Heading size="2xl" mb={8} textAlign="center">Partner with Us</Heading>
            <Box 
              bgGradient="linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="2xl"
              p={12}
            >
              <Text color="text.muted" mb={10} fontSize="lg" textAlign="center">
                We offer a powerful Reseller Program that helps partners grow their business through:
              </Text>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                {[
                  { icon: Award, title: "Wholesale Discounts", desc: "Competitive pricing tiers for resellers" },
                  { icon: TrendingUp, title: "Quarterly Rebates", desc: "Incentive programs to boost earnings" },
                  { icon: Handshake, title: "Full Support", desc: "Sales and technical assistance included" }
                ].map((item, index) => (
                  <VStack 
                    key={index}
                    p={6}
                    bg={cardBg}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="border.default"
                    spacing={4}
                    align="center"
                    boxShadow="sm"
                  >
                    <item.icon size={36} color={accentColor} />
                    <Text fontWeight="bold" fontSize="lg">{item.title}</Text>
                    <Text color="text.muted" textAlign="center" fontSize="sm">{item.desc}</Text>
                  </VStack>
                ))}
              </SimpleGrid>
              <Text color="text.muted" mt={10} textAlign="center">
                Whether you're an IT consultant, software house, or system integrator, you can expand your services with 1CNG cloud.
              </Text>
            </Box>
          </Box>

          {/* Our Team Structure */}
          <Box>
            <Heading size="2xl" mb={8} textAlign="center">Our Team Structure</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[
                { name: "Solution Architecture", desc: "Expert cloud architecture design", icon: Target },
                { name: "Cloud Security Team", desc: "Enterprise-grade security solutions", icon: Shield },
                { name: "Professional Support", desc: "24/7 dedicated local support", icon: Users },
                { name: "Network & Systems", desc: "Infrastructure optimization", icon: Database },
                { name: "Cloud Architects", desc: "Scalable cloud solutions", icon: Cloud }
              ].map((team, index) => (
                <VStack 
                  key={index}
                  p={6}
                  bg={cardBg}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="border.default"
                  spacing={4}
                  align="center"
                  boxShadow="sm"
                >
                  <team.icon size={36} color={accentColor} />
                  <Text fontWeight="bold" fontSize="md" textAlign="center">{team.name}</Text>
                  <Text fontSize="sm" color="text.muted" textAlign="center">{team.desc}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>

          {/* Ready to Grow */}
          <Box 
            bg={cardBg}
            borderRadius="2xl"
            p={16}
            boxShadow="sm"
            borderWidth="1px"
            borderColor="border.default"
          >
            <VStack spacing={8} align="center" textAlign="center">
              <Rocket size={64} color={accentColor} />
              <Heading size="3xl">Ready to Grow Your Business?</Heading>
              <Text color="text.muted" fontSize="lg" maxW="2xl">
                Joining 1CNG is simple. Just sign up on our platform, choose the cloud services you need, and deploy your first instance in minutes. We're here to help you launch, grow, and scale—all on local infrastructure you can trust.
              </Text>
              <Button 
                size="lg" 
                bg={accentColor} 
                color="white"
                _hover={{ bg: "#ea580c" }}
                rightIcon={<ArrowRight size={20} />}
                px={8}
              >
                Get Started Today
              </Button>
            </VStack>
          </Box>

          {/* Contact */}
          <Box>
            <Heading size="2xl" mb={8} textAlign="center">Contact Us</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <HStack 
                spacing={6}
                p={8}
                bg={cardBg}
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="2xl"
                boxShadow="sm"
                align="center"
              >
                <Box 
                  p={4} 
                  borderRadius="xl" 
                  bg="orange.50"
                  _dark={{ bg: "orange.900" }}
                >
                  <Globe size={32} color={accentColor} />
                </Box>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" fontSize="lg">Website</Text>
                  <Link href="https://1cloudng.com" isExternal color="accent.400">
                    <HStack spacing={2}>
                      <Text>1cloudng.com</Text>
                      <ExternalLink size={16} />
                    </HStack>
                  </Link>
                </VStack>
              </HStack>
              <HStack 
                spacing={6}
                p={8}
                bg={cardBg}
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="2xl"
                boxShadow="sm"
                align="center"
              >
                <Box 
                  p={4} 
                  borderRadius="xl" 
                  bg="orange.50"
                  _dark={{ bg: "orange.900" }}
                >
                  <Mail size={32} color={accentColor} />
                </Box>
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" fontSize="lg">Email</Text>
                  <Link href="mailto:info@1cloudng.com" color="accent.400">
                    info@1cloudng.com
                  </Link>
                </VStack>
              </HStack>
            </SimpleGrid>
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
