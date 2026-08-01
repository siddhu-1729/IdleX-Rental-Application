import { AdminDisputesPage, AdminGate } from "@/components/marketplace/admin-pages";

export default function AdminDisputesRoute() {
  return (
    <AdminGate>
      <AdminDisputesPage />
    </AdminGate>
  );
}
