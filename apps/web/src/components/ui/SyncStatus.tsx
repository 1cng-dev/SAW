import { Box, HStack, Text, Tooltip } from "@chakra-ui/react";
import { Clock, AlertTriangle } from "lucide-react";

export function SyncStatus({ lastSync, expectedInterval }: { lastSync?: string | null; expectedInterval?: number }) {
  if (!lastSync) {
    return null;
  }

  const lastSyncTime = new Date(lastSync).getTime();
  const now = Date.now();
  const elapsed = now - lastSyncTime;
  const isStale = expectedInterval && elapsed > expectedInterval * 1.5; // 1.5x tolerance

  const formatRelativeTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  return (
    <Tooltip label={`Last synced: ${new Date(lastSync).toLocaleString()}`}>
      <HStack spacing={2} align="center" color="text.muted">
        {isStale ? (
          <AlertTriangle size={14} color="orange.400" />
        ) : (
          <Clock size={14} />
        )}
        <Text fontSize="xs">{formatRelativeTime(elapsed)}</Text>
      </HStack>
    </Tooltip>
  );
}
