export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed with status ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}
