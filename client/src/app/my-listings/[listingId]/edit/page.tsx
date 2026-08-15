"use client";

import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingStepperForm } from "@/components/marketplace/forms";
import { RequireAuth, RequireKyc } from "@/lib/auth";

export default function EditListingPage() {
  const params = useParams<{ listingId: string }>();
  return (
    <RequireAuth>
      <RequireKyc>
        <DashboardShell title="Edit Listing">
          <ListingStepperForm edit listingId={params.listingId} />
        </DashboardShell>
      </RequireKyc>
    </RequireAuth>
  );
}