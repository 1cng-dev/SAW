import Parser from "rss-parser";
import { newsArticles, type Db, type NewNewsArticle } from "@sec1cng/db";
import { CATEGORY_KEYWORDS, CVE_ID_REGEX, EXCERPT_MAX_LENGTH, NEWS_FEEDS, NEWS_CATEGORIES } from "@sec1cng/shared";
import { logger } from "../lib/logger";
import { withRetry } from "../lib/retry";
import { withSyncLog } from "../lib/syncLogger";

const JOB_NAME = "sync-news-feeds";
const parser = new Parser({ timeout: 15_000 });

function inferCategory(title: string): (typeof NEWS_CATEGORIES)[number] {
  const lower = title.toLowerCase();
  for (const category of NEWS_CATEGORIES) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Other";
}

function extractCveIds(text: string): string[] {
  const matches = text.match(CVE_ID_REGEX);
  return matches ? Array.from(new Set(matches.map((m) => m.toUpperCase()))) : [];
}

function truncateExcerpt(text: string | undefined): string | null {
  if (!text) return null;
  const stripped = text.replace(/<[^>]*>/g, "").trim();
  if (stripped.length <= EXCERPT_MAX_LENGTH) return stripped;
  return `${stripped.slice(0, EXCERPT_MAX_LENGTH - 1)}…`;
}

export interface FeedIngestionResult {
  recordsFetched: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
}

async function ingestOneFeed(db: Db, feedName: string, feedUrl: string): Promise<FeedIngestionResult> {
  const errors: string[] = [];
  let recordsFetched = 0;
  let recordsInserted = 0;

  try {
    const feed = await withRetry(() => parser.parseURL(feedUrl), {
      label: `news:${feedName}`,
      maxAttempts: 3,
      baseDelayMs: 2000,
    });

    const rows: NewNewsArticle[] = (feed.items ?? [])
      .filter((item) => item.link)
      .map((item) => {
        const title = item.title ?? "(untitled)";
        const excerpt = truncateExcerpt(item.contentSnippet ?? item.content ?? item.summary);
        const combinedText = `${title} ${excerpt ?? ""}`;
        return {
          title,
          excerpt,
          sourceName: feedName,
          sourceUrl: item.link as string,
          category: inferCategory(title),
          publishedDate: item.isoDate ? new Date(item.isoDate) : item.pubDate ? new Date(item.pubDate) : null,
          relatedCveIds: extractCveIds(combinedText),
        };
      });

    recordsFetched = rows.length;

    if (rows.length > 0) {
      const inserted = await db
        .insert(newsArticles)
        .values(rows)
        .onConflictDoNothing({ target: newsArticles.sourceUrl })
        .returning({ id: newsArticles.id });
      recordsInserted = inserted.length;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`${feedName}: ${message}`);
    logger.error({ feedName, feedUrl, err: message }, `[news] feed fetch failed, continuing to next source`);
  }

  return { recordsFetched, recordsInserted, recordsUpdated: 0, errors };
}

export async function runNewsIngestion(db: Db): Promise<FeedIngestionResult> {
  return withSyncLog(db, JOB_NAME, async () => {
    let recordsFetched = 0;
    let recordsInserted = 0;
    const errors: string[] = [];

    for (const feed of NEWS_FEEDS) {
      logger.info({ feed: feed.name, url: feed.url }, "[news] fetching feed");
      const result = await ingestOneFeed(db, feed.name, feed.url);
      recordsFetched += result.recordsFetched;
      recordsInserted += result.recordsInserted;
      errors.push(...result.errors);
      logger.info(
        { feed: feed.name, fetched: result.recordsFetched, inserted: result.recordsInserted },
        `[news] ${feed.name} done`,
      );
    }

    return { recordsFetched, recordsInserted, recordsUpdated: 0, errors };
  });
}

export { JOB_NAME as NEWS_JOB_NAME };
