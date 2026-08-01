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

function MyListingsInner() {
  const { data, isLoading, error } = useFetchData<Listing[]>("/api/listings/mine/all", []);

  return (
    <DashboardShell title="My Listings">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground">Manage pricing, availability, photos, and booking readiness.</p>
        </div>
        <Link href={ROUTES.LISTING_NEW}><Button>Add Listing</Button></Link>
      </div>
      {error && <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((listing) => <ListingCard key={listing._id} listing={toCard(listing)} />)}
      </div>
      {!isLoading && !error && (data ?? []).length === 0 && (
        <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t listed anything yet.{' '}
          <Link href={ROUTES.LISTING_NEW} className="font-semibold text-primary">Create your first listing</Link>.
        </p>
      )}
    </DashboardShell>
  );
}

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <MyListingsInner />
    </RequireAuth>
  );
}
