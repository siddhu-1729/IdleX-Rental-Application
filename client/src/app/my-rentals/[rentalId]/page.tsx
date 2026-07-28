import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { RentalExtensionPanel } from "@/components/marketplace/rental-extension-panel";
import { Badge } from "@/components/ui/badge";
import { getBooking } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export default async function RentalDetailPage({ params }: { params: Promise<{ rentalId: string }> }) {
  const { rentalId } = await params;
  const booking = getBooking(rentalId);

  return (
    <DashboardShell title="Booking Detail">
      <div className="space-y-6">
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
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <span className="text-sm text-muted-foreground">Total paid</span>
              <p className="mt-1 text-xl font-bold">{formatCurrency(booking.amount)}</p>
            </div>
            <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
              <span className="text-sm text-primary-700">Extension status</span>
              <p className="mt-1 font-semibold text-primary-900">
                {booking.extension.available ? "Eligible for extension" : "Closed"}
              </p>
            </div>
          </div>
        </div>
        <RentalExtensionPanel extension={booking.extension} />
      </div>
    </DashboardShell>
  );
}
