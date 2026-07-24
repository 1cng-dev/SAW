import { Link } from "@tanstack/react-router";
import { Box, HStack, Text } from "@chakra-ui/react";
import { ShieldAlert, Bug } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { decodeHtmlEntities } from "../../lib/text";
import type { Cve } from "../../api/types";

export function CveCard({ cve }: { cve: Cve }) {
  return (
    <Link to="/cves/$cveId" params={{ cveId: cve.id }} style={{ display: "block", height: "100%" }}>
      <Box
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        borderRadius="xl"
        p={4}
        h="full"
        transition="border-color 0.15s ease"
        _hover={{ borderColor: "accent.solid" }}
      >
        <HStack justify="space-between" mb={2}>
          <Text fontFamily="mono" fontSize="sm" fontWeight="medium">
            {cve.id}
          </Text>
          <SeverityBadge severity={cve.severity} />
        </HStack>
        <Text fontSize="sm" color="text.muted" noOfLines={2}>
          {cve.description ? decodeHtmlEntities(cve.description) : "No description available."}
        </Text>
        <HStack mt={3} spacing={3} fontSize="xs" color="text.muted">
          {cve.cvssScore && <Text fontFamily="mono">CVSS {cve.cvssScore}</Text>}
          {cve.isExploitedInWild && (
            <HStack spacing={1} color="severity.critical.500">
              <ShieldAlert size={12} />
              <Text>Exploited</Text>
            </HStack>
          )}
          {cve.hasPoc && (
            <HStack spacing={1} color="severity.medium.500">
              <Bug size={12} />
              <Text>PoC</Text>
            </HStack>
          )}
          {cve.vendor && <Text>{cve.vendor}</Text>}
        </HStack>
      </Box>
    </Link>
  );
}
