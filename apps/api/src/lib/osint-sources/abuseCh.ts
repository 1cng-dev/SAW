import { fetchWithTimeout, ok, err, notConfigured, type OsintSourceModule, type OsintSourceInput } from "./types";

// abuse.ch moved URLhaus/ThreatFox behind a free "Auth-Key" (registration
// required) in 2024 — no longer usable with zero configuration. Gated behind
// optional env vars, same pattern as the existing VirusTotal/AbuseIPDB
// integrations in threatIntel.ts: absent key -> "not_configured", never faked.
async function checkUrlhaus(host: string, authKey: string) {
  const response = await fetchWithTimeout(
    "https://urlhaus-api.abuse.ch/v1/host/",
    { method: "POST", headers: { "Auth-Key": authKey, "Content-Type": "application/x-www-form-urlencoded" }, body: `host=${encodeURIComponent(host)}` },
    6000
  );
  if (!response.ok) throw new Error(`URLhaus HTTP ${response.status}`);
  const json = (await response.json()) as { query_status: string; url_count?: number; urls?: unknown[] };
  return { listed: json.query_status === "ok" && (json.url_count ?? 0) > 0, urlCount: json.url_count ?? 0, urls: json.urls ?? [] };
}

async function checkThreatFox(searchTerm: string, authKey: string) {
  const response = await fetchWithTimeout(
    "https://threatfox-api.abuse.ch/api/v1/",
    { method: "POST", headers: { "Auth-Key": authKey, "Content-Type": "application/json" }, body: JSON.stringify({ query: "search_ioc", search_term: searchTerm }) },
    6000
  );
  if (!response.ok) throw new Error(`ThreatFox HTTP ${response.status}`);
  const json = (await response.json()) as { query_status: string; data?: unknown[] };
  return { listed: json.query_status === "ok" && Array.isArray(json.data) && json.data.length > 0, matches: json.data ?? [] };
}

export const abuseChSource: OsintSourceModule = {
  name: "ABUSE_CH",
  supports: (type) => type === "domain" || type === "ip",
  run: async ({ value }: OsintSourceInput) => {
    const urlhausKey = process.env.URLHAUS_AUTH_KEY;
    const threatfoxKey = process.env.THREATFOX_AUTH_KEY;
    if (!urlhausKey && !threatfoxKey) {
      return notConfigured("ABUSE_CH", "URLHAUS_AUTH_KEY / THREATFOX_AUTH_KEY not configured (free registration required at abuse.ch)");
    }
    try {
      const [urlhaus, threatfox] = await Promise.all([
        urlhausKey ? checkUrlhaus(value, urlhausKey).catch((e) => ({ error: String(e) })) : null,
        threatfoxKey ? checkThreatFox(value, threatfoxKey).catch((e) => ({ error: String(e) })) : null,
      ]);
      return ok("ABUSE_CH", { urlhaus, threatfox });
    } catch (error) {
      return err("ABUSE_CH", error instanceof Error ? error.message : "abuse.ch lookup failed");
    }
  },
};
