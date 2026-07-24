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
  Badge,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Star } from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import type { Cve } from "../../api/types";

const columns: ColumnDef<Cve>[] = [
  {
    accessorKey: "id",
    header: "CVE ID",
    cell: (info) => (
      <Link to="/cves/$cveId" params={{ cveId: info.getValue<string>() }}>
        <Text as="span" fontFamily="mono" fontSize="sm" color="accent.400" _hover={{ textDecoration: "underline" }} fontWeight="medium">
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
    cell: (info) => (
      <Text fontFamily="mono" color={info.getValue<number>() && info.getValue<number>()! >= 7 ? "severity.critical.500" : info.getValue<number>() && info.getValue<number>()! >= 4 ? "severity.high.500" : "text.muted"}>
        {info.getValue<string | null>() ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: (info) => (
      <Text color="text.muted">{info.getValue<string | null>() ?? "—"}</Text>
    ),
  },
  {
    accessorKey: "publishedDate",
    header: "Published",
    cell: (info) => {
      const value = info.getValue<string | null>();
      return value ? (
        <Text fontFamily="mono" fontSize="xs" color="text.muted">
          {new Date(value).toLocaleDateString()}
        </Text>
      ) : "—";
    },
  },
  {
    id: "flags",
    header: "Flags",
    cell: ({ row }) => (
      <HStack spacing={1}>
        {row.original.isExploitedInWild && (
          <Badge size="sm" colorScheme="red" variant="solid">
            Exploited
          </Badge>
        )}
        {row.original.hasPoc && (
          <Badge size="sm" colorScheme="orange" variant="solid">
            PoC
          </Badge>
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
          <Thead bg="charcoal.800">
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th 
                    key={header.id} 
                    cursor="pointer" 
                    userSelect="none" 
                    onClick={header.column.getToggleSortingHandler()}
                    borderColor="border.default"
                    color="text.muted"
                    fontSize="xs"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    py={3}
                  >
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
              <Tr 
                key={row.id} 
                _hover={{ bg: "charcoal.800" }}
                borderColor="border.default"
                transition="background-color 0.2s"
              >
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id} borderColor="border.default" py={3}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))}
            {data.length === 0 && (
              <Tr>
                <Td colSpan={columns.length} textAlign="center" py={12} color="text.muted">
                  No CVEs match the current filters.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <HStack 
        justify="space-between" 
        borderTopWidth="1px" 
        borderColor="border.default" 
        px={4} 
        py={3} 
        fontSize="sm"
        bg="charcoal.800"
      >
        <Text color="text.muted">
          Page {page} of {totalPages} · {total.toLocaleString()} results
        </Text>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            borderColor="border.default"
            color="text.muted"
            _hover={{ bg: "charcoal.700", borderColor: "accent.400" }}
            leftIcon={<ChevronLeft size={16} />}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            isDisabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderColor="border.default"
            color="text.muted"
            _hover={{ bg: "charcoal.700", borderColor: "accent.400" }}
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
