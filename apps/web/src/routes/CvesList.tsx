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
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Download, ShieldCheck, AlertOctagon, Activity, Skull, TrendingUp, Clock, Target, Search, LayoutGrid, Table, X } from "lucide-react";
import { useCves, useStats, useCveBreakdown, useVendors, type CveFilters } from "../api/hooks";
import { useSearchHistory } from "../hooks/useSearchHistory";
import { CveFilterBar } from "../components/cves/CveFilterBar";
import { CveTable } from "../components/cves/CveTable";
import { CveCardView } from "../components/cves/CveCardView";
import { ErrorState } from "../components/ui/ErrorState";

export function CvesListPage() {
  const search = useSearch({ from: "/cves" });
  const { logSearch } = useSearchHistory();
  const [filters, setFilters] = useState<Partial<CveFilters>>({});
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "publishedDate", desc: true }]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchQuery, setSearchQuery] = useState(search.search || '');

  const sortBy = sorting[0]?.id ?? "publishedDate";
  const sortDir = sorting[0]?.desc === false ? "asc" : "desc";

  const query = useCves({
    ...filters,
    search: searchQuery,
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

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setPage(1);
  }

  function clearSearch() {
    setSearchQuery('');
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
  const inputBg = useColorModeValue("white", "charcoal.800");

  return (
    <Box w="full">
      <Stack spacing={6}>
        {/* Header */}
        <Flex align="center" justify="space-between" gap={2} wrap="wrap">
          <Box>
            <Heading size="lg" mb={1}>
              CVE Database
              {searchQuery && <Text as="span" color="text.muted" fontSize="md" ml={2}>— "{searchQuery}"</Text>}
            </Heading>
            {stats.data && (
              <Text fontSize="sm" color="text.muted">
                {stats.data.totalCves.toLocaleString()} total CVEs indexed
              </Text>
            )}
          </Box>
          <HStack spacing={2}>
            {/* Search Input */}
            <InputGroup width="300px">
              <InputLeftElement>
                <Search size={16} color="#64748b" />
              </InputLeftElement>
              <Input
                placeholder="Search CVEs..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onBlur={() => searchQuery.trim() && logSearch("cves", searchQuery.trim())}
                onKeyDown={(e) => e.key === "Enter" && searchQuery.trim() && logSearch("cves", searchQuery.trim())}
                bg={inputBg}
                borderColor="border.default"
                _focus={{ borderColor: "accent.400" }}
                size="sm"
                borderRadius="md"
              />
              {searchQuery && (
                <IconButton
                  aria-label="Clear search"
                  icon={<X size={14} />}
                  size="xs"
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                  onClick={clearSearch}
                  variant="ghost"
                  color="text.muted"
                  _hover={{ color: "accent.400" }}
                />
              )}
            </InputGroup>
            {/* View Toggle */}
            <HStack borderWidth="1px" borderColor="border.default" borderRadius="md" p={1} bg={inputBg}>
              <Tooltip label="Table View">
                <IconButton
                  aria-label="Table view"
                  icon={<Table size={16} />}
                  size="sm"
                  variant={viewMode === 'table' ? 'solid' : 'ghost'}
                  colorScheme={viewMode === 'table' ? 'orange' : 'gray'}
                  onClick={() => setViewMode('table')}
                />
              </Tooltip>
              <Tooltip label="Card View">
                <IconButton
                  aria-label="Card view"
                  icon={<LayoutGrid size={16} />}
                  size="sm"
                  variant={viewMode === 'card' ? 'solid' : 'ghost'}
                  colorScheme={viewMode === 'card' ? 'orange' : 'gray'}
                  onClick={() => setViewMode('card')}
                />
              </Tooltip>
            </HStack>
            <Button size="sm" variant="outline" leftIcon={<Download size={16} />} onClick={handleExport}>
              Export CSV
            </Button>
          </HStack>
        </Flex>

        {/* Stat Cards - 8 cards with enhanced UI */}
        <SimpleGrid columns={{ base: 2, md: 4, xl: 8 }} spacing={4}>
          {stats.data && (
            <>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "accent.solid",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <ShieldCheck size={18} color="#a78bfa" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">Total CVEs</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold">{stats.data.totalCves.toLocaleString()}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "severity.critical.500",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <AlertOctagon size={18} color="#dc2626" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">Critical Today</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold" color="severity.critical.500">{stats.data.todayCriticalCves}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "severity.high.500",
                  boxShadow: "0 4px 12px rgba(234, 88, 12, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <Activity size={18} color="#ea580c" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">High Severity</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold" color="severity.high.500">{stats.data.severityBreakdown.high.toLocaleString()}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "severity.critical.500",
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <Skull size={18} color="#dc2626" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">Exploited</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold" color="severity.critical.500">{breakdown.data?.exploitedInWild?.toLocaleString() || "—"}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "severity.high.500",
                  boxShadow: "0 4px 12px rgba(234, 88, 12, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <Target size={18} color="#ea580c" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">Has PoC</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold" color="severity.high.500">{breakdown.data?.hasPublicPoc?.toLocaleString() || "—"}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "accent.400",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <TrendingUp size={18} color="#22d3ee" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">Avg CVSS</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold" color="accent.400">{breakdown.data?.avgCvssScore || "—"}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "accent.400",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <Clock size={18} color="#a78bfa" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">New This Week</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold">{breakdown.data?.newThisWeek?.toLocaleString() || "—"}</Text>
              </Box>
              <Box 
                p={4} 
                borderWidth="1px" 
                borderColor="border.default" 
                borderRadius="xl" 
                bg={useColorModeValue("white", "charcoal.800")}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ 
                  borderColor: "accent.400",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.08)",
                  transform: 'translateY(-2px)'
                }}
              >
                <HStack spacing={2}>
                  <ShieldCheck size={18} color="#22d3ee" />
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">This Page</Text>
                </HStack>
                <Text fontSize="lg" fontFamily="mono" mt={1} fontWeight="bold">{query.data?.data.length || 0}</Text>
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

        {/* Full-width Table or Card View */}
        {query.isError && <ErrorState />}
        {query.isLoading ? (
          <Stack spacing={2}>
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} height="48px" borderRadius="md" bg="charcoal.800" />
            ))}
          </Stack>
        ) : query.data ? (
          viewMode === 'table' ? (
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
          ) : (
            <CveCardView
              data={query.data.data}
              total={query.data.total}
              page={page}
              pageSize={query.data.pageSize}
              onPageChange={setPage}
            />
          )
        ) : null}
      </Stack>
    </Box>
  );
}
