"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "./api-client";

/**
 * Tiny client-side data hook — replacement for TanStack Query until npm is available.
 * When npm install is fixed, this can be removed and components swapped to useQuery.
 */
export function useFetchData<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<Error | null>(null);
  const depKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    const requestPath = path;

    async function load() {
      setIsLoading(true);
      try {
        const d = await apiFetch<T>(requestPath);
        if (!cancelled) {
          setData(d);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [depKey, path]);

  return { data, isLoading, error, refetch: () => setData(null) };
}

export { ApiError };
