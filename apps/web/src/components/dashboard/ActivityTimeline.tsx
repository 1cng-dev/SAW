import { Link } from "@tanstack/react-router";
import { Box, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import { Newspaper, ShieldAlert, Skull } from "lucide-react";
import { useCves, useNews, useRansomwareVictims } from "../../api/hooks";
import { SeverityBadge } from "../cves/SeverityBadge";
import { ErrorState } from "../ui/ErrorState";

interface TimelineEvent {
  id: string;
  type: "cve" | "news" | "ransomware";
  title: string;
  timestamp: string;
  meta?: string;
  href?: string;
  external?: boolean;
  severity?: string;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function EventRow({ event }: { event: TimelineEvent }) {
  const Icon = event.type === "cve" ? ShieldAlert : event.type === "news" ? Newspaper : Skull;
  const iconColor = event.type === "cve" ? "#f97316" : event.type === "news" ? "#22d3ee" : "#dc2626";

  const content = (
    <HStack align="start" spacing={3} py={2}>
      <Box mt={0.5} flexShrink={0}>
        <Icon size={16} color={iconColor} />
      </Box>
      <Box flex={1} minW={0}>
        <Text fontSize="sm" noOfLines={1}>
          {event.title}
        </Text>
        <HStack spacing={2} mt={0.5}>
          {event.severity && <SeverityBadge severity={event.severity} />}
          {event.meta && (
            <Text fontSize="xs" color="text.muted">
              {event.meta}
            </Text>
          )}
          <Text fontSize="xs" color="text.muted">
            · {timeAgo(event.timestamp)}
          </Text>
        </HStack>
      </Box>
    </HStack>
  );

  if (event.href && event.external) {
    return (
      <a href={event.href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  if (event.href) {
    return (
      <Link to={event.href} params={event.type === "cve" ? { cveId: event.id } : undefined}>
        {content}
      </Link>
    );
  }
  return content;
}

export function ActivityTimeline() {
  const latestCves = useCves({ pageSize: 8, sortBy: "publishedDate", sortDir: "desc" });
  const latestNews = useNews({ pageSize: 8 });
  const latestVictims = useRansomwareVictims();

  const isLoading = latestCves.isLoading || latestNews.isLoading || latestVictims.isLoading;
  const isError = latestCves.isError || latestNews.isError || latestVictims.isError;

  if (isLoading) {
    return (
      <Stack spacing={2}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="44px" borderRadius="md" />
        ))}
      </Stack>
    );
  }

  if (isError) return <ErrorState message="Failed to load activity timeline, retrying..." />;

  const events: TimelineEvent[] = [
    ...(latestCves.data?.data ?? []).map((cve): TimelineEvent => ({
      id: cve.id,
      type: "cve",
      title: `${cve.id} published`,
      timestamp: cve.publishedDate ?? cve.createdAt,
      meta: cve.vendor ?? undefined,
      severity: cve.severity,
      href: "/cves/$cveId",
    })),
    ...(latestNews.data?.data ?? []).map((article): TimelineEvent => ({
      id: article.id,
      type: "news",
      title: article.title,
      timestamp: article.publishedDate ?? article.fetchedAt,
      meta: article.sourceName,
      href: article.sourceUrl,
      external: true,
    })),
    ...(latestVictims.data?.data ?? []).slice(0, 8).map((victim): TimelineEvent => ({
      id: victim.id,
      type: "ransomware",
      title: `${victim.groupName} claimed a new victim: ${victim.name}`,
      timestamp: victim.publishedDate,
      meta: victim.country ?? undefined,
      href: "/ransomware-tracker",
    })),
  ]
    .filter((e) => e.timestamp)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 15);

  if (events.length === 0) {
    return (
      <Text fontSize="sm" color="text.muted">
        No recent activity yet.
      </Text>
    );
  }

  return (
    <Stack spacing={0} divider={<Box borderBottomWidth="1px" borderColor="border.default" />}>
      {events.map((event) => (
        <EventRow key={`${event.type}-${event.id}`} event={event} />
      ))}
    </Stack>
  );
}
