import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminSystemSettingsPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="System Settings" description="Configure platform settings, fees, and policies." />
    </AdminGate>
  );
}
