import Link from "next/link";
import { PublicShell } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ShieldCheck, Star } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/formatters";
import { getListing } from "@/lib/mock-data";
import { ROUTES } from "@/lib/constants";

export default async function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const listing = getListing(productId);

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.image} alt={listing.title} className="aspect-video w-full rounded-lg object-cover" />
          <div className="mt-6">
            <Badge variant="outline">{listing.category}</Badge>
            <h1 className="mt-3 text-3xl font-bold">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin size={16} />
              {listing.location} - hosted by {listing.owner}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {listing.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
            <p className="mt-6 leading-7 text-muted-foreground">
              A verified rental with pickup proof, clear deposit tracking, and in-app chat. This item is maintained between rentals and includes the accessories shown in the listing.
            </p>
          </div>
        </div>
        <Card className="h-max">
          <CardHeader>
            <CardTitle>{formatCurrency(listing.price)} / day</CardTitle>
            <p className="flex items-center gap-1 text-sm text-accent-700"><Star size={15} /> {listing.rating} from {listing.reviews} reviews</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="flex justify-between"><span>Security deposit</span><strong>{formatCurrency(listing.deposit)}</strong></p>
              <p className="mt-2 flex justify-between"><span>Platform protection</span><strong>Included</strong></p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-secondary-200 bg-secondary-50 p-3 text-sm text-secondary-700">
              <ShieldCheck size={18} />
              KYC verified owner and protected handover
            </div>
            <Link href={ROUTES.CHECKOUT(listing.id)}><Button fullWidth>Reserve Item</Button></Link>
          </CardContent>
        </Card>
      </section>
    </PublicShell>
  );
}
