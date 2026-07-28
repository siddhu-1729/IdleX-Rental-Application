import { DashboardShell } from "@/components/marketplace/dashboard-shell";

export default function HelpPage() {
  return (
    <DashboardShell title="Help & Support">
      <div className="grid gap-4 md:grid-cols-3">
        {["Booking issue", "Deposit refund", "Owner payout"].map((topic) => (
          <div key={topic} className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">{topic}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Support workflow placeholder with ticket routing.</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
