import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import {
  Box,
  Checkbox,
  Heading,
  Input,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Stack,
  Switch,
  Text,
  Divider,
} from "@chakra-ui/react";
import { SEVERITIES } from "@sec1cng/shared";
import type { CveFilters } from "../../api/hooks";

interface FormValues {
  severity: string[];
  dateFrom: string;
  dateTo: string;
  vendor: string;
  minCvss: number;
  maxCvss: number;
  hasPoc: boolean;
  isExploited: boolean;
}

const DEFAULT_VALUES: FormValues = {
  severity: [],
  dateFrom: "",
  dateTo: "",
  vendor: "",
  minCvss: 0,
  maxCvss: 10,
  hasPoc: false,
  isExploited: false,
};

export function CveFilterSidebar({ onChange }: { onChange: (filters: Partial<CveFilters>) => void }) {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
    onSubmit: () => undefined,
  });

  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.state.values;
      onChange({
        severity: values.severity.length > 0 ? values.severity.join(",") : undefined,
        vendor: values.vendor || undefined,
        dateFrom: values.dateFrom || undefined,
        dateTo: values.dateTo || undefined,
        minCvss: values.minCvss > 0 ? values.minCvss : undefined,
        maxCvss: values.maxCvss < 10 ? values.maxCvss : undefined,
        hasPoc: values.hasPoc || undefined,
        isExploited: values.isExploited || undefined,
      });
    });
    return () => unsubscribe.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      as="aside"
      w="full"
      minW={{ md: "280px" }}
      maxW={{ md: "280px" }}
      borderWidth={{ base: 0, md: "1px" }}
      borderColor="border.default"
      bg={{ base: "transparent", md: "bg.surface" }}
      borderRadius="xl"
      p={{ base: 0, md: 5 }}
    >
      <Stack spacing={6}>
        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={3}>
            Severity
          </Heading>
          <form.Field name="severity" mode="array">
            {(field) => (
              <Stack spacing={2}>
                {SEVERITIES.filter((s) => s !== "unknown").map((severity) => (
                  <Checkbox
                    key={severity}
                    isChecked={field.state.value.includes(severity)}
                    onChange={(e) => {
                      if (e.target.checked) field.pushValue(severity);
                      else field.removeValue(field.state.value.indexOf(severity));
                    }}
                    colorScheme="orange"
                    size="sm"
                  >
                    <Text textTransform="capitalize" fontSize="sm" color="text.muted">
                      {severity}
                    </Text>
                  </Checkbox>
                ))}
              </Stack>
            )}
          </form.Field>
        </Box>

        <Divider borderColor="border.default" />

        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={3}>
            Date Range
          </Heading>
          <Stack spacing={2}>
            <form.Field name="dateFrom">
              {(field) => (
                <Input
                  size="sm"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  borderColor="border.default"
                  _hover={{ borderColor: "accent.400" }}
                  _focus={{ borderColor: "accent.400", boxShadow: "0 0 0 1px #f97316" }}
                  bg="charcoal.800"
                />
              )}
            </form.Field>
            <form.Field name="dateTo">
              {(field) => (
                <Input
                  size="sm"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  borderColor="border.default"
                  _hover={{ borderColor: "accent.400" }}
                  _focus={{ borderColor: "accent.400", boxShadow: "0 0 0 1px #f97316" }}
                  bg="charcoal.800"
                />
              )}
            </form.Field>
          </Stack>
        </Box>

        <Divider borderColor="border.default" />

        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={3}>
            Vendor
          </Heading>
          <form.Field name="vendor">
            {(field) => (
              <Input
                size="sm"
                placeholder="e.g. cisco"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                borderColor="border.default"
                _hover={{ borderColor: "accent.400" }}
                _focus={{ borderColor: "accent.400", boxShadow: "0 0 0 1px #f97316" }}
                bg="charcoal.800"
              />
            )}
          </form.Field>
        </Box>

        <Divider borderColor="border.default" />

        <Box>
          <Heading size="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={3}>
            CVSS Range
          </Heading>
          <form.Field name="minCvss">
            {(minField) => (
              <form.Field name="maxCvss">
                {(maxField) => (
                  <Stack spacing={3}>
                    <Box display="flex" justifyContent="space-between" fontSize="xs" color="text.muted" fontFamily="mono">
                      <Text>{minField.state.value.toFixed(1)}</Text>
                      <Text>{maxField.state.value.toFixed(1)}</Text>
                    </Box>
                    <RangeSlider
                      min={0}
                      max={10}
                      step={0.1}
                      value={[minField.state.value, maxField.state.value]}
                      onChange={([min, max]) => {
                        minField.handleChange(min);
                        maxField.handleChange(max);
                      }}
                      colorScheme="orange"
                    >
                      <RangeSliderTrack bg="charcoal.800">
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <RangeSliderThumb index={0} boxSize={4} />
                      <RangeSliderThumb index={1} boxSize={4} />
                    </RangeSlider>
                  </Stack>
                )}
              </form.Field>
            )}
          </form.Field>
        </Box>

        <Divider borderColor="border.default" />

        <Stack spacing={4}>
          <form.Field name="hasPoc">
            {(field) => (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" color="text.muted">Has PoC</Text>
                <Switch 
                  isChecked={field.state.value} 
                  onChange={(e) => field.handleChange(e.target.checked)}
                  colorScheme="orange"
                />
              </Box>
            )}
          </form.Field>
          <form.Field name="isExploited">
            {(field) => (
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Text fontSize="sm" color="text.muted">Exploited in the wild</Text>
                <Switch 
                  isChecked={field.state.value} 
                  onChange={(e) => field.handleChange(e.target.checked)}
                  colorScheme="orange"
                />
              </Box>
            )}
          </form.Field>
        </Stack>
      </Stack>
    </Box>
  );
}
