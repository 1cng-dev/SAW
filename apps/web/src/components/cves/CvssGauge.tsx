import { Box, Text, useColorModeValue } from "@chakra-ui/react";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  unknown: "#64748b",
};

export function CvssGauge({ score, severity }: { score: number | null; severity: string }) {
  const trackColor = useColorModeValue("#e2e8f0", "#334155");
  const clamped = Math.max(0, Math.min(10, score ?? 0));
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - clamped / 10);
  const color = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.unknown;

  return (
    <Box position="relative" w="140px" h="140px" display="flex" alignItems="center" justifyContent="center">
      <svg width="140" height="140" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r="45" fill="none" stroke={trackColor} strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={score == null ? circumference : offset}
          strokeLinecap="round"
        />
      </svg>
      <Box position="absolute" inset={0} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Text fontFamily="mono" fontSize="3xl" fontWeight="bold">
          {score != null ? score.toFixed(1) : "—"}
        </Text>
        <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted">
          CVSS
        </Text>
      </Box>
    </Box>
  );
}
