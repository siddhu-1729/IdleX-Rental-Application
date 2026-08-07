"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PublicShell } from "@/components/marketplace/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";
import { api } from "@/lib/api-client";
import { useFetchData } from "@/lib/use-fetch-data";
import { useAuth, errorMessage } from "@/lib/auth";
import { listingImage } from "@/lib/api-types";
import type { Booking, Listing, Payment } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";
import { daysBetween } from "@/lib/formatters";

export default function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = React.use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { data: listing, isLoading } = useFetchData<Listing>(`/api/listings/${productId}`, [productId]);

  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<Booking | null>(null);

  if (isLoading || !listing) {
    return <PublicShell><div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Loading…</div></PublicShell>;
  }

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const rent = listing.pricePerDay * days;
  const fee = Math.round(rent * 0.1);
  const total = rent + fee + listing.securityDeposit;

  const ownerId = typeof listing.owner === "object" && listing.owner !== null ? listing.owner._id : listing.owner;
  const isOwn = !!user && ownerId === user._id;

  const pay = async () => {
    setError(null);
    if (isOwn) {
      setError("You cannot book your own listing.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Choose start and end dates");
      return;
    }
    if (days < 1) {
      setError("End date must be after start date");
      return;
    }
    if (!user) {
      setError("Please sign in to complete your booking.");
      return;
    }
    setLoading(true);
    try {
      const booking = await api.post<Booking>("/api/bookings", { listingId: listing._id, startDate, endDate });
      await api.post<Payment>("/api/payments/checkout", { bookingId: booking._id });
      setDone(booking);
      router.push(ROUTES.MY_RENTALS);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Card>
            <CardHeader><CardTitle>Rental details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="End date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <Select label="Pickup option" options={[{ value: "pickup", label: "Owner pickup" }, { value: "delivery", label: "Doorstep delivery" }]} />
              <Select label="Payment method" options={[{ value: "upi", label: "UPI" }, { value: "card", label: "Card" }, { value: "wallet", label: "IdleX Wallet" }]} />
            </CardContent>
          </Card>
        </div>
        <Card className="h-max">
          <CardHeader><CardTitle>{listing.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listingImage(listing)} alt={listing.title} className="aspect-video w-full rounded-lg object-cover" />
            <p className="flex justify-between"><span>Rent x {days || "-"} days</span><strong>{formatCurrency(rent)}</strong></p>
            <p className="flex justify-between"><span>Platform fee</span><strong>{formatCurrency(fee)}</strong></p>
            <p className="flex justify-between"><span>Refundable deposit</span><strong>{formatCurrency(listing.securityDeposit)}</strong></p>
            <hr className="border-border" />
            <p className="flex justify-between text-base"><span>Total today</span><strong>{formatCurrency(total)}</strong></p>
            {error && <p className="rounded-md bg-danger-50 p-3 text-danger">{error}</p>}
            {done && <p className="rounded-md bg-secondary-50 p-3 text-secondary-700">Booking requested! The owner will confirm shortly.</p>}
            {isOwn && (
              <p className="rounded-md border border-border bg-muted p-3 text-center text-sm text-muted-foreground">
                This is your listing — you can&apos;t book your own items.
              </p>
            )}
            <Button fullWidth loading={loading} disabled={isOwn} onClick={pay}>Pay and Reserve</Button>
            <Link href={`/product/${listing._id}`} className="block text-center text-sm font-semibold text-primary">Back to item</Link>
          </CardContent>
        </Card>
      </section>
    </PublicShell>
  );
}
