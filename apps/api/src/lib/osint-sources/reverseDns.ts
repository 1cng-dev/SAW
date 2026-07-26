import { fetchWithTimeout, ok, err, notConfigured, type OsintSourceModule, type OsintSourceInput } from "./types";

function toPtrName(ip: string): string | null {
  // IPv4 only for now — reverse octets under in-addr.arpa.
  const parts = ip.split(".");
  if (parts.length !== 4 || !parts.every((p) => /^\d{1,3}$/.test(p))) return null;
  return `${parts.reverse().join(".")}.in-addr.arpa`;
}

export const reverseDnsSource: OsintSourceModule = {
  name: "REVERSE_DNS",
  supports: (type) => type === "ip",
  run: async ({ value }: OsintSourceInput) => {
    const ptrName = toPtrName(value);
    if (!ptrName) return notConfigured("REVERSE_DNS", "IPv6 reverse lookup not supported");
    try {
      const response = await fetchWithTimeout(
        `https://cloudflare-dns.com/dns-query?name=${ptrName}&type=PTR`,
        { headers: { accept: "application/dns-json" } },
        6000
      );
      if (!response.ok) return err("REVERSE_DNS", `HTTP ${response.status}`);
      const json = (await response.json()) as { Answer?: { data: string }[] };
      const hostnames = (json.Answer ?? []).map((a) => a.data.replace(/\.$/, ""));
      return ok("REVERSE_DNS", { hostnames });
    } catch (error) {
      return err("REVERSE_DNS", error instanceof Error ? error.message : "Reverse DNS lookup failed");
    }
  },
};
