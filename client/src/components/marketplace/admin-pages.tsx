"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/marketplace/admin-shell";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/data-table";
import { api } from "@/lib/api-client";
import { RequireAuth, useAuth, errorMessage } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { AdminStats, Dispute, Kyc, Listing, User } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

function AdminError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{message}</p>;
}

export function AdminOverview() {
  const { data } = useFetchData<AdminStats>("/api/admin/stats", []);
  const { data: pendingKyc } = useFetchData<Kyc[]>("/api/admin/kyc?status=pending", []);
  const { data: openDisputes } = useFetchData<Dispute[]>("/api/admin/disputes", []);

  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Users" value={(data?.totalUsers ?? 0).toLocaleString("en-IN")} description="Registered accounts" icon="Users" />
        <StatCard title="Listings" value={(data?.totalListings ?? 0).toLocaleString("en-IN")} description="Across all categories" icon="Package" />
        <StatCard title="Active bookings" value={(data?.activeBookings ?? 0).toString()} description="Confirmed + active" icon="CalendarCheck" />
        <StatCard title="Revenue" value={formatCurrency(data?.totalRevenue ?? 0)} description="Captured payments" icon="Wallet" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Pending KYC ({pendingKyc?.length ?? 0})</h2>
          {pendingKyc?.map((k) => (
            <p key={k._id} className="border-b border-border py-2 text-sm last:border-0">
              {typeof k.user === "object" ? k.user.name : k.user} — <span className="text-muted-foreground">{k.currentStep}</span>
            </p>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Open disputes ({openDisputes?.filter((d) => d.status === "open").length ?? 0})</h2>
          {openDisputes?.filter((d) => d.status === "open").map((d) => (
            <p key={d._id} className="border-b border-border py-2 text-sm last:border-0">
              {d.reason} — <span className="text-muted-foreground">{formatDate(d.createdAt)}</span>
            </p>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminUsersPage() {
  const { data, isLoading, error, refetch } = useFetchData<User[]>("/api/admin/users", []);

  const suspend = async (id: string, isActive: boolean) => {
    await api.patch<User>(`/api/admin/users/${id}`, { isActive: !isActive });
    refetch();
  };

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage registered accounts and suspensions.</p>
        </div>
      </div>
      <AdminError message={error?.message ?? null} />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((user) => (
              <tr key={user._id}>
                <Td>{user.name}</Td>
                <Td>{user.email}</Td>
                <Td>{user.role}</Td>
                <Td><Badge variant={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Suspended"}</Badge></Td>
                <Td><Button size="sm" variant={user.isActive ? "danger" : "outline"} onClick={() => suspend(user._id, user.isActive)}>{user.isActive ? "Suspend" : "Restore"}</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </AdminShell>
  );
}

export function AdminListingsPage() {
  const { data, isLoading, error, refetch } = useFetchData<Listing[]>("/api/admin/listings", []);

  const moderate = async (id: string, status: Listing["status"]) => {
    await api.patch<Listing>(`/api/admin/listings/${id}`, { status });
    refetch();
  };

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Listings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Moderate published listings.</p>
        </div>
      </div>
      <AdminError message={error?.message ?? null} />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Owner</Th>
              <Th>Price/day</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((listing) => (
              <tr key={listing._id}>
                <Td>{listing.title}</Td>
                <Td>{typeof listing.owner === "object" ? listing.owner.name : "Owner"}</Td>
                <Td>{formatCurrency(listing.pricePerDay)}</Td>
                <Td><Badge variant={listing.status === "published" ? "success" : "warning"}>{listing.status}</Badge></Td>
                <Td>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => moderate(listing._id, "paused")}>Pause</Button>
                    <Button size="sm" variant="outline" onClick={() => moderate(listing._id, "published")}>Publish</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </AdminShell>
  );
}

export function AdminDisputesPage() {
  const { data, isLoading, error, refetch } = useFetchData<Dispute[]>("/api/admin/disputes", []);

  const resolve = async (id: string) => {
    await api.post<Dispute>(`/api/admin/disputes/${id}/resolve`, { status: "resolved", resolutionNote: "Resolved by admin" });
    refetch();
  };

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review and resolve disputes.</p>
        </div>
      </div>
      <AdminError message={error?.message ?? null} />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <Table>
          <thead>
            <tr>
              <Th>Reason</Th>
              <Th>Raised by</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((dispute) => (
              <tr key={dispute._id}>
                <Td>{dispute.reason}</Td>
                <Td>{typeof dispute.raisedBy === "object" ? dispute.raisedBy.name : "User"}</Td>
                <Td><Badge variant={dispute.status === "open" ? "danger" : dispute.status === "resolved" ? "success" : "warning"}>{dispute.status}</Badge></Td>
                <Td>{dispute.status !== "resolved" && <Button size="sm" onClick={() => resolve(dispute._id)}>Resolve</Button>}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </AdminShell>
  );
}

export function AdminKycPage() {
  const { data, isLoading, error, refetch } = useFetchData<Kyc[]>("/api/admin/kyc", []);

  const review = async (id: string, status: "approved" | "rejected") => {
    await api.patch<Kyc>(`/api/admin/kyc/${id}`, { status, rejectionReason: status === "rejected" ? "Documents unclear" : undefined });
    refetch();
  };

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="mt-1 text-sm text-muted-foreground">Approve identity, address, bank, and higher-value rental checks.</p>
        </div>
      </div>
      <AdminError message={error?.message ?? null} />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Step</Th>
              <Th>Status</Th>
              <Th>Submitted</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((kyc) => (
              <tr key={kyc._id}>
                <Td>{typeof kyc.user === "object" ? `${kyc.user.name} (${kyc.user.email})` : kyc.user}</Td>
                <Td>{kyc.currentStep}</Td>
                <Td><Badge variant={kyc.status === "approved" ? "success" : kyc.status === "rejected" ? "danger" : kyc.status === "pending" ? "warning" : "default"}>{kyc.status}</Badge></Td>
                <Td>{formatDate(kyc.createdAt)}</Td>
                <Td>
                  {kyc.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => review(kyc._id, "approved")}>Approve</Button>
                      <Button size="sm" variant="danger" onClick={() => review(kyc._id, "rejected")}>Reject</Button>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </AdminShell>
  );
}

export function AdminReportsPage() {
  const { data, isLoading, error } = useFetchData<Dispute[]>("/api/admin/reports", []);

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Flagged content queue.</p>
        </div>
      </div>
      <AdminError message={error?.message ?? null} />
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <Table>
          <thead>
            <tr>
              <Th>Reason</Th>
              <Th>Raised by</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((report) => (
              <tr key={report._id}>
                <Td>{report.reason}</Td>
                <Td>{typeof report.raisedBy === "object" ? report.raisedBy.name : "User"}</Td>
                <Td><Badge variant={report.status === "open" ? "danger" : "success"}>{report.status}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </AdminShell>
  );
}

export function AdminSectionPage({ title, description }: { title: string; description: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {title === "Support Tickets" && (
          <Button
            onClick={async () => {
              setError(null);
              try {
                await api.get<null>("/api/auth/me");
              } catch (err) {
                setError(errorMessage(err));
              }
            }}
          >
            Verify session
          </Button>
        )}
      </div>
      <AdminError message={error} />
      <div className="mt-6 rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        {user?.role === "admin" ? (
          <>
            Signed in as <strong className="text-foreground">{user.email}</strong>. This section is
            rendered from static mock data — the backend does not expose a dedicated endpoint for it.
          </>
        ) : (
          <>
            Not authenticated as admin.{" "}
            <button className="font-semibold text-primary" onClick={() => { logout(); router.push(ROUTES.LOGIN); }}>
              Sign in
            </button>{" "}
            with an admin account to manage {title.toLowerCase()}.
          </>
        )}
      </div>
    </AdminShell>
  );
}

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const bouncedRef = React.useRef(false);

  React.useEffect(() => {
    if (bouncedRef.current) return;
    bouncedRef.current = true;
    if (!user) router.replace(ROUTES.LOGIN);
    else if (user.role !== "admin") router.replace(ROUTES.DASHBOARD);
  }, [user, router]);

  if (!user) {
    return <div className="grid min-h-screen place-items-center bg-muted"><p className="text-sm text-muted-foreground">Loading…</p></div>;
  }
  if (user.role !== "admin") {
    return <div className="grid min-h-screen place-items-center bg-muted"><p className="text-sm text-muted-foreground">Redirecting…</p></div>;
  }
  return <>{children}</>;
}

export { RequireAuth };
