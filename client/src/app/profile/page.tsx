import { DashboardShell } from "@/components/marketplace/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  return (
    <DashboardShell title="Profile">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Avatar name="Rahul Verma" size="xl" />
          <div>
            <h1 className="text-2xl font-bold">Venkata Siddhardha.V</h1>
            <Badge variant="success">KYC Verified</Badge>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Full name" defaultValue="Venkata Siddhardha" />
          <Input label="Email" defaultValue="siddhu@example.com" />
          <Input label="Phone" defaultValue="+91 9997799800" />
          <Input label="City" defaultValue="Bhimavaram" />
        </div>
        <Button className="mt-5">Save Profile</Button>
      </div>
    </DashboardShell>
  );
}
