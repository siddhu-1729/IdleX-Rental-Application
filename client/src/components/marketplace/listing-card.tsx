import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";

type Listing = {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Link href={ROUTES.PRODUCT(listing.id)} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.image} alt={listing.title} className="aspect-4/3 w-full object-cover" />
      </Link>
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="outline">{listing.category}</Badge>
              <h3 className="mt-2 line-clamp-2 text-base font-semibold">{listing.title}</h3>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-accent-700">
              <Star size={15} />
              {listing.rating}
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={15} />
            {listing.location} - {listing.reviews} reviews
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {listing.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="text-xl font-bold text-foreground">{formatCurrency(listing.price)}</span>
            /day
          </p>
          <Link href={ROUTES.CHECKOUT(listing.id)}>
            <Button size="sm">Book</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
