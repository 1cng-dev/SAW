import { Link } from "@tanstack/react-router";
import { HStack, Text, Badge, useColorModeValue, Box } from "@chakra-ui/react";
import { Building2, TrendingUp } from "lucide-react";
import type { VendorSummary } from "../../api/types";

export function VendorChip({ vendor }: { vendor: VendorSummary }) {
  const chipBg = useColorModeValue("white", "charcoal.800");
  const hoverShadow = useColorModeValue("0 4px 12px rgba(0,0,0,0.08)", "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.08)");

  const getSeverityColor = (cveCount: number) => {
    if (cveCount >= 1000) return 'red';
    if (cveCount >= 500) return 'orange';
    if (cveCount >= 100) return 'yellow';
    return 'blue';
  };

  return (
    <Link to="/vendors/$vendorName" params={{ vendorName: vendor.vendor }} style={{ display: "block" }}>
      <Box
        borderWidth="1px"
        borderColor="border.default"
        bg={chipBg}
        borderRadius="full"
        px={5}
        py={3}
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
          bgGradient="linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)"
          opacity={0}
          transition="opacity 0.3s ease"
          _hover={{ opacity: 1 }}
          pointerEvents="none"
          borderRadius="full"
        />
        
        <HStack spacing={3} position="relative">
          <Building2 size={16} color="#64748b" />
          <Text fontWeight="semibold" fontSize="sm">{vendor.vendor}</Text>
          <Badge 
            colorScheme={getSeverityColor(vendor.cveCount)} 
            variant="subtle"
            borderRadius="full"
            px={2}
            py={1}
            fontSize="xs"
          >
            {vendor.cveCount.toLocaleString()}
          </Badge>
          {vendor.cveCount >= 100 && (
            <TrendingUp size={12} color="#f97316" />
          )}
        </HStack>
      </Box>
    </Link>
  );
}
