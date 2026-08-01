/**
 * Fetch wrapper for the IdleX Express backend.
 *
 * The backend serves every endpoint as { success, message, data } — this
 * client unwraps the envelope and returns `data` directly. Auth tokens are
 * stored in localStorage and attached as `Authorization: Bearer <token>`.
 * Requests are same-origin relative paths; next.config.ts rewrites /api/*
 * and /uploads/* to the backend.
 */

import type { ApiEnvelope } from "./api-types";

const TOKEN_KEY = "idlex_access_token";
const USER_KEY = "idlex_current_user";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser<T>(user: T | null): void {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function clearAuth(): void {
  setToken(null);
  setStoredUser(null);
}

type ApiInit = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = init;

  const isFormData = body instanceof FormData;
  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string> | undefined) };
  if (!isFormData && body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...rest,
    headers: finalHeaders,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    cache: rest.cache ?? "no-store",
  });

  if (res.status === 401 && getToken()) {
    clearAuth();
  }

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const envelope = payload as { message?: string; details?: unknown } | null;
    throw new ApiError(res.status, envelope?.message || `Request failed with status ${res.status}`, envelope?.details);
  }

  // Endpoints that don't use the envelope (e.g. /health) pass raw JSON through.
  const envelope = payload as ApiEnvelope<T> | null;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    return envelope.data as T;
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, init?: ApiInit) => apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: ApiInit) => apiFetch<T>(path, { ...init, method: "POST", body }),
  put: <T>(path: string, body?: unknown, init?: ApiInit) => apiFetch<T>(path, { ...init, method: "PUT", body }),
  patch: <T>(path: string, body?: unknown, init?: ApiInit) => apiFetch<T>(path, { ...init, method: "PATCH", body }),
  del: <T>(path: string, init?: ApiInit) => apiFetch<T>(path, { ...init, method: "DELETE" }),
};
