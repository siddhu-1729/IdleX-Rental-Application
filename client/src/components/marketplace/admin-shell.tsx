import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ADMIN_SIDEBAR } from "@/config/navigation";
import { ICONS } from "@/components/ui/icons";
import { ROUTES } from "@/lib/constants";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-sm font-bold text-white">
            iX
          </div>
          <Link href={ROUTES.ADMIN} className="font-bold">IdleX Admin</Link>
        </div>
        <nav className="p-3">
          {ADMIN_SIDEBAR.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted"
              >
                {Icon && <Icon size={17} />}
                <span className="flex-1">{item.label}</span>
                {item.badge && <Badge variant="danger">{item.badge}</Badge>}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-white px-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Operations</p>
            <h1 className="text-lg font-semibold">Admin Control Center</h1>
          </div>
          <Badge variant="success">Live mock data</Badge>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </main>
    </div>
  );
}
