"use client";

import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { RequireAuth, useAuth } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Booking, Listing, Payout } from "@/lib/api-types";

function BookingRow({ booking }: { booking: Booking }) {
  const title = typeof booking.listing === "object" && booking.listing !== null ? booking.listing.title : "Rental";
  return (
    <div key={booking._id} className="flex items-center justify-between rounded-lg bg-muted p-3">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
      </div>
      <Badge variant={booking.status === "completed" ? "success" : booking.status === "cancelled" ? "danger" : "default"}>{booking.status}</Badge>
    </div>
  );
}

function DashboardInner() {
  const { user } = useAuth();
  const isOwner = user?.isOwner || user?.role === "admin" || user?.role === "owner";

  const { data: myListings } = useFetchData<Listing[]>("/api/listings/mine/all", [isOwner]);
  const { data: renterBookings } = useFetchData<Booking[]>("/api/bookings", []);
  const { data: ownerBookings } = useFetchData<Booking[]>("/api/bookings/owner", [isOwner]);
  const { data: payouts } = useFetchData<Payout[]>("/api/payments/payouts", [isOwner]);

  const upcoming = (renterBookings ?? []).filter((b) => ["requested", "confirmed", "active"].includes(b.status));
  const ownerUpcoming = (ownerBookings ?? []).filter((b) => ["requested", "confirmed", "active"].includes(b.status));
  const listedCount = myListings?.length ?? 0;
  const publishedCount = myListings?.filter((l) => l.status === "published").length ?? 0;
  const payoutTotal = (payouts ?? []).filter((p) => p.status !== "failed").reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Active bookings" value={String(upcoming.length + ownerUpcoming.length)} description="Across your rentals" icon="CalendarCheck" />
        <StatCard title="Listed items" value={String(listedCount)} description={`${publishedCount} published`} icon="Package" />
        <StatCard title="Payout eligible" value={formatCurrency(payoutTotal)} description="Owner earnings" icon="Wallet" />
        <StatCard title="Role" value={isOwner ? "Owner" : "Renter"} description={user?.email ?? ""} icon="ShieldCheck" />
      </div>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Upcoming rentals</h2>
          <div className="mt-4 space-y-3">
            {upcoming.length === 0 && <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No upcoming rentals. Browse the marketplace to book something.</p>}
            {upcoming.map((booking) => <BookingRow key={booking._id} booking={booking} />)}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">{isOwner ? "Incoming requests" : "Recent activity"}</h2>
          <div className="mt-4 space-y-3">
            {ownerUpcoming.length === 0 && <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No requests yet.</p>}
            {ownerUpcoming.map((booking) => <BookingRow key={booking._id} booking={booking} />)}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
