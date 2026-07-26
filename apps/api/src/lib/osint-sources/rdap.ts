import { fetchWithTimeout, ok, err, type OsintSourceModule, type OsintSourceInput, type OsintQueryType } from "./types";

export function detectQueryType(query: string): OsintQueryType | null {
  const trimmed = query.trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed) || /^[0-9a-fA-F:]+:[0-9a-fA-F:]*$/.test(trimmed)) return "ip";
  if (/^as?\d+$/i.test(trimmed)) return "asn";
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(trimmed)) return "domain";
  return null;
}

export async function fetchRdap(path: string) {
  const response = await fetchWithTimeout(`https://rdap.org/${path}`, { headers: { Accept: "application/rdap+json" } }, 15000);
  if (!response.ok) return null;
  return response.json();
}

function extractEntityInfo(entities: any[] | undefined, role: string) {
  if (!Array.isArray(entities)) return null;
  const match = entities.find((e) => Array.isArray(e.roles) && e.roles.includes(role));
  if (!match) return null;
  const vcard = match.vcardArray?.[1] as any[] | undefined;
  const name = vcard?.find((field: any[]) => field[0] === "fn")?.[3];
  return { handle: match.handle, name: name ?? null };
}

function extractEvents(events: any[] | undefined) {
  if (!Array.isArray(events)) return {};
  const find = (action: string) => events.find((e) => e.eventAction === action)?.eventDate ?? null;
  return {
    registered: find("registration"),
    lastChanged: find("last changed"),
    expires: find("expiration"),
  };
}

export function normalizeRdap(queryType: OsintQueryType, query: string, raw: any) {
  return {
    queryType,
    query,
    source: "RDAP (rdap.org)",
    name: raw.ldhName ?? raw.name ?? raw.handle ?? query,
    handle: raw.handle ?? null,
    status: raw.status ?? [],
    events: extractEvents(raw.events),
    registrar: extractEntityInfo(raw.entities, "registrar"),
    registrant: extractEntityInfo(raw.entities, "registrant"),
    nameservers: Array.isArray(raw.nameservers) ? raw.nameservers.map((ns: any) => ns.ldhName) : [],
    network:
      queryType === "ip"
        ? { startAddress: raw.startAddress ?? null, endAddress: raw.endAddress ?? null, cidrs: raw.cidr0_cidrs ?? [] }
        : null,
    country: raw.country ?? null,
    raw,
  };
}

export const rdapSource: OsintSourceModule = {
  name: "RDAP",
  supports: () => true,
  run: async ({ type, value }: OsintSourceInput) => {
    const path = type === "domain" ? `domain/${value}` : type === "ip" ? `ip/${value}` : `autnum/${value.replace(/^as/i, "")}`;
    try {
      const raw = await fetchRdap(path);
      if (!raw) return err("RDAP", "No RDAP record found");
      return ok("RDAP", normalizeRdap(type, value, raw));
    } catch (error) {
      return err("RDAP", error instanceof Error ? error.message : "RDAP lookup failed");
    }
  },
};
