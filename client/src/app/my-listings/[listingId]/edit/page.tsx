"use client";

import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingStepperForm } from "@/components/marketplace/forms";

export default function EditListingPage() {
  const params = useParams<{ listingId: string }>();
  return <DashboardShell title="Edit Listing"><ListingStepperForm edit listingId={params.listingId} /></DashboardShell>;
}
