import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminBookingsPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Bookings" description="Review all rental bookings across the marketplace." />
    </AdminGate>
  );
}
