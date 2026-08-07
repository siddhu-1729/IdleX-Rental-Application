"use client";

import * as React from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/lib/auth";
import { api } from "@/lib/api-client";
import { useFetchData } from "@/lib/use-fetch-data";
import { formatDate } from "@/lib/formatters";
import type { AppNotification } from "@/lib/api-types";

function NotificationsInner() {
  const { data, isLoading, error, refetch } = useFetchData<AppNotification[]>("/api/notifications", []);

  const markRead = async (id: string) => {
    const fresh = await api.post<AppNotification>(`/api/notifications/${id}/read`, {});
    if (fresh) refetch();
  };

  return (
    <DashboardShell title="Notifications">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Booking requests and approvals land here in real time.</p>
        </div>
        {data?.some((n) => !n.isRead) && (
          <Button variant="outline" size="sm" onClick={() => api.post<null>("/api/notifications/read-all", {}).then(() => refetch())}>
            Mark all read
          </Button>
        )}
      </div>
      {error && <p className="mb-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="space-y-3">
        {!isLoading && (data ?? []).length === 0 && (
          <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No notifications yet.
          </p>
        )}
        {(data ?? []).map((note) => {
          const content = (
            <div className={`flex items-center justify-between gap-3 rounded-lg border p-4 ${note.isRead ? "border-border bg-card" : "border-primary-200 bg-primary-50"}`}>
              <div className="min-w-0">
                <p className="font-medium">{note.title}</p>
                {note.body && <p className="mt-0.5 truncate text-sm text-muted-foreground">{note.body}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
              </div>
              {!note.isRead && <Badge variant="info">New</Badge>}
            </div>
          );
          return note.link ? (
            <Link key={note._id} href={note.link} onClick={() => { if (!note.isRead) markRead(note._id); }} className="block">
              {content}
            </Link>
          ) : (
            <button key={note._id} onClick={() => { if (!note.isRead) markRead(note._id); }} className="block w-full text-left">
              {content}
            </button>
          );
        })}
      </div>
    </DashboardShell>
  );
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <NotificationsInner />
    </RequireAuth>
  );
}