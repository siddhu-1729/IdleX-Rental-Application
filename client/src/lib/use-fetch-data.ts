"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "./api-client";

/**
 * Client-side data hook. Fetches `path` (relative — proxied to the
 * backend via next.config rewrites) whenever the path or deps change.
 */
export function useFetchData<T>(path: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<Error | null>(null);
  const [version, setVersion] = useState(0);
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
  }, [depKey, path, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return { data, isLoading, error, refetch };
}

export { ApiError };
