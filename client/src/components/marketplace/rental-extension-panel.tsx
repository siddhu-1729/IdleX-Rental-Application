"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Calendar, CheckCircle, Clock, Repeat, Wallet } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/formatters";

type Extension = {
  available: boolean;
  currentReturn: string;
  dailyRate: number;
  maxDays: number;
  approval: string;
  notice: string;
};

export function RentalExtensionPanel({ extension }: { extension: Extension }) {
  const [days, setDays] = React.useState(extension.available ? 1 : 0);
  const [submitted, setSubmitted] = React.useState(false);
  const extensionTotal = days * extension.dailyRate;

  if (!extension.available) {
    return (
      <div className="rounded-lg border border-border bg-muted p-5">
        <div className="flex items-center gap-2">
          <Repeat className="text-muted-foreground" />
          <h2 className="font-semibold">Rental extension unavailable</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{extension.notice}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge className="border-primary-200 bg-primary-50 text-primary-700">Extension available</Badge>
          <h2 className="mt-3 text-xl font-semibold">Request Rental Extension</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose extra days and send a request to the owner before the rental ends.
          </p>
        </div>
        <div className="rounded-lg bg-primary-50 px-4 py-3 text-sm">
          <p className="text-muted-foreground">Current return</p>
          <p className="font-semibold text-primary-900">{extension.currentReturn}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Extend by"
            value={String(days)}
            onChange={(event) => setDays(Number(event.target.value))}
            options={Array.from({ length: extension.maxDays }, (_, index) => {
              const value = String(index + 1);
              return { value, label: `${value} ${index === 0 ? "day" : "days"}` };
            })}
          />
          <Input label="Extension daily rate" value={formatCurrency(extension.dailyRate)} readOnly />
          <Input label="Approval rule" value={extension.approval} readOnly className="md:col-span-2" />
          <Textarea
            label="Message to owner"
            placeholder="Tell the owner why you need more time..."
            className="md:col-span-2"
          />
        </div>

        <div className="rounded-lg bg-muted p-4">
          <p className="font-semibold">Extension summary</p>
          <div className="mt-4 space-y-3 text-sm">
            <SummaryRow icon={<Calendar size={16} />} label="Extra time" value={`${days} ${days === 1 ? "day" : "days"}`} />
            <SummaryRow icon={<Wallet size={16} />} label="Amount due" value={formatCurrency(extensionTotal)} />
            <SummaryRow icon={<Clock size={16} />} label="Deadline" value={extension.notice} />
          </div>
          <Button
            className="mt-5"
            fullWidth
            leftIcon={submitted ? <CheckCircle size={16} /> : <Repeat size={16} />}
            onClick={() => setSubmitted(true)}
          >
            {submitted ? "Request Sent" : "Send Extension Request"}
          </Button>
          {submitted && (
            <p className="mt-3 rounded-md bg-secondary-50 p-3 text-xs leading-5 text-secondary-700">
              The owner has been notified. You can continue using the item only after approval and payment.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <strong className="max-w-36 text-right text-foreground">{value}</strong>
    </div>
  );
}
