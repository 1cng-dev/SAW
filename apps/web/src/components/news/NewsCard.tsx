import { ExternalLink } from "lucide-react";
import type { NewsArticle } from "../../api/types";

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg border border-surface-border bg-surface-raised p-4 transition hover:border-slate-500"
    >
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{article.sourceName}</span>
        {article.category && (
          <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">{article.category}</span>
        )}
      </div>
      <h3 className="mt-2 flex items-start justify-between gap-2 text-sm font-medium text-slate-100">
        <span>{article.title}</span>
        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
      </h3>
      {article.excerpt && <p className="mt-2 line-clamp-3 text-sm text-slate-400">{article.excerpt}</p>}
      {article.relatedCveIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {article.relatedCveIds.map((id) => (
            <span key={id} className="font-mono-cve rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
              {id}
            </span>
          ))}
        </div>
      )}
      {article.publishedDate && (
        <div className="mt-2 text-xs text-slate-500">{new Date(article.publishedDate).toLocaleDateString()}</div>
      )}
    </a>
  );
}
