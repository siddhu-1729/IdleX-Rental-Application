"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { RequireAuth, errorMessage } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { api } from "@/lib/api-client";
import { toCard } from "@/lib/api-types";
import type { Listing } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

function WishlistInner() {
  const { data, isLoading, error, refetch } = useFetchData<Listing[]>("/api/wishlist", []);
  const [removeError, setRemoveError] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const removeFromWishlist = async (listingId: string) => {
    setRemoveError(null);
    setRemovingId(listingId);
    try {
      await api.del<Listing[]>(`/api/wishlist/${listingId}`);
      refetch();
    } catch (err) {
      setRemoveError(errorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <DashboardShell title="Wishlist">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Your wishlist</h1>
        <p className="text-sm text-muted-foreground">Items you&apos;ve saved. Reach them quickly before they get booked.</p>
      </div>
      {error && <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
      {removeError && <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{removeError}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !error && (data ?? []).length === 0 && (
        <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Your wishlist is empty.{' '}
          <Link href={ROUTES.SEARCH} className="font-semibold text-primary">Browse items</Link>{' '}
          and tap the heart to save them here.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((listing) => (
          <ListingCard
            key={listing._id}
            listing={toCard(listing)}
            onRemove={(id) => void removeFromWishlist(id)}
          />
        ))}
      </div>
      {removingId && <p className="mt-4 text-sm text-muted-foreground">Removing from wishlist…</p>}
      {(data ?? []).length > 0 && (
        <div className="mt-8 flex justify-center">
          <Link href={ROUTES.SEARCH}><Button variant="outline">Discover more items</Button></Link>
        </div>
      )}
    </DashboardShell>
  );
}

export default function WishlistPage() {
  return (
    <RequireAuth>
      <WishlistInner />
    </RequireAuth>
  );
}