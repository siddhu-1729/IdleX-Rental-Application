import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { KycStepperForm } from "@/components/marketplace/forms";

export default function KycPage() {
  return <DashboardShell title="KYC Verification"><KycStepperForm /></DashboardShell>;
}
