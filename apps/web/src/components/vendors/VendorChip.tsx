import { Link } from "@tanstack/react-router";
import { HStack, Tag, TagLabel, Text } from "@chakra-ui/react";
import type { VendorSummary } from "../../api/types";

export function VendorChip({ vendor }: { vendor: VendorSummary }) {
  return (
    <Link to="/vendors/$vendorName" params={{ vendorName: vendor.vendor }}>
      <HStack
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        borderRadius="full"
        px={4}
        py={2}
        fontSize="sm"
        transition="border-color 0.15s ease"
        _hover={{ borderColor: "accent.solid" }}
      >
        <Text fontWeight="medium">{vendor.vendor}</Text>
        <Tag size="sm" borderRadius="full" variant="subtle">
          <TagLabel>{vendor.cveCount}</TagLabel>
        </Tag>
      </HStack>
    </Link>
  );
}
