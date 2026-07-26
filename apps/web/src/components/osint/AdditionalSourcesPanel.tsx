import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Code,
  HStack,
  Input,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Link,
  IconButton,
  useToast,
  Wrap,
} from "@chakra-ui/react";
import { Copy, ExternalLink } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OsintAggregateState, OsintSourceResult } from "../../hooks/useOsintAggregate";

type QueryType = "domain" | "ip" | "asn";

const PANEL_APPLICABILITY: Record<string, QueryType[]> = {
  DNS: ["domain"],
  CT_LOGS: ["domain"],
  WAYBACK: ["domain"],
  REVERSE_DNS: ["ip"],
  SPAMHAUS_DROP: ["ip"],
  RIPESTAT: ["ip", "asn"],
  BGPVIEW: ["ip", "asn"],
  ABUSE_CH: ["domain", "ip"],
};

function CopyableCode({ value }: { value: string }) {
  const toast = useToast();
  return (
    <HStack spacing={1}>
      <Code fontSize="xs" fontFamily="mono">{value}</Code>
      <IconButton
        aria-label="Copy"
        icon={<Copy size={12} />}
        size="xs"
        variant="ghost"
        onClick={() => {
          navigator.clipboard.writeText(value);
          toast({ title: "Copied", status: "success", duration: 1200 });
        }}
      />
    </HStack>
  );
}

function SourceStatusBody({ result, children }: { result: OsintSourceResult | undefined; children: (data: any) => React.ReactNode }) {
  if (!result) {
    return (
      <VStack align="stretch" spacing={2}>
        <Skeleton h="20px" />
        <Skeleton h="20px" />
      </VStack>
    );
  }
  if (result.status === "not_configured") {
    return <Text fontSize="sm" color="text.muted">Not configured &mdash; {result.error}</Text>;
  }
  if (result.status === "error") {
    return <Text fontSize="sm" color="text.muted">Source unavailable ({result.error ?? "unknown error"})</Text>;
  }
  return <>{children(result.data)}</>;
}

