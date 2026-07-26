import { fetchWithTimeout, ok, err, notConfigured, type OsintSourceModule, type OsintSourceInput } from "./types";

interface WaybackResponse {
  archived_snapshots?: {
    closest?: { status: string; available: boolean; url: string; timestamp: string };
  };
}

function parseTimestamp(ts: string): string {
  // Wayback timestamps are YYYYMMDDHHMMSS
  const y = ts.slice(0, 4);
  const m = ts.slice(4, 6);
  const d = ts.slice(6, 8);
  return `${y}-${m}-${d}`;
}

async function fetchFirstSnapshot(domain: string): Promise<string | null> {
  const response = await fetchWithTimeout(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=1&fl=timestamp&filter=statuscode:200`,
    {},
    6000
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as string[][];
  const timestamp = rows[1]?.[0];
  return timestamp ? parseTimestamp(timestamp) : null;
}

export const waybackSource: OsintSourceModule = {
  name: "WAYBACK",
  supports: (type) => type === "domain",
  run: async ({ value }: OsintSourceInput) => {
    if (value.length === 0) return notConfigured("WAYBACK", "no domain provided");
    try {
      const [availableResponse, firstSnapshotDate] = await Promise.all([
        fetchWithTimeout(`https://archive.org/wayback/available?url=${encodeURIComponent(value)}`, {}, 6000),
        fetchFirstSnapshot(value).catch(() => null),
      ]);
      if (!availableResponse.ok) return err("WAYBACK", `HTTP ${availableResponse.status}`);
      const json = (await availableResponse.json()) as WaybackResponse;
      const closest = json.archived_snapshots?.closest;
      if (!closest || !closest.available) return ok("WAYBACK", { available: false, firstSnapshotDate });
      return ok("WAYBACK", {
        available: true,
        firstSnapshotDate,
        lastSnapshotDate: parseTimestamp(closest.timestamp),
        snapshotUrl: closest.url,
      });
    } catch (error) {
      return err("WAYBACK", error instanceof Error ? error.message : "Wayback lookup failed");
    }
  },
};
