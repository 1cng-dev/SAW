import { useCallback, useEffect, useState } from "react";

const HISTORY_KEY = "sec1cng_search_history";
const SAVED_KEY = "sec1cng_saved_searches";
const EVENT = "sec1cng:search-history-changed";
const MAX_HISTORY = 50;

export type SearchModule = "cves" | "threat-intel" | "osint";

export interface SearchHistoryEntry {
  id: string;
  module: SearchModule;
  query: string;
  timestamp: string;
}

export interface SavedSearchEntry {
  id: string;
  module: SearchModule;
  query: string;
  savedAt: string;
}

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(key: string, data: unknown[]) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(EVENT));
}

// Logs real user queries the moment they're actually run elsewhere in the
// app (CVE Database, Threat Intel, OSINT Search) — no synthetic history.
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>(() => read(HISTORY_KEY));
  const [saved, setSaved] = useState<SavedSearchEntry[]>(() => read(SAVED_KEY));

  useEffect(() => {
    const handler = () => {
      setHistory(read(HISTORY_KEY));
      setSaved(read(SAVED_KEY));
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const logSearch = useCallback((module: SearchModule, query: string) => {
    if (!query.trim()) return;
    const current = read<SearchHistoryEntry>(HISTORY_KEY);
    const deduped = current.filter((e) => !(e.module === module && e.query === query));
    const next = [{ id: crypto.randomUUID(), module, query, timestamp: new Date().toISOString() }, ...deduped].slice(0, MAX_HISTORY);
    write(HISTORY_KEY, next);
  }, []);

  const saveSearch = useCallback((module: SearchModule, query: string) => {
    if (!query.trim()) return;
    const current = read<SavedSearchEntry>(SAVED_KEY);
    if (current.some((e) => e.module === module && e.query === query)) return;
    write(SAVED_KEY, [{ id: crypto.randomUUID(), module, query, savedAt: new Date().toISOString() }, ...current]);
  }, []);

  const removeSaved = useCallback((id: string) => {
    write(SAVED_KEY, read<SavedSearchEntry>(SAVED_KEY).filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => write(HISTORY_KEY, []), []);

  return { history, saved, logSearch, saveSearch, removeSaved, clearHistory };
}
