import { AdminOverview, AdminGate } from "@/components/marketplace/admin-pages";

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminOverview />
    </AdminGate>
  );
}
