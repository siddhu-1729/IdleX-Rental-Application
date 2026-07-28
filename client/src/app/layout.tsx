import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IdleX - Rent Smart. Own Nothing. Live Fully.",
  description:
    "IdleX is your trusted community marketplace to rent items you love and earn from what you don't use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground select-none">
        {children}
      </body>
    </html>
  );
}
