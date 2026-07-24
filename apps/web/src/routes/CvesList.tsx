import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import {
  Box,
  Button,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  SimpleGrid,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { Download, ShieldCheck, AlertOctagon, Activity, Skull, TrendingUp, Clock, Target } from "lucide-react";
import { useCves, useStats, useCveBreakdown, useVendors, type CveFilters } from "../api/hooks";
import { CveFilterBar } from "../components/cves/CveFilterBar";
import { CveTable } from "../components/cves/CveTable";
import { ErrorState } from "../components/ui/ErrorState";

export function CvesListPage() {
  const search = useSearch({ from: "/cves" });
  const [filters, setFilters] = useState<Partial<CveFilters>>({});
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "publishedDate", desc: true }]);

  const sortBy = sorting[0]?.id ?? "publishedDate";
  const sortDir = sorting[0]?.desc === false ? "asc" : "desc";

  const query = useCves({
    ...filters,
    search: search.search,
    page,
    pageSize: 50,
    sortBy,
    sortDir,
  });

  const stats = useStats();
  const breakdown = useCveBreakdown();
  const vendors = useVendors();

  function handleFilterChange(next: Partial<CveFilters>) {
    setFilters(next);
    setPage(1);
  }

  function handleExport() {
    const params = new URLSearchParams();
    Object.entries({ ...filters, search: search.search, sortBy, sortDir }).forEach(([key, value]) => {
      if (value !== undefined) params.set(key, String(value));
    });
    window.open(`/api/cves/export?${params.toString()}`, "_blank");
  }

  const vendorList = vendors.data?.data.map(v => v.vendor) || [];

  return (
    <Box w="full">
      <Stack spacing={6}>
        {/* Header */}
        <Flex align="center" justify="space-between" gap={2} wrap="wrap">
          <Box>
            <Heading size="lg" mb={1}>
              CVE Database
              {search.search && <Text as="span" color="text.muted" fontSize="md" ml={2}>— "{search.search}"</Text>}
            </Heading>
            {stats.data && (
              <Text fontSize="sm" color="text.muted">
                {stats.data.totalCves.toLocaleString()} total CVEs indexed
              </Text>
            )}
          </Box>
          <Button size="sm" variant="outline" leftIcon={<Download size={16} />} onClick={handleExport}>
            Export CSV
          </Button>
        </Flex>

        {/* Stat Cards - 8 cards */}
        <SimpleGrid columns={{ base: 2, md: 4, xl: 8 }} spacing={4}>
          {stats.data && (
            <>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <ShieldCheck size={18} color="#a78bfa" />
                  <Text fontSize="xs" color="text.muted">Total CVEs</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1}>{stats.data.totalCves.toLocaleString()}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <AlertOctagon size={18} color="#dc2626" />
                  <Text fontSize="xs" color="text.muted">Critical Today</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} color="severity.critical.500">{stats.data.todayCriticalCves}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <Activity size={18} color="#ea580c" />
                  <Text fontSize="xs" color="text.muted">High Severity</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} color="severity.high.500">{stats.data.severityBreakdown.high.toLocaleString()}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <Skull size={18} color="#dc2626" />
                  <Text fontSize="xs" color="text.muted">Exploited</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} color="severity.critical.500">{breakdown.data?.exploitedInWild?.toLocaleString() || "—"}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <Target size={18} color="#ea580c" />
                  <Text fontSize="xs" color="text.muted">Has PoC</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} color="severity.high.500">{breakdown.data?.hasPublicPoc?.toLocaleString() || "—"}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <TrendingUp size={18} color="#22d3ee" />
                  <Text fontSize="xs" color="text.muted">Avg CVSS</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} color="accent.400">{breakdown.data?.avgCvssScore || "—"}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <Clock size={18} color="#a78bfa" />
                  <Text fontSize="xs" color="text.muted">New This Week</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1}>{breakdown.data?.newThisWeek?.toLocaleString() || "—"}</Text>
              </Box>
              <Box p={4} borderWidth="1px" borderColor="border.default" borderRadius="md" bg="charcoal.800">
                <HStack spacing={2}>
                  <ShieldCheck size={18} color="#22d3ee" />
                  <Text fontSize="xs" color="text.muted">This Page</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1}>{query.data?.data.length || 0}</Text>
              </Box>
            </>
          )}
        </SimpleGrid>

        {/* Horizontal Filter Bar */}
        <CveFilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange}
          vendors={vendorList}
        />

        {/* Full-width Table */}
        {query.isError && <ErrorState />}
        {query.isLoading ? (
          <Stack spacing={2}>
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} height="48px" borderRadius="md" bg="charcoal.800" />
            ))}
          </Stack>
        ) : query.data ? (
          <CveTable
            data={query.data.data}
            total={query.data.total}
            page={page}
            pageSize={query.data.pageSize}
            sorting={sorting}
            onSortingChange={(s) => {
              setSorting(s);
              setPage(1);
            }}
            onPageChange={setPage}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
