import { AdminGate, AdminAuditLogsPage } from "@/components/marketplace/admin-pages";

export default function AuditLogsAdminPage() {
  return (
    <AdminGate>
      <AdminAuditLogsPage />
    </AdminGate>
  );
}
