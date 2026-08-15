import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingStepperForm } from "@/components/marketplace/forms";
import { RequireAuth, RequireKyc } from "@/lib/auth";

export default function NewListingPage() {
  return (
    <RequireAuth>
      <RequireKyc>
        <DashboardShell title="New Listing">
          <ListingStepperForm />
        </DashboardShell>
      </RequireKyc>
    </RequireAuth>
  );
}