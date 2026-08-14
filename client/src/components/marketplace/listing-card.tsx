import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Star } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
import type { ListingStatus } from "@/lib/api-types";

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
  status: ListingStatus;
};

type ManageActions = {
  onPublish?: (id: string) => void;
  onDelete?: (id: string) => void;
  busy?: boolean;
};

export function ListingCard({
  listing,
  onRemove,
  manage,
}: {
  listing: Listing;
  onRemove?: (id: string) => void;
  manage?: ManageActions;
}) {
  const statusVariant =
    listing.status === "published" ? "success" : listing.status === "paused" ? "warning" : "secondary";
  return (
    <article className="relative overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Link href={ROUTES.PRODUCT(listing.id)} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.image} alt={listing.title} className="aspect-4/3 w-full object-cover" />
      </Link>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${listing.title} from wishlist`}
          onClick={() => onRemove(listing.id)}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-danger shadow-sm transition hover:bg-danger hover:text-white"
        >
          <Heart size={17} fill="currentColor" />
        </button>
      )}
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{listing.category}</Badge>
                {manage && <Badge variant={statusVariant}>{listing.status}</Badge>}
              </div>
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
        {manage ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="text-xl font-bold text-foreground">{formatCurrency(listing.price)}</span>
              /day
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={ROUTES.LISTING_EDIT(listing.id)}>
                <Button size="sm" variant="outline">Edit</Button>
              </Link>
              {manage.onPublish && listing.status !== "published" && (
                <Button size="sm" loading={manage.busy} onClick={() => manage.onPublish?.(listing.id)}>
                  Publish
                </Button>
              )}
              {manage.onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  loading={manage.busy}
                  onClick={() => manage.onDelete?.(listing.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="text-xl font-bold text-foreground">{formatCurrency(listing.price)}</span>
              /day
            </p>
            <Link href={ROUTES.CHECKOUT(listing.id)}>
              <Button size="sm">Book</Button>
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
