import { PublicShell, PageHero } from "@/components/marketplace/app-shell";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <PageHero title="Privacy Policy" eyebrow="Legal" description="A frontend-ready privacy page covering account, KYC, transaction, and communication data." />
      <section className="mx-auto max-w-4xl px-4 py-10 text-sm leading-7 text-muted-foreground sm:px-6">
        IdleX mock screens collect only demonstration data. Production integrations should store identity, payment, location, and chat data through approved services with role-based access, retention rules, and user export controls.
      </section>
    </PublicShell>
  );
}