function DnsPanel({ result }: { result?: OsintSourceResult }) {
  return (
    <SourceStatusBody result={result}>
      {(data) => {
        const records = data?.records ?? [];
        if (records.length === 0) return <Text fontSize="sm" color="text.muted">No DNS records returned.</Text>;
        return (
          <Table size="sm">
            <Thead><Tr><Th>Type</Th><Th>Value</Th><Th>TTL</Th></Tr></Thead>
            <Tbody>
              {records.map((r: any, i: number) => (
                <Tr key={i}>
                  <Td><Badge fontSize="9px">{r.type}</Badge></Td>
                  <Td><Code fontSize="xs" wordBreak="break-all">{r.value}</Code></Td>
                  <Td fontSize="xs" color="text.muted">{r.ttl}s</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        );
      }}
    </SourceStatusBody>
  );
}

function CtLogsPanel({ result }: { result?: OsintSourceResult }) {
  const [filter, setFilter] = useState("");
  return (
    <SourceStatusBody result={result}>
      {(data) => {
        const subdomains: string[] = data?.subdomains ?? [];
        const filtered = filter ? subdomains.filter((s) => s.includes(filter.toLowerCase())) : subdomains;
        if (subdomains.length === 0) return <Text fontSize="sm" color="text.muted">No certificates found.</Text>;
        return (
          <VStack align="stretch" spacing={3}>
            <Text fontSize="xs" color="text.muted">{data.certificateCount} certificate(s) &middot; {subdomains.length} unique subdomain(s)</Text>
            {subdomains.length > 20 && (
              <Input size="sm" placeholder="Filter subdomains..." value={filter} onChange={(e) => setFilter(e.target.value)} fontFamily="mono" />
            )}
            <Box maxH="240px" overflowY="auto">
              <VStack align="stretch" spacing={1}>
                {filtered.map((s) => <Code key={s} fontSize="xs">{s}</Code>)}
              </VStack>
            </Box>
          </VStack>
        );
      }}
    </SourceStatusBody>
  );
}

function extractPrefixes(ripestat?: OsintSourceResult, bgpview?: OsintSourceResult): string[] {
  const list: string[] = [];
  const rData: any = ripestat?.data;
  if (rData?.announcedPrefixes?.prefixes) list.push(...rData.announcedPrefixes.prefixes.map((p: any) => p.prefix));
  if (rData?.networkInfo?.prefix) list.push(rData.networkInfo.prefix);
  const bData: any = bgpview?.data;
  if (Array.isArray(bData?.prefixes)) list.push(...bData.prefixes.map((p: any) => p.prefix ?? p));
  return Array.from(new Set(list));
}

// BGP/ASN "graph view" — real distribution of announced prefix sizes
// (how many /24s, /23s, etc.), derived from the same RIPEstat/BGPView data
// shown as CIDR chips above, not a separate fabricated data source.
function PrefixDistributionChart({ prefixes }: { prefixes: string[] }) {
  const chartData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const cidr of prefixes) {
      const [, len] = cidr.split("/");
      if (!len) continue;
      const label = `/${len}`;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([prefixLength, count]) => ({ prefixLength, count }))
      .sort((a, b) => Number(a.prefixLength.slice(1)) - Number(b.prefixLength.slice(1)));
  }, [prefixes]);

  if (chartData.length === 0) return null;

  return (
    <Box>
      <Text fontSize="xs" color="text.muted" mb={2}>Announced prefix sizes ({prefixes.length} total)</Text>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis dataKey="prefixLength" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "#e2e8f0" }} />
          <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function NetworkPrefixesPanel({ ripestat, bgpview }: { ripestat?: OsintSourceResult; bgpview?: OsintSourceResult }) {
  const prefixes = useMemo(() => extractPrefixes(ripestat, bgpview), [ripestat, bgpview]);

  if (!ripestat && !bgpview) return <SourceStatusBody result={undefined}>{() => null}</SourceStatusBody>;
  if (ripestat?.status === "error" && (!bgpview || bgpview.status !== "ok")) {
    return <Text fontSize="sm" color="text.muted">Source unavailable ({ripestat.error})</Text>;
  }
  if (prefixes.length === 0) return <Text fontSize="sm" color="text.muted">No announced prefixes found.</Text>;

  const rGeoloc = (ripestat?.data as any)?.geoloc?.located_resources?.[0]?.locations?.[0];

  return (
    <VStack align="stretch" spacing={4}>
      {rGeoloc && (
        <Text fontSize="xs" color="text.muted">
          Approx. location: {rGeoloc.city || "—"} {rGeoloc.country ?? ""} ({rGeoloc.latitude?.toFixed(2)}, {rGeoloc.longitude?.toFixed(2)})
        </Text>
      )}
      {prefixes.length > 1 && <PrefixDistributionChart prefixes={prefixes} />}
      <Wrap spacing={2}>
        {prefixes.slice(0, 50).map((p) => <CopyableCode key={p} value={p} />)}
      </Wrap>
    </VStack>
  );
}

function ReverseDnsPanel({ result }: { result?: OsintSourceResult }) {
  return (
    <SourceStatusBody result={result}>
      {(data) => {
        const hostnames: string[] = data?.hostnames ?? [];
        if (hostnames.length === 0) return <Text fontSize="sm" color="text.muted">No PTR record found.</Text>;
        return <VStack align="stretch" spacing={1}>{hostnames.map((h) => <Code key={h} fontSize="sm">{h}</Code>)}</VStack>;
      }}
    </SourceStatusBody>
  );
}

function WaybackPanel({ result }: { result?: OsintSourceResult }) {
  return (
    <SourceStatusBody result={result}>
      {(data) => {
        if (!data?.available) return <Text fontSize="sm" color="text.muted">No archived snapshots found.</Text>;
        return (
          <VStack align="stretch" spacing={2} fontSize="sm">
            {data.firstSnapshotDate && (
              <HStack justify="space-between"><Text color="text.muted">First seen</Text><Text fontFamily="mono">{data.firstSnapshotDate}</Text></HStack>
            )}
            <HStack justify="space-between"><Text color="text.muted">Last snapshot</Text><Text fontFamily="mono">{data.lastSnapshotDate}</Text></HStack>
            <Link href={data.snapshotUrl} isExternal color="accent.400" fontSize="xs">
              <HStack spacing={1}><ExternalLink size={12} /><Text>View historical snapshot</Text></HStack>
            </Link>
          </VStack>
        );
      }}
    </SourceStatusBody>
  );
}

