import Link from "next/link";
import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { conversations } from "@/lib/mock-data";
import { ROUTES } from "@/lib/constants";

export default function MessagesPage() {
  return (
    <DashboardShell title="Messages">
      <div className="rounded-lg border border-border bg-card">
        {conversations.map((conversation) => (
          <Link key={conversation.id} href={ROUTES.MESSAGE_THREAD(conversation.id)} className="flex gap-3 border-b border-border p-4 last:border-0 hover:bg-muted">
            <Avatar name={conversation.name} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{conversation.name}</p>
                <span className="text-xs text-muted-foreground">{conversation.time}</span>
              </div>
              <p className="text-sm text-muted-foreground">{conversation.item}</p>
              <p className="mt-1 truncate text-sm">{conversation.message}</p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
