import { AdminGate, AdminPaymentsPage } from "@/components/marketplace/admin-pages";

export default function PaymentsAdminPage() {
  return (
    <AdminGate>
      <AdminPaymentsPage />
    </AdminGate>
  );
}
