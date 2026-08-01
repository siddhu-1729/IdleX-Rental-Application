import { AdminReportsPage, AdminGate } from "@/components/marketplace/admin-pages";

export default function AdminReportsRoute() {
  return (
    <AdminGate>
      <AdminReportsPage />
    </AdminGate>
  );
}
