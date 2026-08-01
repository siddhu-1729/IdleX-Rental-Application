import { AdminListingsPage, AdminGate } from "@/components/marketplace/admin-pages";

export default function AdminListingsRoute() {
  return (
    <AdminGate>
      <AdminListingsPage />
    </AdminGate>
  );
}
