import { Box, Flex, Stat, StatLabel, StatNumber, useColorModeValue } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  sparkline,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor?: string;
  sparkline?: ReactNode;
}) {
  const iconColor = useColorModeValue("#94a3b8", "#64748b");
  const hoverShadow = useColorModeValue("0 4px 12px rgba(0,0,0,0.06)", "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.06)");

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      borderRadius="xl"
      p={4}
      transition="box-shadow 0.15s ease, border-color 0.15s ease"
      _hover={{ boxShadow: hoverShadow, borderColor: "accent.solid" }}
    >
      <Flex justify="space-between" align="center">
        <Stat>
          <StatLabel fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted">
            {label}
          </StatLabel>
          <StatNumber fontFamily="mono" fontSize="2xl" color={accentColor}>
            {value}
          </StatNumber>
        </Stat>
        <Icon size={16} color={iconColor} />
      </Flex>
      {sparkline && <Box mt={2}>{sparkline}</Box>}
    </Box>
  );
}
