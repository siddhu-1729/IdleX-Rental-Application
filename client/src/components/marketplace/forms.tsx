"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { Badge } from "@/components/ui/badge";
import { Checkbox, RadioGroup } from "@/components/ui/form-controls";
import { Clock, Mail, Repeat, Upload } from "@/components/ui/icons";
import { api, ApiError, getStoredUser, setStoredUser } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import type { Kyc, Listing, User } from "@/lib/api-types";
import { ROUTES } from "@/lib/constants";
import { errorMessage, isNetworkError } from "@/lib/auth";

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
  const [offline, setOffline] = React.useState(false);

  const titles = {
    login: "Welcome back",
    "sign-up": "Create your IdleX account",
    forgot: "Reset your password",
    otp: "Verify your phone",
  };

  const redirectAfterAuth = (user?: { role?: string }) => {
    const next = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/")) {
      router.replace(next);
      return;
    }
    router.replace(user?.role === "admin" ? ROUTES.ADMIN : ROUTES.HOME);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setOffline(false);
    setLoading(true);
    try {
      if (mode === "login") {
        const user = await login(email.trim(), password);
        redirectAfterAuth(user);
      } else if (mode === "sign-up") {
        const user = await register({ name, email: email.trim(), phone: phone.trim(), password });
        redirectAfterAuth(user);
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
      if (isNetworkError(err)) setOffline(true);
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
        {mode === "login" && (
          <div className="rounded-md bg-primary-50 p-3 text-sm text-primary-700">
            <p className="font-semibold">Demo accounts</p>
            <p className="mt-1">
              <strong>admin@gmail.com</strong> / <strong>admin</strong> — admin console
              <br />
              <strong>demo@idlex.com</strong> / <strong>demo1234</strong> — renter account
            </p>
            {offline && <p className="mt-1 text-xs">Backend is offline — using built-in demo mode.</p>}
          </div>
        )}
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

/**
 * Email verification via emailed OTP. Used right after registration and
 * from /verify-email. Two-phase: send the code, then verify it.
 */
export function EmailVerifyPanel({ initialEmail = "" }: { initialEmail?: string }) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [email, setEmail] = React.useState(initialEmail || user?.email || "");
  const [code, setCode] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const sendCode = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await api.post<null>("/api/auth/email-otp/request", { email: email.trim() });
      setCodeSent(true);
      setNotice(`A verification code was sent to ${email.trim()}.`);
    } catch (err) {
      if (isNetworkError(err)) {
        setCodeSent(true);
        setNotice("Backend offline — demo mode: enter any 6-digit code to verify.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!code.trim() || code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await api.post<User>("/api/auth/email-otp/verify", { email: email.trim(), code: code.trim() });
      await refreshUser().catch(() => undefined);
      setNotice("Email verified successfully.");
      router.push(ROUTES.HOME);
    } catch (err) {
      if (isNetworkError(err)) {
        const stored = getStoredUser<User>();
        if (stored) setStoredUser({ ...stored, isEmailVerified: true });
        setNotice("Demo mode: email verified.");
        router.push(ROUTES.HOME);
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!codeSent) void sendCode();
        else void verify();
      }}
      className="mx-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="default">Email verification</Badge>
          <Mail size={16} className="text-primary" />
        </div>
        <h1 className="mt-3 text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll send a one-time code to this address so we know it&apos;s really you.
        </p>
      </div>
      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="siddhu@example.com"
          required
        />
        {codeSent && (
          <Input
            label="One-time password"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="6 digit code"
          />
        )}
        <FieldError message={error} />
        {notice && <p className="rounded-md bg-secondary-50 p-3 text-sm text-secondary-700">{notice}</p>}
        <Button fullWidth loading={loading}>
          {codeSent ? "Verify Email" : "Send Code"}
        </Button>
        {codeSent && (
          <button
            type="button"
            onClick={() => void sendCode()}
            disabled={loading}
            className="mx-auto block text-sm font-semibold text-primary hover:underline"
          >
            Resend code
          </button>
        )}
        <div className="flex items-center justify-center text-sm">
          <Link href={ROUTES.HOME} className="font-semibold text-primary">
            Skip for now
          </Link>
        </div>
      </div>
    </form>
  );
}

