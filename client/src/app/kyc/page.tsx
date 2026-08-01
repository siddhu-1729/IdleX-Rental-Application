"use client";

import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { KycStepperForm } from "@/components/marketplace/forms";
import { RequireAuth } from "@/lib/auth";

export default function KycPage() {
  return (
    <RequireAuth>
      <DashboardShell title="KYC Verification">
        <KycStepperForm />
      </DashboardShell>
    </RequireAuth>
  );
}
