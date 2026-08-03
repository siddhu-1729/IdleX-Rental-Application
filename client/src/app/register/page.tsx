"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/form-controls";
import { Input, Select } from "@/components/ui/input";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  MapPin,
  Package,
  ShieldCheck,
  Star,
  User,
  Wallet,
} from "@/components/ui/icons";
import { ROUTES } from "@/lib/constants";
import { useAuth, errorMessage } from "@/lib/auth";

const roles = [
  {
    id: "renter",
    title: "Renter",
    copy: "Find trusted items nearby",
    Icon: User,
  },
  {
    id: "owner",
    title: "Owner",
    copy: "List items and earn",
    Icon: Wallet,
  },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = React.useState<(typeof roles)[number]["id"]>("renter");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Full name must be at least 2 characters");
      return;
    }
    if (phone.trim().length < 7) {
      setError("Phone number must be at least 7 digits");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const user = await register({ name, email, phone, password, becomeOwner: role === "owner" });
      router.push(user.role === "admin" ? ROUTES.ADMIN : ROUTES.HOME);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:grid-cols-[0.88fr_1fr] lg:gap-12 lg:py-10">
        <section className="hidden flex-col justify-between rounded-2xl bg-primary-50 p-8 lg:flex">
          <Link href={ROUTES.HOME} className="flex w-fit items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
              iX
            </span>
            <span className="text-xl font-bold text-foreground">
              Idle<span className="text-primary">X</span>
            </span>
          </Link>

          <div className="py-10">
            <Badge className="border-primary-200 bg-white text-primary-700">New user registration</Badge>
            <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight text-foreground">
              Create your IdleX account and start renting smarter.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
              Register once with your initial details, then rent products nearby or become an
              owner and list items from your home.
            </p>

            <div className="mt-8 grid gap-3">
              {[
                { icon: <ShieldCheck size={18} />, label: "Verified profiles for safer rentals" },
                { icon: <Package size={18} />, label: "Book, extend, and return from one dashboard" },
                { icon: <Wallet size={18} />, label: "Clear payments, deposits, and owner payouts" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-50 text-primary">
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_0.8fr] gap-4">
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80"
                alt="Camera available for rent"
                className="h-44 w-full object-cover"
              />
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Camera className="text-primary" />
                <Badge variant="success">Trusted</Badge>
              </div>
              <p className="mt-6 text-sm font-semibold">Camera kit rental</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin size={13} />
                Bhimavaram
              </p>
              <p className="mt-4 flex items-center gap-1 text-sm font-bold text-accent-700">
                <Star size={15} />
                4.9 rating
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center py-6 lg:min-h-0">
          <div className="w-full max-w-xl">
            <div className="mb-8 flex items-center justify-between">
              <Link href={ROUTES.HOME} className="flex items-center gap-2 lg:hidden">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white">
                  iX
                </span>
                <span className="text-xl font-bold">
                  Idle<span className="text-primary">X</span>
                </span>
              </Link>
              <Link href={ROUTES.LOGIN} className="ml-auto text-sm font-semibold text-primary">
                Already registered? Sign in
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <Badge className="border-violet-200 bg-violet-50 text-violet-700">Register</Badge>
              <h2 className="mt-4 text-3xl font-bold text-foreground">Tell us your initial details</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                These details create your basic IdleX account. You can complete KYC and owner setup later.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {roles.map(({ id, title, copy, Icon }) => {
                  const selected = role === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-primary bg-primary-50 shadow-sm"
                          : "border-border bg-white hover:border-primary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="text-primary" />
                        {selected && <CheckCircle size={18} className="text-primary" />}
                      </div>
                      <p className="mt-3 font-semibold">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{copy}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Venkata Siddhardha" minLength={2} required />
                <Input label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" minLength={7} required />
                <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="siddhu@example.com" required />
                <Select
                  label="City"
                  name="city"
                  defaultValue="bhimavaram"
                  options={[
                    { value: "bhimavaram", label: "Bhimavaram" },
                    { value: "vijayawada", label: "Vijayawada" },
                    { value: "rajahmundry", label: "Rajahmundry" },
                    { value: "eluru", label: "Eluru" },
                  ]}
                />
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" minLength={8} hint="At least 8 characters" required />
                <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" minLength={8} required />
              </div>

              <input type="hidden" name="role" value={role} />

              <div className="mt-5 rounded-xl bg-primary-50 p-4">
                <Checkbox
                  required
                  label={
                    <span className="text-sm leading-6">
                      I agree to IdleX safe rental rules, verification checks, and the{" "}
                      <Link href={ROUTES.TERMS} className="font-semibold text-primary">
                        terms of service
                      </Link>.
                    </span>
                  }
                />
              </div>

              {error && <p className="mt-4 rounded-md bg-danger-50 p-3 text-sm text-danger">{error}</p>}

              <Button className="mt-5" fullWidth size="lg" rightIcon={<ArrowRight size={18} />} loading={loading}>
                Register Account
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
