import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api/client";

export type OsintSourceStatus = "ok" | "error" | "not_configured";

export interface OsintSourceResult<T = unknown> {
  source: string;
  status: OsintSourceStatus;
  data?: T;
  error?: string;
}

export interface OsintAggregateState {
  query: { type: string; value: string } | null;
  totalSources: number;
  results: Record<string, OsintSourceResult>;
  isStreaming: boolean;
  isDone: boolean;
  cached: boolean;
  sourcesResponded: number;
  connectionError: string | null;
}

const INITIAL_STATE: OsintAggregateState = {
  query: null,
  totalSources: 0,
  results: {},
  isStreaming: false,
  isDone: false,
  cached: false,
  sourcesResponded: 0,
  connectionError: null,
};

// SSE consumer for /api/osint/aggregate/stream — plain useState/useEffect
// rather than React Query, since results arrive incrementally (one event per
// source) instead of as a single request/response payload.
export function useOsintAggregate(value: string): OsintAggregateState {
  const [state, setState] = useState<OsintAggregateState>(INITIAL_STATE);

  useEffect(() => {
    if (!value) {
      setState(INITIAL_STATE);
      return;
    }

    setState({ ...INITIAL_STATE, isStreaming: true });

    const url = new URL(`${API_BASE_URL}/api/osint/aggregate/stream`, window.location.origin);
    url.searchParams.set("value", value);
    const source = new EventSource(url.toString());

    source.addEventListener("meta", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setState((s) => ({ ...s, query: data.query, totalSources: data.totalSources }));
    });

    source.addEventListener("source", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as OsintSourceResult;
      setState((s) => ({ ...s, results: { ...s.results, [data.source]: data } }));
    });

    source.addEventListener("done", (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setState((s) => ({ ...s, isStreaming: false, isDone: true, cached: data.cached, sourcesResponded: data.sourcesResponded }));
      source.close();
    });

    source.onerror = () => {
      setState((s) => (s.isDone ? s : { ...s, isStreaming: false, connectionError: "Lost connection to OSINT stream" }));
      source.close();
    };

    return () => source.close();
  }, [value]);

  return state;
}
