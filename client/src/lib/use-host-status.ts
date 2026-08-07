"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch, getToken } from "@/lib/api-client";
import type { Listing } from "@/lib/api-types";

/**
 * True once the signed-in user owns at least one listing. Used to switch
 * the "Become a Host" call-to-action to "Add another listing" for hosts
 * who already have listings.
 */
export function useHostStatus() {
  const { user } = useAuth();
  const [hasListings, setHasListings] = useState(false);
  const [checked, setChecked] = useState(false);

  const signedIn = !!user || !!getToken();

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    apiFetch<Listing[]>("/api/listings/mine/all")
      .then((listings) => {
        if (!cancelled) setHasListings(Array.isArray(listings) && listings.length > 0);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return { hasListings, checked };
}
