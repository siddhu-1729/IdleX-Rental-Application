"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { Checkbox, RadioGroup } from "@/components/ui/form-controls";
import { Clock, Repeat, Upload } from "@/components/ui/icons";

export function AuthPanel({ mode }: { mode: "login" | "sign-up" | "forgot" | "otp" }) {
  const titles = {
    login: "Welcome back",
    "sign-up": "Create your IdleX account",
    forgot: "Reset your password",
    otp: "Verify your phone",
  };

  return (
    <form className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <Badge variant="default">Secure access</Badge>
        <h1 className="mt-3 text-2xl font-bold">{titles[mode]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mock authentication is ready for backend integration.
        </p>
      </div>
      <div className="space-y-4">
        {mode === "sign-up" && <Input label="Full name" placeholder="Venkata Siddhardha" />}
        {mode !== "otp" && <Input label="Email or phone" placeholder="siddhu@example.com" />}
        {(mode === "login" || mode === "sign-up") && (
          <Input label="Password" type="password" placeholder="Enter password" />
        )}
        {mode === "otp" && <Input label="One-time password" placeholder="6 digit code" />}
        <Button fullWidth>{mode === "forgot" ? "Send reset link" : mode === "otp" ? "Verify OTP" : "Continue"}</Button>
      </div>
    </form>
  );
}

export function ListingStepperForm({ edit = false }: { edit?: boolean }) {
  const [extensionPricing, setExtensionPricing] = React.useState("custom");

  return (
    <div className="space-y-6">
      <Stepper
        current={edit ? 4 : 1}
        steps={[
          { id: "basics", title: "Basics" },
          { id: "pricing", title: "Pricing" },
          { id: "extension", title: "Extension" },
          { id: "photos", title: "Photos" },
          { id: "review", title: "Review" },
        ]}
      />
      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <Input label="Item title" defaultValue={edit ? "Canon EOS R6 Camera Kit" : ""} placeholder="Camera, bike, drill..." />
        <Select
          label="Category"
          options={[
            { value: "cameras", label: "Cameras" },
            { value: "tools", label: "Tools" },
            { value: "sports", label: "Sports" },
          ]}
        />
        <Input label="Daily price" placeholder="1450" />
        <Input label="Security deposit" placeholder="7000" />
        <Textarea className="md:col-span-2" label="Description" placeholder="Condition, included accessories, pickup notes..." />
        <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted md:col-span-2">
          <div className="text-center text-sm text-muted-foreground">
            <Upload className="mx-auto mb-2" />
            Upload product photos
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Repeat className="text-primary" />
              <h2 className="text-lg font-semibold">Rental Extension Setting</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Give renters the flexibility to extend their rental before it ends.
            </p>
          </div>
          <Checkbox defaultChecked label="Allow Extension" />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium">Extension Pricing</p>
              <RadioGroup
                name="extension-pricing"
                value={extensionPricing}
                onChange={setExtensionPricing}
                options={[
                  { value: "same", label: "Same as normal rate" },
                  { value: "custom", label: "Custom extension rate, higher than normal rate" },
                ]}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="Extension Daily Rate"
                defaultValue="20"
                rightIcon={<span className="text-xs font-semibold">%</span>}
                hint="Example: if normal rate is Rs 100/day, extension rate will be Rs 120/day."
              />
              <Select
                label="Request Before"
                defaultValue="12"
                options={[
                  { value: "6", label: "6 hours before booking ends" },
                  { value: "12", label: "12 hours before booking ends" },
                  { value: "24", label: "24 hours before booking ends" },
                ]}
              />
              <Select
                label="Maximum Extension Period"
                defaultValue="3"
                options={[
                  { value: "1", label: "1 day" },
                  { value: "3", label: "3 days" },
                  { value: "7", label: "7 days" },
                ]}
              />
            </div>
            <Select
              label="Approval"
              defaultValue="owner"
              options={[
                { value: "owner", label: "Owner approval required" },
                { value: "auto", label: "Auto approve if item is available" },
                { value: "manual", label: "Manual review for every request" },
              ]}
            />
          </div>
          <div className="rounded-lg bg-primary-50 p-4">
            <div className="flex items-center gap-2 text-primary">
              <Clock size={18} />
              <span className="text-sm font-semibold">Live renter preview</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-primary-900">
              Renters will see extension eligibility before they book and can request extra days from
              their booking detail page.
            </p>
            <div className="mt-4 rounded-lg bg-white p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max extension</span>
                <strong>3 days</strong>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-muted-foreground">Approval</span>
                <strong>Owner</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline">Save Draft</Button>
        <Button>{edit ? "Publish Changes" : "Continue"}</Button>
      </div>
    </div>
  );
}

export function KycStepperForm() {
  return (
    <div className="space-y-6">
      <Stepper
        current={2}
        steps={[
          { id: "identity", title: "Identity" },
          { id: "address", title: "Address" },
          { id: "bank", title: "Bank" },
          { id: "review", title: "Review" },
        ]}
      />
      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <Select
          label="ID type"
          options={[
            { value: "aadhaar", label: "Aadhaar" },
            { value: "pan", label: "PAN" },
            { value: "passport", label: "Passport" },
          ]}
        />
        <Input label="ID number" placeholder="XXXX XXXX 1234" />
        <Input label="Account holder" defaultValue="Venkata Siddhardha" />
        <Input label="IFSC" placeholder="HDFC0001234" />
        <Textarea className="md:col-span-2" label="Address" placeholder="House, street, city, pincode" />
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline">Save and Resume</Button>
        <Button>Submit for Review</Button>
      </div>
    </div>
  );
}
