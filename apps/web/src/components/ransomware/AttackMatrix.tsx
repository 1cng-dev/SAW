import { Box, Heading, HStack, SimpleGrid, Skeleton, Stack, Text, Tooltip } from "@chakra-ui/react";
import { useRansomwareAttack, type AttackTactic } from "../../api/hooks";
import { ErrorState } from "../ui/ErrorState";

function TacticColumn({ tactic }: { tactic: AttackTactic }) {
  return (
    <Box borderWidth="1px" borderColor="border.default" bg="charcoal.800" borderRadius="lg" p={3} minW="200px">
      <Text fontSize="xs" fontWeight="semibold" color="accent.400" mb={1}>
        {tactic.tactic_id}
      </Text>
      <Text fontSize="sm" fontWeight="medium" mb={3}>
        {tactic.tactic_name}
      </Text>
      <Stack spacing={2}>
        {tactic.techniques.map((tech) => (
          <Tooltip key={tech.technique_id} label={tech.technique_details} placement="top" hasArrow>
            <Box borderWidth="1px" borderColor="border.default" borderRadius="md" px={2} py={1.5} bg="bg.surface" cursor="help">
              <Text fontSize="xs" fontFamily="mono" color="teal.400">
                {tech.technique_id}
              </Text>
              <Text fontSize="xs" color="text.muted" noOfLines={2}>
                {tech.technique_name}
              </Text>
            </Box>
          </Tooltip>
        ))}
      </Stack>
    </Box>
  );
}

export function AttackMatrix({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useRansomwareAttack(slug);

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height="180px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  if (isError) return <ErrorState message="Failed to load ATT&CK data, retrying..." />;

  const tactics = data?.ttps ?? [];

  if (tactics.length === 0) {
    return (
      <Text fontSize="sm" color="text.muted">
        No MITRE ATT&CK mapping available for this group yet.
      </Text>
    );
  }

  return (
    <Stack spacing={3}>
      <HStack justify="space-between">
        <Heading size="sm">MITRE ATT&CK Technique Matrix</Heading>
        <Text fontSize="xs" color="text.muted">
          {data?.cached ? "cached" : "live"} · source: ransomware.live
        </Text>
      </HStack>
      <Box overflowX="auto" pb={2}>
        <HStack spacing={3} align="start">
          {tactics.map((tactic) => (
            <TacticColumn key={tactic.tactic_id} tactic={tactic} />
          ))}
        </HStack>
      </Box>
    </Stack>
  );
}
