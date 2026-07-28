import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { listings } from "@/lib/mock-data";

export default function WishlistPage() {
  return (
    <DashboardShell title="Wishlist">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.slice(0, 3).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </DashboardShell>
  );
}
