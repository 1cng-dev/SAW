export type OsintQueryType = "domain" | "ip" | "asn";

export interface OsintSourceResult<T = unknown> {
  source: string;
  status: "ok" | "error" | "not_configured";
  data?: T;
  error?: string;
}

export interface OsintSourceInput {
  type: OsintQueryType;
  value: string;
}

export type OsintSourceModule = {
  name: string;
  supports: (type: OsintQueryType) => boolean;
  run: (input: OsintSourceInput) => Promise<OsintSourceResult>;
};

const DEFAULT_TIMEOUT_MS = 8000;

export async function fetchWithTimeout(url: string, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function ok<T>(source: string, data: T): OsintSourceResult<T> {
  return { source, status: "ok", data };
}

export function err(source: string, error: string): OsintSourceResult {
  return { source, status: "error", error };
}

export function notConfigured(source: string, error: string): OsintSourceResult {
  return { source, status: "not_configured", error };
}
