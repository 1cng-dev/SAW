import { useCallback, useEffect, useState } from "react";

const WATCHLIST_STORAGE_KEY = "sec1cng_watchlist";
const WATCHLIST_EVENT = "sec1cng:watchlist-changed";

export interface WatchlistData {
  cveIds: string[];
  vendorSubscriptions: string[];
}

const DEFAULT_WATCHLIST: WatchlistData = { cveIds: [], vendorSubscriptions: [] };

function readWatchlist(): WatchlistData {
  try {
    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (!saved) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(saved);
    return {
      cveIds: Array.isArray(parsed.cveIds) ? parsed.cveIds : [],
      vendorSubscriptions: Array.isArray(parsed.vendorSubscriptions) ? parsed.vendorSubscriptions : [],
    };
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

function writeWatchlist(data: WatchlistData) {
  localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(WATCHLIST_EVENT));
}

// Shared localStorage-backed watchlist state, kept in sync across every
// component that calls this hook (star toggles on cards, the Watchlist page,
// etc.) via a custom event instead of prop drilling.
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistData>(() => readWatchlist());

  useEffect(() => {
    const handler = () => setWatchlist(readWatchlist());
    window.addEventListener(WATCHLIST_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(WATCHLIST_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const toggleCve = useCallback((cveId: string) => {
    const current = readWatchlist();
    writeWatchlist({
      ...current,
      cveIds: current.cveIds.includes(cveId)
        ? current.cveIds.filter((id) => id !== cveId)
        : [...current.cveIds, cveId],
    });
  }, []);

  const addVendor = useCallback((vendor: string) => {
    const trimmed = vendor.trim();
    if (!trimmed) return;
    const current = readWatchlist();
    if (current.vendorSubscriptions.includes(trimmed)) return;
    writeWatchlist({ ...current, vendorSubscriptions: [...current.vendorSubscriptions, trimmed] });
  }, []);

  const removeVendor = useCallback((vendor: string) => {
    const current = readWatchlist();
    writeWatchlist({ ...current, vendorSubscriptions: current.vendorSubscriptions.filter((v) => v !== vendor) });
  }, []);

  const isCveWatched = useCallback((cveId: string) => watchlist.cveIds.includes(cveId), [watchlist.cveIds]);

  return { watchlist, toggleCve, addVendor, removeVendor, isCveWatched };
}
