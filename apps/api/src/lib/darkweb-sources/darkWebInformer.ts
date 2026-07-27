import type { DarkWebMatch, DarkWebSource } from "./types";

const FEED_URL = "https://darkwebinformer.com/rss/";
const CACHE_TTL_MS = 15 * 60 * 1000; // Dark Web Informer's own feed ttl is 60s, but a 15min cache is plenty for a free public feed and keeps us well within fair use.

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  category: string | null;
}

let cache: { items: FeedItem[]; fetchedAt: number } | null = null;

function extractTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i"));
  if (!match) return null;
  return match[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFeed(): Promise<FeedItem[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.items;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(FEED_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();

    const items: FeedItem[] = [];
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
    for (const block of itemBlocks) {
      const title = extractTag(block, "title");
      const link = extractTag(block, "link");
      const description = extractTag(block, "description");
      const pubDate = extractTag(block, "pubDate");
      const category = extractTag(block, "category");
      if (title && link && pubDate) {
        items.push({ title, link, description: description ?? "", pubDate, category });
      }
    }

    cache = { items, fetchedAt: Date.now() };
    return items;
  } finally {
    clearTimeout(timeout);
  }
}

function riskFromCategory(category: string | null): DarkWebMatch["riskLevel"] {
  const c = (category ?? "").toLowerCase();
  if (c.includes("ransomware") || c.includes("breach")) return "high";
  if (c.includes("leak") || c.includes("market")) return "medium";
  return "low";
}

export const darkWebInformerSource: DarkWebSource = {
  name: "Dark Web Informer",
  isSample: false,
  search: async (keywords: string[]) => {
    const items = await fetchFeed();
    const matches: DarkWebMatch[] = [];
    for (const keyword of keywords) {
      const term = keyword.toLowerCase();
      for (const item of items) {
        if (item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)) {
          matches.push({
            source: "Dark Web Informer",
            isSample: false,
            dateFound: new Date(item.pubDate).toISOString(),
            matchedKeyword: keyword,
            snippet: item.description ? `${item.title} — ${item.description}`.slice(0, 300) : item.title,
            riskLevel: riskFromCategory(item.category),
          });
        }
      }
    }
    return { matches };
  },
};
