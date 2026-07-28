import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBooking } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export default async function RentalDetailPage({ params }: { params: Promise<{ rentalId: string }> }) {
  const { rentalId } = await params;
  const booking = getBooking(rentalId);

  return (
    <DashboardShell title="Booking Detail">
      <div className="rounded-lg border border-border bg-card p-6">
        <Badge>{booking.status}</Badge>
        <h1 className="mt-3 text-2xl font-bold">{booking.item}</h1>
        <p className="mt-2 text-muted-foreground">{booking.dates}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Booked", "Pickup verified", "Return inspection"].map((step) => (
            <div key={step} className="rounded-lg bg-muted p-4">
              <p className="font-semibold">{step}</p>
              <p className="mt-1 text-sm text-muted-foreground">Status tracked for both renter and owner.</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-lg border border-border p-4">
          <span>Total paid</span>
          <strong>{formatCurrency(booking.amount)}</strong>
        </div>
        <Button className="mt-5">Request Extension</Button>
      </div>
    </DashboardShell>
  );
}
