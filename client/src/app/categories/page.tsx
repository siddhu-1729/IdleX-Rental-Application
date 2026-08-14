"use client";

import * as React from "react";
import Link from "next/link";
import { PublicShell, PageHero } from "@/components/marketplace/app-shell";
import { Badge } from "@/components/ui/badge";
import { categoryStats } from "@/lib/mock-data";
import { useFetchData } from "@/lib/use-fetch-data";
import type { MarketplaceStats } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

export default function CategoriesPage() {
  const { data: stats } = useFetchData<MarketplaceStats>("/api/stats");
  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const row of stats?.listingsByCategory ?? []) map.set(row.category, row.count);
    return map;
  }, [stats]);

  return (
    <PublicShell>
      <PageHero title="Categories" eyebrow="Browse by need" description="Find verified local rentals across electronics, cameras, tools, sports, vehicles, books, appliances, and outdoor gear." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {categoryStats.map((category) => (
          <Link key={category.slug} href={`${ROUTES.SEARCH}?category=${category.slug}`} className="rounded-lg border border-border bg-card p-5 shadow-sm hover:border-primary">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              <Badge variant={category.demand === "High" ? "success" : "outline"}>{category.demand}</Badge>
            </div>
            <p className="mt-4 text-3xl font-bold">{(stats ? counts.get(category.slug) ?? 0 : category.count).toLocaleString("en-IN")}</p>
            <p className="mt-1 text-sm text-muted-foreground">available listings</p>
          </Link>
        ))}
      </section>
    </PublicShell>
  );
}
