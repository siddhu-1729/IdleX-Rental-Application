import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { bookings } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";

export default function MyRentalsPage() {
  return (
    <DashboardShell title="My Bookings">
      <div className="space-y-3">
        {bookings.map((booking) => (
          <Link key={booking.id} href={ROUTES.RENTAL_DETAIL(booking.id)} className="block rounded-lg border border-border bg-card p-5 hover:border-primary">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{booking.item}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{booking.dates} - {booking.next}</p>
              </div>
              <div className="text-right">
                <Badge variant={booking.status === "Completed" ? "success" : "default"}>{booking.status}</Badge>
                <p className="mt-2 font-semibold">{formatCurrency(booking.amount)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
