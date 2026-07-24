import { AlertTriangle } from "lucide-react";

export function ErrorState({ message = "Failed to load, retrying..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
