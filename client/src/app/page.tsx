import Link from "next/link";
import { PublicShell } from "@/components/marketplace/app-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryStats, listings } from "@/lib/mock-data";
import { ROUTES } from "@/lib/constants";
import { ArrowRight, CheckCircle, ShieldCheck, Wallet } from "@/components/ui/icons";

const steps = [
  { title: "Find", copy: "Search by location, category, availability, deposit, and rating.", Icon: CheckCircle },
  { title: "Book", copy: "Pay securely with transparent rent, platform fee, and deposit.", Icon: Wallet },
  { title: "Trust", copy: "Use KYC, pickup proofs, reviews, and chat to keep every rental accountable.", Icon: ShieldCheck },
];

export default function Home() {
  return (
    <PublicShell>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_520px] lg:py-16">
          <div className="flex flex-col justify-center">
            <Badge variant="success">Verified rentals in your city</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold text-foreground sm:text-6xl">
              IdleX
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Rent cameras, tools, bikes, electronics, and event gear from trusted local owners.
              Earn from items sitting idle at home.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={ROUTES.SEARCH}>
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>Browse Items</Button>
              </Link>
              <Link href={ROUTES.BECOME_HOST}>
                <Button size="lg" variant="outline">Start Hosting</Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <StatCard title="Listed items" value="8.4k" description="Across Andhra Pradesh" icon="Package" />
              <StatCard title="Avg. owner rating" value="4.8" description="From verified renters" icon="Star" />
              <StatCard title="Deposits tracked" value="100%" description="Clear refund status" icon="ShieldCheck" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {listings.slice(0, 4).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>
      <section id="how-it-works" className="border-y border-border bg-muted">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
          {steps.map(({ title, copy, Icon }) => (
            <div key={title} className="rounded-lg border border-border bg-white p-5">
              <Icon className="text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Popular Categories</h2>
            <p className="mt-2 text-sm text-muted-foreground">Demand-ready inventory for daily life and special plans.</p>
          </div>
          <Link href={ROUTES.CATEGORIES} className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categoryStats.slice(0, 8).map((category) => (
            <Link key={category.slug} href={`${ROUTES.SEARCH}?category=${category.slug}`} className="rounded-lg border border-border bg-white p-4 hover:border-primary">
              <p className="font-semibold">{category.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{category.count.toLocaleString("en-IN")} items - {category.demand} demand</p>
            </Link>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
