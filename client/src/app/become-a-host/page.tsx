import Link from "next/link";
import { PublicShell, PageHero } from "@/components/marketplace/app-shell";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function BecomeHostPage() {
  return (
    <PublicShell>
      <PageHero title="Become a Host" eyebrow="Owner onboarding" description="List idle items, set deposits and availability, chat with renters, and receive payouts after successful returns." />
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {["Create listing", "Verify KYC", "Approve bookings"].map((step) => (
            <div key={step} className="rounded-lg border border-border bg-card p-5">
              <h2 className="font-semibold">{step}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">A guided flow keeps details, pricing, photos, and handover expectations clear.</p>
            </div>
          ))}
        </div>
        <Link href={ROUTES.LISTING_NEW} className="mt-6 inline-block"><Button>List Your First Item</Button></Link>
      </section>
    </PublicShell>
  );
}
