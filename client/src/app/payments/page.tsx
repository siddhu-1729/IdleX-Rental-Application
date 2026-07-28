import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { payments } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/formatters";

export default function PaymentsPage() {
  return (
    <DashboardShell title="Payments">
      <div className="rounded-lg border border-border bg-card">
        {payments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between border-b border-border p-4 last:border-0">
            <div>
              <p className="font-semibold">{payment.label}</p>
              <p className="text-sm text-muted-foreground">{payment.id} - {payment.type}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(payment.amount)}</p>
              <Badge variant={payment.status === "Settled" || payment.status === "Paid" ? "success" : "warning"}>{payment.status}</Badge>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
