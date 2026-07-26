import { Box, Flex, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useColorModeValue, Text, HStack, Badge, Progress } from "@chakra-ui/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  sparkline,
  trend,
  trendValue,
  progress,
  status,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor?: string;
  sparkline?: ReactNode;
  trend?: 'increase' | 'decrease';
  trendValue?: string;
  progress?: number;
  status?: 'critical' | 'high' | 'medium' | 'low' | 'elevated' | 'normal';
}) {
  const iconColor = useColorModeValue("#94a3b8", "#64748b");
  const hoverShadow = useColorModeValue("0 4px 12px rgba(0,0,0,0.06)", "0 0 0 1px #2a2a2a, 0 8px 20px rgba(249,115,22,0.06)");
  const cardBg = useColorModeValue("white", "charcoal.800");

  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      case 'elevated': return 'orange';
      case 'normal': return 'blue';
      default: return 'gray';
    }
  };

  const getProgressColor = () => {
    if (progress && progress >= 80) return 'red.500';
    if (progress && progress >= 60) return 'orange.500';
    if (progress && progress >= 40) return 'yellow.500';
    return 'green.500';
  };

  return (
    <Box
      borderWidth="1px"
      borderColor="border.default"
      bg={cardBg}
      borderRadius="xl"
      p={5}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ 
        boxShadow: hoverShadow, 
        borderColor: "accent.solid",
        transform: 'translateY(-2px)'
      }}
      position="relative"
      overflow="hidden"
    >
      {/* Animated gradient overlay on hover */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)"
        opacity={0}
        transition="opacity 0.3s ease"
        _hover={{ opacity: 1 }}
        pointerEvents="none"
      />
      
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Stat>
          <StatLabel fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="text.muted" mb={1}>
            {label}
          </StatLabel>
          <StatNumber fontFamily="mono" fontSize="3xl" fontWeight="bold" color={accentColor || "text.primary"}>
            {value}
          </StatNumber>
          {trend && trendValue && (
            <StatHelpText mb={0}>
              <HStack spacing={1}>
                <StatArrow type={trend === 'increase' ? 'increase' : 'decrease'} />
                <Text fontSize="sm" fontWeight="medium" color={trend === 'increase' ? 'green.500' : 'red.500'}>
                  {trendValue}
                </Text>
              </HStack>
            </StatHelpText>
          )}
        </Stat>
        <Box
          p={2}
          borderRadius="lg"
          bg={accentColor ? `${accentColor}20` : 'gray.100'}
          transition="transform 0.3s ease"
          _hover={{ transform: 'scale(1.1)' }}
        >
          <Icon size={20} color={accentColor || iconColor} />
        </Box>
      </Flex>
      
      {status && (
        <Badge colorScheme={getStatusColor()} variant="subtle" fontSize="xs" mb={2}>
          {status.toUpperCase()}
        </Badge>
      )}
      
      {progress !== undefined && (
        <Box mt={2}>
          <Progress 
            value={progress} 
            size="sm" 
            colorScheme={getProgressColor().split('.')[0] as any}
            borderRadius="full"
            hasStripe
            isAnimated
          />
        </Box>
      )}
      
      {sparkline && <Box mt={3}>{sparkline}</Box>}
    </Box>
  );
}
