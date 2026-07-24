export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md bg-slate-700/50 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-raised p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}
