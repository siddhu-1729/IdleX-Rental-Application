import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Checkbox } from "@/components/ui/form-controls";

export default function SettingsPage() {
  return (
    <DashboardShell title="Settings">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <Checkbox label="Email booking updates" defaultChecked />
        <Checkbox label="SMS pickup reminders" defaultChecked />
        <Checkbox label="Owner payout alerts" />
      </div>
    </DashboardShell>
  );
}
