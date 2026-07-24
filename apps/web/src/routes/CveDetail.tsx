import type { ReactNode } from "react";
import { useParams } from "@tanstack/react-router";
import { Box, Center, Flex, Heading, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { ExternalLink, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCve } from "../api/hooks";
import { SeverityBadge } from "../components/cves/SeverityBadge";
import { CvssGauge } from "../components/cves/CvssGauge";
import { NewsCard } from "../components/news/NewsCard";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { decodeHtmlEntities } from "../lib/text";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4}>
      <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={3}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}

export function CveDetailPage() {
  const { cveId } = useParams({ from: "/cves/$cveId" });
  const { data, isLoading, isError } = useCve(cveId);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </SimpleGrid>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Failed to load CVE detail, retrying..." />;
  }

  const { data: cve, relatedNews } = data;

  return (
    <Stack spacing={6}>
      <Flex justify="space-between" wrap="wrap" gap={3}>
        <HStack spacing={3}>
          <Heading size="lg" fontFamily="mono">
            {cve.id}
          </Heading>
          <SeverityBadge severity={cve.severity} />
        </HStack>
        <Text fontSize="sm" color="text.muted">
          {cve.viewCount.toLocaleString()} views
        </Text>
      </Flex>

      <Text maxW="3xl">{cve.description ? decodeHtmlEntities(cve.description) : "No description available."}</Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Center borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={4}>
          <CvssGauge score={cve.cvssScore != null ? Number(cve.cvssScore) : null} severity={cve.severity} />
        </Center>

        <Panel title="Key Facts">
          <Stack spacing={2} fontSize="sm">
            <HStack justify="space-between">
              <Text color="text.muted">CWE</Text>
              <Text fontFamily="mono">{cve.cweId ?? "—"}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="text.muted">Vendor</Text>
              <Text>{cve.vendor ?? "—"}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="text.muted">Published</Text>
              <Text>{cve.publishedDate ? new Date(cve.publishedDate).toLocaleDateString() : "—"}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="text.muted">Last modified</Text>
              <Text>{cve.lastModifiedDate ? new Date(cve.lastModifiedDate).toLocaleDateString() : "—"}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="text.muted">Source</Text>
              <Text>{cve.source}</Text>
            </HStack>
          </Stack>
        </Panel>

        <Panel title="Exploitation Status">
          <Stack spacing={3} fontSize="sm">
            <HStack color={cve.isExploitedInWild ? "severity.critical.500" : "text.muted"}>
              <ShieldAlert size={16} />
              <Text>{cve.isExploitedInWild ? "Exploited in the wild" : "No known exploitation"}</Text>
            </HStack>
            <HStack color={cve.hasPoc ? "severity.medium.500" : "text.muted"}>
              <ShieldCheck size={16} />
              <Text>{cve.hasPoc ? "Public PoC available" : "No public PoC known"}</Text>
            </HStack>
          </Stack>
        </Panel>
      </SimpleGrid>

      {cve.affectedProducts.length > 0 && (
        <Panel title="Affected Products">
          <Stack spacing={1.5} fontSize="sm" divider={<Box borderBottomWidth="1px" borderColor="border.default" />}>
            {cve.affectedProducts.map((product) => (
              <Text key={product} py={0.5}>
                {product}
              </Text>
            ))}
          </Stack>
        </Panel>
      )}

      {cve.references.length > 0 && (
        <Panel title="References">
          <Stack spacing={1.5} fontSize="sm">
            {cve.references.map((ref) => (
              <HStack
                key={ref.url}
                as="a"
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                color="blue.400"
                _hover={{ textDecoration: "underline" }}
                align="start"
              >
                <ExternalLink size={14} style={{ flexShrink: 0, marginTop: 3 }} />
                <Text wordBreak="break-all">{ref.url}</Text>
              </HStack>
            ))}
          </Stack>
        </Panel>
      )}

      {relatedNews.length > 0 && (
        <Box>
          <Heading size="md" mb={3}>
            Related News
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {relatedNews.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </SimpleGrid>
        </Box>
      )}
    </Stack>
  );
}
