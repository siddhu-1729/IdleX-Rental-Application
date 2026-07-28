import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Button } from "@/components/ui/button";
import { listings } from "@/lib/mock-data";
import { ROUTES } from "@/lib/constants";

export default function MyListingsPage() {
  return (
    <DashboardShell title="My Listings">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Listings</h1>
          <p className="text-sm text-muted-foreground">Manage pricing, availability, photos, and booking readiness.</p>
        </div>
        <Link href={ROUTES.LISTING_NEW}><Button>Add Listing</Button></Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </DashboardShell>
  );
}
