"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Bell, MessageCircle, Menu } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";

export function TopBar({ onMenuClick, title }: { onMenuClick?: () => void; title?: string }) {
  return (
    <div className="sticky top-0 z-20 h-16 bg-white border-b border-border px-4 md:px-6 flex items-center gap-3">
      {onMenuClick && (
        <button onClick={onMenuClick} className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md hover:bg-muted">
          <Menu size={20} />
        </button>
      )}
      {title && <h1 className="hidden md:block text-lg font-semibold">{title}</h1>}

      <div className="flex-1 max-w-md">
        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Link href="/messages" className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted">
          <MessageCircle size={20} />
          <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-danger text-white flex items-center justify-center">2</span>
        </Link>
        <Link href="/notifications" className="relative h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-muted">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 text-[10px] font-bold rounded-full bg-danger text-white flex items-center justify-center">3</span>
        </Link>
        <div className="ml-2">
          <Avatar name="Rahul Verma" size="sm" />
        </div>
      </div>
    </div>
  );
}
