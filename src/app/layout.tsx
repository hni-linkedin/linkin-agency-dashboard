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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('la-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;})();`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
