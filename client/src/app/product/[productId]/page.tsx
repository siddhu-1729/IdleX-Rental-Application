"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ShieldCheck, Star } from "@/components/ui/icons";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useFetchData } from "@/lib/use-fetch-data";
import { ownerName, listingImage } from "@/lib/api-types";
import type { Listing, Review } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = React.use(params);

  const { data: listing, isLoading, error } = useFetchData<Listing>(`/api/listings/${productId}`, [productId]);
  const { data: reviews } = useFetchData<Review[]>(`/api/listings/${productId}/reviews`, [productId]);

  if (isLoading) return <PublicShell><div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading…</div></PublicShell>;
  if (error || !listing) {
    return (
      <PublicShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error?.message}</p>
          <Link href={ROUTES.SEARCH} className="mt-6 inline-block"><Button variant="outline">Back to search</Button></Link>
        </div>
      </PublicShell>
    );
  }

  const image = listingImage(listing);
  const owner = ownerName(listing.owner);

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={listing.title} className="aspect-video w-full rounded-lg object-cover" />
          <div className="mt-6">
            <Badge variant="outline">{listing.category}</Badge>
            <h1 className="mt-3 text-3xl font-bold">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              {listing.location?.city || "India"} - hosted by {owner}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={listing.status === "published" ? "success" : "secondary"}>{listing.status}</Badge>
              {listing.securityDeposit > 0 && <Badge variant="secondary">Deposit {formatCurrency(listing.securityDeposit)}</Badge>}
            </div>
            <p className="mt-6 leading-7 text-muted-foreground">{listing.description}</p>

            <div className="mt-8">
              <h2 className="text-xl font-semibold">Reviews ({reviews?.length ?? 0})</h2>
              <div className="mt-4 space-y-4">
                {(reviews ?? []).length === 0 && (
                  <p className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
                    No reviews yet. Be the first to rent and review this item.
                  </p>
                )}
                {(reviews ?? []).map((review) => (
                  <div key={review._id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{typeof review.reviewer === "object" ? review.reviewer.name : "Renter"}</p>
                      <span className="flex items-center gap-1 text-sm font-semibold text-accent-700">
                        <Star size={14} /> {review.rating}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.comment && <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Card className="h-max">
          <CardHeader>
            <CardTitle>{formatCurrency(listing.pricePerDay)} / day</CardTitle>
            <p className="flex items-center gap-1 text-sm text-accent-700">
              <Star size={15} /> {listing.ratingAvg || "New"} {listing.ratingCount > 0 && `from ${listing.ratingCount} reviews`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="flex justify-between"><span>Security deposit</span><strong>{formatCurrency(listing.securityDeposit)}</strong></p>
              <p className="mt-2 flex justify-between"><span>Platform protection</span><strong>Included</strong></p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-secondary-50 p-3 text-sm text-secondary-700">
              <ShieldCheck size={18} />
              KYC verified owner and protected handover
            </div>
            <Link href={ROUTES.CHECKOUT(listing._id)}><Button fullWidth>Reserve Item</Button></Link>
          </CardContent>
        </Card>
      </section>
    </PublicShell>
  );
}
