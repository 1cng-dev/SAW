import { useMemo, useState } from "react";
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Progress,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Skeleton,
  Alert,
  AlertIcon,
  SimpleGrid,
  Input,
  Select,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Textarea,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { Search } from "lucide-react";
import { useCompliance, useSetComplianceControl } from "../api/hooks";
import type { ComplianceControl, ComplianceControlStatus, ComplianceFrameworkStatus } from "../api/types";

const STATUS_COLORS: Record<ComplianceControlStatus, string> = {
  complete: "green",
  incomplete: "red",
  not_applicable: "gray",
};

function ControlRow({ frameworkKey, control }: { frameworkKey: string; control: ComplianceControl }) {
  const setControl = useSetComplianceControl();
  const [notes, setNotes] = useState(control.notes ?? "");

  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="lg" p={3}>
      <HStack justify="space-between" mb={2}>
        <HStack spacing={2} flex={1} minW={0}>
          <Text fontFamily="mono" fontSize="xs" color="text.muted" flexShrink={0}>{control.id}</Text>
          <Text fontSize="sm" noOfLines={2}>{control.title}</Text>
        </HStack>
        <Select
          size="xs"
          w="150px"
          flexShrink={0}
          value={control.status}
          borderColor={`${STATUS_COLORS[control.status]}.500`}
          onChange={(e) => setControl.mutate({ framework: frameworkKey, controlId: control.id, status: e.target.value })}
        >
          <option value="incomplete">Incomplete</option>
          <option value="complete">Complete</option>
          <option value="not_applicable">Not Applicable</option>
        </Select>
      </HStack>
      <Textarea
        size="sm"
        fontSize="xs"
        placeholder="Notes / evidence of how this control is satisfied..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => {
          if (notes !== (control.notes ?? "")) {
            setControl.mutate({ framework: frameworkKey, controlId: control.id, notes });
          }
        }}
        rows={2}
      />
      {control.updatedAt && (
        <Text fontSize="9px" color="text.muted" mt={1}>Updated {new Date(control.updatedAt).toLocaleString()}</Text>
      )}
    </Box>
  );
}

function FrameworkPanel({ framework }: { framework: ComplianceFrameworkStatus }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const map = new Map<string, ComplianceControl[]>();
    for (const c of framework.controls) {
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) continue;
      if (statusFilter !== "all" && c.status !== statusFilter) continue;
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries());
  }, [framework.controls, search, statusFilter]);

  return (
    <Box>
      <HStack mb={4} spacing={3}>
        <Box position="relative" flex={1}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, opacity: 0.5 }} />
          <Input size="sm" pl={8} placeholder="Search controls..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </Box>
        <Select size="sm" w="180px" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="complete">Complete</option>
          <option value="incomplete">Incomplete</option>
          <option value="not_applicable">Not Applicable</option>
        </Select>
      </HStack>

      {categories.length === 0 ? (
        <Text fontSize="sm" color="text.muted">No controls match the current search/filter.</Text>
      ) : (
        <Accordion allowMultiple defaultIndex={[0]}>
          {categories.map(([category, controls]) => {
            const applicable = controls.filter((c) => c.status !== "not_applicable");
            const done = controls.filter((c) => c.status === "complete").length;
            const pct = applicable.length > 0 ? Math.round((done / applicable.length) * 100) : 0;
            return (
              <AccordionItem key={category} borderColor="border.default">
                <AccordionButton py={3}>
                  <HStack flex={1} justify="space-between" pr={4}>
                    <Text fontSize="sm" fontWeight="medium">{category}</Text>
                    <HStack spacing={3}>
                      <Text fontSize="xs" color="text.muted">{done}/{controls.length}</Text>
                      <Box w="80px"><Progress value={pct} size="xs" colorScheme="orange" borderRadius="full" /></Box>
                    </HStack>
                  </HStack>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <VStack align="stretch" spacing={2}>
                    {controls.map((c) => <ControlRow key={c.id} frameworkKey={framework.key} control={c} />)}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </Box>
  );
}

export function CompliancePage() {
  const compliance = useCompliance();
  const [tab, setTab] = useState(0);

  if (compliance.isLoading) return <Skeleton h="400px" />;
  if (compliance.isError || !compliance.data) return <Alert status="error"><AlertIcon />Failed to load compliance data.</Alert>;

  const frameworks = compliance.data.data;

  return (
    <Box>
      <Heading size="lg" mb={1}>Security Policy / Compliance Checklist</Heading>
      <Text color="text.muted" fontSize="sm" mb={6}>
        Track control completion across ISO 27001 (93 Annex A controls), NIST CSF 2.0 (6 functions), and CIS Controls v8.
      </Text>

      {/* Overall summary dashboard */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        {frameworks.map((f) => (
          <Box key={f.key} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5}>
            <HStack spacing={4}>
              <CircularProgress value={f.progressPct} color="orange.400" trackColor="charcoal.700" size="70px">
                <CircularProgressLabel fontSize="sm" fontWeight="bold">{f.progressPct}%</CircularProgressLabel>
              </CircularProgress>
              <Box>
                <Text fontSize="sm" fontWeight="medium" noOfLines={2}>{f.name}</Text>
                <Text fontSize="xs" color="text.muted">{f.completedCount}/{f.totalCount - f.notApplicableCount} applicable complete</Text>
                {f.notApplicableCount > 0 && <Badge fontSize="9px" mt={1}>{f.notApplicableCount} N/A</Badge>}
              </Box>
            </HStack>
          </Box>
        ))}
      </SimpleGrid>

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
              <FrameworkPanel framework={f} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}
