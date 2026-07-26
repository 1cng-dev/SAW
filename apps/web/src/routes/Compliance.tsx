import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Progress,
  Checkbox,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Skeleton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useCompliance, useSetComplianceControl } from "../api/hooks";

export function CompliancePage() {
  const compliance = useCompliance();
  const setControl = useSetComplianceControl();
  const [tab, setTab] = useState(0);

  if (compliance.isLoading) return <Skeleton h="400px" />;
  if (compliance.isError || !compliance.data) return <Alert status="error"><AlertIcon />Failed to load compliance data.</Alert>;

  const frameworks = compliance.data.data;

  return (
    <Box>
      <Heading size="lg" mb={1}>Security Policy / Compliance Checklist</Heading>
      <Text color="text.muted" fontSize="sm" mb={6}>
        Track control completion across ISO 27001, NIST CSF, and CIS Controls.
      </Text>

      <Tabs index={tab} onChange={setTab} colorScheme="orange">
        <TabList>
          {frameworks.map((f) => (
            <Tab key={f.key}>
              {f.name.split(" (")[0]}
              <Badge ml={2} colorScheme="orange" fontSize="9px">{f.progressPct}%</Badge>
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {frameworks.map((f) => (
            <TabPanel key={f.key} px={0}>
              <Box mb={4}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" color="text.muted">{f.completedCount} of {f.totalCount} controls complete</Text>
                  <Text fontSize="sm" fontWeight="bold" color="accent.400">{f.progressPct}%</Text>
                </HStack>
                <Progress value={f.progressPct} colorScheme="orange" borderRadius="full" size="sm" />
              </Box>
              <VStack align="stretch" spacing={2}>
                {f.controls.map((c) => (
                  <HStack
                    key={c.id}
                    borderWidth="1px"
                    borderColor="border.default"
                    bg="bg.surface"
                    borderRadius="lg"
                    p={3}
                    justify="space-between"
                  >
                    <HStack>
                      <Checkbox
                        isChecked={c.completed}
                        colorScheme="orange"
                        onChange={(e) => setControl.mutate({ framework: f.key, controlId: c.id, completed: e.target.checked })}
                      />
                      <Box>
                        <HStack>
                          <Text fontFamily="mono" fontSize="xs" color="text.muted">{c.id}</Text>
                          <Badge fontSize="9px">{c.category}</Badge>
                        </HStack>
                        <Text fontSize="sm">{c.title}</Text>
                      </Box>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}
