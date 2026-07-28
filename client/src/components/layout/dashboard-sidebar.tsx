"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LogOut, X } from "@/components/ui/icons";
import { ICONS } from "@/components/ui/icons";
import { RENTER_SIDEBAR, OWNER_SIDEBAR } from "@/config/navigation";
import { ROUTES } from "@/lib/constants";

export function DashboardSidebar({
  mode = "renter",
  onCloseMobile,
}: {
  mode?: "renter" | "owner";
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const items = mode === "owner" ? OWNER_SIDEBAR : RENTER_SIDEBAR;

  return (
    <aside className="h-full flex flex-col bg-white border-r border-border w-64">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold text-sm">
            iX
          </div>
          <span className="text-lg font-bold">
            Idle<span className="text-primary">X</span>
          </span>
        </Link>
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="md:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User card */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar name="Rahul Verma" size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Rahul Verma</p>
            <p className="text-xs text-muted-foreground">{mode === "owner" ? "Owner" : "Renter"}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs">★</span>
          <span className="text-xs font-semibold">4.7</span>
          <span className="text-xs text-muted-foreground">(23 Reviews)</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary text-white font-medium"
                  : "text-foreground hover:bg-muted"
              )}
            >
              {Icon && <Icon size={18} />}
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                typeof item.badge === "string" ? (
                  <Badge variant={item.badge === "Verified" ? "success" : "danger"} className="text-[10px]">
                    {item.badge}
                  </Badge>
                ) : (
                  <span
                    className={cn(
                      "min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold",
                      active ? "bg-white text-primary" : "bg-danger text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                )
              )}
            </Link>
          );
        })}
      </nav>

      {/* Refer & Earn */}
      <div className="m-3 p-4 rounded-xl bg-linear-to-br from-primary-50 to-secondary-50 border border-primary-100">
        <p className="text-sm font-semibold text-foreground">Refer & Earn</p>
        <p className="text-xs text-muted-foreground mt-1">
          Refer your friends and earn ₹300 IdleX credits!
        </p>
        <Button size="sm" className="mt-3 w-full">Refer Now</Button>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <Link
          href={ROUTES.LOGIN}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-foreground hover:bg-muted"
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </aside>
  );
}
