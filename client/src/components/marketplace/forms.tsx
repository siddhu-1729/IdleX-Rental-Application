"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { Checkbox, RadioGroup } from "@/components/ui/form-controls";
import { Clock, Repeat, Upload } from "@/components/ui/icons";
import { api, ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Kyc, Listing, User } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";
import { errorMessage } from "@/lib/auth";

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded-md bg-danger-50 p-3 text-sm text-danger">{message}</p>;
}

export function AuthPanel({ mode }: { mode: "login" | "sign-up" | "forgot" | "otp" }) {
  const router = useRouter();
  const { login, register } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const titles = {
    login: "Welcome back",
    "sign-up": "Create your IdleX account",
    forgot: "Reset your password",
    otp: "Verify your phone",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const user = await login(email.trim(), password);
        router.push(user.role === "admin" ? ROUTES.ADMIN : ROUTES.DASHBOARD);
      } else if (mode === "sign-up") {
        await register({ name, email: email.trim(), phone: phone.trim(), password });
        router.push(ROUTES.DASHBOARD);
      } else if (mode === "forgot") {
        await api.post<null>("/api/auth/password/reset", { email: email.trim() });
        setNotice("If that email exists, a reset link has been sent.");
      } else if (mode === "otp") {
        if (!code) {
          await api.post<null>("/api/auth/otp/request", { phone: phone.trim() });
          setNotice("OTP sent. Enter the code below.");
        } else {
          await api.post<User>("/api/auth/otp/verify", { phone: phone.trim(), code });
          setNotice("Phone verified successfully.");
        }
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <Badge variant="default">Secure access</Badge>
        <h1 className="mt-3 text-2xl font-bold">{titles[mode]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "otp" ? "Enter your phone number to receive a code." : "Sign in to your IdleX account."}
        </p>
      </div>
      <div className="space-y-4">
        {mode === "sign-up" && (
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Venkata Siddhardha" required />
        )}
        {mode === "otp" ? (
          <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" required />
        ) : (
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siddhu@example.com" required />
        )}
        {mode === "otp" && (
          <Input label="One-time password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6 digit code" />
        )}
        {(mode === "login" || mode === "sign-up") && (
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
        )}
        <FieldError message={error} />
        {notice && <p className="rounded-md bg-secondary-50 p-3 text-sm text-secondary-700">{notice}</p>}
        <Button fullWidth loading={loading}>
          {mode === "forgot" ? "Send reset link" : mode === "otp" ? (code ? "Verify OTP" : "Send OTP") : "Continue"}
        </Button>
        <div className="flex items-center justify-between text-sm">
          {mode === "login" && (
            <>
              <Link href={ROUTES.FORGOT_PASSWORD} className="font-semibold text-primary">
                Forgot password?
              </Link>
              <Link href={ROUTES.REGISTER} className="font-semibold text-primary">
                Create account
              </Link>
            </>
          )}
          {mode === "sign-up" && (
            <Link href={ROUTES.LOGIN} className="ml-auto font-semibold text-primary">
              Already registered? Sign in
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}

export function ListingStepperForm({ edit = false }: { edit?: boolean }) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("tools");
  const [pricePerDay, setPricePerDay] = React.useState("");
  const [securityDeposit, setSecurityDeposit] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [city, setCity] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const submit = async (publish: boolean) => {
    setError(null);
    setLoading(true);
    try {
      if (user && !user.isOwner) {
        const updated = await api.patch<User>("/api/auth/me", { becomeOwner: true });
        await refreshUser().catch(() => updated);
      }
      const payload = {
        title,
        category,
        pricePerDay: Number(pricePerDay),
        securityDeposit: Number(securityDeposit || 0),
        description,
        location: city ? { city } : undefined,
        status: publish ? "published" : "draft",
      };
      await api.post<Listing>("/api/listings", payload);
      router.push(ROUTES.MY_LISTINGS);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper
        current={1}
        steps={[
          { id: "basics", title: "Basics" },
          { id: "pricing", title: "Pricing" },
          { id: "extension", title: "Extension" },
          { id: "photos", title: "Photos" },
          { id: "review", title: "Review" },
        ]}
      />
      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <Input label="Item title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Camera, bike, drill..." required />
        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[
            { value: "cameras", label: "Cameras" },
            { value: "electronics", label: "Electronics" },
            { value: "tools", label: "Tools" },
            { value: "sports", label: "Sports" },
            { value: "outdoor", label: "Outdoor" },
            { value: "home-appliances", label: "Home Appliances" },
            { value: "vehicles", label: "Vehicles" },
            { value: "books", label: "Books" },
          ]}
        />
        <Input label="Daily price" type="number" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} placeholder="250" required />
        <Input label="Security deposit" type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(e.target.value)} placeholder="1000" />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Pune" />
        <Textarea className="md:col-span-2" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, included accessories, pickup notes..." required />
        <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted md:col-span-2">
          <div className="text-center text-sm text-muted-foreground">
            <Upload className="mx-auto mb-2" />
            Photos can be uploaded after the listing is created.
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
                value="custom"
                onChange={() => undefined}
                options={[
                  { value: "same", label: "Same as normal rate" },
                  { value: "custom", label: "Custom extension rate, higher than normal rate" },
                ]}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Extension Daily Rate" defaultValue="20" rightIcon={<span className="text-xs font-semibold">%</span>} />
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
          </div>
        </div>
      </div>
      <FieldError message={error} />
      <div className="flex justify-end gap-3">
        <Button variant="outline" loading={loading} onClick={() => submit(false)}>
          Save Draft
        </Button>
        <Button loading={loading} onClick={() => submit(true)}>
          {edit ? "Publish Changes" : "Publish Listing"}
        </Button>
      </div>
    </div>
  );
}

