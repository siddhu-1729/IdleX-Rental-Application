import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminPaymentsPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Payments" description="Monitor captured payments, refunds, and owner payouts." />
    </AdminGate>
  );
}
