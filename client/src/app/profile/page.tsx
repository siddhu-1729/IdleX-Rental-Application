"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequireAuth, useAuth, errorMessage } from "@/lib/auth";
import { api } from "@/lib/api-client";
import type { Kyc, User } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

function ProfileInner() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [kyc, setKyc] = React.useState<Kyc | null>(null);
  const [name, setName] = React.useState(user?.name ?? "");
  const [phone, setPhone] = React.useState(user?.phone ?? "");
  const [email] = React.useState(user?.email ?? "");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    api
      .get<Kyc>("/api/kyc")
      .then((data) => {
        if (!cancelled) setKyc(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const updated = await api.patch<User>("/api/auth/me", { name, phone: phone || undefined });
      setMessage("Profile saved.");
      await refreshUser().catch(() => updated);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell title="Profile">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name ?? "User"} size="xl" />
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={user?.role === "admin" ? "success" : "default"}>{user?.role}</Badge>
              <Badge variant={user?.isOwner ? "warning" : "secondary"}>{user?.isOwner ? "Owner" : "Renter"}</Badge>
              <Badge
                variant={kyc?.status === "approved" ? "success" : kyc?.status === "pending" ? "warning" : "secondary"}
              >
                KYC {kyc?.status === "approved" ? "Approved" : kyc?.status === "pending" ? "Pending Review" : kyc?.status === "rejected" ? "Rejected" : "Not Verified"}
              </Badge>
              {kyc && kyc.status !== "approved" && (
                <Link href={ROUTES.KYC} className="text-sm font-semibold text-primary hover:underline">
                  Complete KYC
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} readOnly />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {error && <p className="mt-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error}</p>}
        {message && <p className="mt-4 rounded-md bg-secondary-50 p-3 text-sm text-secondary-700">{message}</p>}
        <div className="mt-5 flex gap-3">
          <Button loading={loading} onClick={save}>Save Profile</Button>
          {!user?.isOwner && (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await api.patch<User>("/api/auth/me", { becomeOwner: true });
                  await refreshUser();
                  router.push(ROUTES.LISTING_NEW);
                } catch (err) {
                  setError(errorMessage(err));
                }
              }}
            >
              Become an Owner
            </Button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
