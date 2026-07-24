import { Badge } from "@chakra-ui/react";

const SEVERITY_HEX: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  unknown: "#64748b",
};

export function SeverityBadge({ severity }: { severity: string }) {
  const color = SEVERITY_HEX[severity] ?? SEVERITY_HEX.unknown;
  return (
    <Badge
      textTransform="uppercase"
      fontSize="xs"
      fontWeight="medium"
      borderRadius="md"
      px={2}
      py={0.5}
      color={color}
      bg={`${color}26`}
      borderWidth="1px"
      borderColor={`${color}66`}
    >
      {severity}
    </Badge>
  );
}
