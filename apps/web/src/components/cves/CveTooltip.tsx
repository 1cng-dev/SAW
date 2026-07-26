import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Box,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  VStack,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverHeader,
  PopoverCloseButton,
  Divider,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { ShieldAlert, Bug, Clock, ExternalLink, Info, AlertTriangle, Target, Calendar, FileText } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { decodeHtmlEntities } from "../../lib/text";
import type { Cve } from "../../api/types";

interface CveTooltipProps {
  cve: Cve;
  children: React.ReactNode;
}

export function CveTooltip({ cve, children }: CveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cardBg = useColorModeValue("white", "charcoal.800");
  const borderColor = useColorModeValue("border.default", "border.default");

  const getTimeAgo = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 8640000);

    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="auto" closeOnBlur={true}>
      <PopoverTrigger>
        <Box 
          onClick={() => setIsOpen(!isOpen)}
          cursor="pointer"
          _hover={{ color: "accent.400" }}
        >
          {children}
        </Box>
      </PopoverTrigger>
      <PopoverContent 
        bg={cardBg} 
        borderColor={borderColor} 
        boxShadow="xl" 
        width="400px"
        maxW="400px"
        p={0}
        borderRadius="xl"
      >
        <PopoverArrow bg={cardBg} />
        <PopoverCloseButton />
        <PopoverHeader 
          borderBottomWidth="1px" 
          borderColor={borderColor}
          pb={3}
          pt={4}
          px={4}
        >
          <HStack spacing={2}>
            <Text 
              fontFamily="mono" 
              fontSize="md" 
              fontWeight="bold" 
              color="accent.400"
            >
              {cve.id}
            </Text>
            <SeverityBadge severity={cve.severity} />
          </HStack>
        </PopoverHeader>
        <PopoverBody p={4}>
          <VStack spacing={3} align="stretch">
            {/* Description */}
            <Text fontSize="sm" color="text.muted" noOfLines={3} lineHeight="tall">
              {cve.description ? decodeHtmlEntities(cve.description) : "No description available."}
            </Text>

            <Divider />

            {/* Quick Stats Grid */}
            <SimpleGrid columns={2} spacing={3}>
              <Box>
                <HStack spacing={1} mb={1}>
                  <Target size={12} color="#ea580c" />
                  <Text fontSize="xs" color="text.muted">CVSS Score</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="semibold" fontFamily="mono">
                  {cve.cvssScore || "—"}
                </Text>
              </Box>
              <Box>
                <HStack spacing={1} mb={1}>
                  <AlertTriangle size={12} color="#dc2626" />
                  <Text fontSize="xs" color="text.muted">Severity</Text>
                </HStack>
                <SeverityBadge severity={cve.severity} />
              </Box>
              <Box>
                <HStack spacing={1} mb={1}>
                  <Calendar size={12} color="#a78bfa" />
                  <Text fontSize="xs" color="text.muted">Published</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="semibold" fontFamily="mono">
                  {formatDate(cve.publishedDate)}
                </Text>
              </Box>
              <Box>
                <HStack spacing={1} mb={1}>
                  <Clock size={12} color="#22d3ee" />
                  <Text fontSize="xs" color="text.muted">Modified</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="semibold" fontFamily="mono">
                  {formatDate(cve.lastModifiedDate)}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Vendor */}
            {cve.vendor && (
              <Box>
                <HStack spacing={1} mb={1}>
                  <Info size={12} color="#64748b" />
                  <Text fontSize="xs" color="text.muted">Vendor</Text>
                </HStack>
                <Text fontSize="sm" fontWeight="semibold">
                  {cve.vendor}
                </Text>
              </Box>
            )}

            {/* Flags */}
            <HStack spacing={2} flexWrap="wrap">
              {cve.isExploitedInWild && (
                <Badge size="sm" colorScheme="red" variant="solid" px={2} py={1}>
                  <HStack spacing={1}>
                    <ShieldAlert size={10} />
                    <Text>Exploited in Wild</Text>
                  </HStack>
                </Badge>
              )}
              {cve.hasPoc && (
                <Badge size="sm" colorScheme="orange" variant="solid" px={2} py={1}>
                  <HStack spacing={1}>
                    <Bug size={10} />
                    <Text>Has PoC</Text>
                  </HStack>
                </Badge>
              )}
            </HStack>

            <Divider />

            {/* Action Buttons */}
            <HStack spacing={2} justify="stretch">
              <Link to="/cves/$cveId" params={{ cveId: cve.id }} style={{ flex: 1 }}>
                <Button 
                  size="sm" 
                  colorScheme="orange" 
                  width="full"
                  leftIcon={<FileText size={14} />}
                >
                  View Details
                </Button>
              </Link>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
