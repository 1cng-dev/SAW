import { fetchWithTimeout, ok, err, notConfigured, type OsintSourceModule, type OsintSourceInput } from "./types";

interface CrtShEntry {
  name_value: string;
  issuer_name: string;
  not_before: string;
  not_after: string;
}

export const ctLogsSource: OsintSourceModule = {
  name: "CT_LOGS",
  supports: (type) => type === "domain",
  run: async ({ value }: OsintSourceInput) => {
    if (value.length === 0) return notConfigured("CT_LOGS", "no domain provided");
    try {
      // crt.sh's public search endpoint is frequently overloaded (502s / slow
      // responses are common) — a longer timeout than other sources is
      // intentional, and a failure here degrades gracefully rather than
      // blocking the rest of the aggregate lookup.
      const response = await fetchWithTimeout(`https://crt.sh/?q=${encodeURIComponent(value)}&output=json`, {}, 15000);
      if (!response.ok) return err("CT_LOGS", `crt.sh returned HTTP ${response.status} (service is often overloaded)`);
      const entries = (await response.json()) as CrtShEntry[];
      const subdomains = new Set<string>();
      for (const entry of entries) {
        for (const name of entry.name_value.split("\n")) {
          const trimmed = name.trim().toLowerCase();
          if (trimmed && !trimmed.startsWith("*.")) subdomains.add(trimmed);
        }
      }
      return ok("CT_LOGS", {
        certificateCount: entries.length,
        subdomains: Array.from(subdomains).sort(),
      });
    } catch (error) {
      return err("CT_LOGS", error instanceof Error ? error.message : "crt.sh lookup failed or timed out");
    }
  },
};
