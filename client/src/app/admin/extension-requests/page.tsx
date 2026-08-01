import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminExtensionRequestsPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Extension Requests" description="Track rental extension requests across all bookings." />
    </AdminGate>
  );
}
