import { AdminShell } from "@/components/marketplace/admin-shell";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/data-table";
import { adminRows } from "@/lib/mock-data";

export function AdminOverview() {
  return (
    <AdminShell>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Users" value="12.8k" description="842 active today" icon="Users" />
        <StatCard title="Listings" value="8.4k" description="118 awaiting review" icon="Package" />
        <StatCard title="Open disputes" value="31" description="6 high priority" icon="AlertTriangle" />
        <StatCard title="Pending KYC" value="12" description="Avg. SLA 4h" icon="ShieldCheck" />
      </div>
      <AdminTable title="Operational Queue" />
    </AdminShell>
  );
}

export function AdminSectionPage({ title, description }: { title: string; description: string }) {
  return (
    <AdminShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button>Export</Button>
      </div>
      <AdminTable title={title} />
    </AdminShell>
  );
}

function AdminTable({ title }: { title: string }) {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Name</Th>
            <Th>Type</Th>
            <Th>Status</Th>
            <Th>Risk</Th>
          </tr>
        </thead>
        <tbody>
          {adminRows.map((row) => (
            <tr key={row.id}>
              <Td>{row.id}</Td>
              <Td>{row.name}</Td>
              <Td>{row.type}</Td>
              <Td><Badge variant={row.status === "Verified" ? "success" : "warning"}>{row.status}</Badge></Td>
              <Td><Badge variant={row.risk === "High" ? "danger" : row.risk === "Medium" ? "warning" : "success"}>{row.risk}</Badge></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
