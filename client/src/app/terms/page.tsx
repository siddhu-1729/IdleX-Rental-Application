import { PublicShell, PageHero } from "@/components/marketplace/app-shell";

export default function TermsPage() {
  return (
    <PublicShell>
      <PageHero title="Terms of Service" eyebrow="Legal" description="Rental terms for renters, owners, deposits, damages, late returns, and disputes." />
      <section className="mx-auto max-w-4xl px-4 py-10 text-sm leading-7 text-muted-foreground sm:px-6">
        These starter terms are placeholders for legal review. The frontend includes the expected sections for booking acceptance, cancellation, return condition, payout timing, and dispute escalation.
      </section>
    </PublicShell>
  );
}
