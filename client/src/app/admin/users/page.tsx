import { AdminUsersPage, AdminGate } from "@/components/marketplace/admin-pages";

export default function AdminUsersRoute() {
  return (
    <AdminGate>
      <AdminUsersPage />
    </AdminGate>
  );
}
