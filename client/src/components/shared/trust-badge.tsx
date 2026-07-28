"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star, CheckCircle, ShieldCheck } from "@/components/ui/icons";

export function TrustBadge({
  children,
  icon,
  className,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary-50 text-secondary-700 text-sm font-medium",
        className
      )}
    >
      {icon || <ShieldCheck size={16} />}
      {children}
    </div>
  );
}

export function RatingBar({
  label,
  count,
  total,
  color = "bg-secondary-500",
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const pct = total === 0 ? 0 : (count / total) * 100;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-12 text-muted-foreground">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-foreground">{count}</span>
    </div>
  );
}

export { Star, CheckCircle, ShieldCheck };
