import { useState } from "react";
import { Box, Heading, Text, VStack, HStack, Badge, Button, Code, Divider, Alert, AlertIcon, AlertTitle, AlertDescription } from "@chakra-ui/react";
import { Key, Copy } from "lucide-react";
import { JsonBlock, HttpBlock } from "../components/docs/CodeBlock";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/cves?severity=critical&pageSize=5",
    description: "List CVEs with filters (severity, vendor, date range, CVSS range, search, ids).",
    response: `{
  "data": [
    { "id": "CVE-2026-48303", "severity": "critical", "cvssScore": "10", "vendor": "adobe" }
  ],
  "page": 1,
  "pageSize": 5,
  "total": 1124
}`,
  },
  {
    method: "GET",
    path: "/api/threat-intel/lookup?indicator=185.220.101.45",
    description: "Look up an IP/domain/hash/URL against real CVE mentions, news mentions, ransomware.live IOCs, and optional VirusTotal/AbuseIPDB.",
    response: `{
  "indicator": "185.220.101.45",
  "indicatorType": "ip",
  "verdict": "unknown",
  "confidence": "low",
  "sources": [],
  "cveMatches": [],
  "newsMatches": []
}`,
  },
  {
    method: "GET",
    path: "/api/osint/aggregate/stream?value=example.com",
    description: "Server-Sent Events stream of RDAP/DNS/CT-logs/RIPEstat/Wayback/reputation results for a domain, IP, or ASN.",
    response: `event: source
data: {"source":"RDAP","status":"ok","data":{"name":"EXAMPLE.COM", ...}}

event: done
data: {"cached":false,"sourcesResponded":5,"totalSources":5}`,
  },
  {
    method: "GET",
    path: "/api/assets/summary",
    description: "Aggregate asset inventory stats: total assets, assets with known CVE matches, severity breakdown.",
    response: `{
  "totalAssets": 4,
  "assetsWithMatches": 2,
  "totalUniqueMatchedCves": 165,
  "severityBreakdown": { "critical": 10, "high": 71, "medium": 80, "low": 4, "unknown": 0 }
}`,
  },
  {
    method: "POST",
    path: "/api/incidents",
    description: "Create a new incident case.",
    response: `{
  "data": {
    "id": "532aaa0b-...",
    "title": "Suspicious login activity",
    "severity": "high",
    "status": "open"
  }
}`,
  },
];

export function ApiDocsPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);

  const generateKey = () => {
    const key = `sk1cng_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join("")}`;
    setApiKey(key);
  };

  return (
    <Box>
      <Heading size="lg" mb={1}>API Access / Developer Docs</Heading>
      <Text color="text.muted" fontSize="sm" mb={6}>
        Query this platform's CVE Database, Threat Intel/IOC Lookup, and OSINT results programmatically.
      </Text>

      <Alert status="warning" mb={6} fontSize="sm">
        <AlertIcon />
        <Box>
          <AlertTitle>No real API-key auth is enforced yet</AlertTitle>
          <AlertDescription>
            All endpoints below are real and live against this deployment's own data with no authentication
            currently required. The key generator is a UI stub for what key-based access would look like once
            an auth layer is added &mdash; it doesn't gate any requests today.
          </AlertDescription>
        </Box>
      </Alert>

      <Box borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5} mb={8}>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="sm" fontWeight="medium">API Key</Text>
          <Button size="sm" leftIcon={<Key size={14} />} colorScheme="orange" onClick={generateKey}>Generate Key</Button>
        </HStack>
        {apiKey ? (
          <HStack>
            <Code fontSize="sm" fontFamily="mono" p={2} flex={1}>{apiKey}</Code>
            <Button size="sm" variant="outline" leftIcon={<Copy size={14} />} onClick={() => navigator.clipboard.writeText(apiKey)}>Copy</Button>
          </HStack>
        ) : (
          <Text fontSize="sm" color="text.muted">No key generated yet.</Text>
        )}
      </Box>

      <Heading size="md" mb={4}>Endpoints</Heading>
      <VStack align="stretch" spacing={6}>
        {ENDPOINTS.map((ep) => (
          <Box key={ep.path} borderWidth="1px" borderColor="border.default" bg="bg.surface" borderRadius="xl" p={5}>
            <HttpBlock method={ep.method} path={ep.path} />
            <Text fontSize="sm" color="text.muted" mb={3}>{ep.description}</Text>
            <Text fontSize="xs" color="text.muted" mb={1} fontWeight="medium">Example Response</Text>
            <JsonBlock code={ep.response} />
          </Box>
        ))}
      </VStack>

      <Divider my={8} />
      <Text fontSize="xs" color="text.muted">
        Base URL: <Code fontSize="xs">{window.location.origin.replace("5173", "4000")}</Code> (or your configured <Code fontSize="xs">VITE_API_BASE_URL</Code>)
      </Text>
    </Box>
  );
}
