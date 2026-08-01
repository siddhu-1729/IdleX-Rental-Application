import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminOffersPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Offers" description="Create and manage promotional offers and coupons." />
    </AdminGate>
  );
}
