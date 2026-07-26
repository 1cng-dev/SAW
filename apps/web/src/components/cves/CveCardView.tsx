import { Link } from "@tanstack/react-router";
import { Box, HStack, Text, Badge, useColorModeValue, VStack, Flex, SimpleGrid, Button } from "@chakra-ui/react";
import { ShieldAlert, Bug, Clock, ExternalLink, ChevronRight } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { decodeHtmlEntities } from "../../lib/text";
import type { Cve } from "../../api/types";

interface CveCardViewProps {
  data: Cve[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function CveCardView({ data, total, page, pageSize, onPageChange }: CveCardViewProps) {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const hoverShadow = useColorModeValue("0 4px 12px rgba(0,0,0,0.08)", "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.08)");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
        {data.map((cve) => (
          <Link to="/cves/$cveId" params={{ cveId: cve.id }} style={{ display: "block", height: "100%" }} key={cve.id}>
            <Box
              borderWidth="1px"
              borderColor="border.default"
              bg={cardBg}
              borderRadius="xl"
              p={5}
              h="full"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{ 
                borderColor: "accent.solid",
                boxShadow: hoverShadow,
                transform: 'translateY(-2px)'
              }}
              position="relative"
              overflow="hidden"
            >
              {/* Animated gradient overlay on hover */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear-gradient(135deg, rgba(249, 115, 22, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)"
                opacity={0}
                transition="opacity 0.3s ease"
                _hover={{ opacity: 1 }}
                pointerEvents="none"
              />
              
              <VStack spacing={3} align="stretch" position="relative">
                {/* Header with CVE ID and Severity */}
                <Flex justify="space-between" align="start">
                  <HStack spacing={2}>
                    <Text 
                      fontFamily="mono" 
                      fontSize="sm" 
                      fontWeight="bold" 
                      color="accent.400"
                      bg={useColorModeValue("orange.50", "orange.900/20")}
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {cve.id}
                    </Text>
                    <SeverityBadge severity={cve.severity} />
                  </HStack>
                  {cve.publishedDate && (
                    <HStack spacing={1} fontSize="xs" color="text.muted">
                      <Clock size={12} />
                      <Text>{getTimeAgo(cve.publishedDate)}</Text>
                    </HStack>
                  )}
                </Flex>

                {/* Description */}
                <Text fontSize="sm" color="text.muted" noOfLines={3} lineHeight="tall">
                  {cve.description ? decodeHtmlEntities(cve.description) : "No description available."}
                </Text>

                {/* CVSS Score and Indicators */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={3} fontSize="xs">
                    {cve.cvssScore && (
                      <Badge 
                        colorScheme={Number(cve.cvssScore) >= 9 ? 'red' : Number(cve.cvssScore) >= 7 ? 'orange' : Number(cve.cvssScore) >= 4 ? 'yellow' : 'green'}
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        CVSS {cve.cvssScore}
                      </Badge>
                    )}
                    {cve.isExploitedInWild && (
                      <HStack spacing={1} color="severity.critical.500">
                        <ShieldAlert size={12} />
                        <Text fontWeight="medium">Exploited</Text>
                      </HStack>
                    )}
                    {cve.hasPoc && (
                      <HStack spacing={1} color="severity.medium.500">
                        <Bug size={12} />
                        <Text fontWeight="medium">PoC</Text>
                      </HStack>
                    )}
                  </HStack>
                  {cve.vendor && (
                    <Badge variant="outline" fontSize="xs" colorScheme="gray">
                      {cve.vendor}
                    </Badge>
                  )}
                </HStack>

                {/* View Details Link */}
                <HStack spacing={1} fontSize="xs" color="accent.400" fontWeight="medium">
                  <Text>View Details</Text>
                  <ChevronRight size={12} />
                </HStack>
              </VStack>
            </Box>
          </Link>
        ))}
      </SimpleGrid>

      {/* Pagination */}
      {data.length === 0 && (
        <Box p={12} textAlign="center" bg={cardBg} borderRadius="xl" borderWidth="1px" borderColor="border.default">
          <Text fontSize="lg" fontWeight="medium" color="text.muted" mb={2}>
            No CVEs match the current filters.
          </Text>
          <Text fontSize="sm" color="text.muted">
            Try adjusting your search or filter criteria.
          </Text>
        </Box>
      )}

      {/* Pagination Controls */}
      <HStack 
        justify="space-between" 
        mt={6}
        px={4} 
        py={3} 
        fontSize="sm"
      >
        <Text color="text.muted">
          Page {page} of {totalPages} · {total.toLocaleString()} results
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            borderColor="border.default"
            color="text.muted"
            _hover={{ bg: "charcoal.700", borderColor: "accent.400" }}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            isDisabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderColor="border.default"
            color="text.muted"
            _hover={{ bg: "charcoal.700", borderColor: "accent.400" }}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            isDisabled={page >= totalPages}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
