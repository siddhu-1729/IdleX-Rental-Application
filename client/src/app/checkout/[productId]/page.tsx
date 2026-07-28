import Link from "next/link";
import { PublicShell } from "@/components/marketplace/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formatters";
import { getListing } from "@/lib/mock-data";

export default async function CheckoutPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const listing = getListing(productId);
  const days = 3;
  const rent = listing.price * days;
  const fee = Math.round(rent * 0.08);

  return (
    <PublicShell>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <Card>
            <CardHeader><CardTitle>Rental details</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input label="Start date" type="date" />
              <Input label="End date" type="date" />
              <Select label="Pickup option" options={[{ value: "pickup", label: "Owner pickup" }, { value: "delivery", label: "Doorstep delivery" }]} />
              <Select label="Payment method" options={[{ value: "upi", label: "UPI" }, { value: "card", label: "Card" }, { value: "wallet", label: "IdleX Wallet" }]} />
            </CardContent>
          </Card>
        </div>
        <Card className="h-max">
          <CardHeader><CardTitle>{listing.title}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex justify-between"><span>Rent x {days} days</span><strong>{formatCurrency(rent)}</strong></p>
            <p className="flex justify-between"><span>Platform fee</span><strong>{formatCurrency(fee)}</strong></p>
            <p className="flex justify-between"><span>Refundable deposit</span><strong>{formatCurrency(listing.deposit)}</strong></p>
            <hr className="border-border" />
            <p className="flex justify-between text-base"><span>Total today</span><strong>{formatCurrency(rent + fee + listing.deposit)}</strong></p>
            <Button fullWidth>Pay and Reserve</Button>
            <Link href={`/product/${listing.id}`} className="block text-center text-sm font-semibold text-primary">Back to item</Link>
          </CardContent>
        </Card>
      </section>
    </PublicShell>
  );
}
