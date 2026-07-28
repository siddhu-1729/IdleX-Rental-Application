import { PublicShell, PageHero } from "@/components/marketplace/app-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <PublicShell>
      <PageHero title="Contact support" eyebrow="Help desk" description="Reach the IdleX team for bookings, payouts, safety reviews, or owner onboarding." />
      <form className="mx-auto grid max-w-3xl gap-4 px-4 py-10 sm:px-6">
        <Input label="Name" />
        <Input label="Email" type="email" />
        <Textarea label="Message" />
        <Button>Send Message</Button>
      </form>
    </PublicShell>
  );
}
