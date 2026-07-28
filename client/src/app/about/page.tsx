import { PublicShell, PageHero } from "@/components/marketplace/app-shell";

export default function AboutPage() {
  return (
    <PublicShell>
      <PageHero title="About IdleX" eyebrow="Community rentals" description="IdleX helps people rent what they need and earn from what they already own, with KYC, deposits, reviews, and guided handover flows built in." />
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
        {["Trust first", "Local supply", "Owner income"].map((title) => (
          <div key={title} className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Designed for repeat rentals, clear accountability, and simple backend integration when the API is ready.</p>
          </div>
        ))}
      </section>
    </PublicShell>
  );
}
