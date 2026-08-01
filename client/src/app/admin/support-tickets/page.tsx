import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminSupportTicketsPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Support Tickets" description="Resolve user-reported issues and escalation requests." />
    </AdminGate>
  );
}
