import type { DarkWebSource } from "./types";

const IP_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const DOMAIN_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;

async function checkUrlhaus(host: string, authKey: string) {
  const response = await fetch("https://urlhaus-api.abuse.ch/v1/host/", {
    method: "POST",
    headers: { "Auth-Key": authKey, "Content-Type": "application/x-www-form-urlencoded" },
    body: `host=${encodeURIComponent(host)}`,
  });
  if (!response.ok) throw new Error(`URLhaus HTTP ${response.status}`);
  const json = (await response.json()) as { query_status: string; url_count?: number; urls?: { url: string; date_added: string }[] };
  return json.query_status === "ok" ? (json.urls ?? []) : [];
}

async function checkThreatFox(term: string, authKey: string) {
  const response = await fetch("https://threatfox-api.abuse.ch/api/v1/", {
    method: "POST",
    headers: { "Auth-Key": authKey, "Content-Type": "application/json" },
    body: JSON.stringify({ query: "search_ioc", search_term: term }),
  });
  if (!response.ok) throw new Error(`ThreatFox HTTP ${response.status}`);
  const json = (await response.json()) as { query_status: string; data?: { ioc: string; first_seen: string; threat_type: string }[] };
  return json.query_status === "ok" ? (json.data ?? []) : [];
}

// Cross-references tracked keywords (when they look like a domain/IP) against
// the same abuse.ch URLhaus/ThreatFox feeds already integrated in OSINT /
// Network Search — reuses the same optional Auth-Key env vars.
export const abuseChCrossRefSource: DarkWebSource = {
  name: "abuse.ch (URLhaus/ThreatFox)",
  isSample: false,
  search: async (keywords: string[]) => {
    const urlhausKey = process.env.URLHAUS_AUTH_KEY;
    const threatfoxKey = process.env.THREATFOX_AUTH_KEY;
    if (!urlhausKey && !threatfoxKey) {
      return { matches: [], notConfigured: true, notConfiguredMessage: "URLHAUS_AUTH_KEY / THREATFOX_AUTH_KEY not configured (free registration required at abuse.ch)" };
    }

    const matches = [];
    for (const keyword of keywords) {
      const looksLikeIndicator = IP_PATTERN.test(keyword) || DOMAIN_PATTERN.test(keyword);
      if (!looksLikeIndicator) continue;

      if (urlhausKey) {
        const urls = await checkUrlhaus(keyword, urlhausKey);
        for (const u of urls.slice(0, 5)) {
          matches.push({
            source: "abuse.ch (URLhaus/ThreatFox)",
            isSample: false,
            dateFound: new Date(u.date_added).toISOString(),
            matchedKeyword: keyword,
            snippet: `Malicious URL hosted on ${keyword}: ${u.url}`,
            riskLevel: "high" as const,
          });
        }
      }
      if (threatfoxKey) {
        const iocs = await checkThreatFox(keyword, threatfoxKey);
        for (const ioc of iocs.slice(0, 5)) {
          matches.push({
            source: "abuse.ch (URLhaus/ThreatFox)",
            isSample: false,
            dateFound: new Date(ioc.first_seen).toISOString(),
            matchedKeyword: keyword,
            snippet: `${keyword} flagged as ${ioc.threat_type} IOC in ThreatFox`,
            riskLevel: "high" as const,
          });
        }
      }
    }
    return { matches };
  },
};
