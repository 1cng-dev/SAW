import { Badge, Box, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";

// Fields worth surfacing per source, in display order. Anything else (huge
// nested blobs like VT's per-vendor engine breakdown) is intentionally omitted.
const ABUSEIPDB_FIELDS: Array<[string, string]> = [
  ["ipAddress", "IP Address"],
  ["countryCode", "Country"],
  ["isp", "ISP"],
  ["domain", "Domain"],
  ["usageType", "Usage Type"],
  ["abuseConfidenceScore", "Abuse Confidence"],
  ["totalReports", "Total Reports"],
  ["numDistinctUsers", "Distinct Reporters"],
  ["lastReportedAt", "Last Reported"],
  ["isWhitelisted", "Whitelisted"],
];

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function AbuseIPDBTable({ data }: { data: Record<string, unknown> }) {
  return (
    <Table size="sm" variant="simple">
      <Tbody>
        {ABUSEIPDB_FIELDS.filter(([key]) => data[key] !== undefined).map(([key, label]) => (
          <Tr key={key}>
            <Td color="text.muted" fontSize="xs" w="40%">
              {label}
            </Td>
            <Td fontFamily="mono" fontSize="xs">
              {key === "abuseConfidenceScore" ? (
                <Badge colorScheme={Number(data[key]) > 50 ? "red" : Number(data[key]) > 25 ? "orange" : "green"}>
                  {formatValue(data[key])}%
                </Badge>
              ) : (
                formatValue(data[key])
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

function VirusTotalTable({ data }: { data: Record<string, unknown> }) {
  const attrs = (data.attributes as Record<string, unknown>) ?? {};
  const stats = (attrs.last_analysis_stats as Record<string, number>) ?? {};
  const totalEngines = Object.values(stats).reduce((sum, v) => sum + (v ?? 0), 0);

  const metaFields: Array<[string, unknown]> = (
    [
      ["Type", data.type],
      ["Reputation", attrs.reputation],
      ["Country", attrs.country],
      ["AS Owner", attrs.as_owner],
      ["Last Analysis", attrs.last_analysis_date ? new Date(Number(attrs.last_analysis_date) * 1000).toLocaleString() : undefined],
    ] as Array<[string, unknown]>
  ).filter(([, v]) => v !== undefined && v !== null);

  return (
    <Box>
      {metaFields.length > 0 && (
        <Table size="sm" variant="simple" mb={3}>
          <Tbody>
            {metaFields.map(([label, value]) => (
              <Tr key={label}>
                <Td color="text.muted" fontSize="xs" w="40%">
                  {label}
                </Td>
                <Td fontFamily="mono" fontSize="xs">
                  {formatValue(value)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {totalEngines > 0 && (
        <Table size="sm" variant="simple">
          <Thead>
            <Tr>
              <Th fontSize="10px">Verdict</Th>
              <Th fontSize="10px" isNumeric>
                Engines
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {(["malicious", "suspicious", "harmless", "undetected", "timeout"] as const)
              .filter((k) => stats[k] !== undefined)
              .map((k) => (
                <Tr key={k}>
                  <Td fontSize="xs" textTransform="capitalize">
                    <Badge
                      colorScheme={k === "malicious" ? "red" : k === "suspicious" ? "orange" : k === "harmless" ? "green" : "gray"}
                      variant="subtle"
                    >
                      {k}
                    </Badge>
                  </Td>
                  <Td fontFamily="mono" fontSize="xs" isNumeric>
                    {stats[k]} / {totalEngines}
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}

export function ExternalApiResultTable({ source, data }: { source: string; data: Record<string, unknown> }) {
  if (source === "AbuseIPDB") return <AbuseIPDBTable data={data} />;
  if (source === "VirusTotal") return <VirusTotalTable data={data} />;
  return <Text fontSize="xs" color="text.muted">No structured view available for this source.</Text>;
}
