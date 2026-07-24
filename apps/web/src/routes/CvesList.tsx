import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import type { SortingState } from "@tanstack/react-table";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Show,
  Skeleton,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Download, SlidersHorizontal } from "lucide-react";
import { useCves, type CveFilters } from "../api/hooks";
import { CveFilterSidebar } from "../components/cves/CveFilterSidebar";
import { CveTable } from "../components/cves/CveTable";
import { ErrorState } from "../components/ui/ErrorState";

export function CvesListPage() {
  const search = useSearch({ from: "/cves" });
  const [filters, setFilters] = useState<Partial<CveFilters>>({});
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([{ id: "publishedDate", desc: true }]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const sortBy = sorting[0]?.id ?? "publishedDate";
  const sortDir = sorting[0]?.desc === false ? "asc" : "desc";

  const query = useCves({
    ...filters,
    search: search.search,
    page,
    pageSize: 20,
    sortBy,
    sortDir,
  });

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

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={6}>
      <Show above="md">
        <CveFilterSidebar onChange={handleFilterChange} />
      </Show>

      <Box flex={1} minW={0}>
        <Stack spacing={4}>
          <Flex align="center" justify="space-between" gap={2} wrap="wrap">
            <Heading size="md">
              CVE Database {search.search && <Text as="span" color="text.muted">— "{search.search}"</Text>}
            </Heading>
            <Flex gap={2}>
              <Show below="md">
                <Button size="sm" variant="outline" leftIcon={<SlidersHorizontal size={16} />} onClick={onOpen}>
                  Filters
                </Button>
              </Show>
              <Button size="sm" variant="outline" leftIcon={<Download size={16} />} onClick={handleExport}>
                Export CSV
              </Button>
            </Flex>
          </Flex>

          {query.isError && <ErrorState />}
          {query.isLoading ? (
            <Stack spacing={2}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} height="40px" borderRadius="md" />
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

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="bg.panel">
          <DrawerCloseButton />
          <DrawerHeader>Filters</DrawerHeader>
          <DrawerBody pb={6}>
            <CveFilterSidebar onChange={handleFilterChange} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
