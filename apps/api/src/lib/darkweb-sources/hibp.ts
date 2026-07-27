import type { DarkWebSource } from "./types";

// HIBP's per-account breach search now requires a paid API key (changed
// policy), but the full breach *list* is still free/public and useful as a
// real reference set — we match tracked keywords (often a company/domain
// name) against each breach's name/title/domain.
const BREACHES_URL = "https://haveibeenpwned.com/api/v3/breaches";
const CACHE_TTL_MS = 60 * 60 * 1000; // this list changes rarely; refresh hourly

interface HibpBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  Description: string;
  DataClasses: string[];
}

let cache: { breaches: HibpBreach[]; fetchedAt: number } | null = null;

async function fetchBreaches(): Promise<HibpBreach[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.breaches;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(BREACHES_URL, { signal: controller.signal, headers: { "User-Agent": "1CNG-Security-Advisory" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const breaches = (await response.json()) as HibpBreach[];
    cache = { breaches, fetchedAt: Date.now() };
    return breaches;
  } finally {
    clearTimeout(timeout);
  }
}

export const hibpSource: DarkWebSource = {
  name: "Have I Been Pwned (breach list)",
  isSample: false,
  search: async (keywords: string[]) => {
    const breaches = await fetchBreaches();
    const matches = [];
    for (const keyword of keywords) {
      const term = keyword.toLowerCase();
      for (const breach of breaches) {
        if (breach.Domain?.toLowerCase().includes(term) || breach.Title.toLowerCase().includes(term) || breach.Name.toLowerCase().includes(term)) {
          matches.push({
            source: "Have I Been Pwned (breach list)",
            isSample: false,
            dateFound: new Date(breach.BreachDate).toISOString(),
            matchedKeyword: keyword,
            snippet: `${breach.Title}: ${breach.DataClasses.slice(0, 5).join(", ")} exposed`,
            riskLevel: (breach.DataClasses.includes("Passwords") ? "high" : "medium") as "high" | "medium",
          });
        }
      }
    }
    return { matches };
  },
};
