import { PublicShell, PageHero } from "@/components/marketplace/app-shell";

const faqs = [
  ["How are deposits handled?", "Deposits are shown before checkout and tracked separately from rent."],
  ["Can owners approve bookings?", "Yes. Owner approval, pickup proof, and return checks are modeled in the dashboard."],
  ["Is KYC required?", "KYC is required for higher-value rentals and owner payouts."],
];

export default function FaqPage() {
  return (
    <PublicShell>
      <PageHero title="FAQ" eyebrow="Answers" description="Common questions about renting, deposits, verification, and payouts." />
      <section className="mx-auto max-w-4xl space-y-3 px-4 py-10 sm:px-6">
        {faqs.map(([question, answer]) => (
          <details key={question} className="rounded-lg border border-border bg-card p-5">
            <summary className="cursor-pointer font-semibold">{question}</summary>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </section>
    </PublicShell>
  );
}
