import { Button, HStack, useColorModeValue } from "@chakra-ui/react";

export type DateRangeOption = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeFilterProps {
  value: DateRangeOption;
  onChange: (value: DateRangeOption) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const activeBg = useColorModeValue("orange.100", "whiteAlpha.200");
  const activeColor = useColorModeValue("orange.600", "accent.400");
  const inactiveColor = useColorModeValue("gray.600", "text.muted");

  const options: { label: string; value: DateRangeOption }[] = [
    { label: "Today", value: "today" },
    { label: "7d", value: "7d" },
    { label: "30d", value: "30d" },
    { label: "90d", value: "90d" },
  ];

  return (
    <HStack spacing={2}>
      {options.map((option) => (
        <Button
          key={option.value}
          size="sm"
          variant="ghost"
          bg={value === option.value ? activeBg : "transparent"}
          color={value === option.value ? activeColor : inactiveColor}
          fontWeight={value === option.value ? "semibold" : "normal"}
          onClick={() => onChange(option.value)}
          _hover={{ bg: value === option.value ? activeBg : "whiteAlpha.100" }}
        >
          {option.label}
        </Button>
      ))}
    </HStack>
  );
}
