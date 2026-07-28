"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Lightweight custom checkbox. Uncontrolled-friendly. */
export function Checkbox({
  className,
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: React.ReactNode }) {
  const id = React.useId();
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none text-sm">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/30",
          className
        )}
        {...rest}
      />
      {label && <span className="text-foreground">{label}</span>}
    </label>
  );
}

/** Radio group, simple. */
export function RadioGroup({
  name,
  options,
  value,
  onChange,
  className,
}: {
  name: string;
  options: Array<{ value: string; label: React.ReactNode }>;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {options.map((o) => {
        const id = `${name}-${o.value}`;
        return (
          <label
            key={o.value}
            htmlFor={id}
            className={cn(
              "flex items-center gap-2 cursor-pointer rounded-md border border-border p-3 transition-colors",
              value === o.value && "border-primary bg-primary-50/40"
            )}
          >
            <input
              id={id}
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={(e) => onChange?.(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-sm text-foreground">{o.label}</span>
          </label>
        );
      })}
    </div>
  );
}
