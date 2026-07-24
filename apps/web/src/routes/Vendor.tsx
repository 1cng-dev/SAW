import { useParams } from "@tanstack/react-router";
import { Box, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { useVendorCves } from "../api/hooks";
import { CveCard } from "../components/cves/CveCard";
import { SeverityDonut } from "../components/charts/SeverityDonut";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function VendorPage() {
  const { vendorName } = useParams({ from: "/vendors/$vendorName" });
  const query = useVendorCves(vendorName);

  return (
    <Box>
      <Heading size="md" mb={6}>
        {vendorName} <Text as="span" color="text.muted">— {query.data?.total ?? "…"} CVEs</Text>
      </Heading>

      {query.isError && <ErrorState />}

      {query.data && (
        <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4} maxW={{ md: "384px" }} mb={6}>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={2}>
            Severity Breakdown
          </Heading>
          <SeverityDonut breakdown={query.data.severityBreakdown} />
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
        {query.isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : query.data?.data.map((cve) => <CveCard key={cve.id} cve={cve} />)}
      </SimpleGrid>
    </Box>
  );
}
