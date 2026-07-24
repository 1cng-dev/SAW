import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import {
  Box,
  Button,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import type { Cve } from "../../api/types";

const columns: ColumnDef<Cve>[] = [
  {
    accessorKey: "id",
    header: "CVE ID",
    cell: (info) => (
      <Link to="/cves/$cveId" params={{ cveId: info.getValue<string>() }}>
        <Text as="span" fontFamily="mono" fontSize="sm" color="blue.400" _hover={{ textDecoration: "underline" }}>
          {info.getValue<string>()}
        </Text>
      </Link>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: (info) => <SeverityBadge severity={info.getValue<string>()} />,
  },
  {
    accessorKey: "cvssScore",
    header: "CVSS",
    cell: (info) => <Text fontFamily="mono">{info.getValue<string | null>() ?? "—"}</Text>,
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: (info) => info.getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "publishedDate",
    header: "Published",
    cell: (info) => {
      const value = info.getValue<string | null>();
      return value ? new Date(value).toLocaleDateString() : "—";
    },
  },
  {
    id: "flags",
    header: "Flags",
    cell: ({ row }) => (
      <HStack spacing={1}>
        {row.original.isExploitedInWild && (
          <Text as="span" fontSize="xs" px={1.5} py={0.5} borderRadius="sm" bg="red.900" color="red.300">
            Exploited
          </Text>
        )}
        {row.original.hasPoc && (
          <Text as="span" fontSize="xs" px={1.5} py={0.5} borderRadius="sm" bg="orange.900" color="orange.300">
            PoC
          </Text>
        )}
      </HStack>
    ),
  },
];

interface CveTableProps {
  data: Cve[];
  total: number;
  page: number;
  pageSize: number;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  onPageChange: (page: number) => void;
}

export function CveTable({ data, total, page, pageSize, sorting, onSortingChange, onPageChange }: CveTableProps) {
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualSorting: true,
    manualPagination: true,
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" overflow="hidden">
      <TableContainer>
        <Table size="sm" variant="simple">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} cursor="pointer" userSelect="none" onClick={header.column.getToggleSortingHandler()}>
                    <HStack spacing={1}>
                      <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                      {header.column.getCanSort() && <ChevronsUpDown size={12} />}
                    </HStack>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => (
              <Tr key={row.id} _hover={{ bg: hoverBg }}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
                ))}
              </Tr>
            ))}
            {data.length === 0 && (
              <Tr>
                <Td colSpan={columns.length} textAlign="center" py={8} color="text.muted">
                  No CVEs match the current filters.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <HStack justify="space-between" borderTopWidth="1px" borderColor="border.default" px={4} py={3} fontSize="sm">
        <Text color="text.muted">
          Page {page} of {totalPages} · {total.toLocaleString()} results
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ChevronLeft size={16} />}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            isDisabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            rightIcon={<ChevronRight size={16} />}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            isDisabled={page >= totalPages}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
}
