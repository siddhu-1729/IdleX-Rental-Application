import { PublicShell, PageHero } from "@/components/marketplace/app-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listings } from "@/lib/mock-data";

export default function SearchPage() {
  return (
    <PublicShell>
      <PageHero title="Search rentals" eyebrow="Marketplace" description="Filter available items by category, city, daily price, rating, and pickup speed." />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-max rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold">Filters</h2>
          <div className="mt-4 space-y-4">
            <Input label="Location" defaultValue="Bhimavaram" />
            <Select label="Category" options={[{ value: "", label: "All categories" }, { value: "camera", label: "Cameras" }, { value: "tools", label: "Tools" }, { value: "sports", label: "Sports" }]} />
            <Select label="Sort" options={[{ value: "recommended", label: "Recommended" }, { value: "price-low", label: "Price: low to high" }, { value: "rating", label: "Top rated" }]} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="default">Verified</Badge>
            <Badge variant="success">Available today</Badge>
            <Badge variant="warning">Low deposit</Badge>
          </div>
        </aside>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{listings.length} listings found</p>
            <Badge variant="outline">Mock API ready</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
