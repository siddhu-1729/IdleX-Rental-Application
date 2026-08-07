"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { toCard } from "@/lib/api-types";
import type { Listing } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

function WishlistInner() {
  const { data, isLoading, error } = useFetchData<Listing[]>("/api/wishlist", []);

  return (
    <DashboardShell title="Wishlist">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Your wishlist</h1>
        <p className="text-sm text-muted-foreground">Items you&apos;ve saved. Reach them quickly before they get booked.</p>
      </div>
      {error && <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
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
          <ListingCard key={listing._id} listing={toCard(listing)} />
        ))}
      </div>
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