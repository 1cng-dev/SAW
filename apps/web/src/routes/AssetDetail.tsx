import { useParams } from "@tanstack/react-router";
import { Box, Heading, Text, Badge, HStack, VStack, Skeleton, Alert, AlertIcon, SimpleGrid } from "@chakra-ui/react";
import { useAsset } from "../api/hooks";
import { CveCard } from "../components/cves/CveCard";

export function AssetDetailPage() {
  const { assetId } = useParams({ strict: false }) as { assetId: string };
  const { data, isLoading, isError } = useAsset(assetId);

  if (isLoading) return <Skeleton h="300px" />;
  if (isError || !data) return <Alert status="error"><AlertIcon />Asset not found.</Alert>;

  const { data: asset, matchedCves } = data;

  return (
    <Box>
      <HStack justify="space-between" mb={2}>
        <Box>
          <HStack spacing={2}>
            <Heading size="lg">{asset.name}</Heading>
            <Badge>{asset.assetType}</Badge>
          </HStack>
          <Text color="text.muted" fontFamily="mono" fontSize="sm" mt={1}>
            {asset.value}{asset.version ? ` — v${asset.version}` : ""}
          </Text>
        </Box>
      </HStack>

      {asset.notes && <Text color="text.muted" mb={4}>{asset.notes}</Text>}

      <Heading size="md" mt={6} mb={3}>
        Matched CVEs ({matchedCves.length})
      </Heading>

      {matchedCves.length === 0 ? (
        <Box p={8} textAlign="center" borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface">
          <Text color="text.muted">
            {asset.assetType === "software"
              ? "No CVE matches found for this vendor/product yet."
              : "IP/domain assets aren't cross-matched against the CVE Database (no direct relationship in the data model)."}
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
          {matchedCves.map((cve) => <CveCard key={cve.id} cve={cve} />)}
        </SimpleGrid>
      )}
    </Box>
  );
}
