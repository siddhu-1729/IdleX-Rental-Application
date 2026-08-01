"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Booking } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

function statusVariant(status: Booking["status"]) {
  if (status === "completed") return "success";
  if (status === "cancelled") return "danger";
  if (status === "active") return "warning";
  return "default";
}

function MyRentalsInner() {
  const { data, isLoading, error } = useFetchData<Booking[]>("/api/bookings", []);

  return (
    <DashboardShell title="My Bookings">
      <div className="space-y-3">
        {error && <p className="rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {(data ?? []).map((booking) => {
          const title = typeof booking.listing === "object" && booking.listing !== null ? booking.listing.title : "Rental";
          return (
            <Link key={booking._id} href={ROUTES.RENTAL_DETAIL(booking._id)} className="block rounded-lg border border-border bg-card p-5 hover:border-primary">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    {booking.status === "requested" && " · Awaiting owner confirmation"}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                  <p className="mt-2 font-semibold">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
            </Link>
          );
        })}
        {!isLoading && !error && (data ?? []).length === 0 && (
          <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No bookings yet. Browse the marketplace to rent something.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}

export default function MyRentalsPage() {
  return (
    <RequireAuth>
      <MyRentalsInner />
    </RequireAuth>
  );
}
