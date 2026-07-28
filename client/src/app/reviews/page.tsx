import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";

export default function ReviewsPage() {
  return (
    <DashboardShell title="Reviews">
      <div className="rounded-lg border border-border bg-card p-5">
        <Badge variant="warning">4.8 average</Badge>
        <h1 className="mt-3 text-xl font-semibold">Recent feedback</h1>
        <p className="mt-2 text-sm text-muted-foreground">Smooth pickup, item matched the listing, and deposit refund was transparent.</p>
      </div>
    </DashboardShell>
  );
}
