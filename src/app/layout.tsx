import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next App",
  description: "Next.js with Tailwind CSS v4, TypeScript, Framer Motion & Recharts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
