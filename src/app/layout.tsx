import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRYAM Enterprise AI | Loan Settlement & Lead Engine CRM",
  description: "AI-Powered Debt Settlement Hub, Lead Logging & Workload Balancing CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
