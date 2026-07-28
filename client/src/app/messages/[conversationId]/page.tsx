import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessageThreadPage() {
  return (
    <DashboardShell title="Conversation">
      <div className="flex min-h-[620px] flex-col rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h1 className="font-semibold">Aarav Studios</h1>
          <p className="text-sm text-muted-foreground">Canon EOS R6 Camera Kit</p>
        </div>
        <div className="flex-1 space-y-3 p-4">
          <p className="max-w-md rounded-lg bg-muted p-3 text-sm">Pickup slot is confirmed for 10:30 AM.</p>
          <p className="ml-auto max-w-md rounded-lg bg-primary p-3 text-sm text-white">Great, I will bring my ID and pickup code.</p>
          <p className="max-w-md rounded-lg bg-muted p-3 text-sm">Perfect. I will share condition photos during handover.</p>
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <Input placeholder="Write a message" />
          <Button>Send</Button>
        </div>
      </div>
    </DashboardShell>
  );
}
