import { fetchWithTimeout, ok, err, type OsintSourceModule, type OsintSourceInput } from "./types";

export const bgpviewSource: OsintSourceModule = {
  name: "BGPVIEW",
  supports: (type) => type === "ip" || type === "asn",
  run: async ({ type, value }: OsintSourceInput) => {
    const path = type === "asn" ? `asn/${value.replace(/^as/i, "")}` : `ip/${value}`;
    try {
      const response = await fetchWithTimeout(`https://api.bgpview.io/${path}`, {}, 7000);
      if (!response.ok) return err("BGPVIEW", `HTTP ${response.status}`);
      const json = (await response.json()) as { data?: unknown };
      return ok("BGPVIEW", json.data ?? null);
    } catch (error) {
      return err("BGPVIEW", error instanceof Error ? error.message : "BGPView lookup failed");
    }
  },
};
