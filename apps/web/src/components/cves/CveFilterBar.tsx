import { useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Button,
  Select,
  Input,
  Switch,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderTrack,
  RangeSliderThumb,
  Wrap,
  Tag,
  TagCloseButton,
  IconButton,
} from "@chakra-ui/react";
import { Filter, X, ChevronDown } from "lucide-react";
import { SEVERITIES } from "@sec1cng/shared";
import type { CveFilters } from "../../api/hooks";

interface CveFilterBarProps {
  filters: Partial<CveFilters>;
  onFilterChange: (filters: Partial<CveFilters>) => void;
  vendors: string[];
}

const DATE_PRESETS = [
  { label: "All Time", value: "" },
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "Custom", value: "custom" },
];

export function CveFilterBar({ filters, onFilterChange, vendors }: CveFilterBarProps) {
  const [datePreset, setDatePreset] = useState("");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== "").length;

  const handleSeverityChange = (value: string) => {
    const current = filters.severity ? filters.severity.split(",") : [];
    if (current.includes(value)) {
      onFilterChange({ ...filters, severity: current.filter(s => s !== value).join(",") || undefined });
    } else {
      onFilterChange({ ...filters, severity: [...current, value].join(",") });
    }
  };

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === "today") {
      const today = new Date().toISOString().slice(0, 10);
      onFilterChange({ ...filters, dateFrom: today, dateTo: today });
    } else if (preset === "7d") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      onFilterChange({ ...filters, dateFrom: weekAgo, dateTo: today });
    } else if (preset === "30d") {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      onFilterChange({ ...filters, dateFrom: monthAgo, dateTo: today });
    } else if (preset === "90d") {
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      onFilterChange({ ...filters, dateFrom: ninetyDaysAgo, dateTo: today });
    } else if (preset === "") {
      onFilterChange({ ...filters, dateFrom: undefined, dateTo: undefined });
    }
  };

  const handleCustomDateChange = () => {
    if (customDateFrom && customDateTo) {
      onFilterChange({ ...filters, dateFrom: customDateFrom, dateTo: customDateTo });
    }
  };

  const selectedSeverities = filters.severity ? filters.severity.split(",") : [];

  return (
    <Box>
      <HStack spacing={3} wrap="wrap" align="center">
        {/* Severity Dropdown */}
        <Popover>
          <PopoverTrigger>
            <Button
              size="sm"
              variant="outline"
              borderColor={selectedSeverities.length > 0 ? "accent.400" : "border.default"}
              color={selectedSeverities.length > 0 ? "accent.400" : "text.muted"}
              rightIcon={<ChevronDown size={14} />}
              bg="charcoal.800"
              _hover={{ borderColor: "accent.400", bg: "charcoal.700" }}
            >
              Severity {selectedSeverities.length > 0 && `(${selectedSeverities.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="charcoal.800" borderColor="border.default" boxShadow="lg">
            <PopoverArrow bg="charcoal.800" />
            <PopoverBody p={3}>
              <VStack spacing={2} align="stretch">
                {SEVERITIES.filter(s => s !== "unknown").map(severity => (
                  <Button
                    key={severity}
                    size="sm"
                    variant={selectedSeverities.includes(severity) ? "solid" : "ghost"}
                    colorScheme={selectedSeverities.includes(severity) ? "orange" : "gray"}
                    justifyContent="flex-start"
                    onClick={() => handleSeverityChange(severity)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Date Range Dropdown */}
        <Popover>
          <PopoverTrigger>
            <Button
              size="sm"
              variant="outline"
              borderColor={filters.dateFrom || filters.dateTo ? "accent.400" : "border.default"}
              color={filters.dateFrom || filters.dateTo ? "accent.400" : "text.muted"}
              rightIcon={<ChevronDown size={14} />}
              bg="charcoal.800"
              _hover={{ borderColor: "accent.400", bg: "charcoal.700" }}
            >
              Date Range
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="charcoal.800" borderColor="border.default" boxShadow="lg">
            <PopoverArrow bg="charcoal.800" />
            <PopoverBody p={3}>
              <VStack spacing={3} align="stretch">
                <Select
                  size="sm"
                  value={datePreset}
                  onChange={(e) => handleDatePresetChange(e.target.value)}
                  bg="charcoal.900"
                  borderColor="border.default"
                  _focus={{ borderColor: "accent.400" }}
                >
                  {DATE_PRESETS.map(preset => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </Select>
                {datePreset === "custom" && (
                  <VStack spacing={2}>
                    <Input
                      size="sm"
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      bg="charcoal.900"
                      borderColor="border.default"
                      _focus={{ borderColor: "accent.400" }}
                    />
                    <Input
                      size="sm"
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      bg="charcoal.900"
                      borderColor="border.default"
                      _focus={{ borderColor: "accent.400" }}
                    />
                    <Button size="sm" colorScheme="orange" onClick={handleCustomDateChange}>
                      Apply
                    </Button>
                  </VStack>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Vendor Dropdown */}
        <Popover>
          <PopoverTrigger>
            <Button
              size="sm"
              variant="outline"
              borderColor={filters.vendor ? "accent.400" : "border.default"}
              color={filters.vendor ? "accent.400" : "text.muted"}
              rightIcon={<ChevronDown size={14} />}
              bg="charcoal.800"
              _hover={{ borderColor: "accent.400", bg: "charcoal.700" }}
            >
              Vendor {filters.vendor && `(${filters.vendor})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="charcoal.800" borderColor="border.default" boxShadow="lg" width="280px">
            <PopoverArrow bg="charcoal.800" />
            <PopoverBody p={3}>
              <VStack spacing={2} align="stretch">
                <Input
                  size="sm"
                  placeholder="Search vendor..."
                  value={filters.vendor || ""}
                  onChange={(e) => onFilterChange({ ...filters, vendor: e.target.value || undefined })}
                  bg="charcoal.900"
                  borderColor="border.default"
                  _focus={{ borderColor: "accent.400" }}
                />
                <Box maxH="200px" overflowY="auto">
                  <VStack spacing={1} align="stretch">
                    {vendors.slice(0, 20).map(vendor => (
                      <Button
                        key={vendor}
                        size="sm"
                        variant="ghost"
                        justifyContent="flex-start"
                        onClick={() => onFilterChange({ ...filters, vendor })}
                        bg={filters.vendor === vendor ? "charcoal.700" : "transparent"}
                      >
                        {vendor}
                      </Button>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* CVSS Range Popover */}
        <Popover>
          <PopoverTrigger>
            <Button
              size="sm"
              variant="outline"
              borderColor={(filters.minCvss !== undefined || filters.maxCvss !== undefined) ? "accent.400" : "border.default"}
              color={(filters.minCvss !== undefined || filters.maxCvss !== undefined) ? "accent.400" : "text.muted"}
              rightIcon={<ChevronDown size={14} />}
              bg="charcoal.800"
              _hover={{ borderColor: "accent.400", bg: "charcoal.700" }}
            >
              CVSS: {filters.minCvss ?? 0}-{filters.maxCvss ?? 10}
            </Button>
          </PopoverTrigger>
          <PopoverContent bg="charcoal.800" borderColor="border.default" boxShadow="lg" width="240px">
            <PopoverArrow bg="charcoal.800" />
            <PopoverBody p={4}>
              <VStack spacing={3}>
                <Box display="flex" justifyContent="space-between" fontSize="xs" color="text.muted" fontFamily="mono">
                  <Text>{filters.minCvss ?? 0}</Text>
                  <Text>{filters.maxCvss ?? 10}</Text>
                </Box>
                <RangeSlider
                  min={0}
                  max={10}
                  step={0.1}
                  value={[filters.minCvss ?? 0, filters.maxCvss ?? 10]}
                  onChange={([min, max]) => {
                    onFilterChange({ 
                      ...filters, 
                      minCvss: min > 0 ? min : undefined,
                      maxCvss: max < 10 ? max : undefined
                    });
                  }}
                  colorScheme="orange"
                >
                  <RangeSliderTrack bg="charcoal.900">
                    <RangeSliderFilledTrack />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} boxSize={4} />
                  <RangeSliderThumb index={1} boxSize={4} />
                </RangeSlider>
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>

        {/* Has PoC Toggle */}
        <HStack spacing={2} px={3} py={2} bg="charcoal.800" borderRadius="md" borderWidth="1px" borderColor={filters.hasPoc ? "accent.400" : "border.default"}>
          <Text fontSize="sm" color="text.muted">Has PoC</Text>
          <Switch
            size="sm"
            isChecked={filters.hasPoc}
            onChange={(e) => onFilterChange({ ...filters, hasPoc: e.target.checked || undefined })}
            colorScheme="orange"
          />
        </HStack>

        {/* Exploited Toggle */}
        <HStack spacing={2} px={3} py={2} bg="charcoal.800" borderRadius="md" borderWidth="1px" borderColor={filters.isExploited ? "accent.400" : "border.default"}>
          <Text fontSize="sm" color="text.muted">Exploited</Text>
          <Switch
            size="sm"
            isChecked={filters.isExploited}
            onChange={(e) => onFilterChange({ ...filters, isExploited: e.target.checked || undefined })}
            colorScheme="orange"
          />
        </HStack>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            color="text.muted"
            _hover={{ color: "accent.400" }}
            onClick={() => onFilterChange({})}
          >
            Clear
          </Button>
        )}
      </HStack>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <Wrap spacing={2} mt={3}>
          {selectedSeverities.map(sev => (
            <Tag key={sev} size="sm" colorScheme="orange" variant="solid" borderRadius="full">
              {sev}
              <TagCloseButton onClick={() => handleSeverityChange(sev)} />
            </Tag>
          ))}
          {filters.vendor && (
            <Tag size="sm" colorScheme="orange" variant="solid" borderRadius="full">
              {filters.vendor}
              <TagCloseButton onClick={() => onFilterChange({ ...filters, vendor: undefined })} />
            </Tag>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Tag size="sm" colorScheme="orange" variant="solid" borderRadius="full">
              {filters.dateFrom} to {filters.dateTo}
              <TagCloseButton onClick={() => onFilterChange({ ...filters, dateFrom: undefined, dateTo: undefined })} />
            </Tag>
          )}
        </Wrap>
      )}
    </Box>
  );
}
