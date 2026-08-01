"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { RequireAuth } from "@/lib/auth";
import { useFetchData } from "@/lib/use-fetch-data";
import { timeAgo } from "@/lib/formatters";
import type { Conversation } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";

function otherParticipant(conversation: Conversation) {
  return conversation.participants.find((p) => typeof p === "object" && p !== null) ?? null;
}

function MessagesInner() {
  const { data, isLoading, error } = useFetchData<Conversation[]>("/api/chat/conversations", []);

  return (
    <DashboardShell title="Messages">
      <div className="rounded-lg border border-border bg-card">
        {error && <p className="rounded-md bg-danger-50 p-3 text-sm text-danger">{error.message}</p>}
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
        {(data ?? []).map((conversation) => {
          const other = otherParticipant(conversation);
          const name = other && typeof other === "object" ? other.name : "Conversation";
          return (
            <Link key={conversation._id} href={ROUTES.MESSAGE_THREAD(conversation._id)} className="flex gap-3 border-b border-border p-4 last:border-0 hover:bg-muted">
              <Avatar name={name} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold">{name}</p>
                  <span className="text-xs text-muted-foreground">{timeAgo(conversation.lastMessageAt)}</span>
                </div>
                {conversation.listing && typeof conversation.listing === "object" && (
                  <p className="text-sm text-muted-foreground">{conversation.listing.title}</p>
                )}
                <p className="mt-1 truncate text-sm">{conversation.lastMessage || "Start the conversation"}</p>
              </div>
            </Link>
          );
        })}
        {!isLoading && !error && (data ?? []).length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            No conversations yet. Message an owner from a listing to get started.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}

export default function MessagesPage() {
  return (
    <RequireAuth>
      <MessagesInner />
    </RequireAuth>
  );
}