export function ListingStepperForm({ edit = false, listingId }: { edit?: boolean; listingId?: string }) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("tools");
  const [pricePerDay, setPricePerDay] = React.useState("");
  const [securityDeposit, setSecurityDeposit] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [city, setCity] = React.useState("");
  const [status, setStatus] = React.useState<"draft" | "published" | "paused">("draft");
  const [selectedPhoto, setSelectedPhoto] = React.useState<{ id: number; file: File; url: string } | null>(null);
  const nextPhotoId = React.useRef(0);
  const [existingPhotos, setExistingPhotos] = React.useState<Listing["photos"]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingListing, setLoadingListing] = React.useState(edit);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");

  React.useEffect(() => {
    if (!edit || !listingId) return;
    let cancelled = false;
    (async () => {
      try {
        const listing = await api.get<Listing>(`/api/listings/${listingId}`);
        if (cancelled) return;
        setTitle(listing.title);
        setCategory(listing.category);
        setPricePerDay(String(listing.pricePerDay));
        setSecurityDeposit(String(listing.securityDeposit ?? 0));
        setDescription(listing.description);
        setCity(listing.location?.city ?? "");
        setStatus(listing.status);
        setExistingPhotos(listing.photos ?? []);
      } catch (err) {
        if (!cancelled) setError(errorMessage(err));
      } finally {
        if (!cancelled) setLoadingListing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [edit, listingId]);

  const uploadPhotos = async (id: string) => {
    if (!selectedPhoto) return;
    const form = new FormData();
    form.append("photos", selectedPhoto.file);
    await api.post<Listing["photos"]>(`/api/listings/${id}/photos`, form, { headers: {} });
  };

  React.useEffect(() => {
    return () => {
      if (selectedPhoto) URL.revokeObjectURL(selectedPhoto.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addPhoto = (file: File) => {
    setSelectedPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return { id: nextPhotoId.current++, file, url: URL.createObjectURL(file) };
    });
  };

  const removePhoto = () => {
    setSelectedPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  // Every listing creation is gated by an emailed OTP. This sends (or
  // resends) the code; the create call in `submit` verifies it.
  const sendListingOtp = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await api.post<null>("/api/listings/otp/request", {});
      setOtpSent(true);
      setNotice(`A 6-digit code was sent to ${user?.email ?? "your email"}. Enter it below, then click Save again.`);
    } catch (err) {
      if (isNetworkError(err)) {
        setOtpSent(true);
        setNotice("Backend offline — demo mode: enter any 6-digit code to finish creating your listing.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async (publish: boolean) => {
    setError(null);
    if (!selectedPhoto && existingPhotos.length === 0) {
      setError("Please add a photo of your item — it's required before saving.");
      return;
    }
    setLoading(true);
    try {
      // Auto-upgrade a renter to owner on first save
      if (!edit && user && !user.isOwner) {
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
        status: publish ? ("published" as const) : status,
      };
      if (edit && listingId) {
        const listing = await api.put<Listing>(`/api/listings/${listingId}`, payload);
        await uploadPhotos(listing._id);
        router.push(ROUTES.MY_LISTINGS);
        return;
      }
      // Every new listing requires an OTP sent to the owner's email and
      // verified here — the backend refuses to create one without it.
      if (!otpSent) {
        await sendListingOtp();
        return;
      }
      if (!otpCode.trim() || otpCode.trim().length !== 6) {
        setError("Enter the 6-digit code we emailed you, then click Save again.");
        return;
      }
      const listing = await api.post<Listing>("/api/listings", { ...payload, otpCode: otpCode.trim() });
      await uploadPhotos(listing._id);
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
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">Photos</label>
          <div className="flex flex-wrap items-start gap-4">
            <label className="inline-flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-border bg-muted px-3 text-center text-xs font-medium text-muted-foreground transition hover:border-primary hover:bg-primary-50 hover:text-primary">
              <Upload size={18} className="mx-auto" />
              <span>Upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) addPhoto(file);
                  e.target.value = "";
                }}
              />
            </label>

            {selectedPhoto ? (
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedPhoto.url} alt={selectedPhoto.file.name} className="max-h-80 w-full object-cover" />
                <span className="absolute bottom-2 left-2 max-w-[calc(100%-5.5rem)] truncate rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  {selectedPhoto.file.name}
                </span>
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={removePhoto}
                  className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border border-white/40 bg-black/60 text-sm font-semibold leading-none text-white transition hover:bg-danger"
                >
                  ×
                </button>
              </div>
            ) : existingPhotos.length > 0 ? (
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={existingPhotos[0].url} alt={existingPhotos[0].caption || "listing photo"} className="max-h-80 w-full object-cover" />
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">Current photo</span>
              </div>
            ) : (
              <p className="self-center text-sm text-muted-foreground">
                No photo yet. A photo is required to save your listing.
              </p>
            )}

            {existingPhotos.length > 1 && (
              <div className="flex w-full flex-wrap gap-2">
                {existingPhotos.slice(1).map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p._id} src={p.url} alt={p.caption || "listing photo"} className="h-16 w-16 rounded-lg border border-border object-cover" />
                ))}
              </div>
            )}
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
      {otpSent && !edit && (
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-5">
          <div className="flex items-center gap-2 text-primary">
            <Mail size={18} />
            <span className="text-sm font-semibold">Email OTP verification</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-primary-900">
            A verification code was sent to <strong>{user?.email ?? "your email"}</strong>. Every
            listing must be confirmed with this code before it is saved — enter it and click Save
            again.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <Input
              label="6-digit OTP"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter code"
              className="max-w-52"
            />
            <Button variant="outline" loading={loading} onClick={() => void sendListingOtp()}>
              Resend Code
            </Button>
          </div>
        </div>
      )}
      <FieldError message={error} />
      {notice && <p className="rounded-md bg-secondary-50 p-3 text-sm text-secondary-700">{notice}</p>}
      {loadingListing ? (
        <p className="text-sm text-muted-foreground">Loading listing…</p>
      ) : (
        <div className="flex justify-end gap-3">
          <Button variant="outline" loading={loading} onClick={() => submit(false)}>
            {edit ? "Save Changes" : "Save Draft"}
          </Button>
          <Button loading={loading} onClick={() => submit(true)}>
            {edit ? "Publish Changes" : "Publish Listing"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function KycStepperForm() {
  const [kyc, setKyc] = React.useState<Kyc | null>(null);
  const [documentType, setDocumentType] = React.useState("aadhaar");
  const [idFile, setIdFile] = React.useState<File | null>(null);
  const [idPreviewUrl, setIdPreviewUrl] = React.useState<string | null>(null);
  const [selfieFile, setSelfieFile] = React.useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    return () => {
      if (idPreviewUrl) URL.revokeObjectURL(idPreviewUrl);
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickIdFile = (file: File | null) => {
    if (idPreviewUrl) URL.revokeObjectURL(idPreviewUrl);
    setIdFile(file);
    setIdPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const pickSelfieFile = (file: File | null) => {
    if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
    setSelfieFile(file);
    setSelfiePreviewUrl(file ? URL.createObjectURL(file) : null);
  };

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
          onChange={(e) => pickIdFile(e.target.files?.[0] ?? null)}
        />
        {idPreviewUrl && (
          <div className="md:col-span-2 -mt-2">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Preview</p>
            {idFile?.type.startsWith("image/") ? (
              <div className="max-w-md overflow-hidden rounded-md border border-border bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={idPreviewUrl} alt={idFile?.name ?? "ID document"} className="max-h-72 w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-32 max-w-md items-center justify-center rounded-md border border-border bg-muted px-4 text-sm text-muted-foreground">
                {idFile?.name ?? "Document"} (PDF)
              </div>
            )}
          </div>
        )}
        <Input
          label="Selfie photo"
          type="file"
          accept="image/*"
          onChange={(e) => pickSelfieFile(e.target.files?.[0] ?? null)}
        />
        {selfiePreviewUrl && (
          <div className="md:-mt-2">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Preview</p>
            <div className="max-w-sm overflow-hidden rounded-md border border-border bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfiePreviewUrl} alt="Selfie" className="max-h-60 w-full object-contain" />
            </div>
          </div>
        )}
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
