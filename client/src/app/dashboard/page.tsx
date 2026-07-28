import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { bookings, listings, payments } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export default function DashboardPage() {
  return (
    <DashboardShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Active bookings" value="3" description="One return due today" icon="CalendarCheck" />
        <StatCard title="Listed items" value={listings.length} description="3 active, 1 paused" icon="Package" />
        <StatCard title="Wallet balance" value={formatCurrency(6120)} description="Payout eligible" icon="Wallet" />
        <StatCard title="Trust score" value="94%" description="KYC verified" icon="ShieldCheck" />
      </div>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Upcoming rentals</h2>
          <div className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="font-medium">{booking.item}</p>
                  <p className="text-sm text-muted-foreground">{booking.dates}</p>
                </div>
                <Badge variant={booking.status === "Completed" ? "success" : "default"}>{booking.status}</Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Recent payments</h2>
          <div className="mt-4 space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium">{payment.label}</p>
                  <p className="text-sm text-muted-foreground">{payment.type}</p>
                </div>
                <strong>{formatCurrency(payment.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
