import { EmailVerifyPanel } from "@/components/marketplace/forms";

type VerifyEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { email } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-muted px-4 py-10">
      <EmailVerifyPanel initialEmail={email ?? ""} />
    </main>
  );
}