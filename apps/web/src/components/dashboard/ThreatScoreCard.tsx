import { Box, Flex, Text, Badge, useColorModeValue } from "@chakra-ui/react";
import { ShieldAlert } from "lucide-react";

interface ThreatScoreCardProps {
  score: number;
  maxScore?: number;
  status?: 'critical' | 'elevated' | 'normal' | 'low';
}

export function ThreatScoreCard({ score, maxScore = 100, status = 'normal' }: ThreatScoreCardProps) {
  const cardBg = useColorModeValue("white", "charcoal.800");
  const percentage = (score / maxScore) * 100;
  
  const getStatusColor = () => {
    switch (status) {
      case 'critical': return '#dc2626';
      case 'elevated': return '#f97316';
      case 'normal': return '#3b82f6';
      case 'low': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'critical': return 'CRITICAL';
      case 'elevated': return 'ELEVATED';
      case 'normal': return 'NORMAL';
      case 'low': return 'LOW';
      default: return 'UNKNOWN';
    }
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      bg={cardBg}
      borderRadius="xl"
      p={6}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ 
        boxShadow: "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.06)",
        transform: 'translateY(-2px)'
      }}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wide" color="text.muted">
          Threat Score
        </Text>
        <Badge colorScheme={status === 'critical' ? 'red' : status === 'elevated' ? 'orange' : status === 'normal' ? 'blue' : 'green'} variant="subtle">
          {getStatusLabel()}
        </Badge>
      </Flex>

      <Flex justify="center" align="center" mb={4}>
        <Box position="relative">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeOpacity="0.1"
              color="#64748b"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke={getStatusColor()}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </svg>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
          >
            <Text fontSize="3xl" fontWeight="bold" fontFamily="mono" color={getStatusColor()}>
              {score}
            </Text>
            <Text fontSize="xs" color="text.muted">
              / {maxScore}
            </Text>
          </Box>
        </Box>
      </Flex>

      <Flex justify="center" align="center" gap={2}>
        <ShieldAlert size={16} color={getStatusColor()} />
        <Text fontSize="xs" color="text.muted">
          Real-time threat assessment
        </Text>
      </Flex>
    </Box>
  );
}
