"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { Upload } from "@/components/ui/icons";

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
  return (
    <div className="space-y-6">
      <Stepper
        current={edit ? 3 : 1}
        steps={[
          { id: "basics", title: "Basics" },
          { id: "pricing", title: "Pricing" },
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
