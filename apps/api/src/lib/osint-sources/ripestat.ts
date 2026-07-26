import { fetchWithTimeout, ok, err, type OsintSourceModule, type OsintSourceInput } from "./types";

async function ripestatCall(endpoint: string, resource: string) {
  const response = await fetchWithTimeout(
    `https://stat.ripe.net/data/${endpoint}/data.json?resource=${encodeURIComponent(resource)}`,
    {},
    7000
  );
  if (!response.ok) throw new Error(`RIPEstat ${endpoint} returned HTTP ${response.status}`);
  const json = (await response.json()) as { data?: unknown; status?: string };
  if (json.status && json.status !== "ok") throw new Error(`RIPEstat ${endpoint} status: ${json.status}`);
  return json.data;
}

export const ripestatSource: OsintSourceModule = {
  name: "RIPESTAT",
  supports: (type) => type === "ip" || type === "asn",
  run: async ({ type, value }: OsintSourceInput) => {
    try {
      if (type === "ip") {
        const resource = value;
        const [networkInfo, geoloc] = await Promise.all([
          ripestatCall("network-info", resource).catch(() => null),
          ripestatCall("geoloc", resource).catch(() => null),
        ]);
        if (!networkInfo && !geoloc) return err("RIPESTAT", "no data returned for this IP");
        return ok("RIPESTAT", { networkInfo, geoloc });
      }

      // ASN
      const asnNumber = value.replace(/^as/i, "");
      const announcedPrefixes = await ripestatCall("announced-prefixes", `AS${asnNumber}`);
      return ok("RIPESTAT", { announcedPrefixes });
    } catch (error) {
      return err("RIPESTAT", error instanceof Error ? error.message : "RIPEstat lookup failed");
    }
  },
};
