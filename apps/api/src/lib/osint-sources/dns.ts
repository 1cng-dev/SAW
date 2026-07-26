import { fetchWithTimeout, ok, err, notConfigured, type OsintSourceModule, type OsintSourceInput } from "./types";

const RECORD_TYPES = ["A", "AAAA", "MX", "TXT", "NS"] as const;

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

async function queryRecord(name: string, type: string): Promise<DohAnswer[]> {
  const response = await fetchWithTimeout(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
    { headers: { accept: "application/dns-json" } },
    6000
  );
  if (!response.ok) return [];
  const json = (await response.json()) as { Answer?: DohAnswer[] };
  return json.Answer ?? [];
}

export const dnsSource: OsintSourceModule = {
  name: "DNS",
  supports: (type) => type === "domain",
  run: async ({ value }: OsintSourceInput) => {
    if (value.length === 0) return notConfigured("DNS", "no domain provided");
    try {
      const results = await Promise.all(RECORD_TYPES.map((t) => queryRecord(value, t)));
      const records = RECORD_TYPES.flatMap((type, i) =>
        results[i].map((a) => ({ type, name: a.name, value: a.data, ttl: a.TTL }))
      );
      return ok("DNS", { records });
    } catch (error) {
      return err("DNS", error instanceof Error ? error.message : "DNS lookup failed");
    }
  },
};
