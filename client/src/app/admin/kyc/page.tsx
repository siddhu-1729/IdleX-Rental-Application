import { AdminKycPage, AdminGate } from "@/components/marketplace/admin-pages";

export default function AdminKycRoute() {
  return (
    <AdminGate>
      <AdminKycPage />
    </AdminGate>
  );
}
