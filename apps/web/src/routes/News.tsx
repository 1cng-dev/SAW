import { useState } from "react";
import { NEWS_CATEGORIES, NEWS_FEEDS } from "@sec1cng/shared";
import { useNews } from "../api/hooks";
import { NewsCard } from "../components/news/NewsCard";
import { ErrorState } from "../components/ui/ErrorState";
import { SkeletonCard } from "../components/ui/Skeleton";

export function NewsPage() {
  const [source, setSource] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();

  const query = useNews({ source, category, pageSize: 30 });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-100">Latest Security News</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSource(undefined)}
          className={`rounded-full border px-3 py-1 text-xs ${!source ? "border-blue-500 text-blue-400" : "border-surface-border text-slate-400"}`}
        >
          All Sources
        </button>
        {NEWS_FEEDS.map((feed) => (
          <button
            key={feed.name}
            onClick={() => setSource(feed.name)}
            className={`rounded-full border px-3 py-1 text-xs ${source === feed.name ? "border-blue-500 text-blue-400" : "border-surface-border text-slate-400"}`}
          >
            {feed.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(undefined)}
          className={`rounded-full border px-3 py-1 text-xs ${!category ? "border-blue-500 text-blue-400" : "border-surface-border text-slate-400"}`}
        >
          All Categories
        </button>
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-3 py-1 text-xs ${category === cat ? "border-blue-500 text-blue-400" : "border-surface-border text-slate-400"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {query.isError && <ErrorState />}
      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : query.data && query.data.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {query.data.data.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No news articles match this filter.</p>
      )}
    </div>
  );
}
