import { fetchWithTimeout, ok, err, type OsintSourceModule, type OsintSourceInput } from "./types";

const REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours — Spamhaus asks that DROP/EDROP not be polled more often than this
const LIST_URLS = ["https://www.spamhaus.org/drop/drop.txt", "https://www.spamhaus.org/drop/edrop.txt"];

interface DropEntry {
  cidr: string;
  sblRef: string;
  baseIp: number;
  prefixLen: number;
}

let cache: { entries: DropEntry[]; fetchedAt: number } | null = null;
let inFlight: Promise<DropEntry[]> | null = null;

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function parseDropList(text: string): DropEntry[] {
  const entries: DropEntry[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";")) continue;
    const [cidr, , ref] = trimmed.split(/\s*;\s*/);
    const [base, prefix] = cidr.split("/");
    if (!base || !prefix) continue;
    entries.push({ cidr, sblRef: ref ?? "", baseIp: ipToInt(base), prefixLen: Number(prefix) });
  }
  return entries;
}

async function refreshList(): Promise<DropEntry[]> {
  const texts = await Promise.all(
    LIST_URLS.map(async (url) => {
      const response = await fetchWithTimeout(url, {}, 8000);
      if (!response.ok) return "";
      return response.text();
    })
  );
  const entries = texts.flatMap(parseDropList);
  cache = { entries, fetchedAt: Date.now() };
  return entries;
}

async function getDropList(): Promise<DropEntry[]> {
  if (cache && Date.now() - cache.fetchedAt < REFRESH_INTERVAL_MS) return cache.entries;
  if (inFlight) return inFlight;
  inFlight = refreshList().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

function ipInCidr(ipInt: number, entry: DropEntry): boolean {
  if (entry.prefixLen === 0) return true;
  const mask = entry.prefixLen === 32 ? 0xffffffff : (~0 << (32 - entry.prefixLen)) >>> 0;
  return (ipInt & mask) === (entry.baseIp & mask);
}

export const spamhausDropSource: OsintSourceModule = {
  name: "SPAMHAUS_DROP",
  supports: (type) => type === "ip",
  run: async ({ value }: OsintSourceInput) => {
    try {
      const entries = await getDropList();
      const ipInt = ipToInt(value);
      const match = entries.find((e) => ipInCidr(ipInt, e));
      return ok("SPAMHAUS_DROP", {
        listed: Boolean(match),
        matchedCidr: match?.cidr ?? null,
        sblRef: match?.sblRef ?? null,
        listSize: entries.length,
        listAgeMs: cache ? Date.now() - cache.fetchedAt : null,
      });
    } catch (error) {
      return err("SPAMHAUS_DROP", error instanceof Error ? error.message : "Spamhaus DROP lookup failed");
    }
  },
};
