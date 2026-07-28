"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "./icons";

export function StarRating({
  value = 0,
  outOf = 5,
  size = 14,
  className,
  showValue = false,
}: {
  value?: number;
  outOf?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: outOf }).map((_, i) => {
        const filled = i + 1 <= Math.round(value);
        return (
          <Star
            key={i}
            size={size}
            className={filled ? "fill-accent-500 text-accent-500" : "text-gray-300 fill-gray-200"}
          />
        );
      })}
      {showValue && <span className="ml-1 text-sm font-medium text-foreground">{value.toFixed(1)}</span>}
    </div>
  );
}