export function KycStepperForm() {
  const [kyc, setKyc] = React.useState<Kyc | null>(null);
  const [documentType, setDocumentType] = React.useState("aadhaar");
  const [idFile, setIdFile] = React.useState<File | null>(null);
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null);
  const [accountHolderName, setAccountHolderName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [ifscOrRoutingNumber, setIfscOrRoutingNumber] = React.useState("");
  const [bankName, setBankName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    api
      .get<Kyc>("/api/kyc")
      .then((data) => {
        if (cancelled) return;
        setKyc(data);
        setNotice(data.status === "pending" ? "Submitted for review. We'll notify you once it's verified." : null);
      })
      .catch(() => {
        // KYC endpoint requires auth; leave as-is if not logged in.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadStep = async (step: "id-upload" | "selfie") => {
    const file = step === "id-upload" ? idFile : selfieFile;
    if (!file) {
      setError(step === "id-upload" ? "Select an ID document to upload" : "Select a selfie to upload");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (step === "id-upload") form.append("documentType", documentType);
      const data = await api.post<Kyc>(`/api/kyc/step/${step}`, form, { headers: {} });
      setKyc(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitBankDetails = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<Kyc>("/api/kyc/step/bank-details", {
        accountHolderName,
        accountNumber,
        ifscOrRoutingNumber,
        bankName,
      });
      setKyc(data);
      const submitted = await api.post<Kyc>("/api/kyc/submit", {});
      setKyc(submitted);
      setNotice("Submitted for review. We'll notify you once it's verified.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Not authenticated. Sign in to complete KYC.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper
        current={kyc?.currentStep === "bank-details" || kyc?.currentStep === "completed" ? 3 : kyc?.currentStep === "selfie" ? 2 : 1}
        steps={[
          { id: "identity", title: "Identity" },
          { id: "selfie", title: "Selfie" },
          { id: "bank", title: "Bank" },
          { id: "review", title: "Review" },
        ]}
      />
      {kyc && kyc.status === "approved" && (
        <p className="rounded-md bg-secondary-50 p-3 text-sm text-secondary-700">Your KYC is approved.</p>
      )}
      {kyc && kyc.status === "rejected" && (
        <p className="rounded-md bg-danger-50 p-3 text-sm text-danger">
          KYC rejected: {kyc.rejectionReason || "Please resubmit your details."}
        </p>
      )}
      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <Select
          label="ID type"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          options={[
            { value: "aadhaar", label: "Aadhaar" },
            { value: "pan", label: "PAN" },
            { value: "passport", label: "Passport" },
            { value: "national_id", label: "National ID" },
          ]}
        />
        <Input
          label="ID document (photo/PDF)"
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
        />
        <Input
          label="Selfie photo"
          type="file"
          accept="image/*"
          onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
        />
        <Input label="Account holder" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder="Name as on bank account" />
        <Input label="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Bank account number" />
        <Input label="IFSC" value={ifscOrRoutingNumber} onChange={(e) => setIfscOrRoutingNumber(e.target.value)} placeholder="HDFC0001234" />
        <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="HDFC Bank" />
      </div>
      <FieldError message={error} />
      {notice && <p className="rounded-md bg-secondary-50 p-3 text-sm text-secondary-700">{notice}</p>}
      <div className="flex justify-end gap-3">
        <Button variant="outline" loading={loading} onClick={() => uploadStep("id-upload")}>
          Save ID Step
        </Button>
        <Button variant="outline" loading={loading} onClick={() => uploadStep("selfie")}>
          Save Selfie
        </Button>
        <Button loading={loading} onClick={() => submitBankDetails()}>
          Submit for Review
        </Button>
      </div>
    </div>
  );
}
