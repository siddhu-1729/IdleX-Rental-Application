import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminMessagesPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Messages" description="Review conversations and resolve user issues." />
    </AdminGate>
  );
}