function ReputationPanel({ abuseCh, spamhaus }: { abuseCh?: OsintSourceResult; spamhaus?: OsintSourceResult }) {
  if (!abuseCh && !spamhaus) return null;
  const badges: { label: string; listed: boolean | null }[] = [];

  if (abuseCh?.status === "ok") {
    const d: any = abuseCh.data;
    if (d.urlhaus) badges.push({ label: "URLhaus", listed: d.urlhaus.listed ?? null });
    if (d.threatfox) badges.push({ label: "ThreatFox", listed: d.threatfox.listed ?? null });
  }
  if (spamhaus?.status === "ok") {
    badges.push({ label: "Spamhaus DROP", listed: (spamhaus.data as any).listed });
  }

  return (
    <VStack align="stretch" spacing={3}>
      {abuseCh?.status === "not_configured" && (
        <Text fontSize="xs" color="text.muted">URLhaus/ThreatFox not configured &mdash; {abuseCh.error}</Text>
      )}
      {badges.length === 0 ? (
        <Text fontSize="sm" color="text.muted">No reputation data available.</Text>
      ) : (
        <Wrap spacing={2}>
          {badges.map((b) => (
            <Badge key={b.label} colorScheme={b.listed ? "red" : "green"} px={3} py={1} borderRadius="full">
              {b.label}: {b.listed ? "Listed" : "Clean"}
            </Badge>
          ))}
        </Wrap>
      )}
    </VStack>
  );
}

function NslookupPanel({ result, domain }: { result?: OsintSourceResult; domain: string }) {
  return (
    <SourceStatusBody result={result}>
      {(data) => {
        const records = data?.records ?? [];
        if (records.length === 0) return <Text fontSize="sm" color="text.muted">No DNS records returned.</Text>;
        const lines = [
          "Server:  cloudflare-dns.com (DNS-over-HTTPS)",
          "Address: 1.1.1.1",
          "",
          "Non-authoritative answer:",
          ...records.map((r: any) => `${domain}${" ".repeat(Math.max(1, 24 - domain.length))}${r.type.padEnd(6)}${r.value}`),
        ];
        return (
          <Box as="pre" fontFamily="mono" fontSize="xs" whiteSpace="pre-wrap" wordBreak="break-all" bg="charcoal.900" p={4} borderRadius="md" borderWidth="1px" borderColor="border.default">
            {lines.join("\n")}
          </Box>
        );
      }}
    </SourceStatusBody>
  );
}

const CONNECTION_TYPE_COLORS: Record<string, string> = {
  A: "#a78bfa",
  AAAA: "#a78bfa",
  MX: "#f97316",
  NS: "#22d3ee",
};

