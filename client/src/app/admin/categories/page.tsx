import { AdminGate, AdminSectionPage } from "@/components/marketplace/admin-pages";

export default function AdminCategoriesPage() {
  return (
    <AdminGate>
      <AdminSectionPage title="Categories" description="Manage marketplace categories and listings counts." />
    </AdminGate>
  );
}
