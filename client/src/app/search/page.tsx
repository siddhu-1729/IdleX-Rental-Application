"use client";

import * as React from "react";
import { PublicShell, PageHero } from "@/components/marketplace/app-shell";
import { ListingCard } from "@/components/marketplace/listing-card";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFetchData } from "@/lib/use-fetch-data";
import { toCard } from "@/lib/api-types";
import type { ListingQueryResult } from "@/lib/api-types";
import { CATEGORIES } from "@/lib/constants";

export default function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = React.use(searchParams);
  const [city, setCity] = React.useState("");
  const [category, setCategory] = React.useState(params.category ?? "");
  const [query, setQuery] = React.useState(params.q ?? "");
  const [sort, setSort] = React.useState("-createdAt");

  const urlParams = new URLSearchParams({ status: "published" });
  if (category) urlParams.set("category", category);
  if (city) urlParams.set("city", city);
  if (query) urlParams.set("q", query);
  urlParams.set("ordering", sort === "price-low" ? "pricePerDay" : sort === "rating" ? "-ratingAvg" : "-createdAt");

  const { data, isLoading, error } = useFetchData<ListingQueryResult>(`/api/listings?${urlParams.toString()}`, [city, category, query, sort]);

  return (
    <PublicShell>
      <PageHero title="Search rentals" eyebrow="Marketplace" description="Filter available items by category, city, daily price, rating, and pickup speed." />
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-max rounded-lg border border-border bg-card p-4">
          <h2 className="font-semibold">Filters</h2>
          <div className="mt-4 space-y-4">
            <Input label="Search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="drill, camera, tent..." />
            <Input label="Location" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Any city" />
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: "", label: "All categories" },
                ...CATEGORIES.map((c) => ({ value: c.slug, label: c.name })),
              ]}
            />
            <Select
              label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              options={[
                { value: "-createdAt", label: "Newest" },
                { value: "price-low", label: "Price: low to high" },
                { value: "rating", label: "Top rated" },
              ]}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="default">Verified</Badge>
            <Badge variant="success">Available today</Badge>
            <Badge variant="warning">Low deposit</Badge>
          </div>
        </aside>
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${data?.pagination.total ?? 0} listings found`}
            </p>
            <Badge variant="outline">Live API</Badge>
          </div>
          {error && <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(data?.items ?? []).map((listing) => (
              <ListingCard key={listing._id} listing={toCard(listing)} />
            ))}
          </div>
          {!isLoading && !error && (data?.items ?? []).length === 0 && (
            <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No listings match these filters yet. Adjust the filters or check back soon.
            </p>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
