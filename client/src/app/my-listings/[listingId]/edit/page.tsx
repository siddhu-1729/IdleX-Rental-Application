import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingStepperForm } from "@/components/marketplace/forms";

export default function EditListingPage() {
  return <DashboardShell title="Edit Listing"><ListingStepperForm edit /></DashboardShell>;
}
