export const CVE_ID_REGEX = /CVE-\d{4}-\d{4,7}/g;

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#ca8a04",
  low: "#2563eb",
  unknown: "#64748b",
};

export const SEVERITIES = ["critical", "high", "medium", "low", "unknown"] as const;

export const NEWS_FEEDS = [
  { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
  { name: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" },
  { name: "SecurityWeek", url: "https://www.securityweek.com/feed/" },
  { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
  { name: "The Record", url: "https://therecord.media/feed/" },
] as const;

// Red Hat has no working plain RSS/Atom feed as of this build — their
// distribution is CSAF/ROLIE JSON, not RSS (confirmed by live curl checks
// during development: access.redhat.com/security/data/csaf/v2/ serves an
// HTML SPA shell, and every candidate *.rss URL either 404s or is also HTML).
// Reported to the user rather than faked; can be added as a CSAF-specific
// ingestion module later if needed.
export const VENDOR_FEEDS = [
  { name: "MSRC", url: "https://api.msrc.microsoft.com/update-guide/rss" },
  { name: "Ubuntu", url: "https://ubuntu.com/security/notices/rss.xml" },
  {
    name: "Cisco",
    url: "https://sec.cloudapps.cisco.com/security/center/psirtrss20/CiscoSecurityAdvisory.xml",
  },
] as const;

export const NEWS_CATEGORIES = [
  "Ransomware",
  "Data Breach",
  "Malware",
  "Vulnerability",
  "APT",
  "Phishing",
  "Other",
] as const;

export const CATEGORY_KEYWORDS: Record<(typeof NEWS_CATEGORIES)[number], string[]> = {
  Ransomware: ["ransomware", "ransom"],
  "Data Breach": ["data breach", "breach", "leaked", "leak"],
  Malware: ["malware", "trojan", "worm", "botnet", "spyware"],
  Vulnerability: ["vulnerability", "flaw", "cve-", "exploit", "patch", "zero-day", "0-day"],
  APT: ["apt", "nation-state", "state-sponsored", "espionage"],
  Phishing: ["phishing", "smishing", "spear-phishing"],
  Other: [],
};

export const EXCERPT_MAX_LENGTH = 300;

export const NVD_API_BASE_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";
export const MITRE_API_BASE_URL = "https://cveawg.mitre.org/api/cve";
export const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
