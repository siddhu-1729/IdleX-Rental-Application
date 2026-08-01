"use client";

import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { RequireAuth } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Payout } from "@/lib/api-types";

function PaymentsInner() {
  const { data, isLoading, error } = useFetchData<Payout[]>("/api/payments/payouts", []);

  return (
    <DashboardShell title="Payments">
      <div className="rounded-lg border border-border bg-card">
        {error && <p className="rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
        {(data ?? []).map((payout) => (
          <div key={payout._id} className="flex items-center justify-between border-b border-border p-4 last:border-0">
            <div>
              <p className="font-semibold">Owner payout</p>
              <p className="text-sm text-muted-foreground">{payout._id} · {formatDate(payout.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">{formatCurrency(payout.amount)}</p>
              <Badge variant={payout.status === "paid" ? "success" : payout.status === "failed" ? "danger" : "warning"}>{payout.status}</Badge>
            </div>
          </div>
        ))}
        {!isLoading && !error && (data ?? []).length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No payouts yet. Payouts appear here after your rentals complete.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}

export default function PaymentsPage() {
  return (
    <RequireAuth>
      <PaymentsInner />
    </RequireAuth>
  );
}