// Domain Connection Graph — real node-link diagram built from the same DNS
// records shown in the table/nslookup panels above (A/AAAA/MX/NS only; TXT
// records aren't "connections" so they're excluded here).
function DomainConnectionGraph({ result, domain }: { result?: OsintSourceResult; domain: string }) {
  return (
    <SourceStatusBody result={result}>
      {(data) => {
        const records = (data?.records ?? []).filter((r: any) => r.type in CONNECTION_TYPE_COLORS);
        if (records.length === 0) return <Text fontSize="sm" color="text.muted">No connection data to graph.</Text>;

        const nodes: { x: number; y: number; type: string; value: string; color: string }[] = records
          .slice(0, 12)
          .map((r: any, i: number) => {
            const angle = (i / Math.min(records.length, 12)) * 2 * Math.PI - Math.PI / 2;
            const radius = 140;
            return {
              x: 200 + radius * Math.cos(angle),
              y: 160 + radius * Math.sin(angle),
              type: r.type,
              value: r.value.replace(/\.$/, ""),
              color: CONNECTION_TYPE_COLORS[r.type],
            };
          });

        return (
          <VStack align="stretch" spacing={3}>
            <Box overflowX="auto">
              <svg viewBox="0 0 400 320" width="100%" height="320" style={{ minWidth: 360 }}>
                {nodes.map((n, i) => (
                  <line key={i} x1={200} y1={160} x2={n.x} y2={n.y} stroke="#2a2a2a" strokeWidth={1.5} />
                ))}
                <circle cx={200} cy={160} r={28} fill="#1a1a1a" stroke="#f97316" strokeWidth={2} />
                <text x={200} y={164} textAnchor="middle" fontSize={9} fill="#f97316" fontFamily="monospace">
                  {domain.length > 14 ? domain.slice(0, 12) + "…" : domain}
                </text>
                {nodes.map((n, i) => (
                  <g key={i}>
                    <circle cx={n.x} cy={n.y} r={7} fill={n.color} />
                    <text
                      x={n.x}
                      y={n.y + (n.y > 160 ? 18 : -12)}
                      textAnchor="middle"
                      fontSize={8}
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      {n.value.length > 20 ? n.value.slice(0, 18) + "…" : n.value}
                    </text>
                  </g>
                ))}
              </svg>
            </Box>
            <HStack spacing={4} fontSize="xs" color="text.muted">
              {Object.entries(CONNECTION_TYPE_COLORS).map(([type, color]) => (
                <HStack key={type} spacing={1}>
                  <Box w="8px" h="8px" borderRadius="full" bg={color} />
                  <Text>{type}</Text>
                </HStack>
              ))}
            </HStack>
          </VStack>
        );
      }}
    </SourceStatusBody>
  );
}

export function AdditionalSourcesPanel({ state }: { state: OsintAggregateState }) {
  const queryType = (state.query?.type as QueryType) ?? "domain";
  const domain = state.query?.value ?? "";
  const applicable = (name: string) => PANEL_APPLICABILITY[name]?.includes(queryType);

  const items: { key: string; title: string; body: React.ReactNode }[] = [];

  if (applicable("DNS")) items.push({ key: "dns", title: "DNS Records", body: <DnsPanel result={state.results.DNS} /> });
  if (applicable("DNS")) items.push({ key: "nslookup", title: "NSLOOKUP", body: <NslookupPanel result={state.results.DNS} domain={domain} /> });
  if (applicable("DNS")) items.push({ key: "graph", title: "Domain Connection Graph", body: <DomainConnectionGraph result={state.results.DNS} domain={domain} /> });
  if (applicable("CT_LOGS")) items.push({ key: "ct", title: "Subdomains / Certificates (crt.sh)", body: <CtLogsPanel result={state.results.CT_LOGS} /> });
  if (applicable("RIPESTAT") || applicable("BGPVIEW")) {
    items.push({
      key: "prefixes",
      title: queryType === "asn" ? "ASN / BGP Prefix Views" : "Network Prefixes",
      body: <NetworkPrefixesPanel ripestat={state.results.RIPESTAT} bgpview={state.results.BGPVIEW} />,
    });
  }
  if (applicable("REVERSE_DNS")) items.push({ key: "rdns", title: "Reverse DNS", body: <ReverseDnsPanel result={state.results.REVERSE_DNS} /> });
  if (applicable("WAYBACK")) items.push({ key: "wayback", title: "Historical Snapshot (Wayback Machine)", body: <WaybackPanel result={state.results.WAYBACK} /> });
  if (applicable("ABUSE_CH") || queryType === "ip") {
    items.push({
      key: "reputation",
      title: "Reputation / Threat Feeds",
      body: <ReputationPanel abuseCh={state.results.ABUSE_CH} spamhaus={state.results.SPAMHAUS_DROP} />,
    });
  }

  if (items.length === 0) return null;

  return (
    <Box borderWidth="1px" borderColor="border.default" borderRadius="xl" bg="bg.surface" overflow="hidden">
      <Box px={6} pt={5} pb={2}>
        <Text fontWeight="semibold" fontSize="sm">Additional Sources</Text>
      </Box>
      <Accordion allowMultiple defaultIndex={[0]}>
        {items.map((item) => (
          <AccordionItem key={item.key} borderColor="border.default">
            <AccordionButton py={4} px={6}>
              <Box flex="1" textAlign="left" fontSize="sm" fontWeight="medium">{item.title}</Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={6} pb={5}>{item.body}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}
