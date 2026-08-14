"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell } from "@/components/marketplace/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoryStats } from "@/lib/mock-data";
import { useFetchData } from "@/lib/use-fetch-data";
import { listingImage } from "@/lib/api-types";
import type { ListingQueryResult, MarketplaceStats } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";
import { useIsMounted } from "@/lib/auth";
import { useHostStatus } from "@/lib/use-host-status";
import {
  ArrowRight,
  Bike,
  CalendarCheck,
  Camera,
  Home as HomeIcon,
  MessageCircle,
  Package,
  Search,
  Smartphone,
  Star,
  Trees,
  Wrench,
} from "@/components/ui/icons";

const steps = [
  { title: "Find", copy: "Search for items you need", Icon: Search },
  { title: "Book", copy: "Choose dates and place request", Icon: CalendarCheck },
  { title: "Connect", copy: "Chat with owner and confirm", Icon: MessageCircle },
  { title: "Use & Return", copy: "Enjoy it and return on time", Icon: Package },
  { title: "Review", copy: "Rate your experience", Icon: Star },
];

const categoryIcons = {
  Electronics: Smartphone,
  Cameras: Camera,
  Outdoor: Trees,
  Tools: Wrench,
  "Home Appliances": HomeIcon,
  Sports: Bike,
};

export default function Home() {
  const { data } = useFetchData<ListingQueryResult>("");
  const { data: stats } = useFetchData<MarketplaceStats>("/api/stats");
  const mounted = useIsMounted();
  const { hasListings } = useHostStatus();
  const isHost = mounted && hasListings;

  const tiles = [
    { className: "col-span-2 row-span-2", image: data?.items[0] ? listingImage(data.items[0]) : "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80", title: data?.items[0]?.title ?? "Camera kit" },
    { className: "col-span-1 row-span-1", image: data?.items[1] ? listingImage(data.items[1]) : "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80", title: data?.items[1]?.title ?? "Drill set" },
    { className: "col-span-1 row-span-1", image: data?.items[2] ? listingImage(data.items[2]) : "https://images.unsplash.com/photo-1626379953822-baec19c3accd?auto=format&fit=crop&w=1200&q=80", title: data?.items[2]?.title ?? "Projector" },
    { className: "col-span-1 row-span-1", image: data?.items[3] ? listingImage(data.items[3]) : "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80", title: data?.items[3]?.title ?? "City bike" },
    {
      className: "col-span-1 row-span-1",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
      title: "Weekend camping tent",
    },
  ];

  return (
    <PublicShell>
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:pb-16 lg:pt-12">
          <div className="flex flex-col justify-center">
            <Badge className="w-fit border-violet-200 bg-violet-50 text-violet-700">Rent Smart. Live More.</Badge>
            <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight text-foreground sm:text-6xl">
              Rent <span className="text-primary">Anything.</span>
              <br />
              Own Nothing.
              <br />
              Live Fully.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              IdleX is your trusted community marketplace to rent items you love and earn from
              what you do not use.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={ROUTES.SEARCH}>
                <Button size="lg" rightIcon={<ArrowRight size={18} />}>Browse Items</Button>
              </Link>
              <Link href={isHost ? ROUTES.LISTING_NEW : ROUTES.BECOME_HOST}>
                <Button size="lg" variant="outline">{isHost ? "Add another listing" : "Become a Host"}</Button>
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-5">
              {[
                [`${(stats?.activeListings ?? data?.pagination.total ?? 10000).toLocaleString("en-IN")}+`, "Active Listings"],
                [`${(stats?.happyRenters ?? 5000).toLocaleString("en-IN")}+`, "Happy Renters"],
                [stats?.averageRating ? stats.averageRating.toFixed(1) : "4.8", "Average Rating"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-primary">{value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative min-h-130">
            <div className="grid h-full grid-cols-3 grid-rows-4 gap-4">
              {tiles.map(({ image, title, className }, index) => (
                <div key={`${title}-${index}`} className={`${className} overflow-hidden rounded-2xl bg-muted shadow-sm`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={title} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4  sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Popular Categories</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find the things you need without buying them.</p>
          </div>
          <Link href={ROUTES.CATEGORIES} className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {categoryStats.slice(0, 6).map((category) => {
            const Icon = categoryIcons[category.name as keyof typeof categoryIcons] ?? Package;
            const count = stats ? stats.listingsByCategory?.find((row) => row.category === category.slug)?.count ?? 0 : category.count;
            return (
            <Link key={category.slug} href={`${ROUTES.SEARCH}?category=${category.slug}`} className="rounded-xl border border-border bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary">
                <Icon size={22} />
              </span>
              <p className="mt-3 font-semibold">{category.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{count.toLocaleString("en-IN")}+ items</p>
            </Link>
          )})}
        </div>
      </section>
      <section id="how-it-works" className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6">
          <h2 className="text-2xl font-bold">How IdleX Works</h2>
          <div className="mt-9 grid gap-5 md:grid-cols-5">
            {steps.map(({ title, copy, Icon }, index) => (
              <div key={title} className="relative">
                {index < steps.length - 1 && <div className="absolute left-[55%] top-7 hidden h-px w-[90%] bg-border md:block" />}
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-full border border-border bg-white text-primary shadow-sm">
                  <Icon size={22} />
                </div>
                <p className="mt-4 text-sm font-bold">{index + 1}. {title}</p>
                <p className="mx-auto mt-2 max-w-32 text-xs leading-5 text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-primary-50/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px]">
          <div>
            <Badge className="border-primary-200 bg-white text-primary-700">New rental extension</Badge>
            <h2 className="mt-4 text-3xl font-bold">Need one more day? Extend without starting over.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Renters can check extension rules before booking, and owners can set extension pricing,
              maximum days, and approval rules while listing an item.
            </p>
          </div>
          <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Extension request</span>
              <Badge variant="warning">Pending owner</Badge>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Extra days</span><strong>2 days</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Extension rate</span><strong>20% higher</strong></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total due</span><strong>Rs 3,200</strong></div>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
