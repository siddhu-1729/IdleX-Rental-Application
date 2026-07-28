import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";

const notifications = ["Booking rent-1042 confirmed", "KYC verification completed", "Security deposit refund processing"];

export default function NotificationsPage() {
  return (
    <DashboardShell title="Notifications">
      <div className="space-y-3">
        {notifications.map((note) => (
          <div key={note} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <p className="font-medium">{note}</p>
            <Badge variant="info">New</Badge>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
