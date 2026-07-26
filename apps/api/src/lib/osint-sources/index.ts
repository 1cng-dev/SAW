import { rdapSource } from "./rdap";
import { dnsSource } from "./dns";
import { reverseDnsSource } from "./reverseDns";
import { ctLogsSource } from "./ctLogs";
import { ripestatSource } from "./ripestat";
import { bgpviewSource } from "./bgpview";
import { waybackSource } from "./wayback";
import { abuseChSource } from "./abuseCh";
import { spamhausDropSource } from "./spamhausDrop";
import type { OsintSourceModule } from "./types";

// Plugin registry: adding a new OSINT data source means dropping in one new
// module file here and listing it — no other aggregation/UI code changes.
export const OSINT_SOURCES: OsintSourceModule[] = [
  rdapSource,
  dnsSource,
  reverseDnsSource,
  ctLogsSource,
  ripestatSource,
  bgpviewSource,
  waybackSource,
  abuseChSource,
  spamhausDropSource,
];

export * from "./types";
export { detectQueryType } from "./rdap";
