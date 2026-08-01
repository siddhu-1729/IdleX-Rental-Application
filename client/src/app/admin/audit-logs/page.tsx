import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminAuditLogsPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Audit Logs" description="Review admin actions and system events." />
    </AdminGate>
  );
}
