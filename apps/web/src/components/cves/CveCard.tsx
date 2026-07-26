import { Link } from "@tanstack/react-router";
import { Box, HStack, Text, Badge, useColorModeValue, VStack, Flex, IconButton } from "@chakra-ui/react";
import { ShieldAlert, Bug, Clock, TrendingUp, ExternalLink, Star } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { decodeHtmlEntities } from "../../lib/text";
import { useWatchlist } from "../../hooks/useWatchlist";
import type { Cve } from "../../api/types";

export function CveCard({ cve }: { cve: Cve }) {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const hoverShadow = useColorModeValue("0 4px 12px rgba(0,0,0,0.08)", "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.08)");
  const { isCveWatched, toggleCve } = useWatchlist();
  const watched = isCveWatched(cve.id);

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
    <Box position="relative" h="full">
      <IconButton
        aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
        icon={<Star size={16} color={watched ? "#f97316" : "#64748b"} fill={watched ? "#f97316" : "none"} />}
        size="sm"
        variant="ghost"
        position="absolute"
        top={2}
        right={2}
        zIndex={2}
        bg={cardBg}
        _hover={{ bg: cardBg }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCve(cve.id);
        }}
      />
      <Link to="/cves/$cveId" params={{ cveId: cve.id }} style={{ display: "block", height: "100%" }}>
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
          top={
0}
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
          <Text fontSize="sm" color="text.muted" noOfLines={2} lineHeight="tall">
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

          {/* Trending indicator for trending CVEs */}
          {cve.trendingScore && Number(cve.trendingScore) > 50 && (
            <HStack spacing={1} fontSize="xs" color="accent.400">
              <TrendingUp size={12} />
              <Text fontWeight="medium">Trending</Text>
            </HStack>
          )}
        </VStack>
      </Box>
      </Link>
    </Box>
  );
}
