import { AdminGate, AdminBookingsPage } from "@/components/marketplace/admin-pages";

export default function BookingsAdminPage() {
  return (
    <AdminGate>
      <AdminBookingsPage />
    </AdminGate>
  );
}
